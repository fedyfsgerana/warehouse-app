const pool = require("../../config/db");

const getAll = async ({ category, search }) => {
  let query = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    params.push(category);
    query += ` AND p.category_id = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
  }

  query += " ORDER BY p.created_at DESC";

  const result = await pool.query(query, params);
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = $1`,
    [id],
  );
  if (!result.rows[0])
    throw { status: 404, message: "Produk tidak ditemukan." };
  return result.rows[0];
};

const create = async ({ sku, name, category_id, unit, min_stock }) => {
  const result = await pool.query(
    `INSERT INTO products (sku, name, category_id, unit, min_stock)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [sku, name, category_id, unit, min_stock || 0],
  );
  return result.rows[0];
};

const update = async (id, { name, unit, min_stock, category_id }) => {
  const result = await pool.query(
    `UPDATE products
     SET name = $1, unit = $2, min_stock = $3, category_id = $4
     WHERE id = $5
     RETURNING *`,
    [name, unit, min_stock, category_id, id],
  );
  if (!result.rows[0])
    throw { status: 404, message: "Produk tidak ditemukan." };
  return result.rows[0];
};

const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM products WHERE id = $1 RETURNING *",
    [id],
  );
  if (!result.rows[0])
    throw { status: 404, message: "Produk tidak ditemukan." };
  return { message: "Produk berhasil dihapus." };
};

const getCategories = async () => {
  const result = await pool.query("SELECT * FROM categories ORDER BY name");
  return result.rows;
};

const createCategory = async (name) => {
  const result = await pool.query(
    "INSERT INTO categories (name) VALUES ($1) RETURNING *",
    [name],
  );
  return result.rows[0];
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getCategories,
  createCategory,
};
