const reportsService = require("./reports.service");

const getDashboard = async (req, res) => {
  try {
    const data = await reportsService.getDashboard();
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getStockMovement = async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await reportsService.getStockMovement({ from, to });
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getPOSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await reportsService.getPOSummary({ from, to });
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { getDashboard, getStockMovement, getPOSummary };
