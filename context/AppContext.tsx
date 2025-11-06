import React, { createContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { Account, Transaction, User, Theme, Category } from '../types';
import { AppAction, appReducer, initialState } from './AppReducer';

interface AppContextProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  auth: {
    isAuthenticated: boolean;
    user: User | null;
  };
  theme: Theme;
  dispatch: Dispatch<AppAction>;
}

export const AppContext = createContext<AppContextProps>({
  ...initialState,
  dispatch: () => null,
});

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    try {
      const storedState = localStorage.getItem('finTrackState');
      if (storedState) {
        const parsed = JSON.parse(storedState);
        // Ensure initialBalance and amount are numbers
        parsed.accounts = parsed.accounts.map((acc: Account) => ({ ...acc, initialBalance: Number(acc.initialBalance) }));
        parsed.transactions = parsed.transactions.map((t: Transaction) => ({ ...t, amount: Number(t.amount) }));
        if (!parsed.categories) {
            parsed.categories = initialState.categories;
        }
        return parsed;
      }
    } catch (error) {
      console.error("Failed to parse state from localStorage", error);
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem('finTrackState', JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};