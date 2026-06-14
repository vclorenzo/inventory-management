export interface CartItem {
  id: string;
  image: string;
  title: string;
  unitPrice: number;
  quantity: number;
  stockLeft: number;
  currency: string;
}

export interface CartGroup {
  shop: {
    name: string;
  };
  items: CartItem[];
}

export interface AddCartItemRequest {
  productId: string;
  quantity?: number;
  currency?: string;
}

export interface UpdateCartItemRequest {
  id: string;
  quantity: number;
}
