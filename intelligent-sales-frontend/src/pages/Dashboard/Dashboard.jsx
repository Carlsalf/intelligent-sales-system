import { useEffect, useMemo, useState } from "react";
import iconProducts from "../../assets/branding/icon-products.png";
import iconClients from "../../assets/branding/icon-clients.png";
import iconSales from "../../assets/branding/icon-sales.png";
import iconAnalytics from "../../assets/branding/icon-analytics.png";
import api from "../../services/api";
import { initials, roleLabel, permissionSummary, isAdmin, isSeller } from "../../utils/roles";
import "./Dashboard.css";

function money(value) {
  return `€ ${Number(value || 0).toFixed(2)}`;
}

function trendText(value) {
  if (value === "descendente") return "Atención comercial";
  if (value === "ascendente") return "Crecimiento comercial";
  return "Estabilidad comercial";
}

function Dashboard({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  async function fetchDashboardData() {
    const [productsRes, clientsRes, salesRes, analyticsRes, meRes] =
      await Promise.all([
        api.get("/productos"),
        api.get("/clients"),
        api.get("/ventas"),
        api.get("/analytics/summary"),
        api.get("/me"),
      ]);

    return {
      products: productsRes.data || [],
      clients: clientsRes.data || [],
      sales: salesRes.data || [],
      analytics: analyticsRes.data || null,
      currentUser: meRes.data.user || null,
      updatedAt: new Date().toLocaleString("es-ES"),
    };
  }

  function applyDashboardData(data) {
    setProducts(data.products);
    setClients(data.clients);
    setSales(data.sales);
    setAnalytics(data.analytics);
    setCurrentUser(data.currentUser);
    setUpdatedAt(data.updatedAt);
  }

  async function loadDashboard() {
    try {
      setLoading(true);
      const data = await fetchDashboardData();
      applyDashboardData(data);
    } catch (err) {
      console.error(
        "Error cargando dashboard:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialDashboard() {
      try {
        const data = await fetchDashboardData();

        if (!cancelled) {
          applyDashboardData(data);
        }
      } catch (err) {
        console.error(
          "Error cargando dashboard:",
          err.response?.data || err.message
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const activeProducts = products.filter((p) => Number(p.estado) !== 0).length;
    const lowStock = products.filter((p) => Number(p.estado) !== 0 && Number(p.stock || 0) <= 5).length;

    const activeClients = clients.filter((c) => Number(c.estado) !== 0).length;
    const inactiveClients = clients.filter((c) => Number(c.estado) === 0).length;
    const pendingClients = clients.filter(
      (c) =>
        Number(c.estado) !== 0 &&
        (!c.documento || !c.telefono || !c.email)
    ).length;

    const confirmedSales = sales.filter((s) => Number(s.estado) !== 0);
    const cancelledSales = sales.filter((s) => Number(s.estado) === 0);
    const revenue = confirmedSales.reduce((sum, s) => sum + Number(s.total || 0), 0);

    return {
      activeProducts,
      lowStock,
      activeClients,
      inactiveClients,
      pendingClients,
      confirmedSales: confirmedSales.length,
      cancelledSales: cancelledSales.length,
      revenue,
      commercialIndex: analytics?.indice_comercial || 0,
      health: analytics?.salud_comercial || "No disponible",
      trend: analytics?.tendencia || "estable",
      recommendation: analytics?.recomendaciones?.[0] || "Mantener seguimiento de ventas, clientes y stock.",
      projection: analytics?.proyeccion_siguiente_mes || 0,
    };
  }, [products, clients, sales, analytics]);

  const baseModules = [
    {
      title: "Gestión de Productos",
      description: "Control de catálogo, categorías, precios, stock y disponibilidad.",
      icon: iconProducts,
      metric: loading ? "…" : stats.activeProducts,
      label: "productos activos",
      detail: `${stats.lowStock} con stock bajo`,
    },
    {
      title: "Gestión de Clientes",
      description: "Cartera comercial, seguimiento, bajas lógicas y calidad de datos.",
      icon: iconClients,
      metric: loading ? "…" : stats.activeClients,
      label: "clientes disponibles",
      detail: `${stats.pendingClients} con datos pendientes`,
    },
    {
      title: "Gestión de Ventas",
      description: "Registro de operaciones, anulación controlada e inventario actualizado.",
      icon: iconSales,
      metric: loading ? "…" : money(stats.revenue),
      label: "facturación confirmada",
      detail: `${stats.confirmedSales} ventas confirmadas`,
    },
    {
      title: "Analítica Comercial",
      description: "Tendencias, reglas de negocio, recomendaciones y proyección simple.",
      icon: iconAnalytics,
      metric: loading ? "…" : `${stats.commercialIndex}/100`,
      label: "índice comercial",
      detail: trendText(stats.trend),
    },
  ];

  const roleHeadline = isAdmin(currentUser)
    ? "Centro de administración empresarial"
    : isSeller(currentUser)
      ? "Panel operativo de ventas"
      : "Panel ejecutivo comercial";

  const roleDescription = isAdmin(currentUser)
    ? "Supervise usuarios, seguridad, infraestructura, módulos comerciales y trazabilidad del sistema."
    : isSeller(currentUser)
      ? "Acceda rápidamente a ventas, productos disponibles y clientes para la operación comercial diaria."
      : "Analice ventas, clientes, productos, alertas y recomendaciones para la toma de decisiones gerenciales.";

  const modules = isSeller(currentUser)
    ? baseModules.filter((module) => module.title !== "Analítica Comercial")
    : baseModules;

  return (
    <section className="dashboard-page dashboard-pro">
      <header className="dashboard-hero-pro">
        <div>
          <span className="dashboard-eyebrow">Intelligent Sales System</span>
          <h1>{roleHeadline}</h1>
          <p>{roleDescription}</p>
        </div>

        <aside className="dashboard-profile-card profile-menu-wrapper">
          <button
            type="button"
            className="profile-trigger"
            onClick={() => setProfileOpen((value) => !value)}
          >
            <div className="profile-avatar">{initials(currentUser)}</div>
            <div>
              <strong>{currentUser?.nombre?.replace("Administrador TFM", "Administrador del Sistema") || "Usuario del sistema"}</strong>
              <span>{roleLabel(currentUser)}</span>
              <small><b></b> En línea · {roleLabel(currentUser)}</small>
              <em>{permissionSummary(currentUser)}</em>
            </div>
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <div>
                <strong>{currentUser?.nombre?.replace("Administrador TFM", "Administrador del Sistema") || "Usuario del sistema"}</strong>
                <span>{roleLabel(currentUser)}</span>
              </div>

              <button type="button" disabled>Mi perfil · Próximamente</button>
              <button type="button" disabled>Preferencias · Próximamente</button>
              {isAdmin(currentUser) && <button type="button" onClick={() => onNavigate?.("users")}>Gestión de usuarios</button>}
              <button type="button" className="logout-option">Cerrar sesión</button>
            </div>
          )}
        </aside>
      </header>

      <section className="dashboard-executive-strip">
        <div>
          <span>Estado comercial</span>
          <strong>{loading ? "…" : stats.health}</strong>
          <small>Índice comercial: {loading ? "…" : `${stats.commercialIndex}/100`}</small>
        </div>

        <div>
          <span>Recomendación principal</span>
          <p>{loading ? "Actualizando información comercial..." : stats.recommendation}</p>
        </div>

        <div className="dashboard-updated">
          <span>Última actualización</span>
          <strong>{updatedAt || "Pendiente"}</strong>
        </div>

        <button onClick={loadDashboard} disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar panel"}
        </button>
      </section>

      <section className="dashboard-enterprise-grid">
        <article className="enterprise-panel user-center">
          <span>Perfil y permisos</span>
          <h2>Perfil y permisos</h2>

          <div className="enterprise-user-line">
            <div className="enterprise-avatar">{initials(currentUser)}</div>
            <div>
              <strong>{currentUser?.nombre?.replace("Administrador TFM", "Administrador del Sistema") || "Usuario del sistema"}</strong>
              <small>{roleLabel(currentUser)}</small>
            </div>
          </div>

          <div className="enterprise-data-list">
            <div><span>Rol</span><strong>{roleLabel(currentUser)}</strong></div>
            <div><span>Permisos</span><strong>{permissionSummary(currentUser)}</strong></div>
            <div><span>Sesión</span><strong className="online-text">Activa</strong></div>
          </div>
        </article>

        {isAdmin(currentUser) ? (
          <article className="enterprise-panel system-center">
            <span>Estado operativo</span>
            <h2>Infraestructura del sistema</h2>

            <div className="system-status-list">
              <div><b></b><span>Servidor</span><strong>Operativo</strong></div>
              <div><b></b><span>Servicios API</span><strong>Disponibles</strong></div>
              <div><b></b><span>Base de datos</span><strong>Sincronizada</strong></div>
              <div><b></b><span>Seguridad</span><strong>Autenticada</strong></div>
            </div>
          </article>
        ) : (
          <article className="enterprise-panel system-center business-center">
            <span>Resumen comercial</span>
            <h2>Situación del negocio</h2>

            <div className="system-status-list">
              <div><b></b><span>Estado comercial</span><strong>{stats.health}</strong></div>
              <div><b></b><span>Ventas confirmadas</span><strong>{stats.confirmedSales}</strong></div>
              <div><b></b><span>Clientes disponibles</span><strong>{stats.activeClients}</strong></div>
              <div><b></b><span>Proyección</span><strong>{money(stats.projection)}</strong></div>
            </div>
          </article>
        )}

        <article className="enterprise-panel notification-center">
          <span>Alertas prioritarias</span>
          <h2>Notificaciones ejecutivas</h2>

          <div className="notification-list">
            <div className={stats.lowStock > 0 ? "warning" : "ok"}>
              <strong>{stats.lowStock}</strong>
              <p>producto(s) requieren revisión de stock.</p>
            </div>
            <div className={stats.pendingClients > 0 ? "warning" : "ok"}>
              <strong>{stats.pendingClients}</strong>
              <p>cliente(s) con información incompleta.</p>
            </div>
            <div className="info">
              <strong>{money(stats.projection)}</strong>
              <p>proyección simple del siguiente periodo.</p>
            </div>
          </div>
        </article>
      </section>

      <div className="dashboard-kpis-pro">
        <article>
          <span>Facturación confirmada</span>
          <strong>{loading ? "…" : money(stats.revenue)}</strong>
          <small>Ventas no anuladas</small>
        </article>

        <article>
          <span>Ventas confirmadas</span>
          <strong>{loading ? "…" : stats.confirmedSales}</strong>
          <small>{stats.cancelledSales} venta(s) anulada(s)</small>
        </article>

        <article className={stats.lowStock > 0 ? "warning" : ""}>
          <span>Productos activos</span>
          <strong>{loading ? "…" : stats.activeProducts}</strong>
          <small>{stats.lowStock} producto(s) con stock bajo</small>
        </article>

        <article className={stats.pendingClients > 0 ? "warning" : ""}>
          <span>Clientes disponibles</span>
          <strong>{loading ? "…" : stats.activeClients}</strong>
          <small>{stats.inactiveClients} dado(s) de baja · {stats.pendingClients} pendiente(s)</small>
        </article>
      </div>

      <section className="dashboard-quick-actions">
        <div>
          <span>Accesos rápidos</span>
          <h2>Operaciones frecuentes</h2>
        </div>

        <div>
          <button onClick={() => onNavigate?.("ventas")}>＋ Nueva venta</button>
          <button onClick={() => onNavigate?.("productos")}>📦 Consultar productos</button>
          <button onClick={() => onNavigate?.("clientes")}>👥 Clientes pendientes</button>
          {!isSeller(currentUser) && <button onClick={() => onNavigate?.("analitica")}>📊 Ver analítica</button>}
          {isAdmin(currentUser) && (
            <button onClick={() => onNavigate?.("users")}>
              ⚙ Gestión del sistema
            </button>
          )}
        </div>
      </section>

      <div className="dashboard-modules-pro">
        {modules.map((module) => (
          <article className="module-card-pro" key={module.title}>
            <div className="module-icon-pro">
              <img src={module.icon} alt={module.title} />
            </div>

            <div>
              <h2>{module.title}</h2>
              <p>{module.description}</p>
            </div>

            <div className="module-metric-pro">
              <strong>{module.metric}</strong>
              <span>{module.label}</span>
              <small>{module.detail}</small>
            </div>
          </article>
        ))}
      </div>

      <section className="dashboard-ai-readiness">
        <div>
          <span>Evolución del sistema</span>
          <h2>Preparación para analítica predictiva</h2>
          <p>
            El sistema ya dispone de datos históricos, reglas de negocio, indicadores
            y arquitectura modular preparada para integrar modelos predictivos en una siguiente fase.
          </p>
        </div>

        <div className="ai-progress">
          <strong>80%</strong>
          <span>Preparado para IA futura</span>
        </div>
      </section>
    </section>
  );
}

export default Dashboard;
