"use client";

import { ConsumptionMethod, Product } from "@prisma/client";
import { createContext, ReactNode, useContext, useState } from "react";

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, notes?: string) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  total: number;
  totalItems: number;
  consumptionMethod: ConsumptionMethod | null;
  setConsumptionMethod: (method: ConsumptionMethod) => void;
}

export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [consumptionMethod, setConsumptionMethod] =
    useState<ConsumptionMethod | null>(null);

  const addItem = (product: Product, notes?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1, notes: notes ?? i.notes }
            : i,
        );
      }
      return [...prev, { product, quantity: 1, notes }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const increaseQuantity = (productId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );
  };

  const decreaseQuantity = (productId: string) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const updateNotes = (productId: string, notes: string) => {
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, notes } : i)),
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
