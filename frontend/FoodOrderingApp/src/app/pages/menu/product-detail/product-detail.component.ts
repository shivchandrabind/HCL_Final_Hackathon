import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MenuService } from '../../../services/menu.service';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { MenuItem } from '../../../models/menu-item.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  template: `
    <div class="pd-container">
      @if (item) {
        <div class="pd-layout">
          <!-- Image Section -->
          <div class="pd-image-wrapper">
            <img
              [src]="item.imageUrl || 'https://via.placeholder.com/600x400?text=Food'"
              [alt]="item.name"
              class="pd-image" />
            <div class="pd-category-chip">{{ item.categoryName }}</div>
          </div>

          <!-- Details Section -->
          <div class="pd-details">
            <h1 class="pd-title">{{ item.name }}</h1>

            <p class="pd-price">{{ item.price | currency:'INR' }}</p>

            <p class="pd-description">{{ item.description }}</p>

            <!-- Stock Badge -->
            <div class="pd-stock-row">
              @if (item.isAvailable && item.stockQuantity > 0) {
                <span class="pd-badge pd-badge--in-stock">
                  <span class="pd-badge-dot pd-badge-dot--green"></span>
                  In Stock &middot; {{ item.stockQuantity }} available
                </span>
              } @else {
                <span class="pd-badge pd-badge--out-of-stock">
                  <span class="pd-badge-dot pd-badge-dot--red"></span>
                  Out of Stock
                </span>
              }
            </div>

            <!-- Quantity + Add to Cart -->
            @if (item.isAvailable && item.stockQuantity > 0 && isLoggedIn && !isAdmin) {
              <div class="pd-qty-row">
                <span class="pd-qty-label">Quantity</span>
                <div class="pd-qty-control">
                  <button class="pd-qty-btn" (click)="decreaseQty()" [disabled]="quantity <= 1" aria-label="Decrease quantity">
                    <mat-icon>remove</mat-icon>
                  </button>
                  <span class="pd-qty-value">{{ quantity }}</span>
                  <button class="pd-qty-btn" (click)="increaseQty()" [disabled]="quantity >= item.stockQuantity" aria-label="Increase quantity">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
              </div>

              <button class="pd-add-btn" (click)="addToCart()">
                <mat-icon class="pd-add-btn-icon">add_shopping_cart</mat-icon>
                Add to Cart
              </button>
            }

            <!-- Back Link -->
            <button class="pd-back-link" (click)="goBack()">
              <mat-icon class="pd-back-icon">arrow_back</mat-icon>
              Back to Menu
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* ---------- Layout ---------- */
    .pd-container {
      max-width: 1100px;
      margin: 40px auto;
      padding: 0 24px;
      font-family: 'Poppins', sans-serif;
    }

    .pd-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: start;
    }

    /* ---------- Image ---------- */
    .pd-image-wrapper {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .pd-image {
      width: 100%;
      display: block;
      min-height: 340px;
      max-height: 480px;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .pd-image-wrapper:hover .pd-image {
      transform: scale(1.03);
    }

    .pd-category-chip {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(6px);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #ff6b35;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    /* ---------- Details ---------- */
    .pd-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .pd-title {
      font-family: 'Poppins', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 4px 0;
      line-height: 1.2;
    }

    .pd-price {
      font-size: 1.75rem;
      font-weight: 700;
      color: #ff6b35;
      margin: 8px 0 12px 0;
    }

    .pd-description {
      font-size: 1rem;
      line-height: 1.7;
      color: #555;
      margin: 0 0 16px 0;
    }

    /* ---------- Stock Badge ---------- */
    .pd-stock-row {
      margin-bottom: 20px;
    }

    .pd-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .pd-badge--in-stock {
      background: #e6f9f1;
      color: #0a8754;
    }

    .pd-badge--out-of-stock {
      background: #fde8e8;
      color: #c0392b;
    }

    .pd-badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .pd-badge-dot--green {
      background: #27ae60;
      box-shadow: 0 0 6px rgba(39, 174, 96, 0.5);
    }

    .pd-badge-dot--red {
      background: #e74c3c;
      box-shadow: 0 0 6px rgba(231, 76, 60, 0.5);
    }

    /* ---------- Quantity ---------- */
    .pd-qty-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    .pd-qty-label {
      font-size: 0.95rem;
      font-weight: 600;
      color: #333;
    }

    .pd-qty-control {
      display: flex;
      align-items: center;
      gap: 0;
      background: #f5f5f5;
      border-radius: 50px;
      padding: 4px;
    }

    .pd-qty-btn {
      width: 38px;
      height: 38px;
      border: none;
      border-radius: 50%;
      background: #fff;
      color: #ff6b35;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      transition: background 0.2s, transform 0.15s;
    }

    .pd-qty-btn:hover:not(:disabled) {
      background: #fff3ed;
      transform: scale(1.08);
    }

    .pd-qty-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .pd-qty-value {
      min-width: 44px;
      text-align: center;
      font-size: 1.15rem;
      font-weight: 700;
      color: #1a1a2e;
    }

    /* ---------- Add to Cart Button ---------- */
    .pd-add-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 14px 28px;
      border: none;
      border-radius: 50px;
      background: linear-gradient(135deg, #ff6b35 0%, #ff8f5e 100%);
      color: #fff;
      font-family: 'Poppins', sans-serif;
      font-size: 1.05rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(255, 107, 53, 0.35);
      transition: transform 0.2s, box-shadow 0.2s;
      margin-bottom: 12px;
    }

    .pd-add-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 22px rgba(255, 107, 53, 0.45);
    }

    .pd-add-btn:active {
      transform: translateY(0);
    }

    .pd-add-btn-icon {
      font-size: 20px;
    }

    /* ---------- Back Link ---------- */
    .pd-back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      color: #2ec4b6;
      font-family: 'Poppins', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      padding: 8px 0;
      margin-top: 8px;
      transition: color 0.2s, gap 0.2s;
    }

    .pd-back-link:hover {
      color: #25a99d;
      gap: 10px;
    }

    .pd-back-icon {
      font-size: 18px;
      transition: transform 0.2s;
    }

    .pd-back-link:hover .pd-back-icon {
      transform: translateX(-3px);
    }

    /* ---------- Responsive ---------- */
    @media (max-width: 768px) {
      .pd-container {
        margin: 20px auto;
        padding: 0 16px;
      }

      .pd-layout {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .pd-title {
        font-size: 1.5rem;
      }

      .pd-price {
        font-size: 1.4rem;
      }

      .pd-image {
        min-height: 220px;
        max-height: 320px;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  item: MenuItem | null = null;
  quantity = 1;
  isLoggedIn = false;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    private cartService: CartService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.isAdmin = this.authService.isAdmin();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.menuService.getById(id).subscribe(item => this.item = item);
  }

  increaseQty(): void { if (this.item && this.quantity < this.item.stockQuantity) this.quantity++; }
  decreaseQty(): void { if (this.quantity > 1) this.quantity--; }

  addToCart(): void {
    if (!this.item) return;
    this.cartService.addItem({ menuItemId: this.item.menuItemId, quantity: this.quantity }).subscribe({
      next: () => {
        this.snackBar.open(`${this.item!.name} added to cart!`, 'Close', { duration: 2000 });
        this.quantity = 1;
      },
      error: () => this.snackBar.open('Failed to add to cart', 'Close', { duration: 3000 })
    });
  }

  goBack(): void { this.router.navigate(['/']); }
}
