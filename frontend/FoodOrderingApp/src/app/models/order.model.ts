export interface Order {
  orderId: number;
  customerId: number;
  customerName?: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  deliveryAddress: string;
  items: OrderItem[];
  couponCode?: string;
  discount?: number;
}

export interface OrderItem {
  orderItemId: number;
  menuItemId: number;
  menuItemName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface PlaceOrderRequest {
  deliveryAddress: string;
  couponCode?: string;
}

export interface UpdateOrderStatusRequest {
  status: string;
}
