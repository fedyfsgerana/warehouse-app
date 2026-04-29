const purchaseOrdersService = require("./purchase-orders.service");

const getAll = async (req, res) => {
  try {
    const { status, supplier } = req.query;
    const data = await purchaseOrdersService.getAll({ status, supplier });
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await purchaseOrdersService.getById(req.params.id);
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { supplier_id, items } = req.body;
    if (!supplier_id || !items || items.length === 0) {
      return res.status(400).json({ error: "Supplier dan items wajib diisi." });
    }
    const data = await purchaseOrdersService.create({
      supplier_id,
      items,
      user_id: req.user.id,
    });
    res.status(201).json({ message: "Purchase order berhasil dibuat.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status wajib diisi." });
    }
    const data = await purchaseOrdersService.updateStatus(
      req.params.id,
      status,
    );
    res.json({ message: "Status berhasil diupdate.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const receive = async (req, res) => {
  try {
    const { items, warehouse_id } = req.body;
    if (!items || items.length === 0 || !warehouse_id) {
      return res
        .status(400)
        .json({ error: "Items dan warehouse_id wajib diisi." });
    }
    const result = await purchaseOrdersService.receive(req.params.id, {
      items,
      warehouse_id,
      user_id: req.user.id,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { getAll, getById, create, updateStatus, receive };
