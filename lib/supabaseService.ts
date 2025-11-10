import { supabase } from './supabase';
import { Account, CreditCard, Transaction, Category } from '../types';

// Accounts
export const fetchAccounts = async (userId: string): Promise<Account[]> => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }

  if (!data) return [];

  // Convert from Supabase format (snake_case) to app format (camelCase)
  return data.map(acc => ({
    id: acc.id,
    bankName: acc.bank_name,
    accountNumber: acc.account_number,
    initialBalance: acc.initial_balance,
    active: acc.active,
  }));
};

export const insertAccount = async (userId: string, account: Account): Promise<Account> => {
  console.log('💾 Inserting account to Supabase:', { userId, accountId: account.id });
  const { data, error } = await supabase
    .from('accounts')
    .insert({
      id: account.id,
      user_id: userId,
      bank_name: account.bankName,
      account_number: account.accountNumber,
      initial_balance: account.initialBalance,
      active: account.active,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error inserting account:', error);
    throw error;
  }

  console.log('✅ Account inserted successfully');
  return {
    id: data.id,
    bankName: data.bank_name,
    accountNumber: data.account_number,
    initialBalance: data.initial_balance,
    active: data.active,
  };
};

export const updateAccount = async (userId: string, account: Account): Promise<Account> => {
  const { data, error } = await supabase
    .from('accounts')
    .update({
      bank_name: account.bankName,
      account_number: account.accountNumber,
      initial_balance: account.initialBalance,
      active: account.active,
    })
    .eq('id', account.id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating account:', error);
    throw error;
  }

  return {
    id: data.id,
    bankName: data.bank_name,
    accountNumber: data.account_number,
    initialBalance: data.initial_balance,
    active: data.active,
  };
};

export const deleteAccount = async (userId: string, accountId: string): Promise<void> => {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

// Credit Cards
export const fetchCreditCards = async (userId: string): Promise<CreditCard[]> => {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching credit cards:', error);
    throw error;
  }

  return (data || []).map(card => ({
    id: card.id,
    name: card.name,
    lastFourDigits: card.last_four_digits,
    flag: card.flag,
    inactive: card.inactive,
    invoiceClosingDay: card.invoice_closing_day,
    invoiceDueDay: card.invoice_due_day,
  }));
};

export const insertCreditCard = async (userId: string, card: CreditCard): Promise<CreditCard> => {
  const { data, error } = await supabase
    .from('credit_cards')
    .insert({
      id: card.id,
      user_id: userId,
      name: card.name,
      last_four_digits: card.lastFourDigits,
      flag: card.flag,
      inactive: card.inactive,
      invoice_closing_day: card.invoiceClosingDay,
      invoice_due_day: card.invoiceDueDay,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting credit card:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    lastFourDigits: data.last_four_digits,
    flag: data.flag,
    inactive: data.inactive,
    invoiceClosingDay: data.invoice_closing_day,
    invoiceDueDay: data.invoice_due_day,
  };
};

export const updateCreditCard = async (userId: string, card: CreditCard): Promise<CreditCard> => {
  const { data, error } = await supabase
    .from('credit_cards')
    .update({
      name: card.name,
      last_four_digits: card.lastFourDigits,
      flag: card.flag,
      inactive: card.inactive,
      invoice_closing_day: card.invoiceClosingDay,
      invoice_due_day: card.invoiceDueDay,
    })
    .eq('id', card.id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating credit card:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    lastFourDigits: data.last_four_digits,
    flag: data.flag,
    inactive: data.inactive,
    invoiceClosingDay: data.invoice_closing_day,
    invoiceDueDay: data.invoice_due_day,
  };
};

export const deleteCreditCard = async (userId: string, cardId: string): Promise<void> => {
  const { error } = await supabase
    .from('credit_cards')
    .delete()
    .eq('id', cardId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting credit card:', error);
    throw error;
  }
};

// Transactions
export const fetchTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }

  return (data || []).map(tx => ({
    id: tx.id,
    accountId: tx.account_id,
    creditCardId: tx.credit_card_id,
    category: tx.category,
    description: tx.description,
    date: tx.date,
    amount: tx.amount,
    type: tx.type,
    paid: tx.paid,
    paidInInvoiceId: tx.paid_in_invoice_id,
  }));
};

