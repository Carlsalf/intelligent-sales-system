import { apiRequest } from '@/src/services/api';

import type {
  CheckoutPayload,
  CheckoutResult,
  CreateAddressPayload,
  CustomerAddress,
} from '@/src/types/checkout';

export async function fetchCustomerAddresses() {
  return apiRequest<{
    addresses: CustomerAddress[];
    total: number;
  }>('/store/addresses', {
    authenticated: true,
  });
}

export async function createCustomerAddress(
  payload: CreateAddressPayload,
) {
  return apiRequest<{
    message: string;
    address: CustomerAddress;
  }>('/store/addresses', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export async function setDefaultCustomerAddress(
  idDireccion: number,
) {
  return apiRequest<{
    message: string;
    address: CustomerAddress;
  }>(`/store/addresses/${idDireccion}/default`, {
    method: 'PATCH',
    authenticated: true,
  });
}

export async function executeCustomerCheckout(
  payload: CheckoutPayload,
) {
  return apiRequest<CheckoutResult>(
    '/store/checkout',
    {
      method: 'POST',
      authenticated: true,
      body: JSON.stringify(payload),
    },
  );
}
