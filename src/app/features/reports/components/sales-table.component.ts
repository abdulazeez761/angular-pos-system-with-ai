import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Sale } from '../../../core/models';

@Component({
  selector: 'app-sales-table',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './sales-table.component.html',
  styleUrl: './sales-table.component.css',
})
export class SalesTableComponent {
  sales = input.required<Sale[]>();
  refund = output<Sale>();
  getPaymentLabel(method: string): string {
    const labels: Record<string, string> = {
      cash: 'نقدي',
      card: 'بطاقة',
      wallet: 'محفظة',
    };
    return labels[method] ?? method;
  }
  getPaymentClass(method: string): string {
    const classes: Record<string, string> = {
      cash: 'bg-emerald-100 text-emerald-700',
      card: 'bg-purple-100 text-purple-700',
      wallet: 'bg-amber-100 text-amber-700',
    };
    return classes[method] ?? 'bg-slate-100 text-slate-600';
  }
}
