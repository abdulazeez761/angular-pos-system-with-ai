import { Component, computed, inject, Inject, signal } from '@angular/core';
import { ProductService, SaleService } from '../../core/services';
import { Sale } from '../../core/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import {
  TopProduct,
  TopProductsComponent,
} from './components/top-products.component';
import { SalesTableComponent } from './components/sales-table.component';
import { StatCardComponent } from './components/stat-card.component';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    StatCardComponent,
    SalesTableComponent,
    TopProductsComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './reports-page.component.html',
})
export class ReportsPageComponent {
  private saleService = inject(SaleService);
  private productService = inject(ProductService);

  searchQuery = signal('');
  activeDateFilter = signal('today');
  showRefundDialog = signal(false);
  saleToRefund = signal<Sale | null>(null);

  dateFilters = [
    { value: 'today', label: 'اليوم' },
    { value: 'week', label: 'هذا الأسبوع' },
    { value: 'month', label: 'هذا الشهر' },
    { value: 'all', label: 'الكل' },
  ];

  filteredSales = computed(() => {
    const all = this.saleService.sales();
    const filter = this.activeDateFilter();
    const now = new Date();

    switch (filter) {
      case 'today':
        return all.filter(
          (s) => new Date(s.createdAt).toDateString() === now.toDateString(),
        );
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return all.filter((s) => new Date(s.createdAt) >= weekAgo);
      }
      case 'month': {
        return all.filter((s) => {
          const d = new Date(s.createdAt);
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        });
      }
      default:
        return all;
    }
  });

  searchedSales = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return this.filteredSales();
    return this.filteredSales().filter((s) =>
      s.id.toLowerCase().includes(query),
    );
  });

  totalRevenue = computed(() => {
    const total = this.filteredSales()
      .filter((s) => s.status === 'completed')
      .reduce((sum, s) => sum + s.grandTotal, 0);
    return Math.round(total).toLocaleString();
  });

  totalProfit = computed(() => {
    const profit = this.filteredSales()
      .filter((s) => s.status === 'completed')
      .reduce(
        (sum, s) =>
          sum +
          s.items.reduce(
            (itemSum, item) =>
              itemSum +
              (item.product.price - item.product.cost) * item.quantity,
            0,
          ),
        0,
      );
    return Math.round(profit).toLocaleString();
  });

  profitMargin = computed(() => {
    const revenue = this.filteredSales()
      .filter((s) => s.status === 'completed')
      .reduce((sum, s) => sum + s.grandTotal, 0);
    const profit = this.filteredSales()
      .filter((s) => s.status === 'completed')
      .reduce(
        (sum, s) =>
          sum +
          s.items.reduce(
            (itemSum, item) =>
              itemSum +
              (item.product.price - item.product.cost) * item.quantity,
            0,
          ),
        0,
      );
    if (revenue === 0) return '0';
    return ((profit / revenue) * 100).toFixed(1);
  });

  avgSale = computed(() => {
    const completed = this.filteredSales().filter(
      (s) => s.status === 'completed',
    );
    if (completed.length === 0) return '0';
    const avg =
      completed.reduce((sum, s) => sum + s.grandTotal, 0) / completed.length;
    return Math.round(avg).toLocaleString();
  });

  refundedCount = computed(
    () => this.filteredSales().filter((s) => s.status === 'refunded').length,
  );

  refundedAmount = computed(() => {
    const total = this.filteredSales()
      .filter((s) => s.status === 'refunded')
      .reduce((sum, s) => sum + s.grandTotal, 0);
    return Math.round(total).toLocaleString();
  });

  topProducts = computed<TopProduct[]>(() => {
    const completed = this.filteredSales().filter(
      (s) => s.status === 'completed',
    );
    const productMap = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    completed.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = productMap.get(item.product.id);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.total;
        } else {
          productMap.set(item.product.id, {
            name: item.product.name,
            quantity: item.quantity,
            revenue: item.total,
          });
        }
      });
    });

    const sorted = [...productMap.values()].sort(
      (a, b) => b.quantity - a.quantity,
    );
    const maxQty = sorted[0]?.quantity ?? 1;

    return sorted.slice(0, 5).map((p) => ({
      ...p,
      percentage: Math.round((p.quantity / maxQty) * 100),
    }));
  });

  paymentBreakdown = computed(() => {
    const completed = this.filteredSales().filter(
      (s) => s.status === 'completed',
    );
    const total = completed.length || 1;

    const methods = [
      {
        type: 'cash',
        label: 'نقدي',
        icon: '💵',
        barColor: 'bg-emerald-500',
      },
      {
        type: 'card',
        label: 'بطاقة',
        icon: '💳',
        barColor: 'bg-purple-500',
      },
      {
        type: 'wallet',
        label: 'محفظة',
        icon: '📱',
        barColor: 'bg-amber-500',
      },
    ];

    return methods.map((m) => {
      const sales = completed.filter((s: Sale) => s.paymentMethod === m.type);
      return {
        ...m,
        count: sales.length,
        total: sales.reduce((sum: number, s: Sale) => sum + s.grandTotal, 0),
        percentage: Math.round((sales.length / total) * 100),
      };
    });
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  openRefundDialog(sale: Sale): void {
    this.saleToRefund.set(sale);
    this.showRefundDialog.set(true);
  }

  closeRefundDialog(): void {
    this.showRefundDialog.set(false);
    this.saleToRefund.set(null);
  }

  onRefund(): void {
    const sale = this.saleToRefund();
    if (sale) {
      this.saleService.refund(sale.id);
    }
    this.closeRefundDialog();
  }
}
