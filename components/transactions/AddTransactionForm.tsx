import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Account, Transaction, CreditCard } from '../../types';

interface AddTransactionFormProps {
  onSuccess: () => void;
  transactionToEdit: Transaction | null;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onSuccess, transactionToEdit }) => {
  const { accounts, creditCards, categories, dispatch } = useContext(AppContext);
  const activeAccounts = accounts.filter(acc => acc.active);
  const activeCreditCards = creditCards.filter(card => !card.inactive);

  const [type, setType] = useState<'income' | 'expense' | 'creditCardExpense'>('expense');
  const [accountId, setAccountId] = useState(activeAccounts.length > 0 ? activeAccounts[0].id : '');
  const [creditCardId, setCreditCardId] = useState(activeCreditCards.length > 0 ? activeCreditCards[0].id : '');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  
  // Get local date in YYYY-MM-DD format to avoid timezone issues
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [date, setDate] = useState(getLocalDateString());

  const resetForm = () => {
    setType('expense');
    setAccountId(activeAccounts.length > 0 ? activeAccounts[0].id : '');
    setCreditCardId(activeCreditCards.length > 0 ? activeCreditCards[0].id : '');
    setCategory('');
    setDescription('');
    setAmount('');
    setDate(getLocalDateString());
  }

  useEffect(() => {
    if (transactionToEdit) {
        setType(transactionToEdit.type);
        setAccountId(transactionToEdit.accountId || '');
        setCreditCardId(transactionToEdit.creditCardId || '');
        setCategory(transactionToEdit.category);
        setDescription(transactionToEdit.description);
        setAmount(String(transactionToEdit.amount));
        // Extract date directly if already in YYYY-MM-DD format, otherwise parse it
        const dateValue = transactionToEdit.date.includes('T') 
          ? transactionToEdit.date.split('T')[0] 
          : transactionToEdit.date;
        setDate(dateValue);
    } else {
        resetForm();
    }
  }, [transactionToEdit, accounts, creditCards]);

  const filteredCategories = useMemo(() => {
    const categoryType = type === 'income' ? 'income' : 'expense';
    const filtered = categories.filter(c => c.type === categoryType);
    console.log('📋 Categories available:', categories.length, '| Type:', categoryType, '| Filtered:', filtered.length, filtered);
    return filtered;
  }, [categories, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCardTx = type === 'creditCardExpense';
    if ((isCardTx && !creditCardId) || (!isCardTx && !accountId) || !description || !amount || !date || !category) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    const transactionData: Transaction = {
        id: transactionToEdit ? transactionToEdit.id : new Date().toISOString() + Math.random(),
        accountId: !isCardTx ? accountId : undefined,
        creditCardId: isCardTx ? creditCardId : undefined,
        category: category,
        description,
        amount: parseFloat(amount),
        date,
        type,
        paid: isCardTx ? (transactionToEdit?.paid ?? false) : undefined,
        paidInInvoiceId: isCardTx ? transactionToEdit?.paidInInvoiceId : undefined,
    };

    if (transactionToEdit) {
        dispatch({ type: 'UPDATE_TRANSACTION', payload: transactionData });
    } else {
        dispatch({ type: 'ADD_TRANSACTION', payload: transactionData });
    }

    onSuccess();
  };
  
  const isSubmitDisabled = 
    (type === 'creditCardExpense' && activeCreditCards.length === 0) ||
    (type !== 'creditCardExpense' && activeAccounts.length === 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="grid grid-cols-3 gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
          <button type="button" onClick={() => setType('expense')} className={`py-2 rounded-md text-sm font-medium transition-colors ${type === 'expense' ? 'bg-danger-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            Despesa
          </button>
           <button type="button" onClick={() => setType('creditCardExpense')} className={`py-2 rounded-md text-sm font-medium transition-colors ${type === 'creditCardExpense' ? 'bg-sky-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            Cartão
          </button>
          <button type="button" onClick={() => setType('income')} className={`py-2 rounded-md text-sm font-medium transition-colors ${type === 'income' ? 'bg-success-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            Receita
          </button>
        </div>
      </div>
      
      {type === 'creditCardExpense' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cartão de Crédito</label>
          <select value={creditCardId} onChange={(e) => setCreditCardId(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
            {activeCreditCards.map((card: CreditCard) => (
              <option key={card.id} value={card.id}>{card.name} - {card.flag}</option>
            ))}
          </select>
          {activeCreditCards.length === 0 && <p className="text-sm text-danger-500 mt-1">Nenhum cartão de crédito ativo. Adicione um em Ajustes.</p>}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conta</label>
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
            {activeAccounts.map((account: Account) => (
              <option key={account.id} value={account.id}>{account.bankName} - {account.accountNumber}</option>
            ))}
          </select>
          {activeAccounts.length === 0 && <p className="text-sm text-danger-500 mt-1">Nenhuma conta ativa. Adicione uma em Ajustes.</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria *</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
          <option value="">Selecione uma categoria</option>
          {filteredCategories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        {filteredCategories.length === 0 && (
          <p className="text-sm text-danger-500 mt-1">
            Nenhuma categoria disponível. Por favor, adicione categorias em Ajustes.
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required step="0.01" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isSubmitDisabled} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {transactionToEdit ? 'Atualizar' : 'Adicionar'} Lançamento
        </button>
      </div>
    </form>
  );
};

export default AddTransactionForm;