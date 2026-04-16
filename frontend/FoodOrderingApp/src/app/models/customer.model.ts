export interface Customer {
  customerId: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  name: string;
  customerId: number;
}
