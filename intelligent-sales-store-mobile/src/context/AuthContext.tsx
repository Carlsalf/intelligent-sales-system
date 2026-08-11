import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import {
  clearCustomerToken,
  fetchAuthenticatedCustomer,
  getCustomerToken,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  saveCustomerToken,
} from '@/src/services/api';
import type { Customer } from '@/src/types/store';

type RegisterPayload = {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
};

type AuthContextValue = {
  customer: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const token = await getCustomerToken();
        if (!token) return;
        const response = await fetchAuthenticatedCustomer();
        if (mounted) setCustomer(response.customer);
      } catch {
        await clearCustomerToken();
        if (mounted) setCustomer(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  async function login(email: string, password: string) {
    const result = await loginCustomer(email, password);
    await saveCustomerToken(result.token);
    setCustomer(result.customer);
  }

  async function register(payload: RegisterPayload) {
    const result = await registerCustomer(payload);
    await saveCustomerToken(result.token);
    setCustomer(result.customer);
  }

  async function logout() {
    try {
      if (customer) await logoutCustomer();
    } finally {
      await clearCustomerToken();
      setCustomer(null);
    }
  }

  const value = {
    customer,
    isLoading,
    isAuthenticated: Boolean(customer),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  return context;
}
