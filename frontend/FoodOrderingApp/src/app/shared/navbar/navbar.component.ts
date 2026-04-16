import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, AsyncPipe, MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule],
  template: `
    <nav class="navbar">
      <div class="navbar-inner">
        <a routerLink="/" class="brand">
          <span class="brand-icon">&#127829;</span>
          <span class="brand-text">FoodieExpress</span>
        </a>
        <div class="spacer"></div>
        <div class="nav-links">
          @if (isLoggedIn$ | async) {
            @if (isAdmin$ | async) {
              <a routerLink="/admin" class="nav-link">
                <mat-icon>dashboard</mat-icon>
                <span>Dashboard</span>
              </a>
              <a routerLink="/admin/menu" class="nav-link">
                <mat-icon>restaurant_menu</mat-icon>
                <span>Manage Menu</span>
              </a>
              <a routerLink="/admin/orders" class="nav-link">
                <mat-icon>list_alt</mat-icon>
                <span>Orders</span>
              </a>
            } @else {
              <a routerLink="/" class="nav-link">
                <mat-icon>restaurant_menu</mat-icon>
                <span>Menu</span>
              </a>
              <a routerLink="/cart" class="nav-link cart-link">
                <mat-icon [matBadge]="cartCount" matBadgeColor="warn" matBadgeSize="small"
                  [matBadgeHidden]="cartCount === 0">shopping_cart</mat-icon>
                <span>Cart</span>
              </a>
              <a routerLink="/orders" class="nav-link">
                <mat-icon>receipt_long</mat-icon>
                <span>Orders</span>
              </a>
              <a routerLink="/rewards" class="nav-link">
                <mat-icon>stars</mat-icon>
                <span>Rewards</span>
              </a>
            }
            <div class="nav-divider"></div>
            <div class="user-info">
              <div class="user-avatar">{{ (userName$ | async)?.charAt(0)?.toUpperCase() }}</div>
              <span class="user-name hide-mobile">{{ userName$ | async }}</span>
            </div>
            <button class="logout-btn" (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span class="hide-mobile">Logout</span>
            </button>
          } @else {
            <a routerLink="/" class="nav-link">
              <mat-icon>restaurant_menu</mat-icon>
              <span>Menu</span>
            </a>
            <a routerLink="/login" class="nav-link login-btn">
              <mat-icon>login</mat-icon>
              <span>Login</span>
            </a>
            <a routerLink="/register" class="nav-link register-btn">
              <mat-icon>person_add</mat-icon>
              <span>Register</span>
            </a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: linear-gradient(135deg, #ff6b35, #e55a2b);
      box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3);
    }
    .navbar-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      padding: 0 24px;
      height: 68px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: white;
    }
    .brand-icon { font-size: 1.8em; }
    .brand-text {
      font-size: 1.4em;
      font-weight: 700;
      letter-spacing: -0.5px;
      font-family: 'Poppins', sans-serif;
    }
    .spacer { flex: 1; }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 8px;
      color: rgba(255,255,255,0.9);
      text-decoration: none;
      font-size: 0.9em;
      font-weight: 500;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
      background: none;
      font-family: inherit;
    }
    .nav-link:hover {
      background: rgba(255,255,255,0.15);
      color: white;
      transform: translateY(-1px);
    }
    .nav-link mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .login-btn {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
    }
    .register-btn {
      background: white;
      color: #e55a2b !important;
      font-weight: 600;
    }
    .register-btn:hover {
      background: #fff5f0;
      color: #e55a2b !important;
    }
    .nav-divider {
      width: 1px;
      height: 28px;
      background: rgba(255,255,255,0.3);
      margin: 0 8px;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 8px;
    }
    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      border: 2px solid rgba(255,255,255,0.5);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9em;
    }
    .user-name {
      color: rgba(255,255,255,0.9);
      font-size: 0.9em;
      font-weight: 500;
    }
    .logout-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 8px;
      color: rgba(255,255,255,0.85);
      font-size: 0.9em;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.08);
      font-family: inherit;
      transition: all 0.2s ease;
    }
    .logout-btn:hover {
      background: rgba(255,255,255,0.15);
      color: white;
    }
    .logout-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
    @media (max-width: 768px) {
      .navbar-inner { padding: 0 12px; height: 60px; }
      .brand-text { display: none; }
      .nav-link span, .logout-btn span { display: none; }
      .nav-link { padding: 8px; }
      .nav-divider { display: none; }
      .user-name { display: none; }
      .hide-mobile { display: none; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  isLoggedIn$: Observable<boolean> = of(false);
  isAdmin$: Observable<boolean> = of(false);
  userName$: Observable<string> = of('');
  cartCount = 0;

  constructor(private authService: AuthService, private cartService: CartService) {}

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.isAdmin$ = this.authService.isAdmin$;
    this.userName$ = this.authService.userName$;
    this.cartService.cartItemCount$.subscribe(count => this.cartCount = count);
    if (this.authService.isAuthenticated() && !this.authService.isAdmin()) {
      this.cartService.getCart().subscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.cartService.clearCount();
    window.location.href = '/';
  }
}
