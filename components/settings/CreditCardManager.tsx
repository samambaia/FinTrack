import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { CreditCard } from '../../types';
import Modal from '../common/Modal';
import CreditCardForm from './CreditCardForm';
import Card from '../common/Card';
import { PlusIcon, PencilIcon, TrashIcon, CreditCardIcon } from '@heroicons/react/24/solid';

const CreditCardManager: React.FC = () => {
  const { creditCards, transactions, dispatch } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  const handleAddCard = () => {
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleDeleteCard = (cardId: string) => {
    const hasTransactions = transactions.some(t => t.creditCardId === cardId);
    if (hasTransactions) {
      alert("Não é possível excluir cartões com transações vinculadas. Exclua as transações primeiro.");
      return;
    }
    if (window.confirm("Tem certeza de que deseja excluir este cartão?")) {
      dispatch({ type: 'DELETE_CREDIT_CARD', payload: cardId });
    }
  };

  const handleToggleActive = (card: CreditCard) => {
      dispatch({ type: 'UPDATE_CREDIT_CARD', payload: {...card, inactive: !card.inactive }});
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Gerenciar Cartões de Crédito</h2>
        <button
          onClick={handleAddCard}
          className="flex items-center bg-primary-600 text-white px-3 py-1.5 rounded-md shadow-sm hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Adicionar Cartão
        </button>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {creditCards.map(card => (
          <div key={card.id} className="py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={!card.inactive} onChange={() => handleToggleActive(card)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600"></div>
              </label>
              <CreditCardIcon className={`h-6 w-6 ${card.inactive ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`} />
              <div>
                <p className={`font-medium ${!card.inactive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500 line-through'}`}>{card.name}</p>
                <p className={`text-sm ${!card.inactive ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500 line-through'}`}>{card.flag}{card.lastFourDigits ? ` - Final ${card.lastFourDigits}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => handleEditCard(card)} className="p-2 text-gray-500 hover:text-primary-500 rounded-full">
                <PencilIcon className="h-5 w-5" />
              </button>
              <button onClick={() => handleDeleteCard(card.id)} className="p-2 text-gray-500 hover:text-danger-500 rounded-full">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
        {creditCards.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">Nenhum cartão de crédito configurado.</p>}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCard ? 'Editar Cartão de Crédito' : 'Adicionar Novo Cartão'}
      >
        <CreditCardForm card={editingCard} onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </Card>
  );
};

export default CreditCardManager;
