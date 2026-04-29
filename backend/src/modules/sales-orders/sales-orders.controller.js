const salesOrdersService = require("./sales-orders.service");

const getAll = async (req, res) => {
  try {
    const { status } = req.query;
    const data = await salesOrdersService.getAll({ status });
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await salesOrdersService.getById(req.params.id);
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { destination, items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items wajib diisi." });
    }
    const data = await salesOrdersService.create({
      destination,
      items,
      user_id: req.user.id,
    });
    res.status(201).json({ message: "Sales order berhasil dibuat.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const confirm = async (req, res) => {
  try {
    const result = await salesOrdersService.confirm(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const ship = async (req, res) => {
  try {
    const { tracking_number } = req.body;
    if (!tracking_number) {
      return res.status(400).json({ error: "Tracking number wajib diisi." });
    }
    const data = await salesOrdersService.ship(req.params.id, tracking_number);
    res.json({ message: "Sales order berhasil dikirim.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { getAll, getById, create, confirm, ship };
