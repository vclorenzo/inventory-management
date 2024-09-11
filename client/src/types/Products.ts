export interface Product {
	productId: string;
	name: string;
	price: number;
	rating?: number;
	stockQuantity: number;
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
