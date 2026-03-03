export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  stock: number;
  images: ProductImage[];
  specs: Record<string, string>;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: string;
}

export interface CartItem {
  productId: { _id: string; title?: string; price?: number; discountPrice?: number; images?: ProductImage[] } | string;
  qty: number;
  priceSnapshot: number;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
  updatedAt?: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  pincode: string;
}

export interface OrderItem {
  productId: string;
  titleSnapshot: string;
  priceSnapshot: number;
  qty: number;
  imageSnapshot?: string;
  slugSnapshot?: string;
}

export type OrderStatus = 'PLACED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  address: OrderAddress;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: string;
  paymentId?: string;
  razorpayOrderId?: string;
  paymentProvider?: string;
  createdAt: string;
}
