import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { logoutUser } from '../../lib/authService';
import AccountManager from './AccountManager';
import CategoryManager from './CategoryManager';
import CreditCardManager from './CreditCardManager';
import { SunIcon, MoonIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

const Settings: React.FC = () => {
  const { theme, dispatch, auth } = useContext(AppContext);

  const handleToggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };
  
  const handleLogout = () => {
    // Logout clears localStorage and resets state
    logoutUser();
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Ajustes</h1>
      </header>

      <AccountManager />

      <CreditCardManager />

      <CategoryManager />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Preferências</h2>
          <div className="flex items-center justify-between">
              <p className="text-gray-800 dark:text-gray-200">Tema</p>
              <button
                onClick={handleToggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
              </button>
          </div>
      </div>
      
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Conta</h2>
          <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 dark:text-gray-200">Logado como</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{auth.user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-danger-600 hover:bg-danger-700"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Sair
              </button>
          </div>
      </div>

    </div>
  );
};

export default Settings;