type meetupLocations = { name: string; address: string; mapLink: string };

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
  paymentMethods: string[];
  meetupLocations: meetupLocations[];
  shippingDetails: string | null;
}

export interface NewProduct {
  name: string;
  productCategory: string;
  brand: string;
  condition: string;
  price: number;
  rating: number;
  stockQuantity: number;
  description: string;
  paymentMethods?: string[];
  meetupLocations?: meetupLocations[];
  shippingDetails?: string | null;
}

export type ProductFormValues = {
  name: string;
  productCategory: string;
  brand: string;
  condition: string;
  price: number;
  stockQuantity: number;
  rating: number;
  description: string;
  paymentMethods: string[];
  meetupLocations: meetupLocations[];
  shippingDetails: string | null;
};
