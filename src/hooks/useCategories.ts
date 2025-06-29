import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const defaultCategories = [
  { name: 'Work', color: '#3b82f6', icon: 'FiBriefcase' },
  { name: 'Health', color: '#22c55e', icon: 'FiHeart' },
  { name: 'Learning', color: '#8b5cf6', icon: 'FiBook' },
  { name: 'Personal', color: '#f59e0b', icon: 'FiUser' },
  { name: 'Home', color: '#ef4444', icon: 'FiHome' },
  { name: 'Finance', color: '#06b6d4', icon: 'FiDollarSign' },
];

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories_dt2024')
        .select('*')
        .order('name');

      if (error) throw error;

      const formattedCategories: Category[] = data.map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        userId: cat.user_id,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at,
      }));

      setCategories(formattedCategories);

      // Create default categories if none exist
      if (formattedCategories.length === 0) {
        await createDefaultCategories();
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCategories = async () => {
    try {
      if (!user?.id) return;

      const categoriesToCreate = defaultCategories.map(cat => ({
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('categories_dt2024')
        .insert(categoriesToCreate)
        .select();

      if (error) throw error;

      const newCategories: Category[] = data.map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        userId: cat.user_id,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at,
      }));

      setCategories(newCategories);
    } catch (error) {
      console.error('Error creating default categories:', error);
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories_dt2024')
        .insert({
          name: categoryData.name,
          color: categoryData.color,
          icon: categoryData.icon,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newCategory: Category = {
        id: data.id,
        name: data.name,
        color: data.color,
        icon: data.icon,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setCategories(prev => [...prev, newCategory]);
      toast.success('Category added successfully!');
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.icon !== undefined) updateData.icon = updates.icon;

      const { error } = await supabase
        .from('categories_dt2024')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setCategories(prev =>
        prev.map(cat =>
          cat.id === id ? { ...cat, ...updates } : cat
        )
      );

      toast.success('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // First, update all tasks with this category to have no category
      await supabase
        .from('tasks_dt2024')
        .update({ category_id: null })
        .eq('category_id', id);

      // Then delete the category
      const { error } = await supabase
        .from('categories_dt2024')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      throw error;
    }
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: fetchCategories,
  };
};