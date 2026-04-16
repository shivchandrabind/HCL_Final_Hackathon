import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { Cart } from '../../../models/cart.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDividerModule, MatSnackBarModule, MatDialogModule, MatIconModule],
  template: `
    <div class="checkout-page">
      @if (orderPlaced) {
        <div class="success-state">
          <div class="success-icon-wrapper">
            <mat-icon>check_circle</mat-icon>
          </div>
          <h2>Order Placed Successfully!</h2>
          <p class="order-id-text">Order #{{ placedOrderId }}</p>
          <p class="success-sub">Your food is being prepared and will be delivered soon.</p>
          <a class="view-orders-btn" routerLink="/orders">
            <mat-icon>receipt_long</mat-icon>
            View My Orders
          </a>
        </div>
      } @else if (cart && cart.items && cart.items.length > 0) {
        <h2 class="page-title">
          <mat-icon class="title-icon">payment</mat-icon>
          Checkout
        </h2>
        <div class="checkout-layout">
          <!-- Order Summary (Left) -->
          <div class="summary-column">
            <div class="summary-card">
              <h3 class="section-title">Order Summary</h3>
              <div class="items-list">
                @for (item of cart.items; track item.cartItemId) {
                  <div class="summary-item">
                    <div class="summary-item-icon">
                      <mat-icon>restaurant</mat-icon>
                    </div>
                    <div class="summary-item-info">
                      <span class="summary-item-name">{{ item.menuItemName }}</span>
                      <span class="summary-item-qty">Qty: {{ item.quantity }}</span>
                    </div>
                    <span class="summary-item-price">{{ item.subtotal | currency:'INR' }}</span>
                  </div>
                }
              </div>
              <div class="summary-divider"></div>
              <div class="summary-total">
                <span>Total</span>
                <span class="total-amount">{{ cart.totalAmount | currency:'INR' }}</span>
              </div>
            </div>
          </div>

          <!-- Delivery Form (Right) -->
          <div class="form-column">
            <div class="form-card">
              <h3 class="section-title">Delivery Details</h3>

              <label class="field-label">Delivery Address</label>
              <textarea
                class="styled-textarea"
                [(ngModel)]="deliveryAddress"
                rows="3"
                placeholder="Enter your full delivery address"
                required
              ></textarea>

              <label class="field-label">Coupon Code <span class="optional">(optional)</span></label>
              <input
                type="text"
                class="styled-input"
                [(ngModel)]="couponCode"
                placeholder="Enter coupon code"
              />
              @if (couponCode) {
                <div class="coupon-note">
                  <mat-icon>local_offer</mat-icon>
                  <span>Coupon "{{ couponCode }}" will be applied at checkout</span>
                </div>
              }

              <button
                class="place-order-btn"
                (click)="placeOrder()"
                [disabled]="!deliveryAddress || loading"
                [class.loading]="loading"
              >
                @if (loading) {
                  <div class="spinner"></div>
                  <span>Placing Order...</span>
                } @else {
                  <mat-icon>shopping_bag</mat-icon>
                  <span>Place Order</span>
                }
              </button>
            </div>
          </div>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">
            <mat-icon>remove_shopping_cart</mat-icon>
          </div>
          <h3>Nothing to checkout</h3>
          <p>Your cart is empty. Add some items first.</p>
          <a class="back-btn" routerLink="/">
            <mat-icon>arrow_back</mat-icon>
            Browse Menu
          </a>
        </div>
      }
    </div>
  `,
  styles: [`

    :host { display: block; font-family: 'Poppins', sans-serif; }

    .checkout-page {
      max-width: 1000px;
      margin: 0 auto;
      padding: 32px 20px 60px;
    }

    .page-title {
      font-family: 'Poppins', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 32px;
    }

    .title-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #ff6b35;
    }

    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      align-items: flex-start;
    }

    /* Summary Card */
    .summary-card, .form-card {
      background: #fff;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .section-title {
      font-family: 'Poppins', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 20px;
    }

    .items-list { display: flex; flex-direction: column; gap: 12px; }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: #f9f9fb;
      border-radius: 12px;
      transition: background 0.2s;
    }

    .summary-item:hover { background: #f0f0f4; }

    .summary-item-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #fff0ea, #ffe0d0);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .summary-item-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #ff6b35;
    }

    .summary-item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .summary-item-name {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a2e;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .summary-item-qty {
      font-size: 12px;
      color: #888;
    }

    .summary-item-price {
      font-size: 14px;
      font-weight: 600;
      color: #ff6b35;
      flex-shrink: 0;
    }

    .summary-divider {
      height: 1px;
      background: #eee;
      margin: 20px 0;
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .total-amount { color: #ff6b35; }

    /* Form Fields */
    .field-label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 8px;
    }

    .optional { font-weight: 400; color: #aaa; }

    .styled-textarea, .styled-input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #eee;
      border-radius: 12px;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      margin-bottom: 20px;
      resize: vertical;
      box-sizing: border-box;
    }

    .styled-textarea:focus, .styled-input:focus {
      border-color: #2ec4b6;
    }

    .coupon-note {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #2ec4b6;
      font-size: 13px;
      font-weight: 500;
      margin: -12px 0 20px;
    }

    .coupon-note mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Place Order Button */
    .place-order-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
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
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(255,107,53,0.3);
      margin-top: 8px;
    }

    .place-order-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255,107,53,0.4);
    }

    .place-order-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .place-order-btn.loading {
      background: linear-gradient(135deg, #ccc, #bbb);
      box-shadow: none;
    }

    .place-order-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Success State */
    .success-state {
      text-align: center;
      padding: 80px 20px;
    }

    .success-icon-wrapper {
      width: 120px;
      height: 120px;
      margin: 0 auto 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e0f7f5, #b2f0e8);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: scaleIn 0.5s ease;
    }

    @keyframes scaleIn {
      0% { transform: scale(0); opacity: 0; }
      60% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
    }

    .success-icon-wrapper mat-icon {
      font-size: 60px;
      width: 60px;
      height: 60px;
      color: #2ec4b6;
    }

    .success-state h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 26px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 8px;
    }

    .order-id-text {
      font-size: 18px;
      font-weight: 600;
      color: #2ec4b6;
      margin: 0 0 8px;
    }

    .success-sub {
      color: #888;
      font-size: 15px;
      margin: 0 0 32px;
    }

    .view-orders-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 36px;
      border-radius: 50px;
      background: linear-gradient(135deg, #2ec4b6, #26a69a);
      color: #fff;
      text-decoration: none;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(46,196,182,0.3);
    }

    .view-orders-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(46,196,182,0.4);
    }

    .view-orders-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }

    .empty-icon {
      width: 100px;
      height: 100px;
      margin: 0 auto 20px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f5f5f7, #eee);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-icon mat-icon {
      font-size: 44px;
      width: 44px;
      height: 44px;
      color: #ccc;
    }

    .empty-state h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 20px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0 0 8px;
    }

    .empty-state p {
      color: #888;
      margin: 0 0 24px;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 28px;
      border-radius: 50px;
      background: linear-gradient(135deg, #ff6b35, #ff8f65);
      color: #fff;
      text-decoration: none;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(255,107,53,0.3);
    }

    .back-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255,107,53,0.4);
    }

    .back-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .checkout-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  deliveryAddress = '';
  couponCode = '';
  loading = false;
  orderPlaced = false;
  placedOrderId: number | string = '';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe(cart => this.cart = cart);
  }

  placeOrder(): void {
    this.loading = true;
    const request = {
      deliveryAddress: this.deliveryAddress,
      ...(this.couponCode ? { couponCode: this.couponCode } : {})
    };
    this.orderService.placeOrder(request).subscribe({
      next: (order) => {
        this.cartService.clearCount();
        this.placedOrderId = order.orderId;
        this.orderPlaced = true;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Failed to place order', 'Close', { duration: 3000 });
      }
    });
  }
}
