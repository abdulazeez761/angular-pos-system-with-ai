import { Component, input } from '@angular/core';
import { Product } from '../../../core/models';

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

@Component({
  selector: 'app-top-products',
  imports: [],
  templateUrl: './top-products.component.html',
  styleUrl: './top-products.component.css',
})
export class TopProductsComponent {
  products = input.required<TopProduct[]>();
}
