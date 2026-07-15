import { Component, inject } from '@angular/core';
import {
  SmartAlertsService,
  SmartAlert,
} from '../services/smart-alerts.service';

@Component({
  selector: 'app-alerts-panel',
  standalone: true,
  template: `
    @if (alertsService.alerts().length > 0) {
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-lg">🤖</span>
            <h3 class="font-bold text-slate-800">تنبيهات ذكية</h3>
          </div>
          <div class="flex gap-2">
            @if (alertsService.criticalCount() > 0) {
              <span
                class="bg-red-100 text-red-700 text-xs font-bold
                           px-2 py-1 rounded-full"
              >
                {{ alertsService.criticalCount() }} حرج
              </span>
            }
            @if (alertsService.warningCount() > 0) {
              <span
                class="bg-amber-100 text-amber-700 text-xs font-bold
                           px-2 py-1 rounded-full"
              >
                {{ alertsService.warningCount() }} تحذير
              </span>
            }
          </div>
        </div>

        <div class="space-y-2 max-h-80 overflow-y-auto">
          @for (alert of alertsService.alerts(); track alert.productId) {
            <div
              class="rounded-lg p-3 flex items-start gap-3 text-sm"
              [class]="getAlertBg(alert)"
            >
              <span class="text-base flex-shrink-0 mt-0.5">
                {{ alert.icon }}
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold" [class]="getAlertText(alert)">
                    {{ alert.productName }}
                  </span>
                  <span
                    class="text-xs px-2 py-0.5 rounded-full font-medium"
                    [class]="getStockBadge(alert)"
                  >
                    المخزون: {{ alert.currentStock }}
                  </span>
                </div>
                <p class="text-xs" [class]="getAlertSubText(alert)">
                  {{ alert.message }}
                </p>
                @if (alert.dailyAvgSales > 0) {
                  <p class="text-xs text-slate-400 mt-1">
                    معدل البيع: {{ alert.dailyAvgSales }} يومياً
                  </p>
                }
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class AlertsPanelComponent {
  alertsService = inject(SmartAlertsService);

  getAlertBg(alert: SmartAlert): string {
    switch (alert.type) {
      case 'critical':
        return 'bg-red-50 border border-red-100';
      case 'warning':
        return 'bg-amber-50 border border-amber-100';
      case 'info':
        return 'bg-blue-50 border border-blue-100';
    }
  }

  getAlertText(alert: SmartAlert): string {
    switch (alert.type) {
      case 'critical':
        return 'text-red-800';
      case 'warning':
        return 'text-amber-800';
      case 'info':
        return 'text-blue-800';
    }
  }

  getAlertSubText(alert: SmartAlert): string {
    switch (alert.type) {
      case 'critical':
        return 'text-red-600';
      case 'warning':
        return 'text-amber-600';
      case 'info':
        return 'text-blue-600';
    }
  }

  getStockBadge(alert: SmartAlert): string {
    switch (alert.type) {
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'warning':
        return 'bg-amber-100 text-amber-700';
      case 'info':
        return 'bg-blue-100 text-blue-700';
    }
  }
}