export const insertTransaction = async (userId: string, transaction: Transaction): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      id: transaction.id,
      user_id: userId,
      account_id: transaction.accountId,
      credit_card_id: transaction.creditCardId,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      amount: transaction.amount,
      type: transaction.type,
      paid: transaction.paid || false,
      paid_in_invoice_id: transaction.paidInInvoiceId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting transaction:', error);
    throw error;
  }

  return {
    id: data.id,
    accountId: data.account_id,
    creditCardId: data.credit_card_id,
    category: data.category,
    description: data.description,
    date: data.date,
    amount: data.amount,
    type: data.type,
    paid: data.paid,
    paidInInvoiceId: data.paid_in_invoice_id,
  };
};

export const updateTransaction = async (userId: string, transaction: Transaction): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      account_id: transaction.accountId,
      credit_card_id: transaction.creditCardId,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      amount: transaction.amount,
      type: transaction.type,
      paid: transaction.paid,
      paid_in_invoice_id: transaction.paidInInvoiceId,
    })
    .eq('id', transaction.id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }

  return {
    id: data.id,
    accountId: data.account_id,
    creditCardId: data.credit_card_id,
    category: data.category,
    description: data.description,
    date: data.date,
    amount: data.amount,
    type: data.type,
    paid: data.paid,
    paidInInvoiceId: data.paid_in_invoice_id,
  };
};

export const deleteTransaction = async (userId: string, transactionId: string): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Categories
export const fetchCategories = async (userId: string): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return (data || []).map(cat => ({
    id: cat.id,
    name: cat.name,
    type: cat.type,
    isDefault: cat.is_default,
  }));
};

export const insertCategory = async (userId: string, category: Category): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      id: category.id,
      user_id: userId,
      name: category.name,
      type: category.type,
      is_default: category.isDefault || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting category:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type,
    isDefault: data.is_default,
  };
};

export const updateCategory = async (userId: string, category: Category): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update({
      name: category.name,
      type: category.type,
      is_default: category.isDefault,
    })
    .eq('id', category.id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type,
    isDefault: data.is_default,
  };
};

export const deleteCategory = async (userId: string, categoryId: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Initialize default categories for a user
export const initializeDefaultCategories = async (userId: string): Promise<void> => {
  const defaultCategories = [
    { id: 'cat-income-1', name: 'Salário', type: 'income', isDefault: true },
    { id: 'cat-income-2', name: 'Freelance', type: 'income', isDefault: true },
    { id: 'cat-income-3', name: 'Investimentos', type: 'income', isDefault: true },
    { id: 'cat-income-99', name: 'Outras Receitas', type: 'income', isDefault: true },
    { id: 'cat-expense-1', name: 'Moradia', type: 'expense', isDefault: true },
    { id: 'cat-expense-2', name: 'Alimentação', type: 'expense', isDefault: true },
    { id: 'cat-expense-3', name: 'Transporte', type: 'expense', isDefault: true },
    { id: 'cat-expense-4', name: 'Lazer', type: 'expense', isDefault: true },
    { id: 'cat-expense-5', name: 'Saúde', type: 'expense', isDefault: true },
    { id: 'cat-expense-6', name: 'Educação', type: 'expense', isDefault: true },
    { id: 'cat-expense-7', name: 'Pagamento de Fatura', type: 'expense', isDefault: true },
    { id: 'cat-expense-99', name: 'Outras Despesas', type: 'expense', isDefault: true },
  ];

  // Check if user already has categories
  const existingCategories = await fetchCategories(userId);
  if (existingCategories.length > 0) {
    return; // User already has categories
  }

  // Insert default categories
  for (const category of defaultCategories) {
    try {
      await insertCategory(userId, category);
    } catch (error) {
      console.error(`Error inserting default category ${category.name}:`, error);
    }
  }
};

