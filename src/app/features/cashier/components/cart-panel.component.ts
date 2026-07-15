import { Component, inject, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services';

@Component({
  selector: 'app-cart-panel',
  imports: [CurrencyPipe],
  templateUrl: './cart-panel.component.html',
  styleUrl: './cart-panel.component.css',
})
export class CartPanelComponent {
  cart = inject(CartService);
  checkout = output<void>();
}
