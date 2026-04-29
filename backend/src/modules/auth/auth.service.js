const pool = require("../../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const login = async (email, password) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  const user = result.rows[0];
  if (!user) throw { status: 401, message: "Email tidak ditemukan." };

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw { status: 401, message: "Password salah." };

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
};

const getMe = async (userId) => {
  const result = await pool.query(
    "SELECT id, email, name, role, created_at FROM users WHERE id = $1",
    [userId],
  );
  return result.rows[0];
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);

  const user = result.rows[0];
  if (!user) throw { status: 404, message: "User tidak ditemukan." };

  const valid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!valid) throw { status: 401, message: "Password lama salah." };

  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
    hash,
    userId,
  ]);

  return { message: "Password berhasil diubah." };
};

module.exports = { login, getMe, changePassword };
