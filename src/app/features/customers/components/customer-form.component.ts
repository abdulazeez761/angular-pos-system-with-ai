import { Component, input, output, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../../core/models';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.css',
})
export class CustomerFormComponent {
  editCustomer = input<Customer | null>(null);
  close = output<void>();
  save = output<Partial<Customer>>();
  form = {
    name: '',
    phone: '',
    email: '',
    address: '',
  };
  constructor() {
    effect(() => {
      const customer = this.editCustomer();
      if (customer) {
        this.form = {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
        };
      }
    });
  }
  isValid(): boolean {
    return (
      this.form.name.trim().length > 0 && this.form.phone.trim().length > 0
    );
  }

  onSave(): void {
    if (!this.isValid()) return;
    this.save.emit({ ...this.form });
  }
}
