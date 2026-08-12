import { apiRequest } from '@/src/services/api';
import type { CustomerCart } from '@/src/types/cart';

export function fetchCustomerCart() {
  return apiRequest<CustomerCart>('/store/cart', {
    authenticated: true,
  });
}

export function addCustomerCartItem(
  idProducto: number,
  cantidad: number,
) {
  return apiRequest<CustomerCart>('/store/cart/items', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify({
      id_producto: idProducto,
      cantidad,
    }),
  });
}

export function updateCustomerCartItem(
  idProducto: number,
  cantidad: number,
) {
  return apiRequest<CustomerCart>(
    `/store/cart/items/${idProducto}`,
    {
      method: 'PUT',
      authenticated: true,
      body: JSON.stringify({ cantidad }),
    },
  );
}

export function removeCustomerCartItem(idProducto: number) {
  return apiRequest<CustomerCart>(
    `/store/cart/items/${idProducto}`,
    {
      method: 'DELETE',
      authenticated: true,
    },
  );
}

export function emptyCustomerCart() {
  return apiRequest<CustomerCart>('/store/cart/items', {
    method: 'DELETE',
    authenticated: true,
  });
}
