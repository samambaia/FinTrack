import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Account } from '../../types';

interface AccountFormProps {
  account: Account | null;
  onSuccess: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ account, onSuccess }) => {
  const { dispatch } = useContext(AppContext);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  useEffect(() => {
    if (account) {
      setBankName(account.bankName);
      setAccountNumber(account.accountNumber);
      setInitialBalance(account.initialBalance.toString());
    } else {
        setBankName('');
        setAccountNumber('');
        setInitialBalance('0');
    }
  }, [account]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAccountData = {
      id: account ? account.id : new Date().toISOString() + Math.random(),
      bankName,
      accountNumber,
      initialBalance: parseFloat(initialBalance) || 0,
      active: account ? account.active : true,
    };

    if (account) {
      dispatch({ type: 'UPDATE_ACCOUNT', payload: newAccountData });
    } else {
      dispatch({ type: 'ADD_ACCOUNT', payload: newAccountData });
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Banco</label>
        <input
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conta / DV</label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Saldo Inicial</label>
        <input
          type="number"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
          required
          step="0.01"
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
        />
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          {account ? 'Atualizar Conta' : 'Adicionar Conta'}
        </button>
      </div>
    </form>
  );
};

export default AccountForm;