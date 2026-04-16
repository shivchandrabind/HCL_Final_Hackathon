import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, MatIconModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="card-header">
          <div class="logo-circle">🍕</div>
          <h1 class="title">Create Account</h1>
          <p class="subtitle">Join us and start ordering your favorite meals</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Full Name</mat-label>
            <mat-icon matPrefix>person</mat-icon>
            <input matInput formControlName="name">
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Email</mat-label>
            <mat-icon matPrefix>email</mat-icon>
            <input matInput formControlName="email" type="email">
            @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
              <mat-error>Email is required</mat-error>
            }
            @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
              <mat-error>Invalid email format</mat-error>
            }
          </mat-form-field>
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input matInput formControlName="password" type="password">
            @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
              <mat-error>Password is required</mat-error>
            }
            @if (form.get('password')?.hasError('minlength') && !form.get('password')?.hasError('required') && form.get('password')?.touched) {
              <mat-error>Minimum 8 characters</mat-error>
            }
            @if (form.get('password')?.hasError('pattern') && !form.get('password')?.hasError('required') && !form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
              <mat-error>Must include uppercase, lowercase, number & special character</mat-error>
            }
          </mat-form-field>
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Phone</mat-label>
            <mat-icon matPrefix>phone</mat-icon>
            <input matInput formControlName="phone">
            @if (form.get('phone')?.hasError('required') && form.get('phone')?.touched) {
              <mat-error>Phone is required</mat-error>
            }
          </mat-form-field>
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Address</mat-label>
            <mat-icon matPrefix>location_on</mat-icon>
            <textarea matInput formControlName="address" rows="3"></textarea>
            @if (form.get('address')?.hasError('required') && form.get('address')?.touched) {
              <mat-error>Address is required</mat-error>
            }
          </mat-form-field>
          @if (errorMessage) {
            <div class="error-alert">
              <mat-icon>error_outline</mat-icon>
              <span>{{ errorMessage }}</span>
            </div>
          }
          <button mat-raised-button class="submit-btn" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Registering...' : 'Register' }}
          </button>
        </form>
        <div class="footer-link">
          <span>Already have an account? </span>
          <a routerLink="/login">Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`

    :host {
      display: block;
      font-family: 'Poppins', sans-serif;
    }

    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #fff5f0 0%, #e0f7f5 100%);
      padding: 24px;
    }

    .auth-card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04);
      padding: 40px 36px 32px;
      width: 100%;
      max-width: 420px;
      animation: fadeSlideUp 0.5s ease-out;
    }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .card-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .logo-circle {
      width: 72px;
      height: 72px;
      margin: 0 auto 16px;
      background: linear-gradient(135deg, #ff6b35, #ff8f65);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      box-shadow: 0 4px 16px rgba(255, 107, 53, 0.35);
    }

    .title {
      font-family: 'Poppins', sans-serif;
      font-size: 26px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 4px;
    }

    .subtitle {
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      color: #777;
      margin: 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 4px;
    }

    ::ng-deep .auth-card .mat-mdc-form-field-subscript-wrapper {
      margin-bottom: 4px;
    }

    ::ng-deep .auth-card .mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__leading,
    ::ng-deep .auth-card .mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__notch,
    ::ng-deep .auth-card .mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__trailing {
      border-color: #e0e0e0;
    }

    ::ng-deep .auth-card .mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-notched-outline .mdc-notched-outline__leading,
    ::ng-deep .auth-card .mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-notched-outline .mdc-notched-outline__notch,
    ::ng-deep .auth-card .mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-notched-outline .mdc-notched-outline__trailing {
      border-color: #ff6b35;
    }

    ::ng-deep .auth-card .mdc-text-field--outlined.mdc-text-field--focused .mdc-notched-outline .mdc-notched-outline__leading,
    ::ng-deep .auth-card .mdc-text-field--outlined.mdc-text-field--focused .mdc-notched-outline .mdc-notched-outline__notch,
    ::ng-deep .auth-card .mdc-text-field--outlined.mdc-text-field--focused .mdc-notched-outline .mdc-notched-outline__trailing {
      border-color: #ff6b35;
    }

    ::ng-deep .auth-card .mat-mdc-form-field.mat-focused .mdc-floating-label {
      color: #ff6b35;
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff0f0;
      border: 1px solid #ffcccc;
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 16px;
      color: #d32f2f;
      font-size: 13px;
      font-family: 'Poppins', sans-serif;
    }

    .error-alert mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #d32f2f;
    }

    .submit-btn {
      width: 100%;
      height: 50px;
      border-radius: 50px !important;
      background: linear-gradient(135deg, #ff6b35, #ff8f65) !important;
      color: #fff !important;
      font-family: 'Poppins', sans-serif;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.5px;
      border: none;
      box-shadow: 0 4px 16px rgba(255, 107, 53, 0.35);
      transition: all 0.3s ease;
      margin-top: 8px;
    }

    .submit-btn:hover:not([disabled]) {
      box-shadow: 0 6px 24px rgba(255, 107, 53, 0.5);
      transform: translateY(-1px);
    }

    .submit-btn[disabled] {
      opacity: 0.5;
      box-shadow: none;
    }

    .footer-link {
      text-align: center;
      margin-top: 24px;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      color: #777;
    }

    .footer-link a {
      color: #2ec4b6;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .footer-link a:hover {
      color: #25a99d;
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_])[A-Za-z\d@$!%*?&#+\-_]{8,}$/)]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Registration successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
