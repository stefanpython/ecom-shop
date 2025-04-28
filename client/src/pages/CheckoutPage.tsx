"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getAddresses, createAddress } from "../api/addresses";
import { createOrder } from "../api/orders";
import type { Address } from "../types";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { CreditCard, Truck, MapPin, Plus } from "lucide-react";

const CheckoutPage = () => {
  const { cart, loading: cartLoading, clearCartItems } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);

  // Form states
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Credit Card");
  const [showAddressForm, setShowAddressForm] = useState(false);

  // New address form
  const [newAddress, setNewAddress] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    isDefault: false,
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const addressesData = await getAddresses();
        setAddresses(addressesData);

        // Set default address if available
        const defaultAddress = addressesData.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        } else if (addressesData.length > 0) {
          setSelectedAddress(addressesData[0]._id);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast.error("Failed to load addresses");
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAddress(e.target.value);
  };

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPaymentMethod(e.target.value);
  };

  const handleNewAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setNewAddress((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const createdAddress = await createAddress(newAddress);
      setAddresses((prev) => [...prev, createdAddress]);
      setSelectedAddress(createdAddress._id);
      setShowAddressForm(false);
      toast.success("Address added successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart) return;

    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    setProcessingOrder(true);

    try {
      // Calculate order totals
      const taxRate = 0.1; // 10% tax
      const shippingPrice = cart.totalPrice > 100 ? 0 : 10; // Free shipping over $100
      const taxPrice = cart.totalPrice * taxRate;
      const totalPrice = cart.totalPrice + taxPrice + shippingPrice;

      // Prepare order items
      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        image: item.product.images[0] || "",
        price: item.price,
        attributes: item.attributes,
      }));

      // Create order
      const orderData = {
        orderItems,
        shippingAddress: selectedAddress,
        billingAddress: selectedAddress, // Using same address for billing
        paymentMethod,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const order = await createOrder(orderData);

      // Clear cart after successful order
      await clearCartItems();

      // Redirect to order confirmation
      navigate(`/orders/${order._id}`);
      toast.success("Order placed successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading || cartLoading) return <Loader />;

  if (!cart || cart.items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Shipping Address</h2>
            </div>

            {addresses.length === 0 && !showAddressForm ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  You don't have any saved addresses.
                </p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="btn btn-primary"
                >
                  Add New Address
                </button>
              </div>
            ) : (
              <>
                {!showAddressForm && (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address._id} className="border rounded-lg p-4">
                        <div className="flex items-start">
                          <input
                            type="radio"
                            id={`address-${address._id}`}
                            name="address"
                            value={address._id}
                            checked={selectedAddress === address._id}
                            onChange={handleAddressChange}
                            className="mt-1 mr-3"
                          />
                          <label
                            htmlFor={`address-${address._id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">{address.name}</div>
                            <div className="text-sm text-gray-600">
                              {address.addressLine1}
                              {address.addressLine2 &&
                                `, ${address.addressLine2}`}
                              <br />
                              {address.city}, {address.state}{" "}
                              {address.postalCode}
                              <br />
                              {address.country}
                              <br />
                              Phone: {address.phone}
                            </div>
                          </label>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add New Address
                    </button>
                  </div>
                )}

                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={newAddress.name}
                          onChange={handleNewAddressChange}
                          required
                          className="input"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={newAddress.phone}
                          onChange={handleNewAddressChange}
                          required
                          className="input"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="addressLine1"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        id="addressLine1"
                        name="addressLine1"
                        value={newAddress.addressLine1}
                        onChange={handleNewAddressChange}
                        required
                        className="input"
                        placeholder="Street address, P.O. box"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="addressLine2"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={newAddress.addressLine2}
                        onChange={handleNewAddressChange}
                        className="input"
                        placeholder="Apartment, suite, unit, building, floor, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={newAddress.city}
                          onChange={handleNewAddressChange}
                          required
                          className="input"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="state"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          State / Province
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={newAddress.state}
                          onChange={handleNewAddressChange}
                          required
                          className="input"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="postalCode"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Postal Code
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={newAddress.postalCode}
                          onChange={handleNewAddressChange}
                          required
                          className="input"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={newAddress.country}
                        onChange={handleNewAddressChange}
                        required
                        className="input"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDefault"
                        name="isDefault"
                        checked={newAddress.isDefault}
                        onChange={handleNewAddressChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="isDefault"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Set as default address
                      </label>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Address
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Payment Method</h2>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-start">
                  <input
                    type="radio"
                    id="credit-card"
                    name="payment"
                    value="Credit Card"
                    checked={paymentMethod === "Credit Card"}
                    onChange={handlePaymentMethodChange}
                    className="mt-1 mr-3"
                  />
                  <label
                    htmlFor="credit-card"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">Credit Card</div>
                    <div className="text-sm text-gray-600">
                      Pay with your credit card. We accept Visa, MasterCard, and
                      American Express.
                    </div>
                  </label>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start">
                  <input
                    type="radio"
                    id="paypal"
                    name="payment"
                    value="PayPal"
                    checked={paymentMethod === "PayPal"}
                    onChange={handlePaymentMethodChange}
                    className="mt-1 mr-3"
                  />
                  <label htmlFor="paypal" className="flex-1 cursor-pointer">
                    <div className="font-medium">PayPal</div>
                    <div className="text-sm text-gray-600">
                      Pay with your PayPal account.
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Method */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Truck className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Shipping Method</h2>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-start">
                  <input
                    type="radio"
                    id="standard"
                    name="shipping"
                    checked
                    readOnly
                    className="mt-1 mr-3"
                  />
                  <label htmlFor="standard" className="flex-1 cursor-pointer">
                    <div className="font-medium">Standard Shipping</div>
                    <div className="text-sm text-gray-600">
                      {cart.totalPrice > 100
                        ? "Free - Arrives in 5-7 business days"
                        : "$10.00 - Arrives in 5-7 business days"}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-4">
              <span>Subtotal ({cart.totalItems} items)</span>
              <span>${cart.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-4">
              <span>Shipping</span>
              <span>{cart.totalPrice > 100 ? "Free" : "$10.00"}</span>
            </div>
            <div className="flex justify-between border-b pb-4">
              <span>Tax (10%)</span>
              <span>${(cart.totalPrice * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>
                $
                {(
                  cart.totalPrice +
                  cart.totalPrice * 0.1 +
                  (cart.totalPrice > 100 ? 0 : 10)
                ).toFixed(2)}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={processingOrder || !selectedAddress}
              className="btn btn-primary w-full mt-6"
            >
              {processingOrder ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
