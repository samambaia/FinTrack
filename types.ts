export interface Account {
  id: string;
  bankName: string;
  accountNumber: string;
  initialBalance: number;
  active: boolean;
}

export interface CreditCard {
  id: string;
  name: string;
  lastFourDigits?: string;
  flag: string;
  inactive: boolean;
  invoiceClosingDay?: number;
  invoiceDueDay?: number;
}

export interface Transaction {
  id: string;
  accountId?: string; // Optional, for income/expense from accounts
  creditCardId?: string; // Optional, for credit card expenses
  category: string;
  description: string;
  date: string; // ISO string format
  amount: number;
  type: 'income' | 'expense' | 'creditCardExpense';
  paid?: boolean; // For credit card expenses, indicates if it's part of a paid invoice
  paidInInvoiceId?: string; // ID of the expense transaction that paid this invoice item
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isDefault?: boolean;
}

export interface User {
  id: string;
  email: string;
}

export type Theme = 'light' | 'dark';