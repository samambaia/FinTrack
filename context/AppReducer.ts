import { Account, Transaction, User, Theme, Category } from '../types';

interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  auth: {
    isAuthenticated: boolean;
    user: User | null;
  };
  theme: Theme;
}

export type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string } // id
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string } // id
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: Category };


export const initialState: AppState = {
  accounts: [],
  transactions: [],
  categories: [
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
    case 'LOGIN':
      return {
        ...state,
        auth: { isAuthenticated: true, user: action.payload },
      };
    case 'LOGOUT':
      // FIX: Logout now correctly resets state without a forced page reload,
      // which was causing navigation errors. The app will react to the state
      // change and display the login screen.
      localStorage.removeItem('finTrackState');
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
      // Find the original category in the current state to get the old name
      const oldCategory = state.categories.find(c => c.id === newCategory.id);

      // If the category isn't found, or the name hasn't changed, just update the categories list.
      if (!oldCategory || oldCategory.name === newCategory.name) {
        return {
          ...state,
          categories: state.categories.map((c) =>
            c.id === newCategory.id ? newCategory : c
          ),
        };
      }

      // If the name has changed, we need to update all transactions that used the old name.
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
      
      // Define a generic fallback category name based on the type
      const fallbackCategoryName = categoryToDelete.type === 'income' 
        ? 'Outras Receitas' 
        : 'Outras Despesas';

      // Update transactions that used the deleted category
      const updatedTransactions = state.transactions.map(tx => {
        if (tx.category === categoryToDelete.name) {
          // Re-assign to the fallback category
          return { ...tx, category: fallbackCategoryName };
        }
        return tx;
      });

      // Remove the category from the list
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