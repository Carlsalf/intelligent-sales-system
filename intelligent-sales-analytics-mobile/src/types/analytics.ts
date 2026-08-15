export type MonthlySale = {
  mes: string;
  ventas: number;
  facturacion: number;
};

export type TopProduct = {
  producto: string;
  unidades: number;
  facturacion: number;
};

export type TopCustomer = {
  cliente: string;
  ventas: number;
  facturacion: number;
};

export type ComparisonPeriod = {
  anterior: string;
  actual: string;
  anterior_visible: string;
  actual_visible: string;
  solo_periodos_completos: boolean;
};

export type CurrentPeriod = {
  mes: string;
  mes_visible: string;
  ventas: number;
  facturacion: number;
  es_parcial: boolean;
};

export type AnalyticsSummary = {
  periodo: string;
  periodo_comparacion: ComparisonPeriod;
  periodo_en_curso?: CurrentPeriod | null;

  ventas_analizadas: number;
  facturacion_acumulada: number;
  ticket_medio: number;

  ventas_mes: MonthlySale[];
  top_productos: TopProduct[];
  top_clientes: TopCustomer[];

  mes_anterior: string;
  mes_actual: string;
  facturacion_mes_anterior: number;
  facturacion_mes_actual: number;

  variacion_mensual: number;
  tendencia:
    | 'ascendente'
    | 'estable'
    | 'descendente';

  salud_comercial: string;
  indice_comercial: number;

  proyeccion_siguiente_mes: number;
  metodologia_proyeccion: string;

  recomendaciones: string[];
  trazabilidad_negocio: string[];
  evolucion_futura_ia: string;
};
