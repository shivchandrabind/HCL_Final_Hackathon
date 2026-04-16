import { Component, OnInit, Inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MenuService } from '../../../services/menu.service';
import { CategoryService } from '../../../services/category.service';
import { MenuItem, Category } from '../../../models/menu-item.model';

@Component({
  selector: 'app-menu-item-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatButtonModule],
  template: `
    <div class="mid-dialog">
      <h2 class="mid-title">{{ data ? 'Edit' : 'Add' }} Menu Item</h2>
      <mat-dialog-content>
        <form [formGroup]="form" class="mid-form">
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name">
          </mat-form-field>
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>
          <div class="mid-row">
            <mat-form-field class="mid-half" appearance="outline">
              <mat-label>Price</mat-label>
              <input matInput formControlName="price" type="number">
            </mat-form-field>
            <mat-form-field class="mid-half" appearance="outline">
              <mat-label>Stock</mat-label>
              <input matInput formControlName="stockQuantity" type="number">
            </mat-form-field>
          </div>
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="categoryId">
              @for (cat of categories; track cat.categoryId) {
                <mat-option [value]="cat.categoryId">{{ cat.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Image URL</mat-label>
            <input matInput formControlName="imageUrl">
          </mat-form-field>
          <mat-slide-toggle formControlName="isAvailable" color="primary">Available</mat-slide-toggle>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="mid-actions">
        <button class="mid-btn mid-btn-cancel" mat-dialog-close>Cancel</button>
        <button class="mid-btn mid-btn-save" (click)="save()" [disabled]="form.invalid">Save</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .mid-dialog { font-family: 'Poppins', sans-serif; }
    .mid-title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; padding: 24px 24px 0; }
    mat-dialog-content { min-width: 440px; padding: 16px 24px !important; }
    .mid-form { display: flex; flex-direction: column; gap: 4px; }
    .mid-row { display: flex; gap: 16px; }
    .mid-half { flex: 1; }
    mat-slide-toggle { margin: 8px 0 16px; }
    .mid-actions { padding: 8px 24px 20px !important; gap: 12px; }
    .mid-btn {
      font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 600;
      padding: 10px 28px; border-radius: 12px; border: none; cursor: pointer;
      transition: all 0.2s;
    }
    .mid-btn-cancel { background: #f0f0f0; color: #666; }
    .mid-btn-cancel:hover { background: #e0e0e0; }
    .mid-btn-save { background: linear-gradient(135deg, #ff6b35, #ff8f65); color: white; }
    .mid-btn-save:hover { box-shadow: 0 4px 14px rgba(255,107,53,0.35); }
    .mid-btn-save:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
  `]
})
export class MenuItemDialogComponent {
  form: FormGroup;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MenuItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item?: MenuItem; categories: Category[] }
  ) {
    this.categories = data.categories;
    this.form = this.fb.group({
      name: [data.item?.name || '', Validators.required],
      description: [data.item?.description || ''],
      price: [data.item?.price || 0, [Validators.required, Validators.min(0)]],
      categoryId: [data.item?.categoryId || '', Validators.required],
      stockQuantity: [data.item?.stockQuantity || 0, [Validators.required, Validators.min(0)]],
      imageUrl: [data.item?.imageUrl || ''],
      isAvailable: [data.item?.isAvailable ?? true]
    });
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}

