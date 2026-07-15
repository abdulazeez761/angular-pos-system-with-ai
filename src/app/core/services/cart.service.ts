import { Injectable, signal, computed } from '@angular/core';
import { Product, CartItem } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSignal = signal<CartItem[]>([]);
  items = this.itemsSignal.asReadonly();

  readonly TAX_RATE = 0.15;

  subtotal = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.total, 0),
  );
  totalDiscount = computed(() =>
    this.itemsSignal().reduce(
      (sum, item) => sum + item.discount * item.quantity,
      0,
    ),
  );
  taxAmount = computed(() => this.subtotal() * this.TAX_RATE);

  grandTotal = computed(() => this.subtotal() + this.taxAmount());

  itemCount = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0),
  );

  addItem(product: Product) {
    this.itemsSignal.update((items) => {
      const existing = items.find((i) => i.product.id === product.id);
      if (existing) {
        return items.map((i) =>
          i.product.id === product.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                total: (i.quantity + 1) * (product.price - i.discount),
              }
            : i,
        );
      }
      return [
        ...items,
        {
          product,
          quantity: 1,
          discount: 0,
          total: product.price,
        },
      ];
    });
  }
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    this.itemsSignal.update((items) =>
      items.map((i) =>
        i.product.id === productId
          ? {
              ...i,
              quantity,
              total: quantity * (i.product.price - i.discount),
            }
          : i,
      ),
    );
  }
  removeItem(productId: string): void {
    this.itemsSignal.update((items) =>
      items.filter((i) => i.product.id !== productId),
    );
  }
  setItemDiscount(productId: string, discount: number): void {
    this.itemsSignal.update((items) =>
      items.map((i) =>
        i.product.id === productId
          ? {
              ...i,
              discount,
              total: i.quantity * (i.product.price - discount),
            }
          : i,
      ),
    );
  }
  clearCart(): void {
    this.itemsSignal.set([]);
  }
}
