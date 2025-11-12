import { Account, Transaction, User, Theme, Category, CreditCard } from '../types';

export interface AppState {
  accounts: Account[];
  creditCards: CreditCard[];
  transactions: Transaction[];
  categories: Category[];
  auth: {
    isAuthenticated: boolean;
    user: User | null;
  };
  theme: Theme;
}

export type AppAction =
  | { type: 'HYDRATE_STATE'; payload: AppState }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string } // id
  | { type: 'ADD_CREDIT_CARD'; payload: CreditCard }
  | { type: 'UPDATE_CREDIT_CARD'; payload: CreditCard }
  | { type: 'DELETE_CREDIT_CARD'; payload: string } // id
  | { type: 'PAY_INVOICE', payload: { creditCardId: string, accountId: string, amount: number, date: string }}
  | { type: 'TRANSFER_BETWEEN_ACCOUNTS', payload: { fromAccountId: string, toAccountId: string, amount: number, date: string, description: string }}
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string } // id
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: Category };


export const initialState: AppState = {
  accounts: [],
  creditCards: [],
  transactions: [],
  categories: [
    { id: 'cat-income-1', name: 'Salário', type: 'income', isDefault: true },
    { id: 'cat-income-2', name: 'Freelance', type: 'income', isDefault: true },
    { id: 'cat-income-3', name: 'Investimentos', type: 'income', isDefault: true },
    { id: 'cat-income-4', name: 'Transferência', type: 'income', isDefault: true },
    { id: 'cat-income-99', name: 'Outras Receitas', type: 'income', isDefault: true },
    { id: 'cat-expense-1', name: 'Moradia', type: 'expense', isDefault: true },
    { id: 'cat-expense-2', name: 'Alimentação', type: 'expense', isDefault: true },
    { id: 'cat-expense-3', name: 'Transporte', type: 'expense', isDefault: true },
    { id: 'cat-expense-4', name: 'Lazer', type: 'expense', isDefault: true },
    { id: 'cat-expense-5', name: 'Saúde', type: 'expense', isDefault: true },
    { id: 'cat-expense-6', name: 'Educação', type: 'expense', isDefault: true },
    { id: 'cat-expense-7', name: 'Pagamento de Fatura', type: 'expense', isDefault: true },
    { id: 'cat-expense-8', name: 'Transferência', type: 'expense', isDefault: true },
    { id: 'cat-expense-99', name: 'Outras Despesas', type: 'expense', isDefault: true },
  ],
  auth: {
    isAuthenticated: false,
    user: null,
  },
  theme: 'light',
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE_STATE':
      return action.payload;
    case 'LOGIN':
      return {
        ...state,
        auth: { isAuthenticated: true, user: action.payload },
      };
    case 'LOGOUT':
      // Clear localStorage
      localStorage.removeItem('fintrack_user');
      return {
        ...initialState,
        theme: state.theme, // Persist theme preference
      };
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light',
      };
    case 'ADD_ACCOUNT':
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
      };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((account) =>
          account.id === action.payload.id ? action.payload : account
        ),
      };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter((account) => account.id !== action.payload),
      };
     case 'ADD_CREDIT_CARD':
      return {
        ...state,
        creditCards: [...state.creditCards, action.payload],
      };
    case 'UPDATE_CREDIT_CARD':
      return {
        ...state,
        creditCards: state.creditCards.map((card) =>
          card.id === action.payload.id ? action.payload : card
        ),
      };
    case 'DELETE_CREDIT_CARD':
      return {
        ...state,
        creditCards: state.creditCards.filter((card) => card.id !== action.payload),
      };
    case 'PAY_INVOICE': {
      const { creditCardId, accountId, amount, date } = action.payload;
      const card = state.creditCards.find(c => c.id === creditCardId);
      if (!card) return state;

      // 1. Create the payment transaction (an expense from a bank account)
      const paymentTransaction: Transaction = {
        id: new Date().toISOString() + Math.random(),
        accountId,
        type: 'expense',
        amount: amount,
        date,
        description: `Pagamento Fatura ${card.name}`,
        category: 'Pagamento de Fatura',
      };

      // 2. Mark associated credit card expenses as paid
      const updatedTransactions = state.transactions.map(tx => {
        if (tx.creditCardId === creditCardId && !tx.paid) {
          return { ...tx, paid: true, paidInInvoiceId: paymentTransaction.id };
        }
        return tx;
      });

      return {
        ...state,
        transactions: [paymentTransaction, ...updatedTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      };
    }
    case 'TRANSFER_BETWEEN_ACCOUNTS': {
      const { fromAccountId, toAccountId, amount, date, description } = action.payload;
      
      // Create two transactions: debit from source, credit to destination
      const debitTransaction: Transaction = {
        id: new Date().toISOString() + Math.random(),
        accountId: fromAccountId,
        type: 'expense',
        amount: amount,
        date,
        description: description || `Transferência para conta`,
        category: 'Transferência',
      };

      const creditTransaction: Transaction = {
        id: new Date().toISOString() + Math.random() + '_credit',
        accountId: toAccountId,
        type: 'income',
        amount: amount,
        date,
        description: description || `Transferência recebida`,
        category: 'Transferência',
      };

      return {
        ...state,
        transactions: [debitTransaction, creditTransaction, ...state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      };
    }
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      };
    case 'UPDATE_TRANSACTION':
        return {
            ...state,
            transactions: state.transactions.map(tx => tx.id === action.payload.id ? action.payload : tx).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        }
    case 'DELETE_TRANSACTION':
        return {
            ...state,
            transactions: state.transactions.filter(tx => tx.id !== action.payload)
        };
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };
    case 'UPDATE_CATEGORY': {
      const newCategory = action.payload;
      const oldCategory = state.categories.find(c => c.id === newCategory.id);

      if (!oldCategory || oldCategory.name === newCategory.name) {
        return {
          ...state,
          categories: state.categories.map((c) =>
            c.id === newCategory.id ? newCategory : c
          ),
        };
      }

      const updatedTransactions = state.transactions.map(tx => {
        if (tx.category === oldCategory.name) {
          return { ...tx, category: newCategory.name };
        }
        return tx;
      });
      
      const updatedCategories = state.categories.map((c) =>
        c.id === newCategory.id ? newCategory : c
      );

      return {
        ...state,
        transactions: updatedTransactions,
        categories: updatedCategories,
      };
    }
    case 'DELETE_CATEGORY': {
      const categoryToDelete = action.payload;
      
      const fallbackCategoryName = categoryToDelete.type === 'income' 
        ? 'Outras Receitas' 
        : 'Outras Despesas';

      const updatedTransactions = state.transactions.map(tx => {
        if (tx.category === categoryToDelete.name) {
          return { ...tx, category: fallbackCategoryName };
        }
        return tx;
      });

      const updatedCategories = state.categories.filter(c => c.id !== categoryToDelete.id);
      
      return {
        ...state,
        transactions: updatedTransactions,
        categories: updatedCategories,
      };
    }
    default:
      return state;
  }
}