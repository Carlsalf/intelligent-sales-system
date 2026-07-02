const service = require("../services/auth.service");

async function loginController(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email y password son requeridos" });
    }
    const result = await service.login(email, password);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function meController(req, res, next) {
  try {
    const user = await service.me(req.user.id_usuario);
    return res.json(user);
  } catch (err) {
    return next(err);
  }
}

module.exports = { loginController, meController };
