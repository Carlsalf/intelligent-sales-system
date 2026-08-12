import * as SecureStore from 'expo-secure-store';
import type { AuthResult, Customer, StoreProduct } from '@/src/types/store';

const TOKEN_KEY = 'iss_customer_token';
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api';

console.log('[ISS API] API_URL =', API_URL);

type ApiOptions = RequestInit & { authenticated?: boolean };

async function parseResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body?.message || 'No se pudo completar la operación';
    throw new Error(message);
  }
  return body;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.authenticated) {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(response) as Promise<T>;
}

export async function saveCustomerToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearCustomerToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getCustomerToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function loginCustomer(email: string, password: string) {
  return apiRequest<AuthResult & { message: string }>('/store/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerCustomer(payload: {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}) {
  return apiRequest<AuthResult & { message: string }>('/store/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchAuthenticatedCustomer() {
  return apiRequest<{ customer: Customer }>('/store/auth/me', {
    authenticated: true,
  });
}

export async function logoutCustomer() {
  return apiRequest<{ message: string }>('/store/auth/logout', {
    method: 'POST',
    authenticated: true,
  });
}

export async function fetchProducts(search = '', category = '') {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<StoreProduct[] | { products: StoreProduct[] }>(`/store/products${suffix}`);
}
