import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import AccountCard from './AccountCard';
import TransactionList from './TransactionList';
import Modal from '../common/Modal';
import AddTransactionForm from '../transactions/AddTransactionForm';
import { PlusIcon } from '@heroicons/react/24/solid';
import { Transaction } from '../../types';
import CreditCardSummary from './CreditCardSummary';

const Dashboard: React.FC = () => {
  const { accounts, transactions } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const activeAccounts = useMemo(() => accounts.filter(acc => acc.active), [accounts]);
  
  const totalBalance = useMemo(() => {
    if (activeAccounts.length === 0) return 0;
    return activeAccounts.reduce((total, account) => {
        const accountTransactions = transactions.filter(t => t.accountId === account.id);
        const income = accountTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = accountTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const accountBalance = account.initialBalance + income - expenses;
        return total + (isNaN(accountBalance) ? 0 : accountBalance);
    }, 0);
  }, [activeAccounts, transactions]);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  }

  const handleOpenEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  }


  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Painel</h1>
          <p className="text-gray-500 dark:text-gray-400">Bem-vindo(a) de volta!</p>
        </div>
        <div className="text-right">
             <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Total em Contas</p>
             <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-500 dark:text-danger-400'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}
            </p>
        </div>
      </header>
      
      <div>
        <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Contas</h2>
        {activeAccounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAccounts.map(account => (
                <AccountCard key={account.id} account={account} />
            ))}
            </div>
        ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma conta ativa. Vá para Ajustes para adicionar uma.</p>
        )}
      </div>

      <CreditCardSummary />

      <TransactionList onEditTransaction={handleOpenEditModal} />

      <button
        onClick={handleOpenAddModal}
        className="fixed bottom-20 right-4 md:hidden h-14 w-14 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-105"
        aria-label="Adicionar Transação"
      >
        <PlusIcon className="h-7 w-7" />
      </button>
      
      <div className="hidden md:block fixed bottom-6 right-6">
         <button
            onClick={handleOpenAddModal}
            className="bg-primary-600 text-white px-4 py-2 rounded-full flex items-center shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-105"
            >
            <PlusIcon className="h-5 w-5 mr-2" />
            Adicionar Transação
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTransaction ? 'Editar Transação' : 'Adicionar Nova Transação'}>
        <AddTransactionForm onSuccess={handleCloseModal} transactionToEdit={editingTransaction} />
      </Modal>
    </div>
  );
};

export default Dashboard;