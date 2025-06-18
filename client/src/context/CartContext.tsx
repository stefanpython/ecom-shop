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
  mergeGuestCart,
} from "../api/cart";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

// Guest cart item type
interface GuestCartItem {
  productId: string;
  quantity: number;
  attributes?: Record<string, any>;
  price: number;
  name: string;
  image?: string;
}

interface CartContextType {
  cart: Cart | null;
  guestCart: GuestCartItem[];
  loading: boolean;
  addToCart: (
    productId: string,
    quantity?: number,
    productData?: any
  ) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCartItems: () => Promise<void>;
  getCartItemsCount: () => number;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to safely get initial guest cart from localStorage
const getInitialGuestCart = (): GuestCartItem[] => {
  if (typeof window === "undefined") return []; // SSR safety

  try {
    const savedGuestCart = localStorage.getItem("guestCart");
    if (savedGuestCart && savedGuestCart !== "[]") {
      const parsedCart = JSON.parse(savedGuestCart);
      console.log("Loading guest cart from localStorage:", parsedCart);
      return Array.isArray(parsedCart) ? parsedCart : [];
    }
  } catch (error) {
    console.error("Failed to parse guest cart:", error);
    localStorage.removeItem("guestCart");
  }
  return [];
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  // Initialize guest cart from localStorage immediately
  const [guestCart, setGuestCart] =
    useState<GuestCartItem[]>(getInitialGuestCart);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Save guest cart to localStorage whenever it changes (only for non-authenticated users)
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem("guestCart", JSON.stringify(guestCart));
      } catch (error) {
        console.error("Failed to save guest cart to localStorage:", error);
      }
    }
  }, [guestCart, isAuthenticated]);

  // Fetch user cart and merge guest cart when user logs in
  useEffect(() => {
    const handleUserLogin = async () => {
      if (isAuthenticated && user) {
        setLoading(true);
        try {
          // If there are items in guest cart, merge them
          if (guestCart.length > 0) {
            const guestItems = guestCart.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              attributes: item.attributes || {},
            }));

            const mergedCart = await mergeGuestCart(guestItems);
            setCart(mergedCart);

            // Clear guest cart after successful merge
            setGuestCart([]);
            localStorage.removeItem("guestCart");

            toast.success("Guest cart items merged successfully!");
          } else {
            // Just fetch the user's cart
            const cartData = await getCart();
            setCart(cartData);
          }
        } catch (error) {
          console.error("Failed to fetch/merge cart:", error);
          toast.error("Failed to merge cart items");

          // Still try to fetch user cart even if merge fails
          try {
            const cartData = await getCart();
            setCart(cartData);
          } catch (fetchError) {
            console.error("Failed to fetch cart:", fetchError);
          }
        } finally {
          setLoading(false);
        }
      } else {
        // User logged out, clear user cart but preserve guest cart
        setCart(null);
      }
    };

    handleUserLogin();
  }, [isAuthenticated, user]); // Removed guestCart from dependencies to prevent loops

  const addToCart = async (
    productId: string,
    quantity = 1,
    productData?: any
  ) => {
    if (isAuthenticated) {
      // Add to user cart via API
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
    } else {
      // Add to guest cart in localStorage
      try {
        setGuestCart((prevGuestCart) => {
          const existingItemIndex = prevGuestCart.findIndex(
            (item) => item.productId === productId
          );

          let updatedGuestCart;
          if (existingItemIndex > -1) {
            // Update quantity if item exists
            updatedGuestCart = [...prevGuestCart];
            updatedGuestCart[existingItemIndex].quantity += quantity;
          } else {
            // Add new item to guest cart
            const newItem: GuestCartItem = {
              productId,
              quantity,
              price: productData?.price || 0,
              name: productData?.name || "Unknown Product",
              image: productData?.images?.[0] || productData?.image,
              attributes: {},
            };
            updatedGuestCart = [...prevGuestCart, newItem];
          }

          console.log("Updating guest cart:", updatedGuestCart);
          return updatedGuestCart;
        });

        toast.success("Item added to cart");
      } catch (error) {
        toast.error("Failed to add item to cart");
        console.error("Failed to add to guest cart:", error);
      }
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    if (isAuthenticated && cart) {
      // Update user cart via API
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
    } else {
      // Update guest cart
      try {
        setGuestCart((prevGuestCart) =>
          prevGuestCart.map((item) =>
            item.productId === itemId ? { ...item, quantity } : item
          )
        );
        toast.success("Cart updated");
      } catch (error) {
        toast.error("Failed to update cart");
        console.error("Failed to update guest cart item:", error);
      }
    }
  };

  const removeItem = async (itemId: string) => {
    if (isAuthenticated && cart) {
      // Remove from user cart via API
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
    } else {
      // Remove from guest cart
      try {
        setGuestCart((prevGuestCart) =>
          prevGuestCart.filter((item) => item.productId !== itemId)
        );
        toast.success("Item removed from cart");
      } catch (error) {
        toast.error("Failed to remove item");
        console.error("Failed to remove guest cart item:", error);
      }
    }
  };

  const clearCartItems = async () => {
    if (isAuthenticated) {
      // Clear user cart via API
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
    } else {
      // Clear guest cart
      setGuestCart([]);
      localStorage.removeItem("guestCart");
      toast.success("Cart cleared");
    }
  };

  const getCartItemsCount = () => {
    if (isAuthenticated && cart) {
      return cart.totalItems;
    }
    return guestCart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    if (isAuthenticated && cart) {
      return cart.totalPrice;
    }
    return guestCart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        guestCart,
        loading,
        addToCart,
        updateItem,
        removeItem,
        clearCartItems,
        getCartItemsCount,
        getCartTotal,
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
