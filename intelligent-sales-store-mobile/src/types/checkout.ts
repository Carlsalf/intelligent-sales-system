export type DeliveryType =
  | 'RECOJO_ALMACEN'
  | 'ENTREGA_DOMICILIO';

export type CustomerAddress = {
  id_direccion: number;
  alias: string;
  destinatario: string;
  telefono: string;
  direccion_linea_1: string;
  direccion_linea_2?: string | null;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  pais: string;
  referencia?: string | null;
  es_principal: boolean;
};

export type CreateAddressPayload = {
  alias?: string;
  destinatario: string;
  telefono: string;
  direccion_linea_1: string;
  direccion_linea_2?: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  pais?: string;
  referencia?: string;
  es_principal?: boolean;
};

export type CheckoutPayload = {
  tipo_entrega: DeliveryType;
  id_direccion?: number;
  canal_venta: 'ECOMMERCE_MOBILE';
};

export type CheckoutOrder = {
  id_venta: number;
  codigo: string;
  estado: string;
  estado_visible: string;
  pago_estado: string;
  tipo_entrega: DeliveryType;
  canal_venta: string;
  total: number;
  fecha_entrega_estimada?: string | null;
};

export type CheckoutResult = {
  success: boolean;
  message: string;
  pedido: CheckoutOrder;
};
