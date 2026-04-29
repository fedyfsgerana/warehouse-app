const authService = require("./auth.service");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib diisi." });
    }

    const data = await authService.login(email, password);
    res.json({ message: "Login berhasil.", data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ data: user });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const logout = (req, res) => {
  res.json({ message: "Logout berhasil." });
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Password lama dan baru wajib diisi." });
    }

    const result = await authService.changePassword(
      req.user.id,
      oldPassword,
      newPassword,
    );
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { login, getMe, logout, changePassword };
