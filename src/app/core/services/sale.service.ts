import { Injectable, signal, computed } from '@angular/core';
import { Sale, CartItem, PaymentMethod } from '../models';
import { StorageService } from './storage.service';
import { ProductService } from './product.service';
import { CustomerService } from './customer.service';
import { CartService } from './cart.service';

const SALES_KEY = 'pos_sales';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private salesSignal = signal<Sale[]>([]);

  sales = this.salesSignal.asReadonly();

  todaySales = computed(() => {
    const today = new Date().toDateString();
    return this.salesSignal().filter(
      (s) => new Date(s.createdAt).toDateString() === today,
    );
  });

  todayRevenue = computed(() =>
    this.todaySales().reduce((sum, s) => sum + s.grandTotal, 0),
  );

  todayProfit = computed(() =>
    this.todaySales().reduce(
      (sum, s) =>
        sum +
        s.items.reduce(
          (itemSum, item) =>
            itemSum + (item.product.price - item.product.cost) * item.quantity,
          0,
        ),
      0,
    ),
  );

  totalSalesCount = computed(() => this.salesSignal().length);

  constructor(
    private storage: StorageService,
    private productService: ProductService,
    private customerService: CustomerService,
    private cartService: CartService,
  ) {
    const saved = this.storage.load<Sale[]>(SALES_KEY, []);
    this.salesSignal.set(saved);
  }

  private persist(): void {
    this.storage.save(SALES_KEY, this.salesSignal());
  }

  private generateReceiptNumber(): string {
    const date = new Date();
    const prefix =
      date.getFullYear().toString().slice(-2) +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const count = this.todaySales().length + 1;
    return `INV-${prefix}-${String(count).padStart(4, '0')}`;
  }

  checkout(
    paymentMethod: PaymentMethod,
    customerId: string | null,
    discount: number = 0,
  ): Sale {
    const items = this.cartService.items();
    const subtotal = this.cartService.subtotal();
    const taxRate = this.cartService.TAX_RATE;

    const discountedSubtotal = subtotal - discount;
    const taxAmount = discountedSubtotal * taxRate;
    const grandTotal = discountedSubtotal + taxAmount;

    const sale: Sale = {
      id: this.generateReceiptNumber(),
      items: [...items],
      customerId,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      grandTotal,
      paymentMethod,
      status: 'completed',
      createdAt: new Date(),
    };

    // حفظ الفاتورة
    this.salesSignal.update((list) => [sale, ...list]);
    this.persist();

    // خصم المخزون
    items.forEach((item) => {
      this.productService.decreaseStock(item.product.id, item.quantity);
    });

    // تحديث مشتريات العميل
    if (customerId) {
      this.customerService.addPurchaseAmount(customerId, grandTotal);
    }

    // تفريغ السلة
    this.cartService.clearCart();

    return sale;
  }

  refund(saleId: string): void {
    const sale = this.salesSignal().find((s) => s.id === saleId);
    if (!sale || sale.status === 'refunded') return;

    // إعادة المخزون
    sale.items.forEach((item) => {
      const current = this.productService.getById(item.product.id);
      if (current) {
        this.productService.update(item.product.id, {
          stock: current.stock + item.quantity,
        });
      }
    });

    // خصم من مشتريات العميل
    if (sale.customerId) {
      const customer = this.customerService.getById(sale.customerId);
      if (customer) {
        this.customerService.update(sale.customerId, {
          totalPurchases: Math.max(
            0,
            customer.totalPurchases - sale.grandTotal,
          ),
        });
      }
    }

    // تحديث حالة الفاتورة
    this.salesSignal.update((list) =>
      list.map((s) =>
        s.id === saleId ? { ...s, status: 'refunded' as const } : s,
      ),
    );
    this.persist();
  }
}
