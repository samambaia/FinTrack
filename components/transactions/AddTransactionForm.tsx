import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Account, Transaction } from '../../types';

interface AddTransactionFormProps {
  onSuccess: () => void;
  transactionToEdit: Transaction | null;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onSuccess, transactionToEdit }) => {
  const { accounts, categories, dispatch } = useContext(AppContext);
  const activeAccounts = accounts.filter(acc => acc.active);

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [accountId, setAccountId] = useState(activeAccounts.length > 0 ? activeAccounts[0].id : '');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (transactionToEdit) {
        setType(transactionToEdit.type);
        setAccountId(transactionToEdit.accountId);
        setCategory(transactionToEdit.category);
        setDescription(transactionToEdit.description);
        setAmount(String(transactionToEdit.amount));
        setDate(new Date(transactionToEdit.date).toISOString().split('T')[0]);
    } else {
        // Reset form when modal is opened for adding new
        setType('expense');
        setAccountId(activeAccounts.length > 0 ? activeAccounts[0].id : '');
        setCategory('');
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
    }
  }, [transactionToEdit, accounts]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.type === type);
  }, [categories, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !description || !amount || !date) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    const transactionData = {
        id: transactionToEdit ? transactionToEdit.id : new Date().toISOString() + Math.random(),
        accountId,
        category: category || (type === 'income' ? 'Outras Receitas' : 'Outras Despesas'),
        description,
        amount: parseFloat(amount),
        date,
        type,
    };

    if (transactionToEdit) {
        dispatch({ type: 'UPDATE_TRANSACTION', payload: transactionData });
    } else {
        dispatch({ type: 'ADD_TRANSACTION', payload: transactionData });
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex justify-center space-x-4 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
          <button type="button" onClick={() => setType('expense')} className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${type === 'expense' ? 'bg-danger-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            Despesa
          </button>
          <button type="button" onClick={() => setType('income')} className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${type === 'income' ? 'bg-success-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            Receita
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conta</label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          {activeAccounts.map((account: Account) => (
            <option key={account.id} value={account.id}>
              {account.bankName} - {account.accountNumber}
            </option>
          ))}
        </select>
         {activeAccounts.length === 0 && <p className="text-sm text-danger-500 mt-1">Nenhuma conta ativa disponível. Adicione uma em Ajustes.</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
        />
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
        <input
          list="categories"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={type === 'expense' ? "Ex: Alimentação, Moradia" : "Ex: Salário, Freelance"}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
        />
        <datalist id="categories">
            {filteredCategories.map(cat => <option key={cat.id} value={cat.name} />)}
        </datalist>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor</label>
            <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            step="0.01"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
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
          disabled={activeAccounts.length === 0}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {transactionToEdit ? 'Atualizar' : 'Adicionar'} {type === 'expense' ? 'Despesa' : 'Receita'}
        </button>
      </div>
    </form>
  );
};

export default AddTransactionForm;