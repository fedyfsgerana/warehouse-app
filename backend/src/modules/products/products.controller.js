const productsService = require("./products.service");

const getAll = async (req, res) => {
  try {
    const { category, search } = req.query;
    const data = await productsService.getAll({ category, search });
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await productsService.getById(req.params.id);
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { sku, name, category_id, unit, min_stock } = req.body;
    if (!sku || !name || !unit) {
      return res
        .status(400)
        .json({ error: "SKU, nama, dan unit wajib diisi." });
    }
    const data = await productsService.create({
      sku,
      name,
      category_id,
      unit,
      min_stock,
    });
    res.status(201).json({ message: "Produk berhasil dibuat.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, unit, min_stock, category_id } = req.body;
    if (!name || !unit) {
      return res.status(400).json({ error: "Nama dan unit wajib diisi." });
    }
    const data = await productsService.update(req.params.id, {
      name,
      unit,
      min_stock,
      category_id,
    });
    res.json({ message: "Produk berhasil diupdate.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await productsService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const data = await productsService.getCategories();
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nama kategori wajib diisi." });
    }
    const data = await productsService.createCategory(name);
    res.status(201).json({ message: "Kategori berhasil dibuat.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
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
