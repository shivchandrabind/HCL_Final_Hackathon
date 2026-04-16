import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../../services/cart.service';
import { CouponService } from '../../../services/coupon.service';
import { Cart, CartItem } from '../../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDividerModule, MatSnackBarModule],
  template: `
    <div class="cart-page">
      <div class="cart-header">
        <h2 class="page-title">
          <mat-icon class="title-icon">shopping_cart</mat-icon>
          Shopping Cart
          @if (cart && cart.items && cart.items.length > 0) {
            <span class="item-count-badge">{{ cart.items.length }} {{ cart.items.length === 1 ? 'item' : 'items' }}</span>
          }
        </h2>
      </div>

      @if (cart && cart.items && cart.items.length > 0) {
        <div class="cart-layout">
          <div class="cart-items-section">
            @for (item of cart.items; track item.cartItemId) {
              <div class="cart-item-card">
                <div class="item-image-wrapper">
                  <div class="item-image-placeholder">
                    <mat-icon>restaurant</mat-icon>
                  </div>
                </div>
                <div class="item-details">
                  <h3 class="item-name">{{ item.menuItemName }}</h3>
                  <p class="item-price">{{ item.price | currency:'INR' }} each</p>
                </div>
                <div class="quantity-pill">
                  <button class="qty-btn minus" (click)="updateQuantity(item, item.quantity - 1)" [disabled]="item.quantity <= 1">
                    <mat-icon>remove</mat-icon>
                  </button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button class="qty-btn plus" (click)="updateQuantity(item, item.quantity + 1)">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
                <div class="item-subtotal">
                  <span class="subtotal-label">Subtotal</span>
                  <span class="subtotal-value">{{ item.subtotal | currency:'INR' }}</span>
                </div>
                <button class="remove-btn" (click)="removeItem(item)">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
            }
          </div>

          <div class="order-summary-section">
            <div class="summary-card">
              <h3 class="summary-title">Order Summary</h3>

              <div class="coupon-section">
                <div class="coupon-input-row">
                  <input type="text" class="coupon-input" [(ngModel)]="couponCode" placeholder="Enter coupon code" />
                  <button class="apply-btn" (click)="applyCoupon()" [disabled]="!couponCode">Apply</button>
                </div>
                @if (discount > 0) {
                  <div class="coupon-success">
                    <mat-icon>check_circle</mat-icon>
                    <span>Coupon applied! {{ discount }}% off</span>
                  </div>
                }
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row">
                <span>Subtotal</span>
                <span>{{ getSubtotal() | currency:'INR' }}</span>
              </div>
              @if (discount > 0) {
                <div class="summary-row discount-row">
                  <span>Discount ({{ discount }}%)</span>
                  <span>-{{ getSubtotal() * discount / 100 | currency:'INR' }}</span>
                </div>
              }

              <div class="summary-divider"></div>

              <div class="summary-row total-row">
                <span>Total</span>
                <span>{{ getTotal() | currency:'INR' }}</span>
              </div>

              <a class="checkout-btn" routerLink="/checkout">
                Proceed to Checkout
                <mat-icon>arrow_forward</mat-icon>
              </a>
            </div>
          </div>
        </div>
      } @else {
        <div class="empty-cart">
          <div class="empty-cart-icon">
            <mat-icon>shopping_cart</mat-icon>
          </div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <a class="start-shopping-btn" routerLink="/">
            <mat-icon>storefront</mat-icon>
            Start Shopping
          </a>
        </div>
      }
    </div>
  `,
  styles: [`

    :host { display: block; font-family: 'Poppins', sans-serif; }

    .cart-page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 32px 20px 60px;
    }

    .cart-header { margin-bottom: 32px; }

    .page-title {
      font-family: 'Poppins', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
    }

    .title-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #ff6b35;
    }

    .item-count-badge {
      font-size: 13px;
      font-weight: 500;
      background: linear-gradient(135deg, #ff6b35, #ff8f65);
      color: #fff;
      padding: 4px 14px;
      border-radius: 50px;
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
      align-items: flex-start;
    }

    /* Cart Item Cards */
    .cart-item-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #fff;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .cart-item-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    }

    .item-image-wrapper { flex-shrink: 0; }

    .item-image-placeholder {
      width: 64px;
      height: 64px;
      border-radius: 14px;
      background: linear-gradient(135deg, #fff0ea, #ffe0d0);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .item-image-placeholder mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #ff6b35;
    }

    .item-details { flex: 1; min-width: 0; }

    .item-name {
      font-family: 'Poppins', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0 0 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-price {
      font-size: 13px;
      color: #888;
      margin: 0;
    }

    /* Quantity Pill */
    .quantity-pill {
      display: flex;
      align-items: center;
      background: #f5f5f7;
      border-radius: 50px;
      padding: 4px;
      gap: 0;
      flex-shrink: 0;
    }

    .qty-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .qty-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .qty-btn.minus {
      background: #fff;
      color: #ff6b35;
    }

    .qty-btn.plus {
      background: linear-gradient(135deg, #ff6b35, #ff8f65);
      color: #fff;
    }

    .qty-btn:hover:not(:disabled) { transform: scale(1.1); }

    .qty-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .qty-value {
      min-width: 32px;
      text-align: center;
      font-weight: 600;
      font-size: 15px;
      color: #1a1a2e;
    }

    /* Subtotal */
    .item-subtotal {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      flex-shrink: 0;
      min-width: 80px;
    }

    .subtotal-label {
      font-size: 11px;
      color: #aaa;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .subtotal-value {
      font-size: 16px;
      font-weight: 700;
      color: #ff6b35;
    }

    /* Remove Button */
    .remove-btn {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      border: none;
      background: #fff0f0;
      color: #e74c3c;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .remove-btn:hover {
      background: #e74c3c;
      color: #fff;
      transform: scale(1.1);
    }

    .remove-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* Order Summary Card */
    .summary-card {
      background: #fff;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      position: sticky;
      top: 90px;
    }

    .summary-title {
      font-family: 'Poppins', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 20px;
    }

    /* Coupon */
    .coupon-section { margin-bottom: 20px; }

    .coupon-input-row {
      display: flex;
      gap: 8px;
    }

    .coupon-input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #eee;
      border-radius: 12px;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .coupon-input:focus { border-color: #2ec4b6; }

    .apply-btn {
      padding: 12px 22px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #2ec4b6, #26a69a);
      color: #fff;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .apply-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(46,196,182,0.4); }
    .apply-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .coupon-success {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
      color: #2ec4b6;
      font-size: 13px;
      font-weight: 500;
    }

    .coupon-success mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .summary-divider {
      height: 1px;
      background: #eee;
      margin: 16px 0;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 14px;
      color: #555;
    }

    .discount-row { color: #2ec4b6; font-weight: 500; }

    .total-row {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 24px;
    }

    .total-row span:last-child { color: #ff6b35; }

    /* Checkout Button */
    .checkout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: 50px;
      background: linear-gradient(135deg, #ff6b35, #ff8f65);
      color: #fff;
      font-family: 'Poppins', sans-serif;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(255,107,53,0.3);
    }

    .checkout-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255,107,53,0.4);
    }

    .checkout-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* Empty Cart */
    .empty-cart {
      text-align: center;
      padding: 80px 20px;
    }

    .empty-cart-icon {
      width: 120px;
      height: 120px;
      margin: 0 auto 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #fff0ea, #ffe0d0);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-cart-icon mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: #ff6b35;
    }

    .empty-cart h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 22px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0 0 8px;
    }

    .empty-cart p {
      color: #888;
      margin: 0 0 28px;
      font-size: 15px;
    }

    .start-shopping-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 36px;
      border-radius: 50px;
      background: linear-gradient(135deg, #ff6b35, #ff8f65);
      color: #fff;
      text-decoration: none;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(255,107,53,0.3);
    }

    .start-shopping-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255,107,53,0.4);
    }

    .start-shopping-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* Responsive */
    @media (max-width: 860px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }
      .summary-card { position: static; }
    }

    @media (max-width: 600px) {
      .cart-item-card {
        flex-wrap: wrap;
        gap: 12px;
        padding: 16px;
      }
      .item-details { min-width: calc(100% - 96px); }
      .quantity-pill { order: 1; }
      .item-subtotal { order: 2; align-items: flex-start; }
      .remove-btn { order: 3; margin-left: auto; }
    }
  `]
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  couponCode = '';
  discount = 0;

  constructor(private cartService: CartService, private couponService: CouponService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: cart => this.cart = cart,
      error: () => this.snackBar.open('Failed to load cart', 'Close', { duration: 3000 })
    });
  }

  updateQuantity(item: CartItem, newQty: number): void {
    if (newQty < 1) return;
    this.cartService.updateItem(item.cartItemId, { quantity: newQty }).subscribe({
      next: cart => this.cart = cart,
      error: () => this.snackBar.open('Failed to update quantity', 'Close', { duration: 3000 })
    });
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.cartItemId).subscribe({
      next: cart => {
        this.cart = cart;
        this.snackBar.open('Item removed', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to remove item', 'Close', { duration: 3000 })
    });
  }

  applyCoupon(): void {
    this.couponService.validate({ code: this.couponCode, orderAmount: this.getSubtotal() }).subscribe({
      next: coupon => {
        this.discount = coupon.discountPercent;
        this.snackBar.open(`Coupon applied! ${coupon.discountPercent}% off`, 'Close', { duration: 3000 });
      },
      error: () => {
        this.discount = 0;
        this.snackBar.open('Invalid or expired coupon', 'Close', { duration: 3000 });
      }
    });
  }

  getSubtotal(): number {
    if (!this.cart) return 0;
    return this.cart.totalAmount || this.cart.items.reduce((sum, i) => sum + i.subtotal, 0);
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    return this.discount > 0 ? subtotal * (1 - this.discount / 100) : subtotal;
  }
}
