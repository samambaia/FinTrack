import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { Transaction } from '../../types';
import Card from '../common/Card';
import { TrashIcon, PencilIcon, CreditCardIcon } from '@heroicons/react/24/solid';


const TransactionItem: React.FC<{ 
    transaction: Transaction & { sourceName: string }; 
    onDelete: (id: string) => void; 
    onEdit: (transaction: Transaction) => void;
}> = ({ transaction, onDelete, onEdit }) => {
    const isIncome = transaction.type === 'income';
    const isCreditCard = transaction.type === 'creditCardExpense';
    
    return (
        <li className="flex items-center justify-between py-3">
            <div className="flex-1 min-w-0 flex items-center">
                 {isCreditCard && <CreditCardIcon className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />}
                <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{transaction.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.sourceName} - {transaction.category}</p>
                </div>
            </div>
            <div className="text-right ml-2">
                 <p className={`font-semibold ${isIncome ? 'text-success-600 dark:text-success-500' : 'text-danger-500'}`}>
                    {isIncome ? '+ ' : '- '}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                </p>
                 <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
            </div>
             <div className="flex items-center ml-2">
                 <button onClick={() => onEdit(transaction)} className="mr-1 text-gray-400 hover:text-primary-500 transition-colors p-2">
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onDelete(transaction.id)} className="text-gray-400 hover:text-danger-500 transition-colors p-2">
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </li>
    )
}

interface TransactionListProps {
    onEditTransaction: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ onEditTransaction }) => {
  const { transactions, accounts, creditCards, dispatch } = useContext(AppContext);

  const enrichedTransactions = useMemo(() => {
    const accountMap = new Map(accounts.map(acc => [acc.id, acc.bankName]));
    const cardMap = new Map(creditCards.map(card => [card.id, card.name]));

    return transactions.map(tx => {
        let sourceName = 'N/A';
        if (tx.type === 'creditCardExpense') {
            sourceName = cardMap.get(tx.creditCardId || '') || 'Cartão Desconhecido';
        } else if (tx.accountId) {
            sourceName = accountMap.get(tx.accountId) || 'Conta Desconhecida';
        }
      return { ...tx, sourceName };
    })
  }, [transactions, accounts, creditCards])

  const groupedTransactions = useMemo(() => {
    return enrichedTransactions.reduce((acc, tx) => {
      const date = new Date(tx.date).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(tx);
      return acc;
    }, {} as Record<string, (Transaction & { sourceName: string })[]>);
  }, [enrichedTransactions]);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir esta transação?')) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Histórico de Transações</h2>
      {transactions.length > 0 ? (
        <div className="space-y-4">
          {sortedDates.map(date => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-md">
                {new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 px-3">
                {groupedTransactions[date].map(transaction => (
                  <TransactionItem 
                    key={transaction.id} 
                    transaction={transaction}
                    onDelete={handleDelete}
                    onEdit={onEditTransaction}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma transação ainda.</p>
      )}
    </Card>
  );
};

export default TransactionList;