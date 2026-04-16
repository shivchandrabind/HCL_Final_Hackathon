import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/menu/menu-list/menu-list.component').then(m => m.MenuListComponent) },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'menu/:id', loadComponent: () => import('./pages/menu/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'cart', loadComponent: () => import('./pages/cart/cart/cart.component').then(m => m.CartComponent), canActivate: [authGuard] },
  { path: 'checkout', loadComponent: () => import('./pages/cart/checkout/checkout.component').then(m => m.CheckoutComponent), canActivate: [authGuard] },
  { path: 'orders', loadComponent: () => import('./pages/orders/order-history/order-history.component').then(m => m.OrderHistoryComponent), canActivate: [authGuard] },
  { path: 'orders/:id', loadComponent: () => import('./pages/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent), canActivate: [authGuard] },
  { path: 'rewards', loadComponent: () => import('./pages/rewards/rewards.component').then(m => m.RewardsComponent), canActivate: [authGuard] },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [adminGuard] },
  { path: 'admin/menu', loadComponent: () => import('./pages/admin/manage-menu/manage-menu.component').then(m => m.ManageMenuComponent), canActivate: [adminGuard] },
  { path: 'admin/orders', loadComponent: () => import('./pages/admin/manage-orders/manage-orders.component').then(m => m.ManageOrdersComponent), canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];
