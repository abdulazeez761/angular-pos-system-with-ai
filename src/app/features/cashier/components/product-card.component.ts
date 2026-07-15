import { Component, input, output } from '@angular/core';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  products = input.required<Product>();
  addToCart = output<Product>();
  categoryIcon = input<string>('📦');
}
