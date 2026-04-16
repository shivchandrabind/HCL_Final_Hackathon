import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, PlaceOrderRequest, UpdateOrderStatusRequest } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:5000/api/orders';

  constructor(private http: HttpClient) {}

  placeOrder(request: PlaceOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, request);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  reorder(orderId: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${orderId}/reorder`, {});
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('http://localhost:5000/api/admin/orders');
  }

  updateStatus(orderId: number, request: UpdateOrderStatusRequest): Observable<Order> {
    return this.http.put<Order>(`http://localhost:5000/api/admin/orders/${orderId}/status`, request);
  }
}
