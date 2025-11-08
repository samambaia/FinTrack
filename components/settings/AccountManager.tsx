import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Account } from '../../types';
import Modal from '../common/Modal';
import AccountForm from './AccountForm';
import Card from '../common/Card';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

const AccountManager: React.FC = () => {
  const { accounts, transactions, dispatch } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleAddAccount = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDeleteAccount = (accountId: string) => {
    const hasTransactions = transactions.some(t => t.accountId === accountId);
    if (hasTransactions) {
      alert("Não é possível excluir contas com transações vinculadas. Exclua as transações primeiro.");
      return;
    }
    if (window.confirm("Tem certeza de que deseja excluir esta conta?")) {
      dispatch({ type: 'DELETE_ACCOUNT', payload: accountId });
    }
  };

  const handleToggleActive = (account: Account) => {
      dispatch({ type: 'UPDATE_ACCOUNT', payload: {...account, active: !account.active }});
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Contas</h2>
        <button
          onClick={handleAddAccount}
          className="flex items-center bg-primary-600 text-white px-3 py-1.5 rounded-md shadow-sm hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Adicionar Conta
        </button>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {accounts.map(account => (
          <div key={account.id} className="py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={account.active} onChange={() => handleToggleActive(account)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600"></div>
              </label>
              <div>
                <p className={`font-medium ${account.active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500 line-through'}`}>{account.bankName}</p>
                <p className={`text-sm ${account.active ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500 line-through'}`}>{account.accountNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => handleEditAccount(account)} className="p-2 text-gray-500 hover:text-primary-500 rounded-full">
                <PencilIcon className="h-5 w-5" />
              </button>
              <button onClick={() => handleDeleteAccount(account.id)} className="p-2 text-gray-500 hover:text-danger-500 rounded-full">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">Nenhuma conta configurada.</p>}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount ? 'Editar Conta' : 'Adicionar Nova Conta'}
      >
        <AccountForm account={editingAccount} onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </Card>
  );
};

export default AccountManager;