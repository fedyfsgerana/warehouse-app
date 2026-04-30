const suppliersService = require("./suppliers.service");

const getAll = async (req, res) => {
  try {
    const data = await suppliersService.getAll();
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await suppliersService.getById(req.params.id);
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nama supplier wajib diisi." });
    }
    const data = await suppliersService.create({ name, phone, address });
    res.status(201).json({ message: "Supplier berhasil dibuat.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nama supplier wajib diisi." });
    }
    const data = await suppliersService.update(req.params.id, {
      name,
      phone,
      address,
    });
    res.json({ message: "Supplier berhasil diupdate.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await suppliersService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
