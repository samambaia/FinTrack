export interface Account {
  id: string;
  bankName: string;
  accountNumber: string;
  initialBalance: number;
  active: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  category: string;
  description: string;
  date: string; // ISO string format
  amount: number;
  type: 'income' | 'expense';
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isDefault?: boolean;
}

export interface User {
  email: string;
}

export type Theme = 'light' | 'dark';