import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { CreditCard, Account } from '../../types';
import Card from '../common/Card';
import Modal from '../common/Modal';
import { CreditCardIcon } from '@heroicons/react/24/solid';

interface PayInvoiceFormProps {
    card: CreditCard;
    totalDue: number;
    onSuccess: () => void;
}

const PayInvoiceForm: React.FC<PayInvoiceFormProps> = ({ card, totalDue, onSuccess }) => {
    const { accounts, dispatch } = useContext(AppContext);
    const activeAccounts = accounts.filter(acc => acc.active);

    const [amount, setAmount] = useState(totalDue.toFixed(2));
    const [accountId, setAccountId] = useState(activeAccounts.length > 0 ? activeAccounts[0].id : '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountId || !amount || !date) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        dispatch({
            type: 'PAY_INVOICE',
            payload: {
                creditCardId: card.id,
                accountId,
                amount: parseFloat(amount),
                date
            }
        });
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cartão</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100 font-semibold">{card.name} - Fatura</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conta para Débito</label>
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
                {activeAccounts.length === 0 && <p className="text-sm text-danger-500 mt-1">Nenhuma conta ativa para realizar o pagamento.</p>}
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor a Pagar</label>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data do Pagamento</label>
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
                Confirmar Pagamento
                </button>
            </div>
        </form>
    )
}

const CreditCardSummary: React.FC = () => {
    const { creditCards, transactions } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<{card: CreditCard, totalDue: number} | null>(null);
    
    const activeCards = creditCards.filter(c => !c.inactive);

    const openInvoices = useMemo(() => {
        return activeCards.map(card => {
            const totalDue = transactions
                .filter(t => t.creditCardId === card.id && t.type === 'creditCardExpense' && !t.paid)
                .reduce((sum, t) => sum + t.amount, 0);
            return { card, totalDue };
        }).filter(item => item.totalDue > 0);
    }, [activeCards, transactions]);

    const handleOpenModal = (card: CreditCard, totalDue: number) => {
        setSelectedCard({card, totalDue});
        setIsModalOpen(true);
    }
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCard(null);
    }

    if (activeCards.length === 0) return null;

    return (
        <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Faturas de Cartão em Aberto</h2>
            {openInvoices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {openInvoices.map(({ card, totalDue }) => (
                    <Card key={card.id} className="flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{card.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{card.flag}{card.lastFourDigits ? ` - Final ${card.lastFourDigits}` : ''}</p>
                            </div>
                            <CreditCardIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="mt-4 text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total da Fatura</p>
                            <p className="text-2xl font-semibold text-danger-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDue)}
                            </p>
                            <button onClick={() => handleOpenModal(card, totalDue)} className="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                                Pagar Fatura
                            </button>
                        </div>
                    </Card>
                ))}
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma fatura em aberto.</p>
            )}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Pagamento de Fatura">
                {selectedCard && <PayInvoiceForm card={selectedCard.card} totalDue={selectedCard.totalDue} onSuccess={handleCloseModal} />}
            </Modal>
        </div>
    );
};

export default CreditCardSummary;
