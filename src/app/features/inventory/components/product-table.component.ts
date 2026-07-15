import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-product-table',
  imports: [CurrencyPipe],
  templateUrl: './product-table.component.html',
  styleUrl: './product-table.component.css',
})
export class ProductTableComponent {
  products = input.required<Product[]>();
  edit = output<Product>();
  delete = output<Product>();
}
