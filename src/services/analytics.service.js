const repo = require("../repositories/analytics.repo");

function percentChange(previous, current) {
  if (!previous || Number(previous) === 0) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
}

/**
 * Proyección comercial simple.
 * Regla de negocio:
 * - Se calcula como promedio móvil de los dos últimos periodos comerciales disponibles.
 * - No corresponde a Machine Learning.
 * - Sirve como estimación descriptiva inicial para planificación gerencial.
 */
function calculateSimpleProjection(ventasPorMes = []) {
  if (!Array.isArray(ventasPorMes) || ventasPorMes.length === 0) return 0;

  const sorted = [...ventasPorMes].sort((a, b) =>
    String(a.mes).localeCompare(String(b.mes))
  );

  const lastPeriods = sorted.slice(-2);

  const projection =
    lastPeriods.reduce((sum, item) => sum + Number(item.facturacion || 0), 0) /
    lastPeriods.length;

  return Number(projection.toFixed(2));
}

function buildRecommendations({ variacion, topProductos, ventasPorMes }) {
  const recomendaciones = [];

  if (variacion > 10) {
    recomendaciones.push("Mantener disponibilidad de los productos con mayor rotación para sostener el crecimiento.");
  }

  if (variacion < -10) {
    recomendaciones.push("Revisar la estrategia comercial del último periodo y reforzar acciones de venta.");
  }

  if (topProductos[0]) {
    recomendaciones.push(`Priorizar reposición y seguimiento del producto líder: ${topProductos[0].producto}.`);
  }

  if (ventasPorMes.length < 12) {
    recomendaciones.push("Ampliar el histórico de ventas para mejorar la confianza de futuros modelos predictivos.");
  }

  return recomendaciones.slice(0, 3);
}

async function getSummary() {
  const [general, ventasPorMes, topProductos, topClientes] = await Promise.all([
    repo.getResumenGeneral(),
    repo.getVentasPorMes(),
    repo.getTopProductos(),
    repo.getTopClientes(),
  ]);

  const last = ventasPorMes[ventasPorMes.length - 1] || {};
  const previous = ventasPorMes[ventasPorMes.length - 2] || {};

  const variacion = percentChange(
    Number(previous.facturacion || 0),
    Number(last.facturacion || 0)
  );

  const tendencia =
    variacion > 10 ? "ascendente" :
    variacion < -10 ? "descendente" :
    "estable";

  const salud =
    tendencia === "ascendente" ? 86 :
    tendencia === "estable" ? 74 :
    58;

  const proyeccionSimple = calculateSimpleProjection(ventasPorMes);

  return {
    periodo: "Enero - Junio 2026",
    ventas_analizadas: general?.ventas_analizadas || 0,
    facturacion_acumulada: general?.facturacion_acumulada || 0,
    ticket_medio: general?.ticket_medio || 0,
    ventas_mes: ventasPorMes,
    top_productos: topProductos,
    top_clientes: topClientes,
    mes_anterior: previous.mes || "",
    mes_actual: last.mes || "",
    facturacion_mes_anterior: previous.facturacion || 0,
    facturacion_mes_actual: last.facturacion || 0,
    variacion_mensual: variacion,
    tendencia,
    salud_comercial: salud >= 85 ? "Excelente" : salud >= 70 ? "Buena" : salud >= 50 ? "Aceptable" : "Crítica",
    indice_comercial: salud,
    proyeccion_siguiente_mes: proyeccionSimple,
    recomendaciones: buildRecommendations({ variacion, topProductos, ventasPorMes }),
    trazabilidad_negocio: [
      "Ventas registradas",
      "Validación de calidad",
      "Análisis comercial",
      "Reglas de negocio",
      "Indicadores ejecutivos",
      "Recomendaciones"
    ],
    evolucion_futura_ia:
      "La arquitectura queda preparada para incorporar modelos de Machine Learning orientados a predicción de demanda, segmentación de clientes y recomendaciones automáticas."
  };
}

module.exports = { getSummary };
