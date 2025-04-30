// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token?: string;
  phone?: string;
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
  category: Category;
  countInStock: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  brand?: string;
  discountPrice?: number;
  discountPercentage?: number;
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
  user: {
    email: string;
  };
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
export interface Review {
  _id: string;
  user: User;
  product: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

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
