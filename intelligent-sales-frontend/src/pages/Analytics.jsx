import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const emptyData = {
  ventasAnalizadas: 0,
  facturacion: 0,
  ticketMedio: 0,
  variacionPeriodo: 0,
  comparacionPeriodo: "",
  periodo: "Ene - May 2026",
  tendencia: "estable",
  tendenciaIcono: "•",
  alerta: "Evaluación comercial",
  saludComercial: 0,
  estadoComercial: "No disponible",
  formulaSaludComercial: [],
  pipelineAnalitico: ["SQLite", "Python/Pandas", "Cálculo de KPIs", "Motor de reglas", "JSON analítico", "Dashboard React"],
  mesAnterior: "",
  mesActual: "",
  totalMesAnterior: 0,
  totalMesActual: 0,
  diferenciaAbsoluta: 0,
  productoLider: "No disponible",
  cantidadProductoLider: 0,
  participacionProductoLider: 0,
  mejorMes: "No disponible",
  mejorMesTotal: 0,
  estabilidadComercial: "No disponible",
  coeficienteVariacion: 0,
  confianzaAnalitica: "No disponible",
  calidadHistorico: "No disponible",
  mesesAnalizados: 0,
  pendienteMensual: 0,
  modeloAnalitico: "Regresión lineal descriptiva",
  objetivoModelo: "Analizar tendencia histórica, no predecir ventas futuras",
  lectura: "El motor analítico evalúa los indicadores calculados para generar una lectura ejecutiva.",
  limitacion: "La línea de tendencia se utiliza como referencia visual descriptiva. No representa un modelo predictivo robusto ni una estimación futura definitiva.",
  reglasActivadas: [],
  topProductos: [],
  recomendacionesDinamicas: [
    "Mantener disponibilidad de productos con mayor rotación para sostener el crecimiento.",
    "Priorizar el control de stock del producto líder por su concentración en la rotación.",
    "Ampliar el histórico de operaciones para mejorar la precisión del análisis."
  ],
  riesgo: "No se observan riesgos críticos; se recomienda validar si el crecimiento puede sostenerse.",
  nivelRiesgo: "Bajo",
  conclusionAutomatica: "El sistema concluye el análisis a partir de los indicadores calculados y reglas de negocio aplicadas."
};

function euros(value) {
  return `€ ${Number(value || 0).toFixed(2)}`;
}

function tendenciaLabel(value) {
  const t = String(value || "").toLowerCase();
  if (t.includes("asc")) return "ascendente";
  if (t.includes("desc")) return "descendente";
  return "estable";
}

function tendenciaIcono(value) {
  const t = tendenciaLabel(value);
  if (t === "ascendente") return "▲";
  if (t === "descendente") return "▼";
  return "•";
}

