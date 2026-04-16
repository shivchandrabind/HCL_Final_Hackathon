import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coupon, ApplyCouponRequest } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private apiUrl = 'http://localhost:5000/api/coupons';

  constructor(private http: HttpClient) {}

  getActive(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(this.apiUrl);
  }

  validate(request: ApplyCouponRequest): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.apiUrl}/validate`, request);
  }
}
