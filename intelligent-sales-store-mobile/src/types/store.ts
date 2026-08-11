export type Customer = {
  id_cliente: number;
  id_cliente_cuenta: number;
  nombre: string;
  documento?: string | null;
  telefono?: string | null;
  email: string;
  email_verificado: boolean;
  ultimo_acceso?: string | null;
};

export type StoreProduct = {
  id_producto?: number;
  id?: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  categoria?: string | null;
  categoria_nombre?: string | null;
  imagen_url?: string | null;
};

export type AuthResult = {
  token: string;
  customer: Customer;
};
