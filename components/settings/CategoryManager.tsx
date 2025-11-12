import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { Category } from '../../types';
import Modal from '../common/Modal';
import CategoryForm from './CategoryForm';
import Card from '../common/Card';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

const CategoryList: React.FC<{
    title: string;
    categories: Category[];
    onEdit: (cat: Category) => void;
    onDelete: (cat: Category) => void;
}> = ({ title, categories, onEdit, onDelete }) => (
    <div>
        <h3 className="text-md font-semibold text-gray-600 dark:text-gray-400 mb-2">{title}</h3>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {categories.map(cat => (
                <div key={cat.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center">
                        <p className="text-gray-800 dark:text-gray-200">{cat.name}</p>
                        {cat.isDefault && (
                            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">Padrão</span>
                        )}
                    </div>
                    <div className="flex items-center space-x-1">
                        <button 
                            onClick={() => onEdit(cat)} 
                            disabled={cat.isDefault}
                            title={cat.isDefault ? "Categorias padrão não podem ser editadas." : "Editar categoria"}
                            className="p-2 text-gray-500 hover:text-primary-500 rounded-full disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => onDelete(cat)}
                            disabled={cat.isDefault}
                            title={cat.isDefault ? "Categorias padrão não podem ser excluídas." : "Excluir categoria"}
                            className="p-2 text-gray-500 hover:text-danger-500 rounded-full disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))}
             {categories.length === 0 && <p className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">Nenhuma categoria.</p>}
        </div>
    </div>
);

const CategoryManager: React.FC = () => {
  const { categories, dispatch } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');

  const { incomeCategories, expenseCategories } = useMemo(() => {
    return categories.reduce((acc, cat) => {
        if (cat.type === 'income') acc.incomeCategories.push(cat);
        else acc.expenseCategories.push(cat);
        return acc;
    }, { incomeCategories: [] as Category[], expenseCategories: [] as Category[] });
  }, [categories]);

  const handleAddCategory = (type: 'income' | 'expense') => {
    setEditingCategory(null);
    setCategoryType(type);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    // Prevent editing default categories
    if (category.isDefault) return;
    
    setEditingCategory(category);
    setCategoryType(category.type);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    // Prevent deleting default categories, although UI should prevent this.
    if (category.isDefault) return;
    
    if (window.confirm(`Tem certeza de que deseja excluir a categoria "${category.name}"? As transações existentes nesta categoria serão movidas para uma categoria genérica.`)) {
      dispatch({ type: 'DELETE_CATEGORY', payload: category });
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Gerenciar Categorias</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-gray-600 dark:text-gray-400">Despesas</h3>
                <button onClick={() => handleAddCategory('expense')} className="text-sm text-primary-600 hover:text-primary-500 flex items-center">
                    <PlusIcon className="h-4 w-4 mr-1"/> Adicionar
                </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <CategoryList categories={expenseCategories} onEdit={handleEditCategory} onDelete={handleDeleteCategory} title="" />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-gray-600 dark:text-gray-400">Receitas</h3>
                <button onClick={() => handleAddCategory('income')} className="text-sm text-primary-600 hover:text-primary-500 flex items-center">
                    <PlusIcon className="h-4 w-4 mr-1"/> Adicionar
                </button>
            </div>
             <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <CategoryList categories={incomeCategories} onEdit={handleEditCategory} onDelete={handleDeleteCategory} title="" />
            </div>
          </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Editar Categoria' : 'Adicionar Nova Categoria'}
      >
        <CategoryForm category={editingCategory} type={categoryType} onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </Card>
  );
};

export default CategoryManager;