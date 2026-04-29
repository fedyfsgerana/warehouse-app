const pool = require("../../config/db");

const getAll = async ({ warehouse_id }) => {
  let query = `
    SELECT sl.*, p.name AS product_name, p.sku, p.unit, p.min_stock,
           w.name AS warehouse_name
    FROM stock_locations sl
    JOIN products p ON sl.product_id = p.id
    JOIN warehouses w ON sl.warehouse_id = w.id
    WHERE 1=1
  `;
  const params = [];

  if (warehouse_id) {
    params.push(warehouse_id);
    query += ` AND sl.warehouse_id = $${params.length}`;
  }

  query += " ORDER BY p.name";

  const result = await pool.query(query, params);
  return result.rows;
};

const check = async ({ product_id, qty }) => {
  const result = await pool.query(
    `SELECT SUM(qty) AS total_qty
     FROM stock_locations
     WHERE product_id = $1`,
    [product_id],
  );
  const total = parseFloat(result.rows[0].total_qty) || 0;
  return {
    product_id,
    requested_qty: parseFloat(qty),
    available_qty: total,
    sufficient: total >= parseFloat(qty),
  };
};

const mutate = async ({ from_loc, to_loc, product_id, qty, user_id }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const from = await client.query(
      "SELECT * FROM stock_locations WHERE id = $1 AND product_id = $2",
      [from_loc, product_id],
    );
    if (!from.rows[0])
      throw { status: 404, message: "Lokasi asal tidak ditemukan." };
    if (from.rows[0].qty < qty)
      throw { status: 400, message: "Stok di lokasi asal tidak mencukupi." };

    await client.query(
      "UPDATE stock_locations SET qty = qty - $1, updated_at = NOW() WHERE id = $2",
      [qty, from_loc],
    );

    await client.query(
      "UPDATE stock_locations SET qty = qty + $1, updated_at = NOW() WHERE id = $2",
      [qty, to_loc],
    );

    await client.query(
      `INSERT INTO stock_transactions (product_id, warehouse_id, type, qty, reference_type, created_by)
       VALUES ($1, $2, 'TRANSFER', $3, 'MUTASI', $4)`,
      [product_id, from.rows[0].warehouse_id, qty, user_id],
    );

    await client.query("COMMIT");
    return { message: "Mutasi stok berhasil." };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getHistory = async ({ from, to, product_id }) => {
  let query = `
    SELECT st.*, p.name AS product_name, p.sku,
           u.name AS created_by_name
    FROM stock_transactions st
    JOIN products p ON st.product_id = p.id
    JOIN users u ON st.created_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (product_id) {
    params.push(product_id);
    query += ` AND st.product_id = $${params.length}`;
  }

  if (from) {
    params.push(from);
    query += ` AND st.created_at >= $${params.length}`;
  }

  if (to) {
    params.push(to);
    query += ` AND st.created_at <= $${params.length}`;
  }

  query += " ORDER BY st.created_at DESC";

  const result = await pool.query(query, params);
  return result.rows;
};

module.exports = { getAll, check, mutate, getHistory };
