import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MenuService } from '../../../services/menu.service';
import { CartService } from '../../../services/cart.service';
import { CategoryService } from '../../../services/category.service';
import { AuthService } from '../../../services/auth.service';
import { MenuItem } from '../../../models/menu-item.model';
import { Category } from '../../../models/menu-item.model';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe, SlicePipe, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSnackBarModule],
  template: `
    <div class="container animate-in">
      <!-- Hero Banner -->
      <div class="hero-banner">
        <div class="hero-content">
          <h1 class="hero-title">Delicious Food, Delivered Fast</h1>
          <p class="hero-subtitle">Order your favorite pizzas, cold drinks, and freshly baked breads</p>
        </div>
      </div>

      <div class="filters-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search menu...</mat-label>
          <input matInput [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="What are you craving?">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <div class="category-chips">
          <button class="chip-btn" [class.active]="!selectedCategoryId" (click)="filterByCategory(undefined)">
            <mat-icon>apps</mat-icon> All
          </button>
          @for (cat of categories; track cat.categoryId) {
            <button class="chip-btn" [class.active]="selectedCategoryId === cat.categoryId" (click)="filterByCategory(cat.categoryId)">
              @if (cat.name === 'Pizza') { <span>&#127829;</span> }
              @else if (cat.name === 'Cold Drinks') { <span>&#129380;</span> }
              @else if (cat.name === 'Breads') { <span>&#127838;</span> }
              {{ cat.name }}
            </button>
          }
        </div>
      </div>

      <div class="items-count mb-16">
        <span>Showing <strong>{{ filteredItems.length }}</strong> items</span>
      </div>

      <div class="menu-grid">
        @for (item of filteredItems; track item.menuItemId; let i = $index) {
          <div class="menu-card" [style.animation-delay]="i * 0.05 + 's'">
            <div class="card-image-wrapper">
              <img [src]="item.imageUrl || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop'" [alt]="item.name" class="card-img">
              <span class="category-badge">{{ item.categoryName }}</span>
              @if (!item.isAvailable || item.stockQuantity === 0) {
                <div class="out-of-stock-overlay">
                  <span>Out of Stock</span>
                </div>
              }
            </div>
            <div class="card-body">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-desc">{{ item.description | slice:0:60 }}{{ item.description && item.description.length > 60 ? '...' : '' }}</p>
              <div class="card-footer">
                <span class="item-price">{{ item.price | currency:'INR' }}</span>
                <div class="card-actions">
                  <a [routerLink]="['/menu', item.menuItemId]" class="btn-view">
                    <mat-icon>visibility</mat-icon>
                  </a>
                  @if (item.isAvailable && item.stockQuantity > 0 && isLoggedIn && !isAdmin) {
                    <button class="btn-add" (click)="addToCart(item)">
                      <mat-icon>add_shopping_cart</mat-icon> Add
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      @if (filteredItems.length === 0) {
        <div class="empty-state">
          <mat-icon>search_off</mat-icon>
          <h3>No items found</h3>
          <p>Try a different search or category</p>
        </div>
      }

      <mat-paginator
        [length]="totalItems"
        [pageSize]="pageSize"
        [pageSizeOptions]="[8, 12, 24]"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .hero-banner {
      background: linear-gradient(135deg, #ff6b35, #ff8a5c, #ffb088);
      border-radius: 20px;
      padding: 48px 40px;
      margin-bottom: 32px;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .hero-banner::before {
      content: '🍕 🥤 🍞';
      position: absolute;
      right: 40px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 4em;
      opacity: 0.2;
    }
    .hero-title {
      font-size: 2.2em;
      font-weight: 700;
      margin: 0 0 8px;
      letter-spacing: -0.5px;
    }
    .hero-subtitle {
      font-size: 1.1em;
      opacity: 0.9;
      margin: 0;
      font-weight: 400;
    }

    .filters-section {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      margin-bottom: 8px;
    }
    .search-field {
      flex: 1;
      min-width: 280px;
      max-width: 400px;
    }
    .category-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .chip-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      border-radius: 50px;
      border: 2px solid #e9ecef;
      background: white;
      color: #636e72;
      font-family: 'Poppins', sans-serif;
      font-size: 0.9em;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .chip-btn:hover { border-color: #ff6b35; color: #ff6b35; }
    .chip-btn.active {
      background: linear-gradient(135deg, #ff6b35, #ff8a5c);
      color: white;
      border-color: transparent;
      box-shadow: 0 4px 12px rgba(255,107,53,0.3);
    }
    .chip-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .items-count { color: #636e72; font-size: 0.9em; }

    .menu-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    .menu-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e9ecef;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      transition: all 0.3s ease;
      animation: fadeInUp 0.4s ease-out both;
    }
    .menu-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 36px rgba(0,0,0,0.12);
    }
    .card-image-wrapper {
      position: relative;
      height: 200px;
      overflow: hidden;
    }
    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .menu-card:hover .card-img { transform: scale(1.08); }
    .category-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(8px);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75em;
      font-weight: 600;
      color: #ff6b35;
    }
    .out-of-stock-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        background: #e74c3c;
        color: white;
        padding: 6px 16px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.85em;
      }
    }

    .card-body { padding: 16px 20px 20px; }
    .item-name {
      font-size: 1.1em;
      font-weight: 600;
      margin: 0 0 6px;
      color: #2d3436;
    }
    .item-desc {
      font-size: 0.85em;
      color: #636e72;
      margin: 0 0 16px;
      line-height: 1.4;
      min-height: 36px;
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .item-price {
      font-size: 1.3em;
      font-weight: 700;
      color: #ff6b35;
    }
    .card-actions { display: flex; gap: 8px; }
    .btn-view {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: 1px solid #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #636e72;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-view:hover { background: #f8f9fa; color: #2d3436; }
    .btn-view mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .btn-add {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #ff6b35, #ff8a5c);
      color: white;
      font-family: 'Poppins', sans-serif;
      font-size: 0.85em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(255,107,53,0.3);
    }
    .btn-add:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255,107,53,0.4);
    }
    .btn-add mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #b2bec3;
      mat-icon { font-size: 64px; width: 64px; height: 64px; }
      h3 { margin: 16px 0 8px; color: #636e72; }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 768px) {
      .hero-banner { padding: 32px 24px; }
      .hero-title { font-size: 1.6em; }
      .hero-banner::before { display: none; }
      .menu-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    }
  `]
})
export class MenuListComponent implements OnInit {
  menuItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  categories: Category[] = [];
  searchTerm = '';
  selectedCategoryId?: number;
  page = 1;
  pageSize = 12;
  totalItems = 0;
  isLoggedIn = false;
  isAdmin = false;

  constructor(
    private menuService: MenuService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.isAdmin = this.authService.isAdmin();
    this.categoryService.getAll().subscribe(cats => this.categories = cats);
    this.loadMenu();
  }

  loadMenu(): void {
    this.menuService.getAll(this.page, this.pageSize, this.selectedCategoryId).subscribe(response => {
      this.menuItems = response.items;
      this.totalItems = response.totalCount;
      this.applySearch();
    });
  }

  applySearch(): void {
    if (this.searchTerm.trim()) {
      this.filteredItems = this.menuItems.filter(i => i.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    } else {
      this.filteredItems = this.menuItems;
    }
  }

  onSearch(): void { this.applySearch(); }

  filterByCategory(categoryId?: number): void {
    this.selectedCategoryId = categoryId;
    this.page = 1;
    this.loadMenu();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadMenu();
  }

  addToCart(item: MenuItem): void {
    this.cartService.addItem({ menuItemId: item.menuItemId, quantity: 1 }).subscribe({
      next: () => this.snackBar.open(`${item.name} added to cart!`, 'Close', { duration: 2000 }),
      error: () => this.snackBar.open('Failed to add item to cart', 'Close', { duration: 3000 })
    });
  }
}
