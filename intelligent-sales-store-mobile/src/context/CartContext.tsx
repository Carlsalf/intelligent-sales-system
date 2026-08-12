import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '@/src/context/AuthContext';
import {
  addCustomerCartItem,
  emptyCustomerCart,
  fetchCustomerCart,
  removeCustomerCartItem,
  updateCustomerCartItem,
} from '@/src/services/cartApi';
import type { CustomerCart } from '@/src/types/cart';

type CartContextValue = {
  cart: CustomerCart | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string;
  totalItems: number;
  totalUnits: number;
  total: number;
  refreshCart: () => Promise<void>;
  addItem: (idProducto: number, cantidad: number) => Promise<void>;
  updateItem: (idProducto: number, cantidad: number) => Promise<void>;
  removeItem: (idProducto: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState<CustomerCart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError('');

      const result = await fetchCustomerCart();
      setCart(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el carrito',
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const runMutation = useCallback(
    async (operation: () => Promise<CustomerCart>) => {
      try {
        setIsMutating(true);
        setError('');

        const result = await operation();
        setCart(result);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'No se pudo actualizar el carrito';

        setError(message);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const addItem = useCallback(
    async (idProducto: number, cantidad: number) => {
      await runMutation(() =>
        addCustomerCartItem(idProducto, cantidad),
      );
    },
    [runMutation],
  );

  const removeItem = useCallback(
    async (idProducto: number) => {
      await runMutation(() =>
        removeCustomerCartItem(idProducto),
      );
    },
    [runMutation],
  );

  const updateItem = useCallback(
    async (idProducto: number, cantidad: number) => {
      if (cantidad <= 0) {
        await removeItem(idProducto);
        return;
      }

      await runMutation(() =>
        updateCustomerCartItem(idProducto, cantidad),
      );
    },
    [removeItem, runMutation],
  );

  const clearCart = useCallback(async () => {
    await runMutation(() => emptyCustomerCart());
  }, [runMutation]);

  const activeCart = isAuthenticated ? cart : null;

  const value = useMemo<CartContextValue>(
    () => ({
      cart: activeCart,
      isLoading,
      isMutating,
      error: isAuthenticated ? error : '',
      totalItems: activeCart?.cantidad_items ?? 0,
      totalUnits: activeCart?.total_unidades ?? 0,
      total: activeCart?.total_estimado ?? 0,
      refreshCart,
      addItem,
      updateItem,
      removeItem,
      clearCart,
    }),
    [
      activeCart,
      isLoading,
      isMutating,
      isAuthenticated,
      error,
      refreshCart,
      addItem,
      updateItem,
      removeItem,
      clearCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart debe utilizarse dentro de CartProvider',
    );
  }

  return context;
}
