import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Cart, AddToCartRequest, UpdateCartRequest } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = 'http://localhost:5000/api/cart';
  private cartItemCountSubject = new BehaviorSubject<number>(0);
  cartItemCount$ = this.cartItemCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap(cart => this.cartItemCountSubject.next(cart.items?.length || 0))
    );
  }

  addItem(request: AddToCartRequest): Observable<Cart> {
    return this.http.post<Cart>(this.apiUrl, request).pipe(
      tap(cart => this.cartItemCountSubject.next(cart.items?.length || 0))
    );
  }

  updateItem(cartItemId: number, request: UpdateCartRequest): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/${cartItemId}`, request).pipe(
      tap(cart => this.cartItemCountSubject.next(cart.items?.length || 0))
    );
  }

  removeItem(cartItemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/${cartItemId}`).pipe(
      tap(cart => this.cartItemCountSubject.next(cart.items?.length || 0))
    );
  }

  clearCount(): void {
    this.cartItemCountSubject.next(0);
  }
}
