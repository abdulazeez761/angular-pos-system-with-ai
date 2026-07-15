import { Component, input, output } from '@angular/core';
import { Customer } from '../../../core/models';

@Component({
  selector: 'app-customer-card',
  imports: [],
  templateUrl: './customer-card.component.html',
  styleUrl: './customer-card.component.css',
})
export class CustomerCardComponent {
  customer = input.required<Customer>();
  edit = output<Customer>();
  delete = output<Customer>();
  private colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
  ];
  avatarColor = () => {
    const index = this.customer().name.charCodeAt(0) % this.colors.length;
    return this.colors[index];
  };
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
    });
  }
}
