import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { Account } from '../../types';
import Card from '../common/Card';

interface AccountCardProps {
  account: Account;
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const { transactions } = useContext(AppContext);

  const currentBalance = useMemo(() => {
    const accountTransactions = transactions.filter(t => t.accountId === account.id);
    const totalIncome = accountTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalExpenses = accountTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const balance = account.initialBalance + totalIncome - totalExpenses;
    return isNaN(balance) ? 0 : balance;
  }, [account, transactions]);

  return (
    <Card className="flex items-center justify-between py-3 px-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base text-gray-800 dark:text-gray-200 truncate">{account.bankName}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Conta: {account.accountNumber}</p>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">Saldo Atual</p>
        <p className={`text-lg font-bold ${currentBalance >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-500 dark:text-danger-400'}`}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentBalance)}
        </p>
      </div>
    </Card>
  );
};

export default AccountCard;