import React from 'react';
import { HomeIcon, Cog6ToothIcon, ChartBarIcon } from '@heroicons/react/24/solid';

type View = 'DASHBOARD' | 'REPORTS' | 'SETTINGS';

interface NavProps {
  activeView: View;
  setView: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400'
    }`}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </button>
);


export const Nav: React.FC<NavProps> = ({ activeView, setView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
      <div className="flex justify-around items-center h-full">
        <NavButton
          label="Início"
          icon={<HomeIcon className="h-6 w-6" />}
          isActive={activeView === 'DASHBOARD'}
          onClick={() => setView('DASHBOARD')}
        />
        <NavButton
          label="Relatórios"
          icon={<ChartBarIcon className="h-6 w-6" />}
          isActive={activeView === 'REPORTS'}
          onClick={() => setView('REPORTS')}
        />
        <NavButton
          label="Ajustes"
          icon={<Cog6ToothIcon className="h-6 w-6" />}
          isActive={activeView === 'SETTINGS'}
          onClick={() => setView('SETTINGS')}
        />
      </div>
    </nav>
  );
};