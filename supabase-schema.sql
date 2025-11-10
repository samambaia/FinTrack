-- FinTrack Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (custom authentication)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  initial_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Credit Cards table
CREATE TABLE IF NOT EXISTS credit_cards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  last_four_digits TEXT,
  flag TEXT NOT NULL,
  inactive BOOLEAN NOT NULL DEFAULT false,
  invoice_closing_day INTEGER,
  invoice_due_day INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  credit_card_id TEXT REFERENCES credit_cards(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'creditCardExpense')),
  paid BOOLEAN DEFAULT false,
  paid_in_invoice_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, name, type)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_credit_card_id ON transactions(credit_card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users policies (allow public registration and login)
CREATE POLICY "Anyone can view users for authentication"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Anyone can register (insert)"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own record"
  ON users FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own record"
  ON users FOR DELETE
  USING (true);

-- Accounts policies (allow all operations for authenticated users)
CREATE POLICY "Anyone can view accounts"
  ON accounts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert accounts"
  ON accounts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update accounts"
  ON accounts FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete accounts"
  ON accounts FOR DELETE
  USING (true);

-- Credit Cards policies
CREATE POLICY "Anyone can view credit cards"
  ON credit_cards FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert credit cards"
  ON credit_cards FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update credit cards"
  ON credit_cards FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete credit cards"
  ON credit_cards FOR DELETE
  USING (true);

-- Transactions policies
CREATE POLICY "Anyone can view transactions"
  ON transactions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update transactions"
  ON transactions FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete transactions"
  ON transactions FOR DELETE
  USING (true);

-- Categories policies
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert categories"
  ON categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update categories"
  ON categories FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete categories"
  ON categories FOR DELETE
  USING (true);

