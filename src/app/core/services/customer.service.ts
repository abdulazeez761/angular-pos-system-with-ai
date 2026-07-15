import { computed, Injectable, signal } from '@angular/core';
import { Customer } from '../models';
import { StorageService } from './storage.service';

const CUSTOMERS_KEY = 'pos_customers';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private customersSignal = signal<Customer[]>([]);

  customers = this.customersSignal.asReadonly();

  topCustomers = computed(() =>
    [...this.customersSignal()]
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, 5),
  );
  constructor(private storage: StorageService) {
    this.loadCustomers();
  }
  loadCustomers() {
    const saved = this.storage.load<Customer[]>(CUSTOMERS_KEY, []);
    if (saved.length === 0) {
      this.seedCustomers();
    } else {
      this.customersSignal.set(saved);
    }
  }
  private seedCustomers(): void {
    const mock: Customer[] = [
      {
        id: 'c1',
        name: 'أحمد محمد',
        phone: '0501234567',
        email: 'ahmed@email.com',
        address: 'الرياض - حي النخيل',
        totalPurchases: 1250,
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 'c2',
        name: 'سارة العلي',
        phone: '0559876543',
        email: 'sara@email.com',
        address: 'جدة - حي الروضة',
        totalPurchases: 3400,
        createdAt: new Date('2024-02-20'),
      },
      {
        id: 'c3',
        name: 'خالد العمري',
        phone: '0541112233',
        email: 'khaled@email.com',
        address: 'الدمام - حي الفيصلية',
        totalPurchases: 870,
        createdAt: new Date('2024-03-10'),
      },
      {
        id: 'c4',
        name: 'نورة السالم',
        phone: '0567778899',
        email: 'noura@email.com',
        address: 'الرياض - حي العليا',
        totalPurchases: 5200,
        createdAt: new Date('2024-01-05'),
      },
      {
        id: 'c5',
        name: 'عبدالله الحربي',
        phone: '0533445566',
        email: 'abdullah@email.com',
        address: 'مكة - حي الزاهر',
        totalPurchases: 0,
        createdAt: new Date('2024-06-01'),
      },
    ];

    this.customersSignal.set(mock);
    this.persist();
  }
  private persist(): void {
    this.storage.save(CUSTOMERS_KEY, this.customersSignal());
  }
  getById(id: string): Customer | undefined {
    return this.customersSignal().find((c) => c.id === id);
  }
  add(customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases'>): void {
    const newCustomer: Customer = {
      ...customer,
      id: 'c' + Date.now(),
      totalPurchases: 0,
      createdAt: new Date(),
    };
    this.customersSignal.update((list) => [...list, newCustomer]);
    this.persist();
  }
  update(id: string, changes: Partial<Customer>): void {
    this.customersSignal.update((list) =>
      list.map((c) => (c.id === id ? { ...c, ...changes } : c)),
    );
    this.persist();
  }
  delete(id: string): void {
    this.customersSignal.update((list) => list.filter((c) => c.id !== id));
    this.persist();
  }
  addPurchaseAmount(id: string, amount: number): void {
    const customer = this.getById(id);
    if (customer) {
      this.update(id, {
        totalPurchases: customer.totalPurchases + amount,
      });
    }
  }
}