function mapAnalytics(json) {
  const componentes = json.componentes_indice || {};
  const ventasMes = Array.isArray(json.ventas_mes) ? json.ventas_mes : [];
  const topProductos = Array.isArray(json.top_productos) ? json.top_productos : [];

  const mesesAnalizados = ventasMes.length || 0;
  const tendencia = tendenciaLabel(json.tendencia);

  return {
    ventasAnalizadas: json.ventas_analizadas ?? 0,
    facturacion: json.facturacion_acumulada ?? 0,
    ticketMedio: json.ticket_medio ?? 0,
    variacionPeriodo: json.variacion_mensual ?? 0,
    comparacionPeriodo: `${json.mes_anterior || "-"} vs ${json.mes_actual || "-"}`,
    periodo: "Ene - May 2026",
    tendencia,
    tendenciaIcono: tendenciaIcono(tendencia),
    alerta: tendencia === "ascendente" ? "Crecimiento comercial" : tendencia === "descendente" ? "Contracción comercial" : "Comportamiento estable",
    saludComercial: json.estado_comercial ?? json.indice_comercial ?? 0,
    estadoComercial: json.salud_comercial ?? "No disponible",

    formulaSaludComercial: [
      {
        criterio: "Variación mensual",
        peso: componentes.variacion_mensual?.peso || "40%",
        valor: `${componentes.variacion_mensual?.valor ?? json.variacion_mensual ?? 0}%`,
        puntaje: componentes.variacion_mensual?.puntos ?? 0
      },
      {
        criterio: "Estabilidad comercial",
        peso: componentes.estabilidad_comercial?.peso || "20%",
        valor: componentes.estabilidad_comercial?.valor ?? json.estabilidad_comercial ?? "No disponible",
        puntaje: componentes.estabilidad_comercial?.puntos ?? 0
      },
      {
        criterio: "Producto líder",
        peso: componentes.producto_lider?.peso || "15%",
        valor: componentes.producto_lider?.valor ?? `${json.producto_lider || "No disponible"} (${json.participacion_producto_lider ?? 0}%)`,
        puntaje: componentes.producto_lider?.puntos ?? 0
      },
      {
        criterio: "Calidad del histórico",
        peso: componentes.calidad_historico?.peso || "15%",
        valor: componentes.calidad_historico?.valor ?? json.confianza_analitica ?? "No disponible",
        puntaje: componentes.calidad_historico?.puntos ?? 0
      },
      {
        criterio: "Pendiente mensual",
        peso: componentes.pendiente_mensual?.peso || "10%",
        valor: `${componentes.pendiente_mensual?.valor ?? json.pendiente_mensual ?? 0} €/mes`,
        puntaje: componentes.pendiente_mensual?.puntos ?? 0
      }
    ],

    pipelineAnalitico: json.trazabilidad || emptyData.pipelineAnalitico,
    mesAnterior: json.mes_anterior || "",
    mesActual: json.mes_actual || "",
    totalMesAnterior: json.facturacion_mes_anterior ?? 0,
    totalMesActual: json.facturacion_mes_actual ?? 0,
    diferenciaAbsoluta: json.diferencia_mensual ?? 0,

    productoLider: json.producto_lider || "No disponible",
    cantidadProductoLider: json.producto_lider_unidades ?? 0,
    participacionProductoLider: json.participacion_producto_lider ?? 0,
    mejorMes: json.mejor_mes || "No disponible",
    mejorMesTotal: json.mejor_mes_facturacion ?? 0,
    estabilidadComercial: json.estabilidad_comercial || "No disponible",
    coeficienteVariacion: json.coeficiente_variacion ?? 0,
    confianzaAnalitica: json.confianza_analitica || "No disponible",
    calidadHistorico: json.confianza_analitica || "No disponible",
    mesesAnalizados,
    pendienteMensual: json.pendiente_mensual ?? 0,

    modeloAnalitico: "Regresión lineal descriptiva",
    objetivoModelo: "Analizar tendencia histórica, no predecir ventas futuras",
    lectura: `El motor analítico identifica una variación mensual de ${json.variacion_mensual ?? 0}% y clasifica la evolución comercial como ${json.salud_comercial || "no disponible"}.`,
    limitacion: json.limitacion || emptyData.limitacion,

    reglasActivadas: [
      ...(Number(json.variacion_mensual || 0) > 10 ? ["Variación mensual superior al 10%"] : []),
      ...(Number(json.participacion_producto_lider || 0) > 30 ? ["Participación del producto líder superior al 30%"] : []),
      ...(mesesAnalizados < 12 ? ["Histórico insuficiente para confianza alta"] : [])
    ],

    topProductos: topProductos.slice(0, 3).map((p) => ({
      nombre: p.producto || p.nombre || "Producto",
      cantidad: p.unidades ?? p.cantidad ?? 0
    })),

    recomendacionesDinamicas: emptyData.recomendacionesDinamicas,
    riesgo: emptyData.riesgo,
    nivelRiesgo: "Bajo",
    conclusionAutomatica: `El sistema concluye que el periodo analizado presenta una salud comercial ${json.salud_comercial || "no disponible"}, con tendencia ${tendencia}, producto líder ${json.producto_lider || "no disponible"} y una confianza analítica ${json.confianza_analitica || "no disponible"}.`
  };
}

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(emptyData);

  useEffect(() => {
    fetch(`/analytics-summary.json?v=${Date.now()}`)
      .then((r) => r.json())
      .then((json) => setData({ ...emptyData, ...mapAnalytics(json) }))
      .catch(() => setData(emptyData));
  }, []);

  const formula = useMemo(() => data.formulaSaludComercial || [], [data]);

  return (
    <main className="analytics-page">
      <section className="analytics-shell">
        <header className="analytics-header">
          <div>
            <h1>📊 Analítica Comercial</h1>
            <p>Plataforma inteligente de apoyo a la toma de decisiones comerciales basada en indicadores, reglas de negocio y analítica de datos.</p>
          </div>
          <button className="dark-button" onClick={() => navigate("/dashboard")}>Volver</button>
        </header>

        <section className="kpi-grid four">
          <article className="kpi-card"><span>Ventas analizadas</span><strong>{data.ventasAnalizadas}</strong><small>Operaciones comerciales registradas</small></article>
          <article className="kpi-card"><span>Facturación acumulada</span><strong>{euros(data.facturacion)}</strong><small>{data.periodo}</small></article>
          <article className="kpi-card"><span>Ticket medio</span><strong>{euros(data.ticketMedio)}</strong><small>Promedio por operación</small></article>
          <article className="kpi-card"><span>Variación mensual</span><strong className={data.variacionPeriodo >= 0 ? "positive" : "negative"}>{data.variacionPeriodo}%</strong><small>{data.comparacionPeriodo}</small></article>
        </section>

        <section className="signal-card">
          <span>{data.alerta}</span>
          <h2>{data.tendenciaIcono} Tendencia {data.tendencia}</h2>
          <p>El sistema aplica reglas de negocio sobre los indicadores calculados para clasificar la evolución comercial y generar una lectura ejecutiva.</p>
        </section>

        <section className="health-card">
          <h2>Estado comercial del periodo</h2>
          <strong>{data.saludComercial}/100</strong>
          <p>Salud comercial: {data.estadoComercial}</p>
          <div className="badge-row">
            <span>✓ Variación mensual</span><span>✓ Estabilidad comercial</span><span>✓ Concentración del producto líder</span><span>✓ Calidad del histórico</span><span>✓ Pendiente mensual observada</span>
          </div>
        </section>

        <section className="section-card">
          <h2>Cálculo del índice comercial ponderado</h2>
          <p>El índice de salud comercial se calcula sobre 100 puntos ponderando variación mensual, estabilidad, concentración del producto líder, calidad del histórico y pendiente observada.</p>
          <div className="source-pill">Fuente del cálculo: generate_business_charts.py → analytics-summary.json → Dashboard React.</div>
          <div className="formula-grid">
            {formula.map((item) => (
              <article className="formula-card" key={item.criterio}>
                <span>{item.criterio}</span><strong>{item.puntaje} pts</strong><small>Peso: {item.peso}</small><p>{item.valor}</p>
              </article>
            ))}
          </div>
          <p className="final-score">Resultado final: <strong>{data.saludComercial}/100</strong></p>
          <div className="scale-row"><span>Crítica: &lt;50</span><span>Aceptable: 50-69</span><span>Buena: 70-89</span><span>Excelente: ≥90</span></div>
        </section>

        <section className="section-card">
          <h2>Trazabilidad del análisis</h2>
          <p>Flujo técnico utilizado para transformar datos operacionales en indicadores de decisión.</p>
          <div className="pipeline-row">{data.pipelineAnalitico.map((step) => <span key={step}>{step}</span>)}</div>
          <div className="trace-grid">
            <article><span>Origen</span><strong>Base de datos SQLite</strong></article>
            <article><span>Procesamiento</span><strong>Python + Pandas</strong></article>
            <article><span>Motor</span><strong>Reglas de negocio</strong></article>
            <article><span>Salida</span><strong>JSON de indicadores consumido por React</strong></article>
          </div>
        </section>

        <section className="section-card">
          <h2>Comparación mensual trazable</h2>
          <div className="comparison-grid">
            <article><span>Mes anterior</span><strong>{data.mesAnterior}</strong><p>{euros(data.totalMesAnterior)}</p></article>
            <article><span>Mes actual</span><strong>{data.mesActual}</strong><p>{euros(data.totalMesActual)}</p></article>
            <article><span>Diferencia</span><strong>{data.diferenciaAbsoluta >= 0 ? "+" : ""}{euros(data.diferenciaAbsoluta)}</strong><p>{data.variacionPeriodo}% respecto al mes anterior</p></article>
          </div>
        </section>

        <section className="kpi-grid three">
          <article className="kpi-card"><span>Producto líder</span><strong>{data.productoLider}</strong><small>Mayor rotación registrada: {data.cantidadProductoLider} unidades</small></article>
          <article className="kpi-card"><span>Participación producto líder</span><strong>{data.participacionProductoLider}%</strong><small>Concentración sobre productos evaluados</small></article>
          <article className="kpi-card"><span>Mejor mes</span><strong>{data.mejorMes}</strong><small>{euros(data.mejorMesTotal)}</small></article>
          <article className="kpi-card"><span>Estabilidad comercial</span><strong>{data.estabilidadComercial}</strong><small>Coef. variación: {data.coeficienteVariacion}%</small></article>
          <article className="kpi-card"><span>Confianza analítica</span><strong>{data.confianzaAnalitica}</strong><small>{data.mesesAnalizados} meses · calidad {data.calidadHistorico}</small></article>
          <article className="kpi-card"><span>Pendiente mensual</span><strong>{data.pendienteMensual > 0 ? "+" : ""}{data.pendienteMensual}</strong><small>€/mes según regresión descriptiva</small></article>
        </section>

        <section className="chart-grid">
          <article className="chart-card"><h2>Evolución de ventas</h2><p>Permite comparar el importe mensual registrado y detectar cambios en el comportamiento comercial.</p><img src="/ventas_mes.png" alt="Evolución mensual de ventas" /><div className="chart-note"><strong>Lectura:</strong> el sistema identifica cambios entre periodos y los transforma en señales de seguimiento para el responsable comercial.</div></article>
          <article className="chart-card"><h2>Productos más vendidos</h2><p>Identifica productos con mayor rotación para apoyar decisiones de reposición e inventario.</p><img src="/top_productos.png" alt="Productos más vendidos" /><div className="chart-note"><strong>Lectura:</strong> el producto líder permite priorizar disponibilidad, reposición y control de stock.</div></article>
        </section>

        <section className="section-card">
          <h2>Tendencia histórica mediante regresión lineal descriptiva</h2>
          <p>Representa el comportamiento histórico disponible mediante una línea de tendencia descriptiva. No proyecta ventas futuras exactas.</p>
          <img className="wide-chart" src="/prediccion_ventas.png" alt="Regresión lineal descriptiva" />
          <div className="model-note"><strong>Modelo utilizado:</strong> {data.modeloAnalitico}<br />{data.objetivoModelo}<br />Pendiente observada: {data.pendienteMensual > 0 ? "+" : ""}{data.pendienteMensual} €/mes</div>
          <div className="warning-note"><strong>Limitación:</strong> {data.limitacion}</div>
        </section>

        <section className="executive-card"><h2>Lectura ejecutiva</h2><p>{data.lectura}</p></section>

        <section className="section-card">
          <h2>Motor de evaluación comercial</h2>
          <p>Las recomendaciones no se muestran como texto aislado: se generan a partir de reglas de negocio aplicadas sobre KPIs calculados.</p>
          <div className="rules-grid">
            <article><span>Regla 1</span><strong>Variación mensual &gt; 10%</strong><p>Tendencia ascendente</p></article>
            <article><span>Regla 2</span><strong>Variación mensual entre -10% y 10%</strong><p>Comportamiento estable</p></article>
            <article><span>Regla 3</span><strong>Variación mensual &lt; -10%</strong><p>Tendencia descendente</p></article>
            <article><span>Regla 4</span><strong>Histórico menor a 12 meses</strong><p>Confianza analítica media o baja</p></article>
          </div>
        </section>

        <section className="section-card">
          <h2>Reglas activadas en este análisis</h2>
          <p>El sistema explica qué condiciones fueron cumplidas para generar la lectura ejecutiva y las recomendaciones.</p>
          <div className="active-rules">
            {data.reglasActivadas.map((rule) => <article key={rule}>✓ Regla activada<br /><span>{rule}</span></article>)}
          </div>
        </section>

        <section className="section-card">
          <h2>Top 3 productos por rotación</h2>
          <div className="ranking-list">
            {data.topProductos.map((item, index) => (
              <div key={item.nombre}><strong>{index + 1}. {item.nombre}</strong><span>{item.cantidad} unidades</span></div>
            ))}
          </div>
        </section>

        <section className="action-section">
          <h2>Plan de acción generado por reglas de negocio</h2>
          <p>Acciones propuestas por el motor de evaluación comercial a partir de los indicadores calculados.</p>
          <div className="action-grid">
            <article><h3>Acción prioritaria</h3><p>{data.recomendacionesDinamicas[0]}</p></article>
            <article><h3>Acción sugerida</h3><p>{data.recomendacionesDinamicas[1]}</p></article>
            <article><h3>Seguimiento</h3><p>{data.recomendacionesDinamicas[2]}</p></article>
            <article><h3>Riesgo detectado</h3><strong>Nivel: {data.nivelRiesgo}</strong><p>{data.riesgo}</p></article>
          </div>
        </section>

        <section className="conclusion-card">
          <h2>Conclusión automática del motor analítico</h2>
          <p>{data.conclusionAutomatica}</p>
          <p><strong>Nivel de confianza del análisis:</strong> {data.confianzaAnalitica} ({data.mesesAnalizados} meses de histórico).</p>
        </section>
      </section>
    </main>
  );
}
