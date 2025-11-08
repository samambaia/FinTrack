import React, { createContext, useReducer, useEffect, ReactNode, Dispatch, useRef } from 'react';
import { Account, Transaction, User, Theme, Category, CreditCard } from '../types';
import { AppAction, appReducer, initialState, AppState } from './AppReducer';

interface AppContextProps {
  accounts: Account[];
  creditCards: CreditCard[];
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
  const [state, dispatch] = useReducer(appReducer, initialState);
  const isInitialized = useRef(false);

  // EFFECT 1: Hydrate state from localStorage on initial mount
  useEffect(() => {
    try {
      const storedStateJSON = localStorage.getItem('finTrackState');
      if (!storedStateJSON) {
        console.log("No saved state found. Starting fresh.");
        return;
      };

      const storedState = JSON.parse(storedStateJSON);

      if (typeof storedState !== 'object' || storedState === null) {
        throw new Error('Stored state is not a valid object.');
      }

      // Validate Auth State
      let validAuth = { isAuthenticated: false, user: null };
      if (storedState.auth && typeof storedState.auth === 'object') {
          const { isAuthenticated, user } = storedState.auth;
          if (isAuthenticated === true && user && typeof user === 'object' && typeof user.email === 'string') {
              validAuth = { isAuthenticated: true, user: { email: user.email } };
          }
      }
      
      // Validate Theme
      const validTheme = ['light', 'dark'].includes(storedState.theme) ? storedState.theme : initialState.theme;
      
      // Validate Accounts
      const validAccounts = Array.isArray(storedState.accounts)
          ? storedState.accounts.filter((acc: any): acc is Account => 
              acc && typeof acc === 'object' && typeof acc.id === 'string' &&
              typeof acc.bankName === 'string' && typeof acc.accountNumber === 'string' &&
              typeof acc.initialBalance === 'number' && isFinite(acc.initialBalance) &&
              typeof acc.active === 'boolean'
            )
          : initialState.accounts;

      // Validate Credit Cards
      const validCreditCards = Array.isArray(storedState.creditCards)
          ? storedState.creditCards.filter((card: any): card is CreditCard =>
              card && typeof card === 'object' && typeof card.id === 'string' &&
              typeof card.name === 'string' && typeof card.flag === 'string' &&
              typeof card.inactive === 'boolean'
            )
          : initialState.creditCards;

      // Validate Transactions
      const validTransactions = Array.isArray(storedState.transactions)
          ? storedState.transactions.filter((t: any): t is Transaction =>
              t && typeof t === 'object' && typeof t.id === 'string' &&
              typeof t.description === 'string' &&
              typeof t.amount === 'number' && isFinite(t.amount) &&
              typeof t.date === 'string' && !isNaN(new Date(t.date).getTime()) &&
              ['income', 'expense', 'creditCardExpense'].includes(t.type)
            )
          : initialState.transactions;

      // Validate Categories
      const validCategories = Array.isArray(storedState.categories)
          ? storedState.categories.filter((cat: any): cat is Category =>
              cat && typeof cat === 'object' && cat.id && cat.name && cat.type
            )
          : initialState.categories;
      
      let sortedTransactions = validTransactions;
      try {
          sortedTransactions = [...validTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } catch (sortError) {
          console.error("Error sorting transactions during hydration. Using unsorted list.", sortError);
      }

      const hydratedState: AppState = {
          accounts: validAccounts,
          creditCards: validCreditCards,
          transactions: sortedTransactions,
          categories: validCategories,
          auth: validAuth,
          theme: validTheme,
      };

      dispatch({ type: 'HYDRATE_STATE', payload: hydratedState });

    } catch (error) {
      console.error("Critical error during state hydration. Ignoring stored state.", error);
    } finally {
      isInitialized.current = true;
    }
  }, []); // Empty array ensures this runs only once on mount

  // EFFECT 2: Save state to localStorage on every change *after* initialization
  useEffect(() => {
    if (!isInitialized.current) {
      return; // Don't save state until hydration is complete
    }
    
    try {
      const stateToSave = {
        accounts: state.accounts,
        creditCards: state.creditCards,
        transactions: state.transactions,
        categories: state.categories,
        auth: state.auth,
        theme: state.theme,
      };
      localStorage.setItem('finTrackState', JSON.stringify(stateToSave));
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
