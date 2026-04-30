const menusService = require("./menus.service");

const getAll = async (req, res) => {
  try {
    const data = await menusService.getAll();
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getByRole = async (req, res) => {
  try {
    const data = await menusService.getByRole(req.user.role);
    res.json({ data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { label, path, icon, sort_order, roles, is_active } = req.body;
    if (!label || !path || !icon) {
      return res
        .status(400)
        .json({ error: "Label, path, dan icon wajib diisi." });
    }
    const data = await menusService.create({
      label,
      path,
      icon,
      sort_order,
      roles,
      is_active,
    });
    res.status(201).json({ message: "Menu berhasil dibuat.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { label, path, icon, sort_order, roles, is_active } = req.body;
    if (!label || !path || !icon) {
      return res
        .status(400)
        .json({ error: "Label, path, dan icon wajib diisi." });
    }
    const data = await menusService.update(req.params.id, {
      label,
      path,
      icon,
      sort_order,
      roles,
      is_active,
    });
    res.json({ message: "Menu berhasil diupdate.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items wajib diisi." });
    }
    const result = await menusService.updateOrder(items);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await menusService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { getAll, getByRole, create, update, updateOrder, remove };
