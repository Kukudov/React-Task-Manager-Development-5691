import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '@/types';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit3, FiTrash2, FiX, FiCheck } = FiIcons;

const availableIcons = [
  { name: 'FiBriefcase', icon: FiIcons.FiBriefcase },
  { name: 'FiHeart', icon: FiIcons.FiHeart },
  { name: 'FiBook', icon: FiIcons.FiBook },
  { name: 'FiUser', icon: FiIcons.FiUser },
  { name: 'FiHome', icon: FiIcons.FiHome },
  { name: 'FiDollarSign', icon: FiIcons.FiDollarSign },
  { name: 'FiCoffee', icon: FiIcons.FiCoffee },
  { name: 'FiMusic', icon: FiIcons.FiMusic },
  { name: 'FiCamera', icon: FiIcons.FiCamera },
  { name: 'FiGamepad', icon: FiIcons.FiGamepad },
  { name: 'FiShoppingCart', icon: FiIcons.FiShoppingCart },
  { name: 'FiActivity', icon: FiIcons.FiActivity },
];

const availableColors = [
  '#3b82f6', '#22c55e', '#8b5cf6', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#84cc16',
  '#f97316', '#6366f1', '#14b8a6', '#f43f5e',
];

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ isOpen, onClose }) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: availableColors[0],
    icon: availableIcons[0].name,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      color: availableColors[0],
      icon: availableIcons[0].name,
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await addCategory(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? All tasks in this category will be uncategorized.')) {
      await deleteCategory(id);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find(i => i.name === iconName);
    return iconData?.icon || FiIcons.FiTag;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-dark-800 rounded-2xl shadow-2xl border border-dark-700 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-700">
              <h2 className="text-xl font-semibold text-white">Manage Categories</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                  <span className="text-sm">Add Category</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600">
                      <h3 className="text-lg font-medium text-white mb-4">
                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                      </h3>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-dark-300 mb-2">
                            Category Name
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter category name"
                            required
                          />
                        </div>

                        {/* Icon Selection */}
                        <div>
                          <label className="block text-sm font-medium text-dark-300 mb-2">
                            Icon
                          </label>
                          <div className="grid grid-cols-6 gap-2">
                            {availableIcons.map((iconData) => (
                              <button
                                key={iconData.name}
                                type="button"
                                onClick={() => setFormData({ ...formData, icon: iconData.name })}
                                className={`
                                  p-3 rounded-lg border-2 transition-all
                                  ${formData.icon === iconData.name
                                    ? 'border-primary-500 bg-primary-500/20'
                                    : 'border-dark-500 hover:border-dark-400 bg-dark-600'
                                  }
                                `}
                              >
                                <SafeIcon icon={iconData.icon} className="w-5 h-5 text-white" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Color Selection */}
                        <div>
                          <label className="block text-sm font-medium text-dark-300 mb-2">
                            Color
                          </label>
                          <div className="grid grid-cols-6 gap-2">
                            {availableColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setFormData({ ...formData, color })}
                                className={`
                                  w-8 h-8 rounded-lg border-2 transition-all
                                  ${formData.color === color
                                    ? 'border-white scale-110'
                                    : 'border-dark-500 hover:scale-105'
                                  }
                                `}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={resetForm}
                            className="flex-1 px-4 py-2 bg-dark-600 hover:bg-dark-500 text-dark-300 hover:text-white rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                          >
                            {editingCategory ? 'Update' : 'Create'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Categories List */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white">Your Categories</h3>
                {categories.length === 0 ? (
                  <div className="text-center py-8 text-dark-400">
                    No categories yet. Create your first category to get started!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <motion.div
                        key={category.id}
                        layout
                        className="bg-dark-700/50 border border-dark-600 rounded-xl p-4 hover:border-dark-500 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: category.color + '20', border: `2px solid ${category.color}` }}
                            >
                              <SafeIcon
                                icon={getIconComponent(category.icon)}
                                className="w-5 h-5"
                                style={{ color: category.color }}
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{category.name}</h4>
                              <p className="text-xs text-dark-400">
                                {category.color} • {category.icon}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-dark-400 hover:text-primary-400"
                            >
                              <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-dark-400 hover:text-red-400"
                            >
                              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategoryManager;