const pool = require("../../config/db");

const getAll = async ({ status }) => {
  let query = `
    SELECT so.*, u.name AS created_by_name
    FROM sales_orders so
    LEFT JOIN users u ON so.created_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND so.status = $${params.length}`;
  }

  query += " ORDER BY so.created_at DESC";

  const result = await pool.query(query, params);
  return result.rows;
};

const getById = async (id) => {
  const so = await pool.query(
    `SELECT so.*, u.name AS created_by_name
     FROM sales_orders so
     LEFT JOIN users u ON so.created_by = u.id
     WHERE so.id = $1`,
    [id],
  );
  if (!so.rows[0])
    throw { status: 404, message: "Sales order tidak ditemukan." };

  const items = await pool.query(
    `SELECT soi.*, p.name AS product_name, p.sku
     FROM sales_order_items soi
     JOIN products p ON soi.product_id = p.id
     WHERE soi.so_id = $1`,
    [id],
  );

  return { ...so.rows[0], items: items.rows };
};

const create = async ({ destination, items, user_id }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const item of items) {
      const stock = await client.query(
        "SELECT SUM(qty) AS total FROM stock_locations WHERE product_id = $1",
        [item.product_id],
      );
      const total = parseFloat(stock.rows[0].total) || 0;
      if (total < item.qty) {
        throw {
          status: 400,
          message: `Stok produk ID ${item.product_id} tidak mencukupi.`,
        };
      }
    }

    const so_number = `SO-${Date.now()}`;
    const so = await client.query(
      `INSERT INTO sales_orders (so_number, destination, created_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [so_number, destination, user_id],
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO sales_order_items (so_id, product_id, qty, price)
         VALUES ($1, $2, $3, $4)`,
        [so.rows[0].id, item.product_id, item.qty, item.price || 0],
      );
    }

    await client.query("COMMIT");
    return so.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const confirm = async (id, user_id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const so = await client.query("SELECT * FROM sales_orders WHERE id = $1", [
      id,
    ]);
    if (!so.rows[0])
      throw { status: 404, message: "Sales order tidak ditemukan." };
    if (so.rows[0].status !== "draft")
      throw {
        status: 400,
        message: "Hanya SO berstatus draft yang bisa dikonfirmasi.",
      };

    const items = await client.query(
      "SELECT * FROM sales_order_items WHERE so_id = $1",
      [id],
    );

    for (const item of items.rows) {
      const locs = await client.query(
        `SELECT * FROM stock_locations WHERE product_id = $1 AND qty > 0 ORDER BY qty DESC`,
        [item.product_id],
      );

      let remaining = item.qty;
      for (const loc of locs.rows) {
        if (remaining <= 0) break;
        const deduct = Math.min(loc.qty, remaining);
        await client.query(
          "UPDATE stock_locations SET qty = qty - $1, updated_at = NOW() WHERE id = $2",
          [deduct, loc.id],
        );
        remaining -= deduct;
      }

      await client.query(
        `INSERT INTO stock_transactions (product_id, warehouse_id, type, qty, reference_type, reference_id, created_by)
         VALUES ($1, $2, 'OUT', $3, 'SO', $4, $5)`,
        [item.product_id, locs.rows[0]?.warehouse_id, item.qty, id, user_id],
      );
    }

    await client.query(
      `UPDATE sales_orders SET status = 'confirmed' WHERE id = $1`,
      [id],
    );

    await client.query("COMMIT");
    return { message: "Sales order berhasil dikonfirmasi." };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const ship = async (id, tracking_number) => {
  const result = await pool.query(
    `UPDATE sales_orders SET status = 'shipped', tracking_number = $1
     WHERE id = $2 AND status = 'confirmed' RETURNING *`,
    [tracking_number, id],
  );
  if (!result.rows[0])
    throw {
      status: 400,
      message: "Hanya SO berstatus confirmed yang bisa dikirim.",
    };
  return result.rows[0];
};

module.exports = { getAll, getById, create, confirm, ship };
