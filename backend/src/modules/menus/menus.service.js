const pool = require("../../config/db");

const getAll = async () => {
  const result = await pool.query(
    "SELECT * FROM menus ORDER BY sort_order ASC",
  );
  return result.rows;
};

const getByRole = async (role) => {
  const result = await pool.query(
    `SELECT * FROM menus 
     WHERE is_active = true AND $1 = ANY(roles)
     ORDER BY sort_order ASC`,
    [role],
  );
  return result.rows;
};

const create = async ({ label, path, icon, sort_order, roles, is_active }) => {
  const result = await pool.query(
    `INSERT INTO menus (label, path, icon, sort_order, roles, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      label,
      path,
      icon,
      sort_order || 0,
      roles || ["admin", "manager", "staff"],
      is_active ?? true,
    ],
  );
  return result.rows[0];
};

const update = async (
  id,
  { label, path, icon, sort_order, roles, is_active },
) => {
  const result = await pool.query(
    `UPDATE menus
     SET label = $1, path = $2, icon = $3, sort_order = $4, roles = $5, is_active = $6
     WHERE id = $7
     RETURNING *`,
    [label, path, icon, sort_order, roles, is_active, id],
  );
  if (!result.rows[0]) throw { status: 404, message: "Menu tidak ditemukan." };
  return result.rows[0];
};

const updateOrder = async (items) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const item of items) {
      await client.query("UPDATE menus SET sort_order = $1 WHERE id = $2", [
        item.sort_order,
        item.id,
      ]);
    }
    await client.query("COMMIT");
    return { message: "Urutan menu berhasil diupdate." };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM menus WHERE id = $1 RETURNING *",
    [id],
  );
  if (!result.rows[0]) throw { status: 404, message: "Menu tidak ditemukan." };
  return { message: "Menu berhasil dihapus." };
};

module.exports = { getAll, getByRole, create, update, updateOrder, remove };
