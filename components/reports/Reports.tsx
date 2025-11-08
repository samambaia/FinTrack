import React, { useState, useMemo, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Transaction } from '../../types';
import Card from '../common/Card';
import BarChart from '../common/BarChart';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

type ReportType = 'expensesByCategory' | 'cashFlow' | 'comparison' | 'creditCardInvoice';

const ComparisonMetric: React.FC<{
  title: string;
  current: number;
  previous: number;
  invertColors?: boolean;
}> = ({ title, current, previous, invertColors = false }) => {
  const diff = current - previous;
  // Handle division by zero when previous is 0
  const percentageChange = previous !== 0 
    ? (diff / Math.abs(previous)) * 100 
    : (current !== 0 ? 100 * Math.sign(diff) : 0);

  const hasChanged = current !== previous;
  const isIncrease = diff > 0;
  const isDecrease = diff < 0;

  let colorClass = 'text-gray-500 dark:text-gray-400';
  if (isIncrease) {
    colorClass = invertColors ? 'text-danger-500' : 'text-success-600 dark:text-success-400';
  } else if (isDecrease) {
    colorClass = invertColors ? 'text-success-600 dark:text-success-400' : 'text-danger-500';
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
      <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">{title}</h4>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(current)}</p>
      {hasChanged ? (
        <div className={`flex items-center mt-1 ${colorClass}`}>
          {isIncrease && <ArrowUpIcon className="h-4 w-4 mr-1" />}
          {isDecrease && <ArrowDownIcon className="h-4 w-4 mr-1" />}
          <span className="text-sm font-semibold">
            {percentageChange.toFixed(2)}%
          </span>
          <span className="text-sm ml-1">vs. {formatCurrency(previous)}</span>
        </div>
      ) : (
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          <span>Sem alteração vs. {formatCurrency(previous)}</span>
        </div>
      )}
    </div>
  );
};


