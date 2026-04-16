export interface MenuItem {
  menuItemId: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName?: string;
  imageUrl: string;
  isAvailable: boolean;
  stockQuantity: number;
}

export interface MenuItemPagedResponse {
  items: MenuItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface Category {
  categoryId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}
