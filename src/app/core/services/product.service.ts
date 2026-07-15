import { Injectable, signal, computed } from '@angular/core';
import { Product, Category } from '../models/product.model';
import { StorageService } from './storage.service';

const PRODUCTS_KEY = 'pos_products';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private productSignal = signal<Product[]>([]);

  products = this.productSignal.asReadonly();

  categories = computed<Category[]>(() => [
    { id: 'all', name: 'الكل', icon: '📋' },
    { id: 'drinks', name: 'المشروبات', icon: '🥤' },
    { id: 'food', name: 'الطعام', icon: '🍔' },
    { id: 'snacks', name: 'الوجبات الخفيفة', icon: '🍿' },
    { id: 'other', name: 'أخرى', icon: '📦' },
  ]);

  lowStockProducts = computed<Product[]>(() =>
    this.productSignal().filter((pr) => pr.stock <= pr.minStock),
  );

  constructor(private storage: StorageService) {
    this.loadProducts();
  }
  private loadProducts(): void {
    const products = this.storage.load<Product[]>(PRODUCTS_KEY, []);
    if (products.length == 0) {
      this.seedProducts();
    } else this.productSignal.set(products);
  }
  private seedProducts(): void {
    const mock: Product[] = [
      {
        id: 'p1',
        name: 'قهوة أمريكية',
        barcode: '100001',
        price: 12,
        cost: 4,
        stock: 50,
        minStock: 10,
        category: 'drinks',
        imageUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'p2',
        name: 'شاي أخضر',
        barcode: '100002',
        price: 8,
        cost: 2,
        stock: 40,
        minStock: 10,
        category: 'drinks',
        imageUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'p3',
        name: 'برجر لحم',
        barcode: '100003',
        price: 25,
        cost: 10,
        stock: 30,
        minStock: 5,
        category: 'food',
        imageUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'p4',
        name: 'بطاطس مقلية',
        barcode: '100004',
        price: 10,
        cost: 3,
        stock: 45,
        minStock: 10,
        category: 'snacks',
        imageUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'p5',
        name: 'عصير برتقال',
        barcode: '100005',
        price: 15,
        cost: 5,
        stock: 3,
        minStock: 10,
        category: 'drinks',
        imageUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'p6',
        name: 'ساندويتش دجاج',
        barcode: '100006',
        price: 20,
        cost: 8,
        stock: 25,
        minStock: 5,
        category: 'food',
        imageUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    this.productSignal.set(mock);
    this.persist();
  }
  private persist(): void {
    this.storage.save(PRODUCTS_KEY, this.productSignal());
  }
  getById(id: string): Product | undefined {
    return this.productSignal().find((c) => c.id == id);
  }
  add(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newProduct: Product = {
      ...product,
      id: 'p' + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.productSignal.update((products) => [...products, newProduct]);
    this.persist();
  }
  update(id: string, changes: Partial<Product>): void {
    this.productSignal.update((list) =>
      list.map((p) =>
        p.id === id ? { ...p, ...changes, updatedAt: new Date() } : p,
      ),
    );
    this.persist();
  }
  delete(id: string): void {
    this.productSignal.update((list) => list.filter((p) => p.id !== id));
    this.persist();
  }
  decreaseStock(id: string, quantity: number): void {
    const product = this.getById(id);
    const newStock = product?.stock ? product.stock - quantity : 0;
    this.update(id, { stock: newStock });
  }
}
