import React, { createContext, useReducer, useEffect, ReactNode, Dispatch, useRef } from 'react';
import { Account, Transaction, User, Theme, Category, CreditCard } from '../types';
import { AppAction, appReducer, initialState, AppState } from './AppReducer';
import { supabase } from '../lib/supabase';
import * as supabaseService from '../lib/supabaseService';

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
  const isSyncing = useRef(false);

  // EFFECT 1: Check authentication and load data from Supabase on initial mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Load theme from localStorage (preference local)
        const savedTheme = localStorage.getItem('finTrackTheme') as Theme;
        const validTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : initialState.theme;

        if (session?.user) {
          // User is authenticated, load data from Supabase
          const userId = session.user.id;
          const userEmail = session.user.email || '';

          try {
            // Load all data in parallel
            const [accounts, creditCards, transactions, categories] = await Promise.all([
              supabaseService.fetchAccounts(userId),
              supabaseService.fetchCreditCards(userId),
              supabaseService.fetchTransactions(userId),
              supabaseService.fetchCategories(userId),
            ]);

            // Initialize default categories if user has none
            if (categories.length === 0) {
              await supabaseService.initializeDefaultCategories(userId);
              const updatedCategories = await supabaseService.fetchCategories(userId);
              
              const hydratedState: AppState = {
                accounts,
                creditCards,
                transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                categories: updatedCategories,
                auth: { isAuthenticated: true, user: { email: userEmail } },
                theme: validTheme,
              };
              dispatch({ type: 'HYDRATE_STATE', payload: hydratedState });
            } else {
              const hydratedState: AppState = {
                accounts,
                creditCards,
                transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                categories,
                auth: { isAuthenticated: true, user: { email: userEmail } },
                theme: validTheme,
              };
              dispatch({ type: 'HYDRATE_STATE', payload: hydratedState });
            }
          } catch (error) {
            console.error('Error loading data from Supabase:', error);
            // Still set auth state even if data loading fails
            dispatch({ 
              type: 'HYDRATE_STATE', 
              payload: { ...initialState, auth: { isAuthenticated: true, user: { email: userEmail } }, theme: validTheme } 
            });
          }
        } else {
          // No session, start fresh
          dispatch({ 
            type: 'HYDRATE_STATE', 
            payload: { ...initialState, theme: validTheme } 
          });
        }
      } catch (error) {
        console.error("Critical error during app initialization:", error);
        dispatch({ type: 'HYDRATE_STATE', payload: initialState });
      } finally {
        isInitialized.current = true;
      }
    };

    initializeApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
      } else if (event === 'SIGNED_IN' && session?.user) {
        const userId = session.user.id;
        const userEmail = session.user.email || '';
        
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('finTrackTheme') as Theme;
        const validTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : state.theme;
        
        try {
          const [accounts, creditCards, transactions, categories] = await Promise.all([
            supabaseService.fetchAccounts(userId),
            supabaseService.fetchCreditCards(userId),
            supabaseService.fetchTransactions(userId),
            supabaseService.fetchCategories(userId),
          ]);

          if (categories.length === 0) {
            await supabaseService.initializeDefaultCategories(userId);
            const updatedCategories = await supabaseService.fetchCategories(userId);
            dispatch({
              type: 'HYDRATE_STATE',
              payload: {
                accounts,
                creditCards,
                transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                categories: updatedCategories,
                auth: { isAuthenticated: true, user: { email: userEmail } },
                theme: validTheme,
              },
            });
          } else {
            dispatch({
              type: 'HYDRATE_STATE',
              payload: {
                accounts,
                creditCards,
                transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                categories,
                auth: { isAuthenticated: true, user: { email: userEmail } },
                theme: validTheme,
              },
            });
          }
        } catch (error) {
          console.error('Error loading data after sign in:', error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty array ensures this runs only once on mount

  // EFFECT 2: Sync state changes to Supabase (only when authenticated and after initialization)
  useEffect(() => {
    if (!isInitialized.current || !state.auth.isAuthenticated || isSyncing.current) {
      return;
    }

    const syncToSupabase = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;
      isSyncing.current = true;

      try {
        // Sync accounts
        const currentAccounts = state.accounts;
        const supabaseAccounts = await supabaseService.fetchAccounts(userId);
        const supabaseAccountIds = new Set(supabaseAccounts.map(a => a.id));
        
        for (const account of currentAccounts) {
          if (supabaseAccountIds.has(account.id)) {
            await supabaseService.updateAccount(userId, account);
          } else {
            await supabaseService.insertAccount(userId, account);
          }
        }
        
        // Remove deleted accounts
        const currentAccountIds = new Set(currentAccounts.map(a => a.id));
        for (const account of supabaseAccounts) {
          if (!currentAccountIds.has(account.id)) {
            await supabaseService.deleteAccount(userId, account.id);
          }
        }

        // Sync credit cards
        const currentCreditCards = state.creditCards;
        const supabaseCreditCards = await supabaseService.fetchCreditCards(userId);
        const supabaseCreditCardIds = new Set(supabaseCreditCards.map(c => c.id));
        
        for (const card of currentCreditCards) {
          if (supabaseCreditCardIds.has(card.id)) {
            await supabaseService.updateCreditCard(userId, card);
          } else {
            await supabaseService.insertCreditCard(userId, card);
          }
        }
        
        const currentCreditCardIds = new Set(currentCreditCards.map(c => c.id));
        for (const card of supabaseCreditCards) {
          if (!currentCreditCardIds.has(card.id)) {
            await supabaseService.deleteCreditCard(userId, card.id);
          }
        }

        // Sync transactions
        const currentTransactions = state.transactions;
        const supabaseTransactions = await supabaseService.fetchTransactions(userId);
        const supabaseTransactionIds = new Set(supabaseTransactions.map(t => t.id));
        
        for (const transaction of currentTransactions) {
          if (supabaseTransactionIds.has(transaction.id)) {
            await supabaseService.updateTransaction(userId, transaction);
          } else {
            await supabaseService.insertTransaction(userId, transaction);
          }
        }
        
        const currentTransactionIds = new Set(currentTransactions.map(t => t.id));
        for (const transaction of supabaseTransactions) {
          if (!currentTransactionIds.has(transaction.id)) {
            await supabaseService.deleteTransaction(userId, transaction.id);
          }
        }

        // Sync categories
        const currentCategories = state.categories;
        const supabaseCategories = await supabaseService.fetchCategories(userId);
        const supabaseCategoryIds = new Set(supabaseCategories.map(c => c.id));
        
        for (const category of currentCategories) {
          if (supabaseCategoryIds.has(category.id)) {
            await supabaseService.updateCategory(userId, category);
          } else {
            await supabaseService.insertCategory(userId, category);
          }
        }
        
        const currentCategoryIds = new Set(currentCategories.map(c => c.id));
        for (const category of supabaseCategories) {
          if (!currentCategoryIds.has(category.id)) {
            await supabaseService.deleteCategory(userId, category.id);
          }
        }
      } catch (error) {
        console.error('Error syncing to Supabase:', error);
      } finally {
        isSyncing.current = false;
      }
    };

    // Debounce sync to avoid too many requests
    const timeoutId = setTimeout(syncToSupabase, 1000);
    return () => clearTimeout(timeoutId);
  }, [state.accounts, state.creditCards, state.transactions, state.categories, state.auth.isAuthenticated]);

  // EFFECT 3: Save theme to localStorage (preference local)
  useEffect(() => {
    localStorage.setItem('finTrackTheme', state.theme);
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
