import React, { createContext, useReducer, useEffect, ReactNode, Dispatch, useRef } from 'react';
import { Account, Transaction, User, Theme, Category, CreditCard } from '../types';
import { AppAction, appReducer, initialState, AppState } from './AppReducer';
//import { supabase } from '../lib/supabase';
import * as supabaseService from '../lib/supabaseService';
import { getCurrentUser } from '../lib/authService';

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
  const isLoggingOut = useRef(false);
  const lastAuthState = useRef<boolean>(false);

  // EFFECT 1: Check authentication and load data from Supabase on initial mount and after login
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check for existing user in localStorage
        const currentUser = getCurrentUser();
        
        // Load theme from localStorage on first init, or preserve current theme on re-login
        const savedTheme = localStorage.getItem('finTrackTheme') as Theme;
        const validTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : initialState.theme;
        // Use current theme if already initialized (preserves theme during logout/login)
        const themeToUse = isInitialized.current ? state.theme : validTheme;
        console.log('🎨 Theme loading - Saved:', savedTheme, '| Using:', themeToUse, '| Initialized:', isInitialized.current);

        if (currentUser) {
          // User is authenticated, load data from Supabase
          const userId = currentUser.id;
          const userEmail = currentUser.email;
          
          console.log('📊 Loading data for user:', userId, userEmail);

          try {
            // Load all data in parallel
            const [accounts, creditCards, transactions, categories] = await Promise.all([
              supabaseService.fetchAccounts(userId),
              supabaseService.fetchCreditCards(userId),
              supabaseService.fetchTransactions(userId),
              supabaseService.fetchCategories(userId),
            ]);
            
            console.log('📦 Loaded accounts:', accounts.length);
            console.log('💳 Loaded credit cards:', creditCards.length);
            console.log('💰 Loaded transactions:', transactions.length);
            console.log('🏷️ Loaded categories:', categories.length);

            // Initialize default categories if user has none
            if (categories.length === 0) {
              await supabaseService.initializeDefaultCategories(userId);
              const updatedCategories = await supabaseService.fetchCategories(userId);
              
              const hydratedState: AppState = {
                accounts,
                creditCards,
                transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                categories: updatedCategories,
                auth: { isAuthenticated: true, user: { id: userId, email: userEmail } },
                theme: themeToUse,
              };
              dispatch({ type: 'HYDRATE_STATE', payload: hydratedState });
            } else {
              const hydratedState: AppState = {
                accounts,
                creditCards,
                transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                categories,
                auth: { isAuthenticated: true, user: { id: userId, email: userEmail } },
                theme: themeToUse,
              };
              dispatch({ type: 'HYDRATE_STATE', payload: hydratedState });
            }
          } catch (error) {
            console.error('Error loading data from Supabase:', error);
            // Still set auth state even if data loading fails
            dispatch({ 
              type: 'HYDRATE_STATE', 
              payload: { ...initialState, auth: { isAuthenticated: true, user: { id: userId, email: userEmail } }, theme: themeToUse } 
            });
          }
        } else {
          // No session, start fresh but preserve theme
          dispatch({ 
            type: 'HYDRATE_STATE', 
            payload: { ...initialState, theme: themeToUse } 
          });
        }
      } catch (error) {
        console.error("Critical error during app initialization:", error);
        // Preserve theme even on critical error
        const savedTheme = localStorage.getItem('finTrackTheme') as Theme;
        const themeToUse = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : (isInitialized.current ? state.theme : initialState.theme);
        dispatch({ type: 'HYDRATE_STATE', payload: { ...initialState, theme: themeToUse } });
      } finally {
        const currentUserAfterInit = getCurrentUser();
        const wasAuthenticatedBeforeInit = lastAuthState.current;
        lastAuthState.current = !!currentUserAfterInit;
        isInitialized.current = true;
        console.log('🏁 Init complete - Was:', wasAuthenticatedBeforeInit, '| Now:', !!currentUserAfterInit);
      }
    };

    // Only run initialization when:
    // 1. First mount (isInitialized is false)
    // 2. Auth state changes from false to true (user just logged in)
    const currentUser = getCurrentUser();
    const isNowAuthenticated = !!currentUser;
    const wasAuthenticated = lastAuthState.current;
    
    console.log('🔍 Init check - Now:', isNowAuthenticated, '| Was:', wasAuthenticated, '| Initialized:', isInitialized.current);
    
    // Only run if not initialized OR if user just logged in (transition from false to true)
    const shouldInitialize = !isInitialized.current || (!wasAuthenticated && isNowAuthenticated);
    
    if (shouldInitialize) {
      console.log('✅ Running initialization');
      initializeApp();
    } else {
      console.log('⏭️ Skipping initialization');
    }
  }, [state.auth.isAuthenticated]); // Re-run when auth state changes

  // EFFECT 1B: Update lastAuthState when user logs out
  useEffect(() => {
    if (!state.auth.isAuthenticated) {
      console.log('🚪 Logout detected, resetting auth state tracking');
      lastAuthState.current = false;
      isLoggingOut.current = false;
    }
  }, [state.auth.isAuthenticated]);

  // EFFECT 2: Sync state changes to Supabase (only when authenticated and after initialization)
  useEffect(() => {
    if (!isInitialized.current || !state.auth.isAuthenticated || !state.auth.user || isSyncing.current || isLoggingOut.current) {
      return;
    }

    const syncToSupabase = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) return;

      const userId = currentUser.id;
      console.log('🔄 Starting sync for user:', userId);
      console.log('📊 Current state - Accounts:', state.accounts.length, 'Cards:', state.creditCards.length, 'Transactions:', state.transactions.length);
      isSyncing.current = true;

      try {
        // Sync accounts
        const currentAccounts = state.accounts;
        const supabaseAccounts = await supabaseService.fetchAccounts(userId);
        const supabaseAccountIds = new Set(supabaseAccounts.map(a => a.id));
        
        for (const account of currentAccounts) {
          if (supabaseAccountIds.has(account.id)) {
            console.log('✅ Updating account:', account.id);
            await supabaseService.updateAccount(userId, account);
          } else {
            console.log('➕ Inserting new account:', account.id);
            await supabaseService.insertAccount(userId, account);
          }
        }
        
        // Remove deleted accounts
        const currentAccountIds = new Set(currentAccounts.map(a => a.id));
        for (const account of supabaseAccounts) {
          if (!currentAccountIds.has(account.id)) {
            console.log('🗑️ Deleting account from Supabase:', account.id);
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
  }, [state.accounts, state.creditCards, state.transactions, state.categories]);
  // Note: Removed state.auth from dependencies to prevent re-sync on LOGIN action

  // EFFECT 3: Save theme to localStorage (only after initialization to prevent overwriting on mount)
  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem('finTrackTheme', state.theme);
    }
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
