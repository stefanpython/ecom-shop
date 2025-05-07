// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token?: string;
  phone?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  richDescription?: string;
  images: string[];
  price: number;
  category: Category | string;
  countInStock: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  brand?: string;
  discountPrice?: number;
  discountPercentage?: number;
  attributes: Record<string, string | number | boolean | null>;
}

export interface ProductsResponse {
  products: Product[];
  page: number;
  pages: number;
  count: number;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  parent?: Category | string;
  isActive?: boolean;
}

// Cart types
export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
  attributes?: Record<string, string | number | boolean | null>;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

// Address types
export interface Address {
  _id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// Order types
export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  image: string;
  price: number;
  attributes?: Record<string, string | number | boolean | null>;
}

export interface Order {
  _id: string;
  user: { email: string; name: string } | string;
  orderItems: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered?: boolean;
  deliveredAt?: string;
  status?: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  trackingNumber?: string;
  createdAt?: string;
}

export interface CreateOrderPayload {
  orderItems: Array<{
    product: string;
    name: string;
    quantity: number;
    image: string;
    price: number;
    attributes?: Record<string, string | number | boolean | null>;
  }>;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

// Review types
export type Review = {
  _id: string;
  title: string;
  comment: string;
  rating: number;
  isApproved: boolean;
  user: {
    name: string;
  };
  product:
    | string
    | {
        name: string;
      };
  createdAt: string;
};

export interface CreateOrderDto {
  orderItems: {
    product: string;
    name: string;
    quantity: number;
    image: string;
    price: number;
    attributes: Record<string, string | number | boolean | null>;
  }[];
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

export interface ProductQueryParams {
  pageNumber: number;
  keyword?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface Payment {
  _id: string;
  transactionId?: string;
  user: string | { name: string };
  order: string | { _id: string; totalPrice: number };
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt?: string;
}
