export type OrderAddress = {
  destinatario: string;
  telefono: string;
  direccion_linea_1: string;
  direccion_linea_2?: string | null;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  pais: string;
  referencia?: string | null;
};

export type OrderItem = {
  id_detalle: number;
  id_producto: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  tipo_cumplimiento:
    | 'RESERVED'
    | 'COMMITTED'
    | 'MIXED';
  cantidad_reservada: number;
  cantidad_comprometida: number;
  fecha_disponibilidad_estimada?: string | null;
};

export type CustomerOrderSummary = {
  id_venta: number;
  id_cliente: number;
  id_cliente_cuenta: number;
  fecha: string;
  total: number;
  estado_pedido: string;
  estado_visible: string;
  tipo_entrega: string;
  pago_estado: string;
  fecha_entrega_estimada?: string | null;
  canal_venta: string;
  cantidad_items: number;
  total_unidades: number;
  codigo: string;
};

export type CustomerOrder =
  CustomerOrderSummary & {
    direccion_entrega_snapshot?: string | null;
    id_direccion_entrega?: number | null;
    direccion_entrega?: OrderAddress | null;
    items: OrderItem[];
  };
