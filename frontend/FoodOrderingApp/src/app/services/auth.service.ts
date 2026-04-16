import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/customer.model';
import { CustomerProfile } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private loggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  private adminSubject = new BehaviorSubject<boolean>(this.isAdmin());
  private userNameSubject = new BehaviorSubject<string>(this.getUserName());

  isLoggedIn$ = this.loggedInSubject.asObservable();
  isAdmin$ = this.adminSubject.asObservable();
  userName$ = this.userNameSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.storeAuth(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.storeAuth(response))
    );
  }

  private storeAuth(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.role);
    localStorage.setItem('userName', response.name);
    localStorage.setItem('customerId', response.customerId.toString());
    this.loggedInSubject.next(true);
    this.adminSubject.next(response.role === 'Admin');
    this.userNameSubject.next(response.name);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('customerId');
    this.loggedInSubject.next(false);
    this.adminSubject.next(false);
    this.userNameSubject.next('');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'Admin';
  }

  getUserName(): string {
    return localStorage.getItem('userName') || '';
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  getCustomerId(): number {
    return parseInt(localStorage.getItem('customerId') || '0', 10);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getProfile(): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(`${this.apiUrl}/profile`);
  }
}
