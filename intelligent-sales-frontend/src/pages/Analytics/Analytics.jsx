import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./Analytics.css";

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

function healthClass(score) {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "warning";
  return "risk";
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

async function fetchAnalyticsSummary() {
  const response = await api.get("/analytics/summary");
  return { ...initialAnalytics, ...response.data };
}

export default function Analytics() {
  const [data, setData] = useState(initialAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const analytics = await fetchAnalyticsSummary();
      setData(analytics);
    } catch (err) {
      console.error("Error al cargar analítica:", err.response?.data || err.message);
      setError("No se pudo cargar el análisis comercial. Inténtelo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialAnalytics() {
      try {
        const analytics = await fetchAnalyticsSummary();

        if (!cancelled) {
          setData(analytics);
        }
      } catch (err) {
        console.error(
          "Error al cargar analítica:",
          err.response?.data || err.message
        );

        if (!cancelled) {
          setError(
            "No se pudo cargar el análisis comercial. Inténtelo nuevamente."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  const chart = useMemo(() => {
    const values = data.ventas_mes.map((m) => Number(m.facturacion || 0));
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = Math.max(max - min, 1);

    const points = data.ventas_mes.map((month, index) => {
      const x = data.ventas_mes.length <= 1 ? 0 : (index / (data.ventas_mes.length - 1)) * 100;
      const y = 90 - ((Number(month.facturacion || 0) - min) / range) * 68;
      return { ...month, x, y };
    });

    return {
      points,
      path: points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" "),
      area: points.length
        ? `M ${points[0].x} 96 ${points.map((p) => `L ${p.x} ${p.y}`).join(" ")} L ${points[points.length - 1].x} 96 Z`
        : "",
    };
  }, [data.ventas_mes]);

  const bestMonth = useMemo(() => {
    if (!data.ventas_mes.length) return null;
    return [...data.ventas_mes].sort((a, b) => Number(b.facturacion) - Number(a.facturacion))[0];
  }, [data.ventas_mes]);

  const worstMonth = useMemo(() => {
    if (!data.ventas_mes.length) return null;
    return [...data.ventas_mes].sort((a, b) => Number(a.facturacion) - Number(b.facturacion))[0];
  }, [data.ventas_mes]);

  const totalMes = data.ventas_mes.reduce((sum, item) => sum + Number(item.facturacion || 0), 0) || 1;
  const totalProductos = data.top_productos.reduce((sum, item) => sum + Number(item.facturacion || 0), 0) || 1;
  const totalClientes = data.top_clientes.reduce((sum, item) => sum + Number(item.facturacion || 0), 0) || 1;
  const totalVentas = data.ventas_mes.reduce((sum, item) => sum + Number(item.ventas || 0), 0);

  const insight = useMemo(() => {
    if (!bestMonth) return "Aún no existe histórico suficiente para generar una lectura ejecutiva.";
    if (data.tendencia === "descendente") {
      return `${monthLabel(bestMonth.mes)} fue el mejor periodo comercial con ${money(bestMonth.facturacion)}. ${monthLabel(data.mes_actual)} presenta una caída de ${pct(data.variacion_mensual)}, por lo que conviene reforzar acciones comerciales y revisar la rotación de productos.`;
    }
    if (data.tendencia === "ascendente") {
      return `${monthLabel(data.mes_actual)} mejora frente al periodo anterior. Se recomienda mantener stock disponible y consolidar los clientes con mayor facturación.`;
    }
    return "La evolución comercial se mantiene estable. Se recomienda controlar ticket promedio, productos líderes y cartera de clientes recurrentes.";
  }, [bestMonth, data]);

  const executiveState =
    Number(data.indice_comercial) >= 85 ? "Excelente" :
    Number(data.indice_comercial) >= 70 ? "Saludable" :
    Number(data.indice_comercial) >= 50 ? "Atención" : "Riesgo";

  const trendArrow = Number(data.variacion_mensual) < 0 ? "↓" : Number(data.variacion_mensual) > 0 ? "↑" : "→";

  return (
    <main className="analytics-pro-page">
      <section className="analytics-topbar-pro">
        <div className="search-box-pro">Buscar en analítica...</div>
        <div className="topbar-actions-pro">
          <span>{data.periodo}</span>
          <button onClick={loadAnalytics} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar datos"}
          </button>
        </div>
      </section>

      <section className="executive-hero-pro">
        <div className="hero-icon-pro">▥</div>
        <div>
          <p>Analítica comercial · Reglas de negocio · Apoyo a decisiones</p>
          <h1>Panel Ejecutivo de Analítica</h1>
          <span>Vista gerencial para supervisar ventas, clientes, productos, desempeño comercial y preparación para modelos predictivos.</span>
        </div>

        <div className="hero-sparkline">
          <svg viewBox="0 0 100 48" preserveAspectRatio="none">
            <polyline points="4,36 22,27 40,25 58,14 76,25 96,18" />
            <circle cx="58" cy="14" r="2.2" />
          </svg>
          <small>Tendencia comercial</small>
        </div>
      </section>

      {error && <p className="analytics-error">{error}</p>}

      <section className="kpi-row-pro">
        <KpiCard label="Ventas analizadas" value={data.ventas_analizadas} meta={`${totalVentas} operaciones agrupadas`} tone="blue" icon="▣" />
        <KpiCard label="Facturación acumulada" value={money(data.facturacion_acumulada)} meta="Ingresos confirmados" tone="green" icon="€" />
        <KpiCard label="Ticket promedio" value={money(data.ticket_medio)} meta="Rendimiento comercial" tone="purple" icon="◇" />
        <KpiCard label="Variación mensual" value={pct(data.variacion_mensual)} meta={`${monthLabel(data.mes_anterior)} vs ${monthLabel(data.mes_actual)}`} tone="red" icon="↘" />
        <KpiCard label="Índice comercial" value={`${data.indice_comercial}/100`} meta={`Estado: ${data.salud_comercial}`} tone={healthClass(Number(data.indice_comercial))} icon="◎" />
      </section>

      <section className="analytics-main-pro">
        <article className="panel-pro chart-panel-pro">
          <div className="panel-heading-pro">
            <div>
              <span>Evolución de facturación</span>
              <h2>Facturación por mes</h2>
            </div>
            <strong className="status-chip-pro">{trendLabel(data.tendencia)}</strong>
          </div>

          <div className="chart-stage-pro">
            <div className="grid-lines" />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <path className="line-area" d={chart.area} />
              <path className="line-stroke" d={chart.path} />
              {chart.points.map((point) => (
                <circle key={point.mes} cx={point.x} cy={point.y} r="1.6" className="line-dot" />
              ))}
            </svg>
          </div>

          <div className="month-axis-pro">
            {data.ventas_mes.map((month) => (
              <div key={month.mes}>
                <span>{monthLabel(month.mes)}</span>
                <strong>{money(month.facturacion)}</strong>
              </div>
            ))}
          </div>

          <div className="chart-insights-pro">
            <div>Mejor mes: <strong>{monthLabel(bestMonth?.mes)} · {money(bestMonth?.facturacion)}</strong></div>
            <div>Menor mes: <strong>{monthLabel(worstMonth?.mes)} · {money(worstMonth?.facturacion)}</strong></div>
          </div>

          <p className="executive-note-pro"><strong>Conclusión ejecutiva:</strong> {insight}</p>
        </article>

        <article className="panel-pro comparison-panel-pro">
          <span>Comparación del último periodo</span>
          <h2>{monthLabel(data.mes_actual)}</h2>

          <div className="variation-card-pro">
            <div>{trendArrow}</div>
            <section>
              <strong>{pct(data.variacion_mensual)}</strong>
              <small>{trendLabel(data.tendencia)}</small>
            </section>
          </div>

          <div className="comparison-list-pro">
            <div><span>Mes anterior</span><strong>{money(data.facturacion_mes_anterior)}</strong></div>
            <div><span>Mes actual</span><strong>{money(data.facturacion_mes_actual)}</strong></div>
            <div><span>Diferencia</span><strong className="negative">{money(Number(data.facturacion_mes_actual) - Number(data.facturacion_mes_anterior))}</strong></div>
          </div>
        </article>

        <article className="executive-summary-pro">
          <span>Resumen ejecutivo</span>
          <h2>{trendLabel(data.tendencia)} comercial</h2>

          <div className="state-box-pro">
            <small>Estado general</small>
            <strong>{executiveState}</strong>
          </div>

          <p>{insight}</p>

          <div className="summary-metrics-pro">
            <div><small>Índice comercial</small><strong>{data.indice_comercial}/100</strong></div>
            <div><small>Proyección siguiente mes</small><strong>{money(data.proyeccion_siguiente_mes)}</strong></div>
          </div>
        </article>
      </section>

      <section className="analytics-secondary-pro">
        <article className="panel-pro">
          <span>Distribución mensual</span>
          <h2>Participación de facturación</h2>
          <div className="distribution-pro">
            {data.ventas_mes
              .map((m) => ({ ...m, percentage: ((Number(m.facturacion || 0) / totalMes) * 100).toFixed(1) }))
              .sort((a, b) => Number(b.percentage) - Number(a.percentage))
              .map((month) => (
                <div key={month.mes}>
                  <section><strong>{monthLabel(month.mes)}</strong><span>{month.percentage}%</span></section>
                  <progress value={month.percentage} max="100" />
                </div>
              ))}
          </div>
        </article>

        <RankingCard label="Top productos" title="Mayor rotación" items={data.top_productos} total={totalProductos} nameKey="producto" metaKey="unidades" metaSuffix="unid." />
        <RankingCard label="Top clientes" title="Mayor facturación" items={data.top_clientes} total={totalClientes} nameKey="cliente" metaKey="ventas" metaSuffix="ventas" />

        <article className="panel-pro recommendations-panel-pro">
          <span>Recomendaciones clave</span>
          <h2>Acciones para gerencia</h2>

          <div className="recommendations-pro">
            {data.recomendaciones.map((item, index) => (
              <div key={item} className={`priority-${index}`}>
                <strong>{["Alta prioridad", "Media prioridad", "Seguimiento"][index] || "Seguimiento"}</strong>
                <p>{item}</p>
              </div>
            ))}
          </div>

          <div className="projection-pro">
            <span>Proyección simple</span>
            <strong>{money(data.proyeccion_siguiente_mes)}</strong>
          </div>
        </article>
      </section>

      <section className="analytics-bottom-pro">
        <article className="panel-pro">
          <span>Trazabilidad de negocio</span>
          <h2>Cómo se convierte la venta en decisión</h2>

          <div className="flow-pro">
            {data.trazabilidad_negocio.map((step, index) => (
              <div key={step}>
                <strong>{index + 1}</strong>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-pro ia-panel-pro">
          <span>Evolución futura</span>
          <h2>Preparación para modelos predictivos</h2>
          <p>{data.evolucion_futura_ia}</p>

          <div className="ai-roadmap-pro">
            {["Analítica descriptiva", "Reglas de negocio", "Predicción de demanda", "Segmentación de clientes", "Recomendaciones IA"].map((item, index) => (
              <div key={item} className={index < 2 ? "done" : ""}>
                <strong>{index + 1}</strong>
                <span>{item}</span>
                <small>{index < 2 ? "Implementado" : "Preparado"}</small>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function KpiCard({ label, value, meta, tone, icon }) {
  return (
    <article className={`kpi-card-pro ${tone}`}>
      <div className="kpi-icon-pro">{icon}</div>
      <section>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{meta}</small>
      </section>
    </article>
  );
}

function RankingCard({ label, title, items, total, nameKey, metaKey, metaSuffix }) {
  return (
    <article className="panel-pro ranking-panel-pro">
      <span>{label}</span>
      <h2>{title}</h2>

      <div className="ranking-list-pro">
        {items.map((item, index) => {
          const percentage = ((Number(item.facturacion || 0) / total) * 100).toFixed(1);
          return (
            <div className="ranking-row-pro" key={item[nameKey]}>
              <b>{index + 1}</b>
              <section>
                <strong>{item[nameKey]}</strong>
                <small>{item[metaKey]} {metaSuffix}</small>
              </section>
              <aside>
                <strong>{money(item.facturacion)}</strong>
                <small>{percentage}%</small>
              </aside>
              <progress value={percentage} max="100" />
            </div>
          );
        })}
      </div>
    </article>
  );
}
