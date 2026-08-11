import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { CartContext } from "./CartContext";

const STORAGE_KEY = "iss-store-cart";

function readInitialCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readInitialCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(product, quantity = 1) {
    const parsedQuantity = Math.max(1, Number(quantity) || 1);

    setItems((currentItems) => {
      const existing = currentItems.find(
        (item) => Number(item.id) === Number(product.id)
      );

      if (existing) {
        return currentItems.map((item) =>
          Number(item.id) === Number(product.id)
            ? {
                ...item,
                cantidad: Number(item.cantidad || 0) + parsedQuantity,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          id: Number(product.id),
          nombre: product.nombre,
          precio: Number(product.precio || 0),
          categoria: product.categoria || "Producto",
          imagen_url: product.imagen_url || null,
          cantidad: parsedQuantity,
        },
      ];
    });
  }

  function updateQuantity(productId, quantity) {
    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        Number(item.id) === Number(productId)
          ? { ...item, cantidad: parsedQuantity }
          : item
      )
    );
  }

  function incrementItem(productId) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        Number(item.id) === Number(productId)
          ? {
              ...item,
              cantidad: Number(item.cantidad || 0) + 1,
            }
          : item
      )
    );
  }

  function decrementItem(productId) {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          Number(item.id) === Number(productId)
            ? {
                ...item,
                cantidad: Number(item.cantidad || 0) - 1,
              }
            : item
        )
        .filter((item) => Number(item.cantidad) > 0)
    );
  }

  function removeItem(productId) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => Number(item.id) !== Number(productId)
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalUnits = useMemo(
    () =>
      items.reduce(
        (total, item) => total + Number(item.cantidad || 0),
        0
      ),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          Number(item.precio || 0) *
            Number(item.cantidad || 0),
        0
      ),
    [items]
  );

  const value = {
    items,
    totalUnits,
    subtotal: Number(subtotal.toFixed(2)),
    addItem,
    updateQuantity,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

