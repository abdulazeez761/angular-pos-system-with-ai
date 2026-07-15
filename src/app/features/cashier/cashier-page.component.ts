import { Component, computed, inject, signal } from '@angular/core';
import { CartService, ProductService } from '../../core/services';
import { CartPanelComponent } from './components/cart-panel.component';
import { CategoryBarComponent } from './components/category-bar.component';
import { ProductCardComponent } from './components/product-card.component';
import { CheckoutDialogComponent } from './components/checkout-dialog.component';
import { Product } from '../../core/models';
import { AiAssistantComponent } from '../ai/components/ai-assistant.component';
import { RecommendationsBarComponent } from '../ai/components/recommendations-bar.component';

@Component({
  selector: 'app-cashier-page',
  standalone: true,
  imports: [
    CategoryBarComponent,
    ProductCardComponent,
    CartPanelComponent,
    CheckoutDialogComponent,
    RecommendationsBarComponent,
    AiAssistantComponent,
  ],
  templateUrl: './cashier-page.component.html',
})
export class CashierPageComponent {
  productService = inject(ProductService);
  private cartService = inject(CartService);
  searchQuery = signal('all');
  activeCategory = signal('all');
  showCheckout = signal(false);
  filterProducts = computed(() => {
    let products = this.productService.products().filter((p) => p.isActive);
    const category = this.activeCategory();
    if (category != 'all')
      products = products.filter((p) => p.category === category);

    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      products =
        query === 'all'
          ? products
          : products.filter((p) => p.name.toLowerCase().includes(query));
    }

    return products;
  });
  private iconMap: Record<string, string> = {
    drinks: '🥤',
    food: '🍔',
    snacks: '🍿',
    other: '📦',
  };
  getCategoryIcon(category: string): string {
    return this.iconMap[category] ?? '📦';
  }
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }
  onAddToCart(product: Product): void {
    this.cartService.addItem(product);
  }

  onCheckout(): void {
    this.showCheckout.set(true);
  }
  onCloseCheckout(): void {
    this.showCheckout.set(false);
  }
}
