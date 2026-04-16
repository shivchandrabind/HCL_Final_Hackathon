import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, MatSnackBarModule],
  template: `
    <div class="oh-page">
      <div class="oh-header">
        <div class="oh-header-left">
          <h2 class="oh-title">My Orders</h2>
          <span class="oh-count" *ngIf="orders.length">{{ orders.length }} order{{ orders.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      @if (orders.length > 0) {
        <div class="oh-grid">
          @for (o of orders; track o.orderId) {
            <div class="oh-card">
              <div class="oh-card-top">
                <div class="oh-order-num">#{{ o.orderId }}</div>
                <span class="oh-status" [class]="'oh-status-' + o.status.toLowerCase()">{{ o.status }}</span>
              </div>
              <div class="oh-card-body">
                <div class="oh-info-row">
                  <mat-icon class="oh-info-icon">calendar_today</mat-icon>
                  <span>{{ o.orderDate | date:'mediumDate' }}</span>
                </div>
                <div class="oh-info-row">
                  <mat-icon class="oh-info-icon">schedule</mat-icon>
                  <span>{{ o.orderDate | date:'shortTime' }}</span>
                </div>
              </div>
              <div class="oh-card-footer">
                <div class="oh-total">{{ o.totalAmount | currency:'INR' }}</div>
                <div class="oh-actions">
                  <a class="oh-btn oh-btn-details" [routerLink]="['/orders', o.orderId]">
                    <mat-icon>visibility</mat-icon> View Details
                  </a>
                  <button class="oh-btn oh-btn-reorder" (click)="reorder(o.orderId)">
                    <mat-icon>replay</mat-icon> Reorder
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="oh-empty">
          <div class="oh-empty-icon-wrap">
            <mat-icon class="oh-empty-icon">receipt_long</mat-icon>
          </div>
          <h3 class="oh-empty-title">No orders yet</h3>
          <p class="oh-empty-text">Your order history will appear here once you place your first order.</p>
          <a class="oh-btn oh-btn-start" routerLink="/">Start Ordering</a>
        </div>
      }
    </div>
  `,
  styles: [`

    .oh-page { max-width: 1100px; margin: 0 auto; padding: 32px 20px; font-family: 'Poppins', sans-serif; }

    .oh-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
    .oh-header-left { display: flex; align-items: baseline; gap: 16px; }
    .oh-title { font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 0; }
    .oh-count {
      background: linear-gradient(135deg, #ff6b35, #ff8f65);
      color: white; font-size: 13px; font-weight: 600;
      padding: 4px 14px; border-radius: 20px;
    }

    .oh-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }

    .oh-card {
      background: white; border-radius: 16px; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      display: flex; flex-direction: column;
    }
    .oh-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }

    .oh-card-top {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px 0;
    }
    .oh-order-num { font-size: 18px; font-weight: 700; color: #1a1a2e; }

    .oh-status {
      font-size: 12px; font-weight: 600; padding: 5px 14px;
      border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .oh-status-pending { background: #fff3e0; color: #e65100; }
    .oh-status-confirmed { background: #e3f2fd; color: #1565c0; }
    .oh-status-preparing { background: #f3e5f5; color: #7b1fa2; }
    .oh-status-delivered { background: #e8f5e9; color: #2e7d32; }
    .oh-status-cancelled { background: #ffebee; color: #c62828; }
    .oh-status-out\ for\ delivery { background: #e3f2fd; color: #1565c0; }

    .oh-card-body { padding: 16px 24px; flex: 1; }
    .oh-info-row { display: flex; align-items: center; gap: 8px; color: #666; font-size: 14px; margin-bottom: 6px; }
    .oh-info-icon { font-size: 18px; width: 18px; height: 18px; color: #999; }

    .oh-card-footer {
      padding: 16px 24px 20px;
      border-top: 1px solid #f0f0f0;
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    }
    .oh-total { font-size: 22px; font-weight: 700; background: linear-gradient(135deg, #ff6b35, #e74c3c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    .oh-actions { display: flex; gap: 8px; }

    .oh-btn {
      display: inline-flex; align-items: center; gap: 6px;
      font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600;
      padding: 8px 16px; border-radius: 10px; border: none; cursor: pointer;
      text-decoration: none; transition: all 0.2s ease;
    }
    .oh-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .oh-btn-details { background: #f0f4ff; color: #1565c0; }
    .oh-btn-details:hover { background: #dce6ff; }
    .oh-btn-reorder { background: linear-gradient(135deg, #2ec4b6, #20a89c); color: white; }
    .oh-btn-reorder:hover { box-shadow: 0 4px 14px rgba(46,196,182,0.4); }

    .oh-empty { text-align: center; padding: 80px 20px; }
    .oh-empty-icon-wrap {
      width: 120px; height: 120px; margin: 0 auto 24px;
      border-radius: 50%; background: linear-gradient(135deg, #fff3e0, #ffe0cc);
      display: flex; align-items: center; justify-content: center;
    }
    .oh-empty-icon { font-size: 56px; width: 56px; height: 56px; color: #ff6b35; }
    .oh-empty-title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; }
    .oh-empty-text { color: #888; font-size: 15px; margin: 0 0 28px; }
    .oh-btn-start {
      background: linear-gradient(135deg, #ff6b35, #ff8f65); color: white;
      padding: 12px 32px; border-radius: 12px; font-size: 15px; font-weight: 600;
      text-decoration: none; display: inline-block; transition: box-shadow 0.2s;
    }
    .oh-btn-start:hover { box-shadow: 0 6px 20px rgba(255,107,53,0.35); }
  `]
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  displayedColumns = ['orderId', 'orderDate', 'totalAmount', 'status', 'actions'];

  constructor(private orderService: OrderService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe(orders => this.orders = orders);
  }

  reorder(orderId: number): void {
    this.orderService.reorder(orderId).subscribe({
      next: () => this.snackBar.open('Items added to cart for reorder!', 'Close', { duration: 3000 }),
      error: () => this.snackBar.open('Failed to reorder', 'Close', { duration: 3000 })
    });
  }
}
