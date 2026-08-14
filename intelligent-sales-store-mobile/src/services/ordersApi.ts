import { apiRequest } from '@/src/services/api';

import type {
  CustomerOrder,
  CustomerOrderSummary,
} from '@/src/types/orders';

export async function fetchCustomerOrders() {
  return apiRequest<{
    orders: CustomerOrderSummary[];
    total: number;
  }>('/store/orders', {
    authenticated: true,
  });
}

export async function fetchCustomerOrderById(
  id: number,
) {
  return apiRequest<{
    order: CustomerOrder;
  }>(`/store/orders/${id}`, {
    authenticated: true,
  });
}
