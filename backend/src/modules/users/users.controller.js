const usersService = require("./users.service");

const getAll = async (req, res) => {
  try {
    const data = await usersService.getAll();
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await usersService.getById(req.params.id);
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { email, name, role, password } = req.body;
    if (!email || !name || !role || !password) {
      return res
        .status(400)
        .json({ error: "Email, nama, role, dan password wajib diisi." });
    }
    const data = await usersService.create({ email, name, role, password });
    res.status(201).json({ message: "User berhasil dibuat.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: "Nama dan role wajib diisi." });
    }
    const data = await usersService.update(req.params.id, { name, role });
    res.json({ message: "User berhasil diupdate.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: "Password baru wajib diisi." });
    }
    const result = await usersService.resetPassword(req.params.id, newPassword);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await usersService.remove(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { getAll, getById, create, update, resetPassword, remove };
