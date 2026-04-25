export interface Product {
  productId: string;
  name: string;
  productCategory: string;
  brand: string;
  condition: string;
  price: number;
  rating: number;
  stockQuantity: number;
  description: string;
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
}

export type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
};
