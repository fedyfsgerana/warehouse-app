const pool = require("../../config/db");

const getAll = async () => {
  const result = await pool.query("SELECT * FROM suppliers ORDER BY name");
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query("SELECT * FROM suppliers WHERE id = $1", [
    id,
  ]);
  if (!result.rows[0])
    throw { status: 404, message: "Supplier tidak ditemukan." };
  return result.rows[0];
};

const create = async ({ name, phone, address }) => {
  const result = await pool.query(
    "INSERT INTO suppliers (name, phone, address) VALUES ($1, $2, $3) RETURNING *",
    [name, phone, address],
  );
  return result.rows[0];
};

const update = async (id, { name, phone, address }) => {
  const result = await pool.query(
    "UPDATE suppliers SET name = $1, phone = $2, address = $3 WHERE id = $4 RETURNING *",
    [name, phone, address, id],
  );
  if (!result.rows[0])
    throw { status: 404, message: "Supplier tidak ditemukan." };
  return result.rows[0];
};

const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM suppliers WHERE id = $1 RETURNING *",
    [id],
  );
  if (!result.rows[0])
    throw { status: 404, message: "Supplier tidak ditemukan." };
  return { message: "Supplier berhasil dihapus." };
};

module.exports = { getAll, getById, create, update, remove };
