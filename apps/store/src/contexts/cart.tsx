"use client";

import { ConsumptionMethod, Product } from "@prisma/client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, notes?: string) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  total: number;
  totalItems: number;
  consumptionMethod: ConsumptionMethod | null;
  setConsumptionMethod: (method: ConsumptionMethod) => void;
  prefilledTable: string | null;
  setPrefilledTable: (t: string | null) => void;
}

export const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
  slug?: string;
}

export const CartProvider = ({ children, slug }: CartProviderProps) => {
  const storageKey = slug ? `cart_${slug}` : null;

  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined" || !slug) return [];
    try {
      const saved = localStorage.getItem(`cart_${slug}`);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [consumptionMethod, setConsumptionMethod] =
    useState<ConsumptionMethod | null>(null);
  const [prefilledTable, setPrefilledTable] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // quota exceeded ou modo privado
    }
  }, [items, storageKey]);

  const addItem = useCallback((product: Product, quantity = 1, notes?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity, notes: notes ?? i.notes }
            : i,
        );
      }
      return [...prev, { product, quantity, notes }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const increaseQuantity = useCallback((productId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );
  }, []);

  const decreaseQuantity = useCallback((productId: string) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const updateNotes = useCallback((productId: string, notes: string) => {
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, notes } : i)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (storageKey) {
      try { localStorage.removeItem(storageKey); } catch {}
    }
  }, [storageKey]);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [items],
  );

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );

  const ctx: CartContextType = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      increaseQuantity,
      decreaseQuantity,
      updateNotes,
      clearCart,
      total,
      totalItems,
      consumptionMethod,
      setConsumptionMethod,
      prefilledTable,
      setPrefilledTable,
    }),
    [items, addItem, removeItem, increaseQuantity, decreaseQuantity, updateNotes, clearCart, total, totalItems, consumptionMethod, prefilledTable],
  );

  return (
    <CartContext.Provider value={ctx}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

