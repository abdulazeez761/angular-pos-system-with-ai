import { Routes } from '@angular/router';
import { ReportsPageComponent } from './features/reports/reports-page.component';
export const routes: Routes = [
  {
    path: 'cashier',
    loadComponent: () =>
      import('./features/cashier/cashier-page.component').then(
        (m) => m.CashierPageComponent,
      ),
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./features/inventory/inventory-page.component').then(
        (m) => m.InventoryPageComponent,
      ),
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./features/customers/customers-page.component').then(
        (m) => m.CustomersPageComponent,
      ),
  },
  {
    path: 'reports',
    loadComponent: () => ReportsPageComponent,
  },
  { path: '', redirectTo: 'cashier', pathMatch: 'full' },
];
