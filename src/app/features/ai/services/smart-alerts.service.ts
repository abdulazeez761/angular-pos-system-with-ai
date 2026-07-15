import { Injectable, inject, computed } from '@angular/core';
import { ProductService, SaleService } from '../../../core/services';

export interface SmartAlert {
  productId: string;
  productName: string;
  type: 'critical' | 'warning' | 'info';
  icon: string;
  message: string;
  currentStock: number;
  dailyAvgSales: number;
  estimatedDaysLeft: number;
}

@Injectable({ providedIn: 'root' })
export class SmartAlertsService {
  private productService = inject(ProductService);
  private saleService = inject(SaleService);

  alerts = computed<SmartAlert[]>(() => {
    const products = this.productService.products().filter((p) => p.isActive);
    const sales = this.saleService
      .sales()
      .filter((s) => s.status === 'completed');
    const alerts: SmartAlert[] = [];

    products.forEach((product) => {
      // حساب متوسط المبيعات اليومية آخر 7 أيام
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      let totalSold = 0;

      sales.forEach((sale) => {
        if (new Date(sale.createdAt) >= weekAgo) {
          sale.items.forEach((item) => {
            if (item.product.id === product.id) {
              totalSold += item.quantity;
            }
          });
        }
      });

      const dailyAvg = totalSold / 7;
      const daysLeft =
        dailyAvg > 0 ? Math.floor(product.stock / dailyAvg) : 999;

      // نفد المخزون
      if (product.stock === 0) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          type: 'critical',
          icon: '🔴',
          message: 'نفد المخزون بالكامل - يحتاج إعادة طلب فوري',
          currentStock: 0,
          dailyAvgSales: Math.round(dailyAvg * 10) / 10,
          estimatedDaysLeft: 0,
        });
      }
      // ينفد خلال 3 أيام أو أقل
      else if (daysLeft <= 3 && dailyAvg > 0) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          type: 'critical',
          icon: '🟠',
          message: `سينفد خلال ${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'} بناءً على معدل البيع`,
          currentStock: product.stock,
          dailyAvgSales: Math.round(dailyAvg * 10) / 10,
          estimatedDaysLeft: daysLeft,
        });
      }
      // تحت الحد الأدنى
      else if (product.stock <= product.minStock) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          type: 'warning',
          icon: '🟡',
          message:
            daysLeft < 999
              ? `تحت الحد الأدنى - يكفي لحوالي ${daysLeft} يوم`
              : 'تحت الحد الأدنى المطلوب',
          currentStock: product.stock,
          dailyAvgSales: Math.round(dailyAvg * 10) / 10,
          estimatedDaysLeft: daysLeft,
        });
      }
      // قريب من الحد الأدنى
      else if (product.stock <= product.minStock * 1.5 && dailyAvg > 0) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          type: 'info',
          icon: '🔵',
          message: `يقترب من الحد الأدنى - يكفي لحوالي ${daysLeft} يوم`,
          currentStock: product.stock,
          dailyAvgSales: Math.round(dailyAvg * 10) / 10,
          estimatedDaysLeft: daysLeft,
        });
      }
    });

    // ترتيب حسب الأهمية
    const priority = { critical: 0, warning: 1, info: 2 };
    return alerts.sort((a, b) => priority[a.type] - priority[b.type]);
  });

  criticalCount = computed(
    () => this.alerts().filter((a) => a.type === 'critical').length,
  );

  warningCount = computed(
    () => this.alerts().filter((a) => a.type === 'warning').length,
  );
}
