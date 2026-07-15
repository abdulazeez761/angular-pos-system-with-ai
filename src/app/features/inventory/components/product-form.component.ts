import { Component, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product, Category } from '../../../core/models';

@Component({
  selector: 'app-product-form',
  imports: [FormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent {
  editProduct = input<Product | null>(null);
  categories = input.required<Category[]>();
  close = output<void>();
  save = output<Partial<Product>>();
  form = {
    name: '',
    barcode: '',
    category: 'drinks',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    isActive: true,
    imageUrl: '',
  };
  constructor() {
    effect(() => {
      const product = this.editProduct();
      if (product) {
        this.form = { ...product };
      }
    });
  }
  profitMargin = signal(0);
  ngDoCheck(): void {
    if (this.form.price > 0 && this.form.cost > 0) {
      const margin =
        ((this.form.price - this.form.cost) / this.form.price) * 100;
      this.profitMargin.set(margin);
    }
  }
  isValid(): boolean {
    return (
      this.form.name.trim().length > 0 &&
      this.form.barcode.trim().length > 0 &&
      this.form.price > 0 &&
      this.form.cost >= 0 &&
      this.form.stock >= 0
    );
  }
  onSave(): void {
    if (!this.isValid()) return;
    this.save.emit({ ...this.form });
  }
}
