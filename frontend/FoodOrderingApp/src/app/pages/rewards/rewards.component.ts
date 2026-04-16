import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { CouponService } from '../../services/coupon.service';
import { CustomerProfile, Coupon } from '../../models/coupon.model';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, MatIconModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="rewards-page">
      <!-- Loyalty Points Section -->
      <div class="loyalty-banner">
        <div class="loyalty-content">
          <div class="loyalty-icon-wrap">
            <span class="loyalty-emoji">&#11088;</span>
          </div>
          <div class="loyalty-info">
            <h1 class="loyalty-title">My Rewards</h1>
            <p class="loyalty-subtitle">Earn 1 point for every &#8377;100 spent</p>
          </div>
        </div>
        <div class="points-card">
          <div class="points-value">{{ profile?.loyaltyPoints || 0 }}</div>
          <div class="points-label">Loyalty Points</div>
        </div>
      </div>

      <!-- Profile Summary -->
      @if (profile) {
        <div class="profile-section">
          <h2 class="section-title">
            <mat-icon>person</mat-icon> Profile
          </h2>
          <div class="profile-grid">
            <div class="profile-item">
              <span class="profile-label">Name</span>
              <span class="profile-value">{{ profile.name }}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Email</span>
              <span class="profile-value">{{ profile.email }}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Phone</span>
              <span class="profile-value">{{ profile.phone || 'Not set' }}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Address</span>
              <span class="profile-value">{{ profile.address || 'Not set' }}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Member Since</span>
              <span class="profile-value">{{ profile.createdAt | date:'mediumDate' }}</span>
            </div>
          </div>
        </div>
      }

      <!-- Available Coupons -->
      <div class="coupons-section">
        <h2 class="section-title">
          <mat-icon>local_offer</mat-icon> Available Coupons
        </h2>
        @if (coupons.length > 0) {
          <div class="coupons-grid">
            @for (coupon of coupons; track coupon.couponId) {
              <div class="coupon-card">
                <div class="coupon-left">
                  <div class="coupon-discount">{{ coupon.discountPercent }}%</div>
                  <div class="coupon-off">OFF</div>
                </div>
                <div class="coupon-divider"></div>
                <div class="coupon-right">
                  <div class="coupon-code-wrap">
                    <span class="coupon-code">{{ coupon.code }}</span>
                    <button class="copy-btn" (click)="copyCode(coupon.code)">
                      <mat-icon>content_copy</mat-icon>
                    </button>
                  </div>
                  <div class="coupon-details">
                    @if (coupon.minOrderAmount > 0) {
                      <span class="coupon-detail">
                        <mat-icon>shopping_cart</mat-icon>
                        Min order: {{ coupon.minOrderAmount | currency:'INR' }}
                      </span>
                    }
                    @if (coupon.maxDiscountAmount) {
                      <span class="coupon-detail">
                        <mat-icon>savings</mat-icon>
                        Max discount: {{ coupon.maxDiscountAmount | currency:'INR' }}
                      </span>
                    }
                    <span class="coupon-detail coupon-expiry">
                      <mat-icon>schedule</mat-icon>
                      Expires: {{ coupon.expiryDate | date:'mediumDate' }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-coupons">
            <mat-icon>loyalty</mat-icon>
            <p>No active coupons right now</p>
            <p class="empty-sub">Check back later for new offers!</p>
          </div>
        }
      </div>

      <!-- How It Works -->
      <div class="how-section">
        <h2 class="section-title">
          <mat-icon>help_outline</mat-icon> How It Works
        </h2>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-icon" style="background: linear-gradient(135deg, #ff6b35, #ff8a5c)">
              <mat-icon>restaurant_menu</mat-icon>
            </div>
            <h3>Order Food</h3>
            <p>Browse our menu and place your order</p>
          </div>
          <div class="step-card">
            <div class="step-icon" style="background: linear-gradient(135deg, #2ec4b6, #5dd9cd)">
              <mat-icon>stars</mat-icon>
            </div>
            <h3>Earn Points</h3>
            <p>Get 1 loyalty point for every &#8377;100 spent</p>
          </div>
          <div class="step-card">
            <div class="step-icon" style="background: linear-gradient(135deg, #a855f7, #c084fc)">
              <mat-icon>local_offer</mat-icon>
            </div>
            <h3>Use Coupons</h3>
            <p>Apply coupon codes at checkout for discounts</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }

    .rewards-page {
      max-width: 1000px;
      margin: 0 auto;
      padding: 32px 20px 60px;
    }

    /* Loyalty Banner */
    .loyalty-banner {
      background: linear-gradient(135deg, #ff6b35, #ff8a5c, #ffb088);
      border-radius: 20px;
      padding: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      margin-bottom: 32px;
      box-shadow: 0 8px 30px rgba(255, 107, 53, 0.25);
    }
    .loyalty-content { display: flex; align-items: center; gap: 20px; }
    .loyalty-icon-wrap {
      width: 64px; height: 64px; border-radius: 16px;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
    }
    .loyalty-emoji { font-size: 2em; }
    .loyalty-title { font-size: 1.8em; font-weight: 700; margin: 0; }
    .loyalty-subtitle { margin: 4px 0 0; opacity: 0.9; font-size: 0.95em; }
    .points-card {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 20px 32px;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.3);
    }
    .points-value { font-size: 3em; font-weight: 800; line-height: 1; }
    .points-label { font-size: 0.85em; opacity: 0.9; margin-top: 4px; font-weight: 500; }

    /* Section Title */
    .section-title {
      display: flex; align-items: center; gap: 10px;
      font-size: 1.3em; font-weight: 600; color: #1a1a2e;
      margin: 0 0 20px;
      mat-icon { color: #ff6b35; }
    }

    /* Profile */
    .profile-section {
      background: white;
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 32px;
      border: 1px solid #e9ecef;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .profile-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    .profile-item { display: flex; flex-direction: column; gap: 4px; }
    .profile-label { font-size: 0.8em; font-weight: 600; color: #636e72; text-transform: uppercase; letter-spacing: 0.5px; }
    .profile-value { font-size: 1em; font-weight: 500; color: #2d3436; }

    /* Coupons */
    .coupons-section {
      margin-bottom: 32px;
    }
    .coupons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 16px;
    }
    .coupon-card {
      display: flex;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      border: 2px dashed #e9ecef;
      transition: all 0.3s ease;
    }
    .coupon-card:hover {
      border-color: #ff6b35;
      box-shadow: 0 8px 24px rgba(255,107,53,0.12);
      transform: translateY(-2px);
    }
    .coupon-left {
      background: linear-gradient(135deg, #ff6b35, #ff8a5c);
      color: white;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 100px;
    }
    .coupon-discount { font-size: 2em; font-weight: 800; line-height: 1; }
    .coupon-off { font-size: 0.85em; font-weight: 700; letter-spacing: 2px; }
    .coupon-divider {
      width: 0;
      border-left: 2px dashed #e9ecef;
      margin: 12px 0;
    }
    .coupon-right {
      flex: 1;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .coupon-code-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .coupon-code {
      background: #fff5f0;
      color: #ff6b35;
      font-weight: 700;
      font-size: 1.1em;
      padding: 6px 14px;
      border-radius: 8px;
      letter-spacing: 1px;
      font-family: monospace;
    }
    .copy-btn {
      width: 32px; height: 32px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      background: white;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: #636e72;
      transition: all 0.2s;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .copy-btn:hover { background: #f8f9fa; color: #ff6b35; }
    .coupon-details { display: flex; flex-direction: column; gap: 4px; }
    .coupon-detail {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.82em; color: #636e72;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .coupon-expiry { color: #e67e22; }

    .empty-coupons {
      text-align: center; padding: 48px 20px; color: #b2bec3;
      background: white; border-radius: 16px; border: 1px solid #e9ecef;
      mat-icon { font-size: 48px; width: 48px; height: 48px; }
      p { margin: 8px 0 0; color: #636e72; }
      .empty-sub { font-size: 0.9em; color: #b2bec3; }
    }

    /* How It Works */
    .how-section { margin-bottom: 32px; }
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .step-card {
      background: white;
      border-radius: 16px;
      padding: 28px;
      text-align: center;
      border: 1px solid #e9ecef;
      transition: all 0.3s;
    }
    .step-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .step-icon {
      width: 56px; height: 56px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px; color: white;
      mat-icon { font-size: 28px; width: 28px; height: 28px; }
    }
    .step-card h3 { margin: 0 0 8px; font-size: 1em; font-weight: 600; color: #1a1a2e; }
    .step-card p { margin: 0; font-size: 0.85em; color: #636e72; line-height: 1.5; }

    @media (max-width: 768px) {
      .loyalty-banner { flex-direction: column; gap: 20px; text-align: center; padding: 28px; }
      .loyalty-content { flex-direction: column; }
      .coupons-grid { grid-template-columns: 1fr; }
      .steps-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class RewardsComponent implements OnInit {
  profile: CustomerProfile | null = null;
  coupons: Coupon[] = [];

  constructor(
    private authService: AuthService,
    private couponService: CouponService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: p => this.profile = p,
      error: () => {}
    });
    this.couponService.getActive().subscribe({
      next: c => this.coupons = c,
      error: () => {}
    });
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code);
    this.snackBar.open(`Coupon code "${code}" copied!`, 'Close', { duration: 2000 });
  }
}
