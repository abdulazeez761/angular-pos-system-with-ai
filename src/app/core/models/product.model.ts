export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface Category {
  id: string;
  name: string;
  icon: string;
}
