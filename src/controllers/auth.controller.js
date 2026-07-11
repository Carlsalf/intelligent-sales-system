const { login } = require("../services/auth.service");

async function loginController(req, res, next) {
  try {
    const { email, password } = req.body || {};

    console.log("====================================");
    console.log("Solicitud de autenticación recibida");
    console.log("Usuario:", email);
    console.log("Hora:", new Date().toISOString());
    console.log("====================================");

    if (!email || !password) {
      return res.status(400).json({
        message: "email y password son requeridos"
      });
    }

    const result = await login(email, password);

    console.log("Autenticación correcta");
    console.log("Usuario autenticado:", result.user.email);
    console.log("====================================");

    return res.json(result);

  } catch (err) {
    console.error("Error de autenticación:", err.message);
    return next(err);
  }
}

module.exports = { loginController };