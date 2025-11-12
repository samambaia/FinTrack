import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Account } from '../../types';

interface TransferFormProps {
  onSuccess: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ onSuccess }) => {
  const { accounts, dispatch } = useContext(AppContext);
  const activeAccounts = accounts.filter(acc => acc.active);

  const [fromAccountId, setFromAccountId] = useState(activeAccounts.length > 0 ? activeAccounts[0].id : '');
  const [toAccountId, setToAccountId] = useState(activeAccounts.length > 1 ? activeAccounts[1].id : '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // Get local date in YYYY-MM-DD format to avoid timezone issues
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [date, setDate] = useState(getLocalDateString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromAccountId || !toAccountId || !amount || !date) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (fromAccountId === toAccountId) {
      alert("Conta de origem e destino devem ser diferentes.");
      return;
    }

    if (parseFloat(amount) <= 0) {
      alert("O valor da transferência deve ser maior que zero.");
      return;
    }

    dispatch({
      type: 'TRANSFER_BETWEEN_ACCOUNTS',
      payload: {
        fromAccountId,
        toAccountId,
        amount: parseFloat(amount),
        date,
        description: description || 'Transferência entre contas',
      },
    });

    onSuccess();
  };

  const availableToAccounts = activeAccounts.filter(acc => acc.id !== fromAccountId);
  const isSubmitDisabled = activeAccounts.length < 2;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conta de Origem *</label>
        <select 
          value={fromAccountId} 
          onChange={(e) => setFromAccountId(e.target.value)} 
          required 
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          {activeAccounts.map((account: Account) => (
            <option key={account.id} value={account.id}>
              {account.bankName} - {account.accountNumber}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conta de Destino *</label>
        <select 
          value={toAccountId} 
          onChange={(e) => setToAccountId(e.target.value)} 
          required 
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          {availableToAccounts.map((account: Account) => (
            <option key={account.id} value={account.id}>
              {account.bankName} - {account.accountNumber}
            </option>
          ))}
        </select>
        {activeAccounts.length < 2 && (
          <p className="text-sm text-danger-500 mt-1">
            Você precisa de pelo menos 2 contas ativas para fazer transferências.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição (opcional)</label>
        <input 
          type="text" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Ex: Transferência para poupança"
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor *</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            required 
            step="0.01" 
            min="0.01"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data *</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" 
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          type="submit" 
          disabled={isSubmitDisabled}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Realizar Transferência
        </button>
      </div>
    </form>
  );
};

export default TransferForm;