const Reports: React.FC = () => {
    const { transactions, creditCards } = useContext(AppContext);
    const [reportType, setReportType] = useState<ReportType>('expensesByCategory');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth());
    const [selectedCardId, setSelectedCardId] = useState<string>('');
    
    const availableYears = useMemo(() => {
        if (transactions.length === 0) return [new Date().getFullYear()];
        const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
        // Fix: Explicitly type sort callback parameters to ensure they are treated as numbers for the arithmetic operation.
        return Array.from(years).sort((a: number, b: number) => b - a);
    }, [transactions]);
    
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate.getFullYear() === year && txDate.getMonth() === month;
        });
    }, [transactions, year, month]);

    const annualTransactions = useMemo(() => {
        return transactions.filter(t => new Date(t.date).getFullYear() === year);
    }, [transactions, year]);

    const comparisonData = useMemo(() => {
        let prevMonth = month - 1;
        let prevYear = year;
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear = year - 1;
        }

        const currentTxs = transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate.getFullYear() === year && txDate.getMonth() === month;
        });

        const previousTxs = transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate.getFullYear() === prevYear && txDate.getMonth() === prevMonth;
        });

        const calculateSummary = (txs: Transaction[]) => {
            const income = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            return { income, expense, netFlow: income - expense };
        };

        return {
            currentSummary: calculateSummary(currentTxs),
            previousSummary: calculateSummary(previousTxs),
            prevMonth,
            prevYear
        };
    }, [transactions, year, month]);

    const renderReport = () => {
        switch(reportType) {
            case 'expensesByCategory':
                const monthlyData = aggregateExpenses(filteredTransactions);
                const annualData = aggregateExpenses(annualTransactions);
                return (
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Despesas por Categoria - {monthNames[month]} {year}</h3>
                         {monthlyData.length > 0 ? <BarChart data={monthlyData} /> : <p className="text-gray-500 dark:text-gray-400">Nenhuma despesa neste mês.</p>}
                        
                        <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-700 dark:text-gray-300">Despesas por Categoria - {year}</h3>
                        {annualData.length > 0 ? <BarChart data={annualData} /> : <p className="text-gray-500 dark:text-gray-400">Nenhuma despesa neste ano.</p>}
                    </div>
                );
            case 'cashFlow':
                const monthlyIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                const monthlyExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                const netFlow = monthlyIncome - monthlyExpense;
                return (
                     <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Fluxo de Caixa - {monthNames[month]} {year}</h3>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                               <p>Receita Total:</p>
                               <p className="font-semibold text-success-600 dark:text-success-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyIncome)}</p>
                           </div>
                           <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                               <p>Despesa Total:</p>
                               <p className="font-semibold text-danger-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyExpense)}</p>
                           </div>
                           <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-600 p-3 rounded-lg border-t-2 dark:border-gray-500">
                               <p className="font-bold">Saldo do Mês:</p>
                               <p className={`font-bold ${netFlow >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-500'}`}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netFlow)}</p>
                           </div>
                        </div>
                    </div>
                );
            case 'comparison': {
                const { currentSummary, previousSummary, prevMonth, prevYear } = comparisonData;
                const prevMonthName = monthNames[prevMonth];
                
                return (
                     <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Comparativo Mensal: {monthNames[month]} {year} vs. {prevMonthName} {prevYear}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ComparisonMetric 
                                title="Receitas"
                                current={currentSummary.income}
                                previous={previousSummary.income}
                            />
                            <ComparisonMetric 
                                title="Despesas"
                                current={currentSummary.expense}
                                previous={previousSummary.expense}
                                invertColors={true}
                            />
                             <ComparisonMetric 
                                title="Saldo Final"
                                current={currentSummary.netFlow}
                                previous={previousSummary.netFlow}
                            />
                        </div>
                    </div>
                );
            }
            case 'creditCardInvoice': {
                if (!selectedCardId) {
                    return (
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Selecione um cartão para ver a fatura.</p>
                        </div>
                    );
                }

                const selectedCard = creditCards.find(c => c.id === selectedCardId);
                if (!selectedCard) {
                    return (
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Cartão não encontrado.</p>
                        </div>
                    );
                }

                // Filter transactions for the selected card and period
                const invoiceTransactions = transactions.filter(t => {
                    if (t.creditCardId !== selectedCardId || t.type !== 'creditCardExpense') return false;
                    const txDate = new Date(t.date);
                    return txDate.getFullYear() === year && txDate.getMonth() === month;
                });

                const totalInvoice = invoiceTransactions.reduce((sum, t) => sum + t.amount, 0);
                const paidTransactions = invoiceTransactions.filter(t => t.paid);
                const unpaidTransactions = invoiceTransactions.filter(t => !t.paid);
                const totalPaid = paidTransactions.reduce((sum, t) => sum + t.amount, 0);
                const totalUnpaid = unpaidTransactions.reduce((sum, t) => sum + t.amount, 0);

                // Group by category
                const categoryMap = new Map<string, number>();
                invoiceTransactions.forEach(t => {
                    const current = categoryMap.get(t.category) || 0;
                    categoryMap.set(t.category, current + t.amount);
                });

                const categoryData = Array.from(categoryMap.entries())
                    .map(([label, value]) => ({ label, value }))
                    .sort((a, b) => b.value - a.value);

                return (
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                            Fatura {selectedCard.name} - {monthNames[month]} {year}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Total da Fatura</h4>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvoice)}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Pago</h4>
                                <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid)}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Em Aberto</h4>
                                <p className="text-2xl font-bold text-danger-500">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalUnpaid)}
                                </p>
                            </div>
                        </div>

                        {categoryData.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-md font-semibold mb-2 text-gray-700 dark:text-gray-300">Gastos por Categoria</h4>
                                <BarChart data={categoryData} />
                            </div>
                        )}

                        <div className="mt-6">
                            <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">Transações da Fatura</h4>
                            {invoiceTransactions.length > 0 ? (
                                <div className="space-y-2">
                                    {invoiceTransactions.map(tx => (
                                        <div key={tx.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800 dark:text-gray-200">{tx.description}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{tx.category} - {new Date(tx.date).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-danger-500">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                                                </p>
                                                {tx.paid && (
                                                    <p className="text-xs text-success-600 dark:text-success-400">Pago</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma transação neste período.</p>
                            )}
                        </div>
                    </div>
                );
            }
        }
    }

    const aggregateExpenses = (txs: Transaction[]) => {
        const categoryMap = new Map<string, number>();
        txs.filter(t => t.type === 'expense').forEach(t => {
            const currentAmount = categoryMap.get(t.category) || 0;
            categoryMap.set(t.category, currentAmount + t.amount);
        });
        return Array.from(categoryMap.entries())
            .map(([label, value]) => ({ label, value }))
            .sort((a,b) => b.value - a.value);
    }
    
    return (
        <div className="container mx-auto p-4 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Relatórios</h1>
                <p className="text-gray-500 dark:text-gray-400">Analise suas finanças.</p>
            </header>
            
            <Card>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Relatório</label>
                        <select value={reportType} onChange={e => {
                            setReportType(e.target.value as ReportType);
                            if (e.target.value !== 'creditCardInvoice') {
                                setSelectedCardId('');
                            }
                        }} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                            <option value="expensesByCategory">Despesas por Categoria</option>
                            <option value="cashFlow">Fluxo de Caixa Mensal</option>
                            <option value="comparison">Comparativo Mensal</option>
                            <option value="creditCardInvoice">Fatura de Cartão</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano</label>
                        <select value={year} onChange={e => setYear(Number(e.target.value))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mês</label>
                        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                            {monthNames.map((m, i) => <option key={m} value={i}>{m}</option>)}
                        </select>
                    </div>
                    {reportType === 'creditCardInvoice' && (
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cartão</label>
                            <select 
                                value={selectedCardId} 
                                onChange={e => setSelectedCardId(e.target.value)} 
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            >
                                <option value="">Selecione um cartão</option>
                                {creditCards.filter(c => !c.inactive).map(card => (
                                    <option key={card.id} value={card.id}>
                                        {card.name} {card.lastFourDigits ? `- Final ${card.lastFourDigits}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div>{renderReport()}</div>

            </Card>

        </div>
    );
};

export default Reports;