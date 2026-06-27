import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <main className="page">
      <section className="card dashboard-card">
        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">Intelligent Sales System</p>
            <h1>Panel de control comercial</h1>
            <p className="subtitle">
              Sistema modular para la gestión comercial y el análisis de información de ventas, diseñado para apoyar la toma de decisiones en pequeñas y medianas empresas.
            </p>
          </div>
        </div>

        <div className="dashboard-grid">
          <Link className="module-card premium-card" to="/productos">
            <span className="module-icon">📦</span>
            <h3>Gestión de Productos</h3>
            <p>Catálogo, categorías, precios y control de stock.</p>
          </Link>

          <Link className="module-card premium-card" to="/clientes">
            <span className="module-icon">👥</span>
            <h3>Gestión de Clientes</h3>
            <p>Consulta y seguimiento de clientes registrados.</p>
          </Link>

          <Link className="module-card premium-card" to="/ventas">
            <span className="module-icon">🧾</span>
            <h3>Gestión de Ventas</h3>
            <p>Registro de operaciones y actualización de inventario.</p>
          </Link>

          <Link className="module-card premium-card" to="/analitica">
            <span className="module-icon">📊</span>
            <h3>Analítica Comercial</h3>
            <p>Indicadores, tendencias y predicción básica con Python.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
