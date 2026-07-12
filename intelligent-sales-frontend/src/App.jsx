import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard/Dashboard";
import Products from "./pages/Products/Products";
import Clients from "./pages/Clients/Clients";
import Sales from "./pages/Sales/Sales";
import Analytics from "./pages/Analytics/Analytics";
import Users from "./pages/Users/Users";
import Login from "./pages/Login/Login";
import api from "./services/api";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  async function checkSession() {
    const token = localStorage.getItem("token");

    if (!token) {
      return {
        authenticated: false,
        clearToken: false,
      };
    }

    try {
      await api.get("/auth/me");

      return {
        authenticated: true,
        clearToken: false,
      };
    } catch {
      return {
        authenticated: false,
        clearToken: true,
      };
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function validateInitialSession() {
      const result = await checkSession();

      if (cancelled) return;

      if (result.clearToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      setAuthenticated(result.authenticated);
      setCurrentPage("dashboard");
      setCheckingSession(false);
    }

    void validateInitialSession();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleLoginSuccess() {
    setAuthenticated(true);
    setCurrentPage("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthenticated(false);
    setCurrentPage("dashboard");
  }

  const pages = {
    dashboard: <Dashboard onNavigate={setCurrentPage} />,
    productos: <Products />,
    clientes: <Clients />,
    ventas: <Sales />,
    analitica: <Analytics />,
    users: <Users />,
  };

  if (checkingSession) {
    return (
      <div className="session-loading">
        <div>
          <strong>Validando sesión</strong>
          <span>Comprobando credenciales del sistema...</span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <button onClick={() => setCurrentPage("dashboard")}>Dashboard</button>
        <button onClick={() => setCurrentPage("productos")}>Productos</button>
        <button onClick={() => setCurrentPage("clientes")}>Clientes</button>
        <button onClick={() => setCurrentPage("ventas")}>Ventas</button>
        <button onClick={() => setCurrentPage("analitica")}>Analítica</button>
        <button onClick={handleLogout}>Salir</button>
      </nav>

      {pages[currentPage] || pages.dashboard}
    </div>
  );
}

export default App;
