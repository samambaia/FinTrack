import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { CreditCard } from '../../types';

interface CreditCardFormProps {
  card: CreditCard | null;
  onSuccess: () => void;
}

const cardFlags = ['Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard', 'Outra'];

const CreditCardForm: React.FC<CreditCardFormProps> = ({ card, onSuccess }) => {
  const { dispatch } = useContext(AppContext);
  const [name, setName] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [flag, setFlag] = useState(cardFlags[0]);
  const [invoiceClosingDay, setInvoiceClosingDay] = useState('');
  const [invoiceDueDay, setInvoiceDueDay] = useState('');


  useEffect(() => {
    if (card) {
      setName(card.name);
      setLastFourDigits(card.lastFourDigits || '');
      setFlag(card.flag);
      setInvoiceClosingDay(card.invoiceClosingDay?.toString() || '');
      setInvoiceDueDay(card.invoiceDueDay?.toString() || '');
    } else {
        setName('');
        setLastFourDigits('');
        setFlag(cardFlags[0]);
        setInvoiceClosingDay('');
        setInvoiceDueDay('');
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !flag) {
        alert('Nome e Bandeira são obrigatórios.');
        return;
    }
    const newCardData: CreditCard = {
      id: card ? card.id : new Date().toISOString() + Math.random(),
      name,
      lastFourDigits,
      flag,
      invoiceClosingDay: invoiceClosingDay ? parseInt(invoiceClosingDay) : undefined,
      invoiceDueDay: invoiceDueDay ? parseInt(invoiceDueDay) : undefined,
      inactive: card ? card.inactive : false,
    };

    if (card) {
      dispatch({ type: 'UPDATE_CREDIT_CARD', payload: newCardData });
    } else {
      dispatch({ type: 'ADD_CREDIT_CARD', payload: newCardData });
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Cartão (Apelido)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Nubank, Inter" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
        </div>
         <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bandeira</label>
            <select value={flag} onChange={(e) => setFlag(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                {cardFlags.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Últimos 4 dígitos</label>
            <input type="text" value={lastFourDigits} onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} placeholder="1234" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dia de Fechamento</label>
            <input type="number" value={invoiceClosingDay} onChange={(e) => setInvoiceClosingDay(e.target.value)} min="1" max="31" placeholder="Ex: 25" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dia de Vencimento</label>
            <input type="number" value={invoiceDueDay} onChange={(e) => setInvoiceDueDay(e.target.value)} min="1" max="31" placeholder="Ex: 5" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          {card ? 'Atualizar Cartão' : 'Adicionar Cartão'}
        </button>
      </div>
    </form>
  );
};

export default CreditCardForm;
