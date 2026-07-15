export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
  total: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  customerId: string | null;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  createdAt: Date;
}

export type PaymentMethod = 'cash' | 'card' | 'wallet';

export type SaleStatus = 'completed' | 'refunded' | 'pending';

import { Product } from './product.model';
