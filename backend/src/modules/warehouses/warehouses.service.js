const pool = require("../../config/db");

const getAll = async () => {
  const result = await pool.query(
    "SELECT * FROM warehouses ORDER BY created_at DESC",
  );
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query("SELECT * FROM warehouses WHERE id = $1", [
    id,
  ]);
  if (!result.rows[0])
    throw { status: 404, message: "Gudang tidak ditemukan." };
  return result.rows[0];
};

const create = async ({ name, address }) => {
  const result = await pool.query(
    "INSERT INTO warehouses (name, address) VALUES ($1, $2) RETURNING *",
    [name, address],
  );
  return result.rows[0];
};

const update = async (id, { name, address }) => {
  const result = await pool.query(
    "UPDATE warehouses SET name = $1, address = $2 WHERE id = $3 RETURNING *",
    [name, address, id],
  );
  if (!result.rows[0])
    throw { status: 404, message: "Gudang tidak ditemukan." };
  return result.rows[0];
};

const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM warehouses WHERE id = $1 RETURNING *",
    [id],
  );
  if (!result.rows[0])
    throw { status: 404, message: "Gudang tidak ditemukan." };
  return { message: "Gudang berhasil dihapus." };
};

const getLocations = async (warehouseId) => {
  const result = await pool.query(
    `SELECT sl.*, p.name AS product_name, p.sku
     FROM stock_locations sl
     LEFT JOIN products p ON sl.product_id = p.id
     WHERE sl.warehouse_id = $1
     ORDER BY sl.location_code`,
    [warehouseId],
  );
  return result.rows;
};

const createLocation = async ({ warehouse_id, product_id, location_code }) => {
  const result = await pool.query(
    `INSERT INTO stock_locations (warehouse_id, product_id, location_code)
     VALUES ($1, $2, $3) RETURNING *`,
    [warehouse_id, product_id, location_code],
  );
  return result.rows[0];
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getLocations,
  createLocation,
};
