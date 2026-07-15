import { Component, inject, signal, computed } from '@angular/core';
import { ProductService } from '../../core/services';
import { Product } from '../../core/models';
import { ProductTableComponent } from './components/product-table.component';
import { ProductFormComponent } from './components/product-form.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { AlertsPanelComponent } from '../ai/components/alerts-panel.component';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [
    ProductTableComponent,
    ProductFormComponent,
    ConfirmDialogComponent,
    AlertsPanelComponent,
  ],
  templateUrl: './inventory-page.component.html',
})
export class InventoryPageComponent {
  productService = inject(ProductService);

  searchQuery = signal('');
  filterCategory = signal('all');
  filterStock = signal('all');
  showForm = signal(false);
  showDeleteDialog = signal(false);
  selectedProduct = signal<Product | null>(null);

  filteredProducts = computed(() => {
    let products = this.productService.products();

    const category = this.filterCategory();
    if (category !== 'all') {
      products = products.filter((p) => p.category === category);
    }

    const stock = this.filterStock();
    if (stock === 'low') {
      products = products.filter((p) => p.stock > 0 && p.stock <= p.minStock);
    } else if (stock === 'out') {
      products = products.filter((p) => p.stock === 0);
    }

    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) || p.barcode.includes(query),
      );
    }

    return products;
  });

  totalStockValue = computed(() =>
    this.productService
      .products()
      .reduce((sum, p) => sum + p.cost * p.stock, 0),
  );

  outOfStockCount = computed(
    () => this.productService.products().filter((p) => p.stock === 0).length,
  );

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onFilterCategory(event: Event): void {
    this.filterCategory.set((event.target as HTMLSelectElement).value);
  }

  onFilterStock(event: Event): void {
    this.filterStock.set((event.target as HTMLSelectElement).value);
  }

  openForm(product?: Product): void {
    this.selectedProduct.set(product ?? null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.selectedProduct.set(null);
  }

  onSave(data: Partial<Product>): void {
    const existing = this.selectedProduct();
    if (existing) {
      this.productService.update(existing.id, data);
    } else {
      this.productService.add(
        data as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
      );
    }
    this.closeForm();
  }

  openDeleteDialog(product: Product): void {
    this.selectedProduct.set(product);
    this.showDeleteDialog.set(true);
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
    this.selectedProduct.set(null);
  }

  onDelete(): void {
    const product = this.selectedProduct();
    if (product) {
      this.productService.delete(product.id);
    }
    this.closeDeleteDialog();
  }
}
