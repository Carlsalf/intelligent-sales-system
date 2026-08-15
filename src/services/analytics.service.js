const repo = require("../repositories/analytics.repo");

function percentChange(previous, current) {
  const previousValue = Number(previous || 0);
  const currentValue = Number(current || 0);

  if (previousValue === 0) return 0;

  return Number(
    (((currentValue - previousValue) / previousValue) * 100).toFixed(2)
  );
}

/**
 * Proyección comercial descriptiva.
 *
 * Regla:
 * - Utiliza el promedio móvil de los dos últimos meses completos.
 * - No corresponde a Machine Learning.
 * - Se utiliza como referencia inicial para planificación comercial.
 */
function calculateSimpleProjection(ventasPorMes = []) {
  if (!Array.isArray(ventasPorMes) || ventasPorMes.length === 0) {
    return 0;
  }

  const lastPeriods = [...ventasPorMes]
    .sort((a, b) =>
      String(a.mes).localeCompare(String(b.mes))
    )
    .slice(-2);

  const projection =
    lastPeriods.reduce(
      (sum, item) =>
        sum + Number(item.facturacion || 0),
      0
    ) / lastPeriods.length;

  return Number(projection.toFixed(2));
}

function monthLabel(value) {
  if (!value) return "";

  const [year, month] = value.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return new Intl.DateTimeFormat(
    "es-ES",
    {
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

function buildPeriodLabel(ventasPorMes = []) {
  if (!ventasPorMes.length) {
    return "Sin datos";
  }

  const first = ventasPorMes[0]?.mes;
  const last = ventasPorMes[ventasPorMes.length - 1]?.mes;

  if (!first || !last) {
    return "Periodo disponible";
  }

  return `${monthLabel(first)} - ${monthLabel(last)}`;
}

function getCompletedPeriods(ventasPorMes = []) {
  const currentMonth = new Date()
    .toISOString()
    .slice(0, 7);

  return ventasPorMes.filter(
    (item) => item.mes !== currentMonth
  );
}

function buildRecommendations({
  variacion,
  topProductos,
  completedPeriods,
}) {
  const recomendaciones = [];

  if (variacion > 10) {
    recomendaciones.push(
      "Mantener disponibilidad de los productos con mayor rotación para sostener el crecimiento."
    );
  }

  if (variacion < -10) {
    recomendaciones.push(
      "Revisar la estrategia comercial del último periodo completo y reforzar acciones de venta."
    );
  }

  if (topProductos[0]) {
    recomendaciones.push(
      `Priorizar reposición y seguimiento del producto líder: ${topProductos[0].producto}.`
    );
  }

  if (completedPeriods.length < 12) {
    recomendaciones.push(
      "Ampliar el histórico de ventas para mejorar la confianza de futuros modelos predictivos."
    );
  }

  return recomendaciones.slice(0, 3);
}

async function getSummary() {
  const [
    general,
    ventasPorMes,
    topProductos,
    topClientes,
  ] = await Promise.all([
    repo.getResumenGeneral(),
    repo.getVentasPorMes(),
    repo.getTopProductos(),
    repo.getTopClientes(),
  ]);

  const sortedMonths = [...ventasPorMes].sort(
    (a, b) =>
      String(a.mes).localeCompare(String(b.mes))
  );

  const completedPeriods =
    getCompletedPeriods(sortedMonths);

  const currentCalendarMonth = new Date()
    .toISOString()
    .slice(0, 7);

  const currentPartialPeriod =
    sortedMonths.find(
      (item) =>
        item.mes === currentCalendarMonth
    ) || null;

  const lastCompleted =
    completedPeriods[
      completedPeriods.length - 1
    ] || {};

  const previousCompleted =
    completedPeriods[
      completedPeriods.length - 2
    ] || {};

  const variacion = percentChange(
    previousCompleted.facturacion,
    lastCompleted.facturacion
  );

  const tendencia =
    variacion > 10
      ? "ascendente"
      : variacion < -10
        ? "descendente"
        : "estable";

  const indice =
    tendencia === "ascendente"
      ? 86
      : tendencia === "estable"
        ? 74
        : 58;

  const proyeccionSimple =
    calculateSimpleProjection(
      completedPeriods
    );

  return {
    periodo:
      buildPeriodLabel(sortedMonths),

    periodo_comparacion: {
      anterior:
        previousCompleted.mes || "",
      actual:
        lastCompleted.mes || "",
      anterior_visible:
        monthLabel(
          previousCompleted.mes
        ),
      actual_visible:
        monthLabel(
          lastCompleted.mes
        ),
      solo_periodos_completos: true,
    },

    periodo_en_curso:
      currentPartialPeriod
        ? {
            mes: currentPartialPeriod.mes,
            mes_visible:
              monthLabel(
                currentPartialPeriod.mes
              ),
            ventas:
              Number(
                currentPartialPeriod.ventas || 0
              ),
            facturacion:
              Number(
                currentPartialPeriod.facturacion || 0
              ),
            es_parcial: true,
          }
        : null,

    ventas_analizadas:
      Number(
        general?.ventas_analizadas || 0
      ),

    facturacion_acumulada:
      Number(
        general?.facturacion_acumulada || 0
      ),

    ticket_medio:
      Number(
        general?.ticket_medio || 0
      ),

    ventas_mes: sortedMonths,

    top_productos: topProductos,
    top_clientes: topClientes,

    mes_anterior:
      previousCompleted.mes || "",

    mes_actual:
      lastCompleted.mes || "",

    facturacion_mes_anterior:
      Number(
        previousCompleted.facturacion || 0
      ),

    facturacion_mes_actual:
      Number(
        lastCompleted.facturacion || 0
      ),

    variacion_mensual:
      variacion,

    tendencia,

    salud_comercial:
      indice >= 85
        ? "Excelente"
        : indice >= 70
          ? "Buena"
          : indice >= 50
            ? "Aceptable"
            : "Crítica",

    indice_comercial: indice,

    proyeccion_siguiente_mes:
      proyeccionSimple,

    metodologia_proyeccion:
      "Promedio móvil de los dos últimos meses completos.",

    recomendaciones:
      buildRecommendations({
        variacion,
        topProductos,
        completedPeriods,
      }),

    trazabilidad_negocio: [
      "Ventas registradas",
      "Validación de calidad",
      "Análisis comercial",
      "Reglas de negocio",
      "Indicadores ejecutivos",
      "Recomendaciones",
    ],

    evolucion_futura_ia:
      "La arquitectura queda preparada para incorporar modelos de Machine Learning orientados a predicción de demanda, segmentación de clientes y recomendaciones automáticas.",
  };
}

module.exports = {
  getSummary,
};
