const { login } = require("../services/auth.service");

async function loginController(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "email y password son requeridos" });
    }

    const result = await login(email, password);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { loginController };
