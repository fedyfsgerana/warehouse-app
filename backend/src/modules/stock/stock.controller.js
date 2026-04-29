const stockService = require("./stock.service");

const getAll = async (req, res) => {
  try {
    const { warehouse_id } = req.query;
    const data = await stockService.getAll({ warehouse_id });
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const check = async (req, res) => {
  try {
    const { product_id, qty } = req.query;
    if (!product_id || !qty) {
      return res.status(400).json({ error: "product_id dan qty wajib diisi." });
    }
    const data = await stockService.check({ product_id, qty });
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const mutate = async (req, res) => {
  try {
    const { from_loc, to_loc, product_id, qty } = req.body;
    if (!from_loc || !to_loc || !product_id || !qty) {
      return res
        .status(400)
        .json({ error: "from_loc, to_loc, product_id, dan qty wajib diisi." });
    }
    const result = await stockService.mutate({
      from_loc,
      to_loc,
      product_id,
      qty,
      user_id: req.user.id,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const { from, to, product_id } = req.query;
    const data = await stockService.getHistory({ from, to, product_id });
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { getAll, check, mutate, getHistory };
