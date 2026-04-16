import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="ad-page">
      <div class="ad-banner">
        <div class="ad-banner-content">
          <h2 class="ad-banner-title">Welcome back, Admin</h2>
          <p class="ad-banner-text">Here's what's happening with your restaurant today.</p>
        </div>
        <div class="ad-banner-graphic">
          <mat-icon>dashboard</mat-icon>
        </div>
      </div>

      <div class="ad-stats">
        <div class="ad-stat-card">
          <div class="ad-stat-icon ad-stat-icon-orders">
            <mat-icon>receipt_long</mat-icon>
          </div>
          <div class="ad-stat-info">
            <div class="ad-stat-value">{{ totalOrders }}</div>
            <div class="ad-stat-label">Total Orders</div>
          </div>
        </div>
        <div class="ad-stat-card">
          <div class="ad-stat-icon ad-stat-icon-pending">
            <mat-icon>pending_actions</mat-icon>
          </div>
          <div class="ad-stat-info">
            <div class="ad-stat-value ad-stat-pending">{{ pendingOrders }}</div>
            <div class="ad-stat-label">Pending Orders</div>
          </div>
        </div>
        <div class="ad-stat-card">
          <div class="ad-stat-icon ad-stat-icon-revenue">
            <mat-icon>payments</mat-icon>
          </div>
          <div class="ad-stat-info">
            <div class="ad-stat-value ad-stat-revenue">{{ totalRevenue | currency:'INR' }}</div>
            <div class="ad-stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      <h3 class="ad-section-title">Quick Actions</h3>
      <div class="ad-actions">
        <div class="ad-action-card">
          <div class="ad-action-icon-wrap ad-action-menu-icon">
            <mat-icon>restaurant_menu</mat-icon>
          </div>
          <h4 class="ad-action-title">Manage Menu</h4>
          <p class="ad-action-text">Add, edit or remove menu items and categories.</p>
          <a class="ad-action-btn" routerLink="/admin/menu">
            <mat-icon>arrow_forward</mat-icon> Go to Menu
          </a>
        </div>
        <div class="ad-action-card">
          <div class="ad-action-icon-wrap ad-action-order-icon">
            <mat-icon>list_alt</mat-icon>
          </div>
          <h4 class="ad-action-title">Manage Orders</h4>
          <p class="ad-action-text">View and update order statuses in real time.</p>
          <a class="ad-action-btn" routerLink="/admin/orders">
            <mat-icon>arrow_forward</mat-icon> Go to Orders
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`

    .ad-page { max-width: 1100px; margin: 0 auto; padding: 32px 20px; font-family: 'Poppins', sans-serif; }

    .ad-banner {
      background: linear-gradient(135deg, #ff6b35, #ff8f65, #ffb088);
      border-radius: 20px; padding: 40px 40px; color: white;
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 36px; box-shadow: 0 10px 40px rgba(255,107,53,0.25);
      overflow: hidden; position: relative;
    }
    .ad-banner::before {
      content: ''; position: absolute; top: -50px; right: -50px;
      width: 200px; height: 200px; border-radius: 50%;
      background: rgba(255,255,255,0.08);
    }
    .ad-banner-title { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
    .ad-banner-text { font-size: 15px; opacity: 0.9; margin: 0; }
    .ad-banner-graphic mat-icon { font-size: 80px; width: 80px; height: 80px; opacity: 0.2; }

    .ad-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 40px; }

    .ad-stat-card {
      background: white; border-radius: 16px; padding: 28px;
      display: flex; align-items: center; gap: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .ad-stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }

    .ad-stat-icon {
      width: 56px; height: 56px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
    }
    .ad-stat-icon mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
    .ad-stat-icon-orders { background: linear-gradient(135deg, #ff6b35, #ff8f65); }
    .ad-stat-icon-pending { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
    .ad-stat-icon-revenue { background: linear-gradient(135deg, #2ec4b6, #20a89c); }

    .ad-stat-value { font-size: 26px; font-weight: 700; color: #1a1a2e; }
    .ad-stat-pending { color: #f59e0b; }
    .ad-stat-revenue { color: #2ec4b6; }
    .ad-stat-label { font-size: 13px; color: #999; font-weight: 500; margin-top: 2px; }

    .ad-section-title { font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0 0 20px; }

    .ad-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }

    .ad-action-card {
      background: white; border-radius: 16px; padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .ad-action-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }

    .ad-action-icon-wrap {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center; margin-bottom: 18px;
    }
    .ad-action-icon-wrap mat-icon { font-size: 26px; width: 26px; height: 26px; color: white; }
    .ad-action-menu-icon { background: linear-gradient(135deg, #ff6b35, #ff8f65); }
    .ad-action-order-icon { background: linear-gradient(135deg, #2ec4b6, #20a89c); }

    .ad-action-title { font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; }
    .ad-action-text { font-size: 14px; color: #888; margin: 0 0 20px; line-height: 1.5; }

    .ad-action-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #ff6b35, #ff8f65); color: white;
      font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 600;
      padding: 10px 24px; border-radius: 12px; text-decoration: none;
      transition: box-shadow 0.2s;
    }
    .ad-action-btn:hover { box-shadow: 0 6px 20px rgba(255,107,53,0.35); }
    .ad-action-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  totalOrders = 0;
  pendingOrders = 0;
  totalRevenue = 0;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getAllOrders().subscribe(orders => {
      this.totalOrders = orders.length;
      this.pendingOrders = orders.filter(o => o.status === 'Pending').length;
      this.totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    });
  }
}
