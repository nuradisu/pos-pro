
export enum UserRole {
  ADMIN = 'ADMIN',
  KASIR = 'KASIR'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  status: 'aktif' | 'nonaktif';
  image?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Transaction {
  id: string;
  orderNumber: string;
  timestamp: string;
  kasirId: string;
  kasirName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'Tunai' | 'QRIS';
}

export interface DashboardStats {
  todayRevenue: number;
  todayTransactions: number;
  activeMenus: number;
  topMenu: string;
}
