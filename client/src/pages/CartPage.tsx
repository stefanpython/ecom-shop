"use client";

import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

const CartPage = () => {
  const {
    cart,
    guestCart,
    loading,
    updateItem,
    removeItem,
    getCartItemsCount,
    getCartTotal,
  } = useCart();
  const { isAuthenticated } = useAuth();

  if (loading) return <Loader />;

  // Determine if cart is empty (both user and guest)
  const isCartEmpty = isAuthenticated
    ? !cart || cart.items.length === 0
    : guestCart.length === 0;

  if (isCartEmpty) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">
          Looks like you haven't added any products to your cart yet.
        </p>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity > 0) {
      updateItem(itemId, quantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  // Render cart items based on authentication status
  const renderCartItems = () => {
    if (isAuthenticated && cart) {
      return cart.items.map((item) => (
        <tr key={item._id}>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img
                  src={item.product.images[0] || "/placeholder-product.jpg"}
                  alt={item.product.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="ml-4">
                <Link
                  to={`/products/${item.product._id}`}
                  className="font-medium text-gray-900 hover:text-blue-600"
                >
                  {item.product.name}
                </Link>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">
              ${item.price.toFixed(2)}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <select
              value={item.quantity}
              onChange={(e) =>
                handleQuantityChange(item._id, Number(e.target.value))
              }
              className="input max-w-[80px]"
            >
              {[...Array(Math.min(10, item.product.countInStock))].map(
                (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                )
              )}
            </select>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              onClick={() => handleRemoveItem(item._id)}
              className="text-red-600 hover:text-red-900"
              aria-label="Remove item"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </td>
        </tr>
      ));
    } else {
      // Render guest cart items
      console.log("Rendering guest cart items:", guestCart);
      return guestCart.map((item, index) => (
        <tr key={`${item.productId}-${index}`}>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img
                  src={item.image || "/placeholder-product.jpg"}
                  alt={item.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="ml-4">
                <Link
                  to={`/products/${item.productId}`}
                  className="font-medium text-gray-900 hover:text-blue-600"
                >
                  {item.name}
                </Link>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">
              ${item.price.toFixed(2)}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <select
              value={item.quantity}
              onChange={(e) =>
                handleQuantityChange(item.productId, Number(e.target.value))
              }
              className="input max-w-[80px]"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              onClick={() => handleRemoveItem(item.productId)}
              className="text-red-600 hover:text-red-900"
              aria-label="Remove item"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </td>
        </tr>
      ));
    }
  };

  const itemsCount = getCartItemsCount();
  const totalPrice = getCartTotal();

  console.log("CartPage render - itemsCount:", itemsCount);
  console.log("CartPage render - totalPrice:", totalPrice);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>

      {!isAuthenticated && guestCart.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <strong>Guest Cart:</strong> Your items are temporarily saved.
            <Link to="/login" className="underline ml-1">
              Login
            </Link>{" "}
            to save them permanently and checkout.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderCartItems()}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-4">
              <span>Subtotal ({itemsCount} items)</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-4">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between border-b pb-4">
              <span>Tax</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            {isAuthenticated ? (
              <Link
                to="/checkout"
                className="btn btn-primary w-full flex items-center justify-center mt-6"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/login?redirect=checkout"
                className="btn btn-primary w-full flex items-center justify-center mt-6"
              >
                Login to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            )}

            <Link
              to="/products"
              className="block text-center text-blue-600 hover:underline mt-4"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
