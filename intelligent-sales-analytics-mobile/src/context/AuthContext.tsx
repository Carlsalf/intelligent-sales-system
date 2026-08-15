import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  clearToken,
  getToken,
  saveToken,
} from '@/src/services/api';

import {
  fetchMe,
  loginInternal,
} from '@/src/services/authApi';

import type {
  InternalUser,
} from '@/src/types/auth';

type AuthContextValue = {
  user: InternalUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<InternalUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const token = await getToken();

        if (!token) {
          return;
        }

        const result =
          await fetchMe();

        if (active) {
          const role =
            String(
              result.user.rol,
            ).toLowerCase();

          if (
            role !== 'gerente' &&
            role !== 'admin'
          ) {
            await clearToken();
            return;
          }

          setUser(result.user);
        }
      } catch {
        await clearToken();
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  async function login(
    email: string,
    password: string,
  ) {
    const result =
      await loginInternal(
        email.trim(),
        password,
      );

    const role =
      String(
        result.user.rol,
      ).toLowerCase();

    if (
      role !== 'gerente' &&
      role !== 'admin'
    ) {
      throw new Error(
        'Esta aplicación está disponible únicamente para gerencia y administración.',
      );
    }

    await saveToken(
      result.token,
    );

    setUser(
      result.user,
    );
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,
        isLoading,
        isAuthenticated:
          Boolean(user),
        login,
        logout,
      }),
      [user, isLoading],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider',
    );
  }

  return context;
}
