import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatSnackBarModule],
  template: `
    <div class="mo-page">
      <div class="mo-header">
        <div>
          <h2 class="mo-title">Manage Orders</h2>
          <p class="mo-subtitle">{{ filteredOrders.length }} of {{ orders.length }} orders shown</p>
        </div>
      </div>

      <div class="mo-filters">
        <button class="mo-pill" [class.mo-pill-active]="statusFilter === ''" (click)="statusFilter = ''; applyFilter()">
          All
        </button>
        @for (s of statuses; track s) {
          <button class="mo-pill" [class]="'mo-pill ' + (statusFilter === s ? 'mo-pill-active mo-pill-' + s.toLowerCase() : '')"
            (click)="statusFilter = s; applyFilter()">
            {{ s }}
          </button>
        }
      </div>

      <div class="mo-table-wrap">
        <table mat-table [dataSource]="filteredOrders" class="mo-table">
          <ng-container matColumnDef="orderId">
            <th mat-header-cell *matHeaderCellDef>Order #</th>
            <td mat-cell *matCellDef="let o">
              <span class="mo-order-id">#{{ o.orderId }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="customerName">
            <th mat-header-cell *matHeaderCellDef>Customer</th>
            <td mat-cell *matCellDef="let o">
              <span class="mo-customer">{{ o.customerName }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="orderDate">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let o">{{ o.orderDate | date:'short' }}</td>
          </ng-container>
          <ng-container matColumnDef="totalAmount">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let o">
              <span class="mo-amount">{{ o.totalAmount | currency:'INR' }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let o">
              <div class="mo-status-cell">
                <span class="mo-badge" [class]="'mo-badge-' + o.status.toLowerCase()">{{ o.status }}</span>
                <mat-form-field appearance="outline" class="mo-status-select">
                  <mat-select [value]="o.status" (selectionChange)="updateStatus(o, $event.value)">
                    @for (s of statuses; track s) {
                      <mat-option [value]="s">{{ s }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`

    .mo-page { max-width: 1100px; margin: 0 auto; padding: 32px 20px; font-family: 'Poppins', sans-serif; }

    .mo-header { margin-bottom: 24px; }
    .mo-title { font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 0; }
    .mo-subtitle { font-size: 14px; color: #999; margin: 4px 0 0; }

    .mo-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 28px; }
    .mo-pill {
      font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600;
      padding: 8px 20px; border-radius: 24px; border: 2px solid #e8e8e8;
      background: white; color: #888; cursor: pointer; transition: all 0.2s;
    }
    .mo-pill:hover { border-color: #ccc; color: #555; }
    .mo-pill-active { border-color: #ff6b35; background: linear-gradient(135deg, #ff6b35, #ff8f65); color: white; }
    .mo-pill-active.mo-pill-pending { background: linear-gradient(135deg, #e65100, #ff9800); border-color: #e65100; }
    .mo-pill-active.mo-pill-confirmed { background: linear-gradient(135deg, #1565c0, #42a5f5); border-color: #1565c0; }
    .mo-pill-active.mo-pill-preparing { background: linear-gradient(135deg, #7b1fa2, #ab47bc); border-color: #7b1fa2; }
    .mo-pill-active.mo-pill-delivered { background: linear-gradient(135deg, #2e7d32, #66bb6a); border-color: #2e7d32; }
    .mo-pill-active.mo-pill-cancelled { background: linear-gradient(135deg, #c62828, #ef5350); border-color: #c62828; }
    .mo-pill-active.mo-pill-out\ for\ delivery { background: linear-gradient(135deg, #1565c0, #42a5f5); border-color: #1565c0; }

    .mo-table-wrap {
      background: white; border-radius: 16px; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .mo-table { width: 100%; }

    :host ::ng-deep .mo-table .mat-mdc-header-row {
      background: linear-gradient(135deg, #ff6b35, #ff8f65) !important;
    }
    :host ::ng-deep .mo-table .mat-mdc-header-cell {
      color: white !important; font-weight: 600 !important; font-size: 13px !important;
      font-family: 'Poppins', sans-serif !important; border-bottom: none !important;
    }
    :host ::ng-deep .mo-table .mat-mdc-row { transition: background 0.2s; }
    :host ::ng-deep .mo-table .mat-mdc-row:hover { background: #fff8f5; }
    :host ::ng-deep .mo-table .mat-mdc-cell {
      font-family: 'Poppins', sans-serif !important; font-size: 14px !important;
      padding: 12px 16px !important; border-bottom-color: #f5f5f5 !important;
      vertical-align: middle !important;
    }

    .mo-order-id { font-weight: 700; color: #1a1a2e; }
    .mo-customer { font-weight: 500; color: #333; }
    .mo-amount { font-weight: 600; color: #ff6b35; }

    .mo-status-cell { display: flex; align-items: center; gap: 12px; }

    .mo-badge {
      font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 16px;
      text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap;
    }
    .mo-badge-pending { background: #fff3e0; color: #e65100; }
    .mo-badge-confirmed { background: #e3f2fd; color: #1565c0; }
    .mo-badge-preparing { background: #f3e5f5; color: #7b1fa2; }
    .mo-badge-delivered { background: #e8f5e9; color: #2e7d32; }
    .mo-badge-cancelled { background: #ffebee; color: #c62828; }
    .mo-badge-out\ for\ delivery { background: #e3f2fd; color: #1565c0; }

    .mo-status-select { width: 150px; }
    :host ::ng-deep .mo-status-select .mat-mdc-form-field-subscript-wrapper { display: none; }
    :host ::ng-deep .mo-status-select .mdc-text-field--outlined { height: 38px !important; }
    :host ::ng-deep .mo-status-select .mat-mdc-select { font-size: 13px !important; font-family: 'Poppins', sans-serif !important; }
  `]
})
export class ManageOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  statusFilter = '';
  statuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
  displayedColumns = ['orderId', 'customerName', 'orderDate', 'totalAmount', 'status'];

  constructor(private orderService: OrderService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe(orders => {
      this.orders = orders;
      this.applyFilter();
    });
  }

  applyFilter(): void {
    this.filteredOrders = this.statusFilter
      ? this.orders.filter(o => o.status === this.statusFilter)
      : [...this.orders];
  }

  updateStatus(order: Order, newStatus: string): void {
    this.orderService.updateStatus(order.orderId, { status: newStatus }).subscribe({
      next: () => {
        order.status = newStatus;
        this.snackBar.open(`Order #${order.orderId} updated to ${newStatus}`, 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 })
    });
  }
}
