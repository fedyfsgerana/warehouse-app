const pool = require("../../config/db");
const bcrypt = require("bcrypt");

const getAll = async () => {
  const result = await pool.query(
    "SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC",
  );
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query(
    "SELECT id, email, name, role, created_at FROM users WHERE id = $1",
    [id],
  );
  if (!result.rows[0]) throw { status: 404, message: "User tidak ditemukan." };
  return result.rows[0];
};

const create = async ({ email, name, role, password }) => {
  const exists = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (exists.rows[0]) throw { status: 400, message: "Email sudah digunakan." };

  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (email, name, role, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, role, created_at`,
    [email, name, role, hash],
  );
  return result.rows[0];
};

const update = async (id, { name, role }) => {
  const result = await pool.query(
    `UPDATE users SET name = $1, role = $2
     WHERE id = $3
     RETURNING id, email, name, role, created_at`,
    [name, role, id],
  );
  if (!result.rows[0]) throw { status: 404, message: "User tidak ditemukan." };
  return result.rows[0];
};

const resetPassword = async (id, newPassword) => {
  const hash = await bcrypt.hash(newPassword, 10);
  const result = await pool.query(
    "UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id",
    [hash, id],
  );
  if (!result.rows[0]) throw { status: 404, message: "User tidak ditemukan." };
  return { message: "Password berhasil direset." };
};

const remove = async (id, currentUserId) => {
  if (parseInt(id) === parseInt(currentUserId)) {
    throw { status: 400, message: "Tidak bisa menghapus akun sendiri." };
  }
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id",
    [id],
  );
  if (!result.rows[0]) throw { status: 404, message: "User tidak ditemukan." };
  return { message: "User berhasil dihapus." };
};

module.exports = { getAll, getById, create, update, resetPassword, remove };
