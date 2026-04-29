const warehousesService = require("./warehouses.service");

const getAll = async (req, res) => {
  try {
    const data = await warehousesService.getAll();
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await warehousesService.getById(req.params.id);
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nama gudang wajib diisi." });
    }
    const data = await warehousesService.create({ name, address });
    res.status(201).json({ message: "Gudang berhasil dibuat.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nama gudang wajib diisi." });
    }
    const data = await warehousesService.update(req.params.id, {
      name,
      address,
    });
    res.json({ message: "Gudang berhasil diupdate.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await warehousesService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getLocations = async (req, res) => {
  try {
    const data = await warehousesService.getLocations(req.params.id);
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const createLocation = async (req, res) => {
  try {
    const { product_id, location_code } = req.body;
    if (!location_code) {
      return res.status(400).json({ error: "Kode lokasi wajib diisi." });
    }
    const data = await warehousesService.createLocation({
      warehouse_id: req.params.id,
      product_id,
      location_code,
    });
    res.status(201).json({ message: "Lokasi berhasil dibuat.", data });
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
  getLocations,
  createLocation,
};
