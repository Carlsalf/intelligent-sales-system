import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@pyme.com");
  const [password, setPassword] = useState("Admin123*");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Credenciales incorrectas o servidor no disponible.");
    }
  };

  return (
    <main className="page">
      <section className="card">
        <h1>Intelligent Sales System</h1>
        <p className="subtitle">Sistema modular de gestión de ventas para PYMES</p>

        <form onSubmit={handleSubmit} className="form">
          <label>Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Ingresar</button>
        </form>

        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
