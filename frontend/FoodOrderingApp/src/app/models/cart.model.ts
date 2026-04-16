export interface Cart {
  cartId: number;
  customerId: number;
  items: CartItem[];
  totalAmount: number;
}

export interface CartItem {
  cartItemId: number;
  menuItemId: number;
  menuItemName: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface AddToCartRequest {
  menuItemId: number;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}
