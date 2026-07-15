import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css',
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string>();
  icon = input('📊');
  iconBg = input('bg-blue-50');
  valueColor = input('text-slate-800');
  subtitle = input('');
  trend = input('');
  trendUp = input(true);
}
