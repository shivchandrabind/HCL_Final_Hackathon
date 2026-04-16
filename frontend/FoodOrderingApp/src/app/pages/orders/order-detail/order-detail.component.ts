import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatChipsModule],
  template: `
    <div class="od-page">
      @if (order) {
        <a class="od-back" routerLink="/orders">
          <mat-icon>arrow_back</mat-icon> Back to Orders
        </a>

        <div class="od-header-card">
          <div class="od-header-left">
            <h2 class="od-order-num">Order #{{ order.orderId }}</h2>
            <div class="od-meta">
              <span class="od-meta-item"><mat-icon>calendar_today</mat-icon> {{ order.orderDate | date:'mediumDate' }}</span>
              <span class="od-meta-item"><mat-icon>schedule</mat-icon> {{ order.orderDate | date:'shortTime' }}</span>
            </div>
          </div>
          <span class="od-status" [class]="'od-status-' + order.status.toLowerCase()">{{ order.status }}</span>
        </div>

        <div class="od-timeline-card">
          <h3 class="od-section-title">Order Progress</h3>
          <div class="od-timeline">
            @for (status of statuses; track status; let i = $index) {
              <div class="od-step" [class.active]="isStatusReached(status)">
                <div class="od-step-dot">
                  @if (isStatusReached(status)) {
                    <mat-icon>check</mat-icon>
                  }
                </div>
                <span class="od-step-label">{{ status }}</span>
                @if (i < statuses.length - 1) {
                  <div class="od-step-line" [class.active]="isStatusReached(statuses[i+1])"></div>
                }
              </div>
            }
          </div>
        </div>

        <div class="od-details-card">
          <h3 class="od-section-title">Delivery Details</h3>
          <div class="od-detail-row">
            <mat-icon>location_on</mat-icon>
            <div>
              <div class="od-detail-label">Delivery Address</div>
              <div class="od-detail-value">{{ order.deliveryAddress }}</div>
            </div>
          </div>
          @if (order.couponCode) {
            <div class="od-detail-row">
              <mat-icon>local_offer</mat-icon>
              <div>
                <div class="od-detail-label">Coupon Applied</div>
                <div class="od-detail-value">{{ order.couponCode }} &mdash; {{ order.discount }}% off</div>
              </div>
            </div>
          }
        </div>

        <div class="od-items-card">
          <h3 class="od-section-title">Items Ordered</h3>
          @for (item of order.items; track item.orderItemId) {
            <div class="od-item-row">
              <div class="od-item-qty">x{{ item.quantity }}</div>
              <div class="od-item-name">{{ item.menuItemName }}</div>
              <div class="od-item-price">{{ item.subtotal | currency:'INR' }}</div>
            </div>
          }
          <div class="od-summary-divider"></div>
          @if (order.discount) {
            <div class="od-summary-row">
              <span>Subtotal</span>
              <span>{{ (order.totalAmount / (1 - order.discount / 100)) | currency:'INR' }}</span>
            </div>
            <div class="od-summary-row od-discount">
              <span>Discount ({{ order.discount }}%)</span>
              <span>-{{ (order.totalAmount / (1 - order.discount / 100) - order.totalAmount) | currency:'INR' }}</span>
            </div>
          }
          <div class="od-summary-row od-total-row">
            <span>Total</span>
            <span class="od-total-amount">{{ order.totalAmount | currency:'INR' }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`

    .od-page { max-width: 720px; margin: 0 auto; padding: 32px 20px; font-family: 'Poppins', sans-serif; }

    .od-back {
      display: inline-flex; align-items: center; gap: 6px; color: #ff6b35; font-weight: 600;
      font-size: 14px; text-decoration: none; margin-bottom: 24px; transition: gap 0.2s;
    }
    .od-back mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .od-back:hover { gap: 10px; }

    .od-header-card {
      background: linear-gradient(135deg, #ff6b35, #ff8f65);
      border-radius: 16px; padding: 28px 32px; color: white;
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 24px; box-shadow: 0 8px 30px rgba(255,107,53,0.25);
    }
    .od-order-num { font-size: 26px; font-weight: 700; margin: 0 0 8px; }
    .od-meta { display: flex; gap: 20px; }
    .od-meta-item { display: flex; align-items: center; gap: 6px; font-size: 14px; opacity: 0.9; }
    .od-meta-item mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .od-status {
      font-size: 13px; font-weight: 700; padding: 6px 18px; border-radius: 20px;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .od-status-pending { background: rgba(255,255,255,0.9); color: #e65100; }
    .od-status-confirmed { background: rgba(255,255,255,0.9); color: #1565c0; }
    .od-status-preparing { background: rgba(255,255,255,0.9); color: #7b1fa2; }
    .od-status-delivered { background: rgba(255,255,255,0.9); color: #2e7d32; }
    .od-status-cancelled { background: rgba(255,255,255,0.9); color: #c62828; }
    .od-status-out\ for\ delivery { background: rgba(255,255,255,0.9); color: #1565c0; }

    .od-timeline-card, .od-details-card, .od-items-card {
      background: white; border-radius: 16px; padding: 28px 32px;
      margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }

    .od-section-title { font-size: 17px; font-weight: 700; color: #1a1a2e; margin: 0 0 20px; }

    .od-timeline { display: flex; justify-content: space-between; position: relative; }
    .od-step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; }
    .od-step-dot {
      width: 32px; height: 32px; border-radius: 50%; background: #e8e8e8;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 10px; transition: all 0.3s; z-index: 1;
    }
    .od-step-dot mat-icon { font-size: 18px; width: 18px; height: 18px; color: white; }
    .od-step.active .od-step-dot { background: linear-gradient(135deg, #2ec4b6, #20a89c); box-shadow: 0 4px 14px rgba(46,196,182,0.35); }
    .od-step-label { font-size: 11px; font-weight: 500; color: #aaa; text-align: center; }
    .od-step.active .od-step-label { color: #2ec4b6; font-weight: 600; }
    .od-step-line {
      position: absolute; top: 16px; left: 50%; width: 100%; height: 3px;
      background: #e8e8e8; z-index: 0;
    }
    .od-step-line.active { background: #2ec4b6; }

    .od-detail-row {
      display: flex; align-items: flex-start; gap: 14px; padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;
    }
    .od-detail-row:last-child { border-bottom: none; }
    .od-detail-row mat-icon { color: #ff6b35; margin-top: 2px; }
    .od-detail-label { font-size: 12px; color: #999; font-weight: 500; margin-bottom: 2px; }
    .od-detail-value { font-size: 15px; color: #333; font-weight: 500; }

    .od-item-row {
      display: flex; align-items: center; padding: 14px 0;
      border-bottom: 1px solid #f8f8f8;
    }
    .od-item-row:last-of-type { border-bottom: none; }
    .od-item-qty {
      background: #f0f4ff; color: #1565c0; font-weight: 700; font-size: 13px;
      padding: 4px 10px; border-radius: 8px; margin-right: 14px;
    }
    .od-item-name { flex: 1; font-size: 15px; font-weight: 500; color: #333; }
    .od-item-price { font-size: 15px; font-weight: 600; color: #1a1a2e; }

    .od-summary-divider { height: 2px; background: linear-gradient(90deg, #ff6b35, #2ec4b6); margin: 20px 0 16px; border-radius: 2px; }
    .od-summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #666; }
    .od-discount { color: #2ec4b6; }
    .od-total-row { padding-top: 12px; }
    .od-total-row span:first-child { font-size: 16px; font-weight: 700; color: #1a1a2e; }
    .od-total-amount {
      font-size: 22px; font-weight: 700;
      background: linear-gradient(135deg, #ff6b35, #e74c3c);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  statuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrderById(id).subscribe(order => this.order = order);
  }

  isStatusReached(status: string): boolean {
    if (!this.order) return false;
    const currentIndex = this.statuses.indexOf(this.order.status);
    const statusIndex = this.statuses.indexOf(status);
    return statusIndex <= currentIndex;
  }
}
