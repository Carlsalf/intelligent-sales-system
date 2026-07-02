import { useState } from "react";
import api from "../../services/api";
import logoMain from "../../assets/branding/logo-main.png";
import "./Login.css";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("admin@pyme.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      const token = response.data?.token;

      if (!token) {
        setError("El backend no devolvió token JWT.");
        return;
      }

      localStorage.setItem("token", token);
      onLoginSuccess?.();
    } catch (err) {
      setError("Credenciales inválidas o backend no disponible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <img src={logoMain} alt="Intelligent Sales System" />
        </div>

        <h1>Intelligent Sales System</h1>
        <p>Sistema modular de gestión de ventas para PYMES</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Correo
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <span className="login-error">{error}</span>}

          <button type="submit" disabled={loading}>
            {loading ? "Validando acceso..." : "Ingresar al sistema"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
