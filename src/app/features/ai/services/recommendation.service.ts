import { Injectable, inject, computed } from '@angular/core';
import {
  CartService,
  ProductService,
  SaleService,
} from '../../../core/services';
import { Product } from '../../../core/models';

export interface Recommendation {
  product: Product;
  reason: string;
  score: number;
}

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private cart = inject(CartService);
  private productService = inject(ProductService);
  private saleService = inject(SaleService);

  // قواعد الارتباط بين التصنيفات
  private categoryRules: Record<string, string[]> = {
    drinks: ['food', 'snacks'],
    food: ['drinks', 'snacks'],
    snacks: ['drinks'],
  };

  recommendations = computed<Recommendation[]>(() => {
    const cartItems = this.cart.items();
    if (cartItems.length === 0) return [];

    const cartProductIds = new Set(cartItems.map((i) => i.product.id));
    const cartCategories = new Set(cartItems.map((i) => i.product.category));
    const allProducts = this.productService
      .products()
      .filter((p) => p.isActive && p.stock > 0 && !cartProductIds.has(p.id));

    const scored: Recommendation[] = [];

    allProducts.forEach((product) => {
      let score = 0;
      const reasons: string[] = [];

      // القاعدة الأولى: ارتباط التصنيفات
      cartCategories.forEach((cat) => {
        const related = this.categoryRules[cat] ?? [];
        if (related.includes(product.category)) {
          score += 30;
          reasons.push('يناسب محتويات السلة');
        }
      });

      // القاعدة الثانية: المنتجات التي تُشترى معاً
      const coScore = this.getCoOccurrenceScore(product.id, cartProductIds);
      if (coScore > 0) {
        score += coScore;
        reasons.push('يُشترى عادةً مع منتجات في سلتك');
      }

      // القاعدة الثالثة: المنتجات الأكثر مبيعاً
      const popularity = this.getPopularityScore(product.id);
      if (popularity > 0) {
        score += popularity;
        reasons.push('من الأكثر مبيعاً');
      }

      // القاعدة الرابعة: هامش ربح مرتفع
      const margin = ((product.price - product.cost) / product.price) * 100;
      if (margin >= 50) {
        score += 10;
      }

      if (score > 0) {
        scored.push({
          product,
          reason: reasons[0] ?? 'منتج مقترح',
          score,
        });
      }
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 4);
  });

  // تحليل سجل المبيعات لمعرفة المنتجات التي تُشترى معاً
  private getCoOccurrenceScore(
    productId: string,
    cartProductIds: Set<string>,
  ): number {
    const sales = this.saleService
      .sales()
      .filter((s) => s.status === 'completed');

    let coCount = 0;

    sales.forEach((sale) => {
      const saleProductIds = sale.items.map((i) => i.product.id);
      const hasProduct = saleProductIds.includes(productId);
      const hasCartItem = saleProductIds.some((id) => cartProductIds.has(id));

      if (hasProduct && hasCartItem) {
        coCount++;
      }
    });

    // كل ظهور مشترك يضيف 10 نقاط بحد أقصى 40
    return Math.min(coCount * 10, 40);
  }

  // نقاط الشعبية بناءً على عدد مرات البيع
  private getPopularityScore(productId: string): number {
    const sales = this.saleService
      .sales()
      .filter((s) => s.status === 'completed');

    let totalSold = 0;
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (item.product.id === productId) {
          totalSold += item.quantity;
        }
      });
    });

    // كل 5 مبيعات تضيف 5 نقاط بحد أقصى 20
    return Math.min(Math.floor(totalSold / 5) * 5, 20);
  }
}
