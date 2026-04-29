const pool = require("../../config/db");

const getAll = async ({ status, supplier }) => {
  let query = `
    SELECT po.*, s.name AS supplier_name, u.name AS created_by_name
    FROM purchase_orders po
    LEFT JOIN suppliers s ON po.supplier_id = s.id
    LEFT JOIN users u ON po.created_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND po.status = $${params.length}`;
  }

  if (supplier) {
    params.push(`%${supplier}%`);
    query += ` AND s.name ILIKE $${params.length}`;
  }

  query += " ORDER BY po.created_at DESC";

  const result = await pool.query(query, params);
  return result.rows;
};

const getById = async (id) => {
  const po = await pool.query(
    `SELECT po.*, s.name AS supplier_name, u.name AS created_by_name
     FROM purchase_orders po
     LEFT JOIN suppliers s ON po.supplier_id = s.id
     LEFT JOIN users u ON po.created_by = u.id
     WHERE po.id = $1`,
    [id],
  );
  if (!po.rows[0])
    throw { status: 404, message: "Purchase order tidak ditemukan." };

  const items = await pool.query(
    `SELECT poi.*, p.name AS product_name, p.sku
     FROM purchase_order_items poi
     JOIN products p ON poi.product_id = p.id
     WHERE poi.po_id = $1`,
    [id],
  );

  return { ...po.rows[0], items: items.rows };
};

const create = async ({ supplier_id, items, user_id }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const po_number = `PO-${Date.now()}`;
    const po = await client.query(
      `INSERT INTO purchase_orders (po_number, supplier_id, created_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [po_number, supplier_id, user_id],
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO purchase_order_items (po_id, product_id, qty, price)
         VALUES ($1, $2, $3, $4)`,
        [po.rows[0].id, item.product_id, item.qty, item.price || 0],
      );
    }

    await client.query("COMMIT");
    return po.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const updateStatus = async (id, status) => {
  const result = await pool.query(
    "UPDATE purchase_orders SET status = $1 WHERE id = $2 RETURNING *",
    [status, id],
  );
  if (!result.rows[0])
    throw { status: 404, message: "Purchase order tidak ditemukan." };
  return result.rows[0];
};

const receive = async (id, { items, user_id, warehouse_id }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const item of items) {
      await client.query(
        `UPDATE purchase_order_items
         SET qty_received = qty_received + $1
         WHERE po_id = $2 AND product_id = $3`,
        [item.qty_received, id, item.product_id],
      );

      const loc = await client.query(
        `SELECT * FROM stock_locations
         WHERE product_id = $1 AND warehouse_id = $2`,
        [item.product_id, warehouse_id],
      );

      if (loc.rows[0]) {
        await client.query(
          `UPDATE stock_locations SET qty = qty + $1, updated_at = NOW()
           WHERE product_id = $2 AND warehouse_id = $3`,
          [item.qty_received, item.product_id, warehouse_id],
        );
      } else {
        await client.query(
          `INSERT INTO stock_locations (product_id, warehouse_id, qty)
           VALUES ($1, $2, $3)`,
          [item.product_id, warehouse_id, item.qty_received],
        );
      }

      await client.query(
        `INSERT INTO stock_transactions (product_id, warehouse_id, type, qty, reference_type, reference_id, created_by)
         VALUES ($1, $2, 'IN', $3, 'PO', $4, $5)`,
        [item.product_id, warehouse_id, item.qty_received, id, user_id],
      );
    }

    await client.query(
      `UPDATE purchase_orders SET status = 'received' WHERE id = $1`,
      [id],
    );

    await client.query("COMMIT");
    return { message: "Barang berhasil diterima." };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { getAll, getById, create, updateStatus, receive };
