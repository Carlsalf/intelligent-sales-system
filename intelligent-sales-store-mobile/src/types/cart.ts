export type CartItem = {
  id_detalle_carrito: number;
  id_producto: number;
  producto_nombre: string;
  precio: number;
  categoria_nombre?: string | null;
  cantidad: number;
  subtotal: number;
  created_at?: string;
  updated_at?: string;
};

export type CustomerCart = {
  id_carrito: number;
  id_cliente: number;
  estado: string;
  cliente_nombre?: string;
  created_at?: string;
  updated_at?: string;
  converted_at?: string | null;
  items: CartItem[];
  cantidad_items: number;
  total_unidades: number;
  total_estimado: number;
};
