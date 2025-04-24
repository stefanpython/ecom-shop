"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Cart } from "../types";
import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../api/cart";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCartItems: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const cartData = await getCart();
          setCart(cartData);
        } catch (error) {
          console.error("Failed to fetch cart:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setCart(null);
      }
    };

    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId: string, quantity = 1) => {
    setLoading(true);
    try {
      const updatedCart = await addToCartApi(productId, quantity);
      setCart(updatedCart);
      toast.success("Item added to cart");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add item to cart"
      );
      console.error("Failed to add to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    setLoading(true);
    try {
      const updatedCart = await updateCartItem(itemId, quantity);
      setCart(updatedCart);
      toast.success("Cart updated");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update cart"
      );
      console.error("Failed to update cart item:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setLoading(true);
    try {
      const updatedCart = await removeCartItem(itemId);
      setCart(updatedCart);
      toast.success("Item removed from cart");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove item"
      );
      console.error("Failed to remove cart item:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearCartItems = async () => {
    setLoading(true);
    try {
      await clearCart();
      setCart(null);
      toast.success("Cart cleared");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to clear cart"
      );
      console.error("Failed to clear cart:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateItem,
        removeItem,
        clearCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