@Component({
  selector: 'app-manage-menu',
  standalone: true,
  imports: [CurrencyPipe, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatDialogModule],
  template: `
    <div class="mm-page">
      <div class="mm-header">
        <div>
          <h2 class="mm-title">Manage Menu</h2>
          <p class="mm-subtitle">{{ menuItems.length }} items in your menu</p>
        </div>
        <button class="mm-add-btn" (click)="openDialog()">
          <mat-icon>add</mat-icon> Add Item
        </button>
      </div>

      <div class="mm-table-wrap">
        <table mat-table [dataSource]="menuItems" class="mm-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let item">
              <span class="mm-item-name">{{ item.name }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="categoryName">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let item">
              <span class="mm-category-badge">{{ item.categoryName }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>Price</th>
            <td mat-cell *matCellDef="let item">
              <span class="mm-price">{{ item.price | currency:'INR' }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="stockQuantity">
            <th mat-header-cell *matHeaderCellDef>Stock</th>
            <td mat-cell *matCellDef="let item">
              <span class="mm-stock" [class.mm-stock-low]="item.stockQuantity < 5">{{ item.stockQuantity }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="isAvailable">
            <th mat-header-cell *matHeaderCellDef>Available</th>
            <td mat-cell *matCellDef="let item">
              <span class="mm-avail" [class.mm-avail-yes]="item.isAvailable" [class.mm-avail-no]="!item.isAvailable">
                {{ item.isAvailable ? 'Yes' : 'No' }}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let item">
              <button class="mm-action-btn mm-edit-btn" (click)="openDialog(item)"><mat-icon>edit</mat-icon></button>
              <button class="mm-action-btn mm-delete-btn" (click)="deleteItem(item)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`

    .mm-page { max-width: 1100px; margin: 0 auto; padding: 32px 20px; font-family: 'Poppins', sans-serif; }

    .mm-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
    .mm-title { font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 0; }
    .mm-subtitle { font-size: 14px; color: #999; margin: 4px 0 0; }

    .mm-add-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #ff6b35, #ff8f65); color: white;
      font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 600;
      padding: 12px 28px; border-radius: 12px; border: none; cursor: pointer;
      transition: box-shadow 0.2s; box-shadow: 0 4px 14px rgba(255,107,53,0.25);
    }
    .mm-add-btn:hover { box-shadow: 0 8px 24px rgba(255,107,53,0.4); }
    .mm-add-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .mm-table-wrap {
      background: white; border-radius: 16px; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }

    .mm-table { width: 100%; }

    :host ::ng-deep .mm-table .mat-mdc-header-row {
      background: linear-gradient(135deg, #ff6b35, #ff8f65) !important;
    }
    :host ::ng-deep .mm-table .mat-mdc-header-cell {
      color: white !important; font-weight: 600 !important; font-size: 13px !important;
      font-family: 'Poppins', sans-serif !important; letter-spacing: 0.3px;
      border-bottom: none !important;
    }
    :host ::ng-deep .mm-table .mat-mdc-row { transition: background 0.2s; }
    :host ::ng-deep .mm-table .mat-mdc-row:hover { background: #fff8f5; }
    :host ::ng-deep .mm-table .mat-mdc-cell {
      font-family: 'Poppins', sans-serif !important; font-size: 14px !important;
      padding: 16px !important; border-bottom-color: #f5f5f5 !important;
    }

    .mm-item-name { font-weight: 600; color: #1a1a2e; }
    .mm-category-badge {
      background: #f0f4ff; color: #1565c0; font-size: 12px; font-weight: 600;
      padding: 4px 12px; border-radius: 8px;
    }
    .mm-price { font-weight: 600; color: #ff6b35; }
    .mm-stock { font-weight: 600; color: #333; }
    .mm-stock-low { color: #e53935; }
    .mm-avail { font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 8px; }
    .mm-avail-yes { background: #e8f5e9; color: #2e7d32; }
    .mm-avail-no { background: #ffebee; color: #c62828; }

    .mm-action-btn {
      width: 36px; height: 36px; border-radius: 10px; border: none; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      transition: all 0.2s; margin-right: 8px;
    }
    .mm-action-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .mm-edit-btn { background: #f0f4ff; color: #1565c0; }
    .mm-edit-btn:hover { background: #dce6ff; }
    .mm-delete-btn { background: #ffebee; color: #c62828; }
    .mm-delete-btn:hover { background: #ffcdd2; }
  `]
})
export class ManageMenuComponent implements OnInit {
  menuItems: MenuItem[] = [];
  categories: Category[] = [];
  displayedColumns = ['name', 'categoryName', 'price', 'stockQuantity', 'isAvailable', 'actions'];

  constructor(
    private menuService: MenuService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.categoryService.getAll().subscribe(cats => this.categories = cats);
    this.menuService.getAll(1, 100).subscribe(response => this.menuItems = response.items);
  }

  openDialog(item?: MenuItem): void {
    const dialogRef = this.dialog.open(MenuItemDialogComponent, {
      data: { item, categories: this.categories }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      if (item) {
        this.menuService.update(item.menuItemId, result).subscribe({
          next: () => { this.loadData(); this.snackBar.open('Item updated', 'Close', { duration: 2000 }); },
          error: () => this.snackBar.open('Failed to update', 'Close', { duration: 3000 })
        });
      } else {
        this.menuService.create(result).subscribe({
          next: () => { this.loadData(); this.snackBar.open('Item created', 'Close', { duration: 2000 }); },
          error: () => this.snackBar.open('Failed to create', 'Close', { duration: 3000 })
        });
      }
    });
  }

  deleteItem(item: MenuItem): void {
    if (confirm(`Delete "${item.name}"?`)) {
      this.menuService.delete(item.menuItemId).subscribe({
        next: () => { this.loadData(); this.snackBar.open('Item deleted', 'Close', { duration: 2000 }); },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 })
      });
    }
  }
}
