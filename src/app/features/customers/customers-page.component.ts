import { Component, computed, inject, signal } from '@angular/core';
import { Customer } from '../../core/models';
import { CustomerService } from '../../core/services';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { CustomerFormComponent } from './components/customer-form.component';
import { CustomerCardComponent } from './components/customer-card.component';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [
    CustomerCardComponent,
    CustomerFormComponent,
    ConfirmDialogComponent,
  ],

  templateUrl: './customers-page.component.html',
  styles: [
    `
      .page {
        padding: 2rem;
      }
      h1 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
    `,
  ],
})
export class CustomersPageComponent {
  customerService = inject(CustomerService);

  searchQuery = signal('');
  sortBy = signal('name');
  showForm = signal(false);
  showDeleteDialog = signal(false);
  selectedCustomer = signal<Customer | null>(null);
  totalCustomers = computed(() => this.customerService.customers().length);
  filteredCustomers = computed(() => {
    let customers = [...this.customerService.customers()];

    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      customers = customers.filter(
        (c) => c.name.toLowerCase().includes(query) || c.phone.includes(query),
      );
    }

    const sort = this.sortBy();
    switch (sort) {
      case 'name':
        customers.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        break;
      case 'purchases':
        customers.sort((a, b) => b.totalPurchases - a.totalPurchases);
        break;
      case 'recent':
        customers.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    return customers;
  });

  totalAllPurchases = computed(() =>
    this.customerService
      .customers()
      .reduce((sum, c) => sum + c.totalPurchases, 0),
  );

  averagePurchases = computed(() => {
    const customers = this.customerService.customers();
    if (customers.length === 0) return 0;
    return Math.round(this.totalAllPurchases() / customers.length);
  });

  inactiveCount = computed(
    () =>
      this.customerService.customers().filter((c) => c.totalPurchases === 0)
        .length,
  );

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onSort(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value);
  }

  openForm(customer?: Customer): void {
    this.selectedCustomer.set(customer ?? null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.selectedCustomer.set(null);
  }

  onSave(data: Partial<Customer>): void {
    const existing = this.selectedCustomer();
    if (existing) {
      this.customerService.update(existing.id, data);
    } else {
      this.customerService.add(
        data as Omit<Customer, 'id' | 'createdAt' | 'totalPurchases'>,
      );
    }
    this.closeForm();
  }

  openDeleteDialog(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.showDeleteDialog.set(true);
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
    this.selectedCustomer.set(null);
  }

  onDelete(): void {
    const customer = this.selectedCustomer();
    if (customer) {
      this.customerService.delete(customer.id);
    }
    this.closeDeleteDialog();
  }
}
