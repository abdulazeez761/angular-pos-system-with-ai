import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import {
  CartService,
  CustomerService,
  SaleService,
} from '../../../core/services';
import { PaymentMethod, Sale } from '../../../core/models';

@Component({
  selector: 'app-checkout-dialog',
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './checkout-dialog.component.html',
  styleUrl: './checkout-dialog.component.css',
})
export class CheckoutDialogComponent {
  cart = inject(CartService);
  customerService = inject(CustomerService);
  private saleService = inject(SaleService);

  close = output<void>();

  selectedPayment = signal<PaymentMethod>('cash');
  selectedCustomerId = '';
  manualDiscount = 0;
  cashPaid = 0;
  completedSale = signal<Sale | null>(null);

  paymentMethods = [
    { value: 'cash' as PaymentMethod, label: 'نقدي', icon: '💵' },
    { value: 'card' as PaymentMethod, label: 'بطاقة', icon: '💳' },
    { value: 'wallet' as PaymentMethod, label: 'محفظة', icon: '📱' },
  ];

  calcTax(): number {
    return (this.cart.subtotal() - this.manualDiscount) * this.cart.TAX_RATE;
  }

  calcGrandTotal(): number {
    const discounted = this.cart.subtotal() - this.manualDiscount;
    return discounted + discounted * this.cart.TAX_RATE;
  }

  canConfirm(): boolean {
    if (this.cart.items().length === 0) return false;
    if (this.manualDiscount > this.cart.subtotal()) return false;
    if (
      this.selectedPayment() === 'cash' &&
      this.cashPaid < this.calcGrandTotal()
    ) {
      return false;
    }
    return true;
  }

  onConfirmPayment(): void {
    if (!this.canConfirm()) return;

    const sale = this.saleService.checkout(
      this.selectedPayment(),
      this.selectedCustomerId || null,
      this.manualDiscount,
    );

    this.completedSale.set(sale);
  }

  getPaymentLabel(method: PaymentMethod): string {
    return this.paymentMethods.find((m) => m.value === method)?.label ?? method;
  }

  onPrintReceipt(): void {
    window.print();
  }
}
