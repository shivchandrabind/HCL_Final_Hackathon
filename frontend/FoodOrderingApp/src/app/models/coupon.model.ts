export interface Coupon {
  couponId: number;
  code: string;
  discountPercent: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  expiryDate: string;
  isActive: boolean;
  usageLimit: number;
  timesUsed: number;
}

export interface ApplyCouponRequest {
  code: string;
  orderAmount: number;
}

export interface CustomerProfile {
  customerId: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  loyaltyPoints: number;
  createdAt: string;
}
