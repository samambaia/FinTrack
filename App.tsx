import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from './context/AppContext';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Settings from './components/settings/Settings';
import Reports from './components/reports/Reports';
import { Nav } from './components/common/Nav';

// FIX: Aligned the View type with the one in Nav.tsx and the actual usage in the component. 'LOGIN' and 'REGISTER' are handled by a separate state.
type View = 'DASHBOARD' | 'REPORTS' | 'SETTINGS';

const App: React.FC = () => {
  const { auth, theme } = useContext(AppContext);
  const [view, setView] = useState<View>('DASHBOARD');
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  if (!auth.isAuthenticated) {
    if (authView === 'LOGIN') {
      return <Login onSwitchToRegister={() => setAuthView('REGISTER')} />;
    }
    return <Register onSwitchToLogin={() => setAuthView('LOGIN')} />;
  }

  const renderView = () => {
    switch (view) {
      case 'DASHBOARD':
        return <Dashboard />;
      case 'REPORTS':
        return <Reports />;
      case 'SETTINGS':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <main className="pb-20 md:pb-4">
            {renderView()}
        </main>
        <Nav activeView={view} setView={setView} />
    </div>
  );
};

export default App;