import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function money(value) {
  return `€ ${Number(value || 0).toFixed(2)}`;
}

function pct(value) {
  const number = Number(value || 0);
  return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
}

function monthLabel(value) {
  const labels = {
    "2026-01": "Enero",
    "2026-02": "Febrero",
    "2026-03": "Marzo",
    "2026-04": "Abril",
    "2026-05": "Mayo",
    "2026-06": "Junio",
    "2026-07": "Julio",
  };
  return labels[value] || value || "No disponible";
}

function trendLabel(value) {
  if (value === "ascendente") return "Crecimiento";
  if (value === "descendente") return "Contracción";
  return "Estabilidad";
}

function trendClass(value) {
  if (value === "ascendente") return "status-success";
  if (value === "descendente") return "status-empty";
  return "status-warning";
}

function healthClass(score) {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "warning";
  return "risk";
}

function rankBadge(index) {
  return ["🥇", "🥈", "🥉"][index] || String(index + 1);
}

function priorityLabel(index) {
  return ["Alta", "Media", "Seguimiento"][index] || "Seguimiento";
}

function priorityClass(index) {
  return ["high", "medium", "low"][index] || "low";
}

function buildDonutGradient(months) {
  const colors = ["#2563eb", "#38bdf8", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444"];
  let current = 0;

  const segments = months.map((month, index) => {
    const start = current;
    const end = current + Number(month.percentage || 0);
    current = end;
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  });

  return `radial-gradient(circle at center, #fff 0 42%, transparent 43%), conic-gradient(${segments.join(", ")})`;
}

const initialAnalytics = {
  periodo: "Enero - Junio 2026",
  ventas_analizadas: 0,
  facturacion_acumulada: 0,
  ticket_medio: 0,
  ventas_mes: [],
  top_productos: [],
  top_clientes: [],
  mes_anterior: "",
  mes_actual: "",
  facturacion_mes_anterior: 0,
  facturacion_mes_actual: 0,
  variacion_mensual: 0,
  tendencia: "estable",
  salud_comercial: "No disponible",
  indice_comercial: 0,
  proyeccion_siguiente_mes: 0,
  recomendaciones: [],
  trazabilidad_negocio: [],
  evolucion_futura_ia: "",
};

export default function Analytics() {
  const [data, setData] = useState(initialAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/analytics/summary");
      setData({ ...initialAnalytics, ...response.data });
    } catch (err) {
      console.error("Error al cargar analítica:", err.response?.data || err.message);
      setError("No se pudo cargar el análisis comercial. Inténtelo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const chart = useMemo(() => {
    const values = data.ventas_mes.map((m) => Number(m.facturacion || 0));
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = Math.max(max - min, 1);

    const points = data.ventas_mes.map((month, index) => {
      const x = data.ventas_mes.length <= 1 ? 0 : (index / (data.ventas_mes.length - 1)) * 100;
      const y = 92 - ((Number(month.facturacion || 0) - min) / range) * 72;
      return { ...month, x, y };
    });

    return {
      points,
      path: points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" "),
      area: points.length
        ? `M ${points[0].x} 96 ${points.map((p) => `L ${p.x} ${p.y}`).join(" ")} L ${points[points.length - 1].x} 96 Z`
        : "",
      max,
    };
  }, [data.ventas_mes]);

  const bestMonth = useMemo(() => {
    if (!data.ventas_mes.length) return null;
    return [...data.ventas_mes].sort((a, b) => Number(b.facturacion) - Number(a.facturacion))[0];
  }, [data.ventas_mes]);

  const monthlyDistribution = useMemo(() => {
    const total = data.ventas_mes.reduce((sum, item) => sum + Number(item.facturacion || 0), 0) || 1;
    return data.ventas_mes.map((item) => ({
      ...item,
      percentage: Number(((Number(item.facturacion || 0) / total) * 100).toFixed(1)),
    }));
  }, [data.ventas_mes]);

  const insight = useMemo(() => {
    if (!bestMonth) return "Aún no existe histórico suficiente para generar una lectura ejecutiva.";
    if (data.tendencia === "descendente") {
      return `${monthLabel(bestMonth.mes)} fue el mejor periodo comercial con ${money(bestMonth.facturacion)}. ${monthLabel(data.mes_actual)} presenta una caída de ${pct(data.variacion_mensual)}, por lo que conviene reforzar acciones comerciales y revisar la rotación de productos.`;
    }
    if (data.tendencia === "ascendente") {
      return `${monthLabel(data.mes_actual)} mejora frente al periodo anterior. La recomendación principal es mantener stock disponible y consolidar los clientes con mayor facturación.`;
    }
    return `La evolución comercial se mantiene estable. Se recomienda controlar ticket promedio, productos líderes y cartera de clientes recurrentes.`;
  }, [bestMonth, data]);

  const donutGradient = useMemo(() => buildDonutGradient(monthlyDistribution), [monthlyDistribution]);

  const totalMonthlySales = data.ventas_mes.reduce((sum, item) => sum + Number(item.ventas || 0), 0);

  const worstMonth = useMemo(() => {
    if (!data.ventas_mes.length) return null;
    return [...data.ventas_mes].sort((a, b) => Number(a.facturacion) - Number(b.facturacion))[0];
  }, [data.ventas_mes]);

  const topProductTotal = data.top_productos.reduce((sum, item) => sum + Number(item.facturacion || 0), 0) || 1;
  const topClientTotal = data.top_clientes.reduce((sum, item) => sum + Number(item.facturacion || 0), 0) || 1;

  const trendArrow = Number(data.variacion_mensual) < 0 ? "↓" : Number(data.variacion_mensual) > 0 ? "↑" : "→";
  const executiveState = Number(data.indice_comercial) >= 85
    ? "Excelente"
    : Number(data.indice_comercial) >= 70
      ? "Saludable"
      : Number(data.indice_comercial) >= 50
        ? "Atención"
        : "Riesgo";

  return (
    <main className="module-page analytics-elite-page">
      <section className="analytics-hero">
        <div>
          <p className="module-kicker">Analítica comercial · Reglas de negocio · Apoyo a decisiones</p>
          <h1>Panel Ejecutivo de Analítica</h1>
          <p className="module-description">
            Indicadores clave, evolución comercial, recomendaciones y preparación para modelos predictivos.
          </p>
        </div>

        <div className="analytics-toolbar">
          <span>{data.periodo}</span>
          <button className="primary-button" onClick={loadAnalytics} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar datos"}
          </button>
        </div>
      </section>

      {error && <p className="form-error">{error}</p>}

      <section className="elite-kpi-grid">
        <article className="elite-kpi-card blue">
          <div className="kpi-icon">▣</div>
          <div>
            <span>Ventas analizadas</span>
            <strong>{loading ? "…" : data.ventas_analizadas}</strong>
            <small>{totalMonthlySales} operaciones históricas agrupadas</small>
          </div>
        </article>

        <article className="elite-kpi-card green">
          <div className="kpi-icon">€</div>
          <div>
            <span>Facturación acumulada</span>
            <strong>{loading ? "…" : money(data.facturacion_acumulada)}</strong>
            <small>Ingresos confirmados · ventas no anuladas</small>
          </div>
        </article>

        <article className="elite-kpi-card purple">
          <div className="kpi-icon">◇</div>
          <div>
            <span>Ticket promedio</span>
            <strong>{loading ? "…" : money(data.ticket_medio)}</strong>
            <small>Indicador de rendimiento comercial</small>
          </div>
        </article>

        <article className="elite-kpi-card orange">
          <div className="kpi-icon">↘</div>
          <div>
            <span>Variación mensual</span>
            <strong>{loading ? "…" : pct(data.variacion_mensual)}</strong>
            <small>{monthLabel(data.mes_anterior)} vs {monthLabel(data.mes_actual)}</small>
          </div>
        </article>

        <article className={`elite-kpi-card health ${healthClass(Number(data.indice_comercial))}`}>
          <div className="kpi-icon">◎</div>
          <div>
            <span>Índice comercial</span>
            <strong>{loading ? "…" : `${data.indice_comercial} / 100`}</strong>
            <small>Semáforo ejecutivo: {data.salud_comercial}</small>
          </div>
        </article>
      </section>

      <section className="analytics-dashboard-grid">
        <article className="elite-card line-card">
          <div className="elite-card-header">
            <div>
              <span>Evolución de facturación</span>
              <h2>Facturación por mes</h2>
            </div>
            <span className={`status-badge ${trendClass(data.tendencia)}`}>
              {trendLabel(data.tendencia)}
            </span>
          </div>

          <div className="line-chart-box">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <path className="line-area" d={chart.area} />
              <path className="line-stroke" d={chart.path} />
              {chart.points.map((point) => (
                <circle key={point.mes} cx={point.x} cy={point.y} r="1.6" className="line-dot" />
              ))}
            </svg>

            <div className="line-axis">
              {data.ventas_mes.map((month) => (
                <span key={month.mes}>{monthLabel(month.mes)}</span>
              ))}
            </div>
          </div>

          <div className="chart-values-row">
            {data.ventas_mes.map((month) => (
              <span key={month.mes}>{money(month.facturacion)}</span>
            ))}
          </div>

          <div className="chart-highlight-row">
            <span>Mejor mes: <strong>{monthLabel(bestMonth?.mes)} · {money(bestMonth?.facturacion)}</strong></span>
            <span>Menor mes: <strong>{monthLabel(worstMonth?.mes)} · {money(worstMonth?.facturacion)}</strong></span>
          </div>

          <p className="insight-box executive-insight">
            <strong>Conclusión ejecutiva:</strong> {insight}
          </p>
        </article>

        <article className="elite-card comparison-card">
          <span>Comparación del último periodo</span>
          <h2>{monthLabel(data.mes_actual)}</h2>

          <div className={`variation-hero ${Number(data.variacion_mensual) < 0 ? "down" : "up"}`}>
            <strong>{trendArrow}</strong>
            <div>
              <span>{pct(data.variacion_mensual)}</span>
              <small>{trendLabel(data.tendencia)}</small>
            </div>
          </div>

          <div className="comparison-pro-list">
            <div>
              <span>Mes anterior</span>
              <strong>{money(data.facturacion_mes_anterior)}</strong>
            </div>
            <div>
              <span>Mes actual</span>
              <strong>{money(data.facturacion_mes_actual)}</strong>
            </div>
            <div>
              <span>Diferencia</span>
              <strong>{money(Number(data.facturacion_mes_actual) - Number(data.facturacion_mes_anterior))}</strong>
            </div>
          </div>
        </article>

        <article className="elite-card executive-dark-card">
          <span>Resumen ejecutivo</span>
          <h2>{trendLabel(data.tendencia)} comercial</h2>

          <div className="executive-state-pill">
            <small>Estado general</small>
            <strong>{executiveState}</strong>
          </div>

          <p>{insight}</p>

          <div>
            <small>Índice comercial</small>
            <strong>{data.indice_comercial}/100</strong>
          </div>

          <div>
            <small>Proyección simple próximo mes</small>
            <strong>{money(data.proyeccion_siguiente_mes)}</strong>
          </div>
        </article>
      </section>

      <section className="analytics-dashboard-grid lower">
        <article className="elite-card donut-card">
          <span>Distribución mensual</span>
          <h2>Participación de facturación</h2>

          <div className="donut-layout">
            <div className="donut-ring" style={{ background: donutGradient }}>
              <strong>{money(data.facturacion_acumulada)}</strong>
              <span>Total</span>
            </div>

            <div className="donut-legend">
              {monthlyDistribution.map((month) => (
                <div key={month.mes}>
                  <span>{monthLabel(month.mes)}</span>
                  <strong>{month.percentage}%</strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="elite-card table-card">
          <span>Top productos</span>
          <h2>Mayor rotación</h2>
          <div className="pro-ranking">
            {data.top_productos.map((item, index) => (
              <div key={item.producto}>
                <span className="rank-medal">{rankBadge(index)}</span>
                <strong>{item.producto}</strong>
                <small>{item.unidades} unid.</small>
                <small>{money(item.facturacion)} · {((Number(item.facturacion || 0) / topProductTotal) * 100).toFixed(1)}%</small>
                <div><i style={{ width: `${(Number(item.facturacion || 0) / topProductTotal) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="elite-card table-card">
          <span>Top clientes</span>
          <h2>Mayor facturación</h2>
          <div className="pro-ranking">
            {data.top_clientes.map((item, index) => (
              <div key={item.cliente}>
                <span className="rank-medal">{rankBadge(index)}</span>
                <strong>{item.cliente}</strong>
                <small>{item.ventas} ventas</small>
                <small>{money(item.facturacion)} · {((Number(item.facturacion || 0) / topClientTotal) * 100).toFixed(1)}%</small>
                <div><i style={{ width: `${(Number(item.facturacion || 0) / topClientTotal) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="elite-card recommendations-card">
          <span>Recomendaciones clave</span>
          <h2>Acciones para gerencia</h2>
          <div className="recommendation-pro-list">
            {data.recomendaciones.map((item, index) => (
              <div key={item} className={`priority-item ${priorityClass(index)}`}>
                <strong>{priorityLabel(index)}</strong>
                <p>{item}</p>
              </div>
            ))}
          </div>

          <div className="projection-mini-card">
            <span>Proyección simple</span>
            <strong>{money(data.proyeccion_siguiente_mes)}</strong>
          </div>
        </article>
      </section>

      <section className="bottom-analytics-grid">
        <article className="elite-card flow-card">
          <span>Trazabilidad de negocio</span>
          <h2>Cómo se convierte la venta en decisión</h2>
          <div className="flow-timeline">
            {data.trazabilidad_negocio.map((step, index) => (
              <div key={step}>
                <strong>{index + 1}</strong>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="elite-card ia-card">
          <span>Evolución futura</span>
          <h2>Preparación para modelos predictivos</h2>
          <p>{data.evolucion_futura_ia}</p>

          <div className="ai-roadmap">
            <div className="done">
              <strong>1</strong>
              <span>Analítica descriptiva</span>
              <small>Implementado</small>
            </div>
            <div className="done">
              <strong>2</strong>
              <span>Reglas de negocio</span>
              <small>Implementado</small>
            </div>
            <div>
              <strong>3</strong>
              <span>Predicción de demanda</span>
              <small>Preparado</small>
            </div>
            <div>
              <strong>4</strong>
              <span>Segmentación de clientes</span>
              <small>Preparado</small>
            </div>
            <div>
              <strong>5</strong>
              <span>Recomendaciones IA</span>
              <small>Preparado</small>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
