
import { Category, MenuItem, User, UserRole } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Makanan Utama' },
  { id: '2', name: 'Minuman' },
  { id: '3', name: 'Snack' },
  { id: '4', name: 'Dessert' }
];

export const INITIAL_MENUS: MenuItem[] = [
  { id: 'm1', name: 'Nasi Goreng Spesial', categoryId: '1', price: 25000, stock: 50, status: 'aktif', image: 'https://picsum.photos/seed/nasigoreng/200' },
  { id: 'm2', name: 'Ayam Bakar Madu', categoryId: '1', price: 35000, stock: 30, status: 'aktif', image: 'https://picsum.photos/seed/ayambakar/200' },
  { id: 'm3', name: 'Es Teh Manis', categoryId: '2', price: 5000, stock: 100, status: 'aktif', image: 'https://picsum.photos/seed/esteh/200' },
  { id: 'm4', name: 'Kopi Susu Gula Aren', categoryId: '2', price: 18000, stock: 40, status: 'aktif', image: 'https://picsum.photos/seed/kopi/200' },
  { id: 'm5', name: 'Kentang Goreng', categoryId: '3', price: 15000, stock: 25, status: 'aktif', image: 'https://picsum.photos/seed/fries/200' },
  { id: 'm6', name: 'Pisang Goreng Keju', categoryId: '4', price: 12000, stock: 20, status: 'aktif', image: 'https://picsum.photos/seed/banana/200' }
];

export const USERS: User[] = [
  { id: 'u1', username: 'admin', role: UserRole.ADMIN, name: 'Budi (Admin)' },
  { id: 'u2', username: 'kasir1', role: UserRole.KASIR, name: 'Siti (Kasir)' }
];
