"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { priceForTier } from "@/lib/pricing";

const CartContext = createContext(null);

const CART_KEY = "flower_cart_v1";
const TIER_KEY = "flower_price_tier_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { productId, name, image_url, retail_price, wholesale_price, ctv_price, quantity }
  const [tier, setTier] = useState("retail");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      const savedTier = localStorage.getItem(TIER_KEY);
      if (savedCart) setItems(JSON.parse(savedCart));
      if (savedTier) setTier(savedTier);
    } catch {
      // ignore malformed local storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(TIER_KEY, tier);
  }, [tier, hydrated]);

  function addToCart(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          image_url: product.image_url,
          retail_price: product.retail_price,
          wholesale_price: product.wholesale_price,
          ctv_price: product.ctv_price,
          quantity,
        },
      ];
    });
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) return removeFromCart(productId);
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }

  function removeFromCart(productId) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce((sum, i) => sum + priceForTier(i, tier) * i.quantity, 0),
    [items, tier]
  );

  const value = {
    items,
    tier,
    setTier,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    itemCount,
    subtotal,
    hydrated,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
