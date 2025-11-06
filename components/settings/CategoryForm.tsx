import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Category } from '../../types';

interface CategoryFormProps {
  category: Category | null;
  type: 'income' | 'expense';
  onSuccess: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, type, onSuccess }) => {
  const { dispatch } = useContext(AppContext);
  const [name, setName] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
    } else {
      setName('');
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert("O nome da categoria não pode estar vazio.");
        return;
    }

    if (category) {
        // This is an UPDATE. Preserve existing properties like isDefault.
        const updatedCategoryData: Category = {
            ...category, // Copy all fields from the original category
            name: name.trim(), // Only change the name
        };
        dispatch({ type: 'UPDATE_CATEGORY', payload: updatedCategoryData });
    } else {
        // This is an ADD. Create a new category and explicitly mark it as NOT default.
        const newCategoryData: Category = {
            id: new Date().toISOString() + Math.random(),
            name: name.trim(),
            type: type,
            isDefault: false, // This is the crucial part for new categories
        };
        dispatch({ type: 'ADD_CATEGORY', payload: newCategoryData });
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nome da Categoria ({type === 'income' ? 'Receita' : 'Despesa'})
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
        />
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          {category ? 'Atualizar Categoria' : 'Adicionar Categoria'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;