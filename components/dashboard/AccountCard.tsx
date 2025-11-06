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
    return account.initialBalance + totalIncome - totalExpenses;
  }, [account, transactions]);

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{account.bankName}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Conta: {account.accountNumber}</p>
      </div>
      <div className="mt-4 text-right">
        <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Atual</p>
        <p className={`text-2xl font-semibold ${currentBalance >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-500 dark:text-danger-400'}`}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentBalance)}
        </p>
      </div>
    </Card>
  );
};

export default AccountCard;