import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Task } from '@/types';
import toast from 'react-hot-toast';

interface DeletedTask extends Task {
  deletedAt: string;
}

export const useDeletedTasks = () => {
  const [deletedTasks, setDeletedTasks] = useState<DeletedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDeletedTasks();
    }
  }, [user]);

  const fetchDeletedTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks_dt2024')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;

      const formattedTasks: DeletedTask[] = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        categoryId: task.category_id,
        repeatType: task.repeat_type || 'none',
        repeatConfig: task.repeat_config,
        dueDate: task.due_date,
        dueTime: task.due_time || '09:00',
        completed: task.completed,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        deletedAt: task.deleted_at,
        userId: task.user_id,
        streakCount: task.streak_count || 0,
        lastCompletedDate: task.last_completed_date,
      }));

      setDeletedTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching deleted tasks:', error);
      toast.error('Failed to fetch deleted tasks');
    } finally {
      setLoading(false);
    }
  };

  const restoreTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks_dt2024')
        .update({ deleted_at: null })
        .eq('id', taskId);

      if (error) throw error;

      // Remove from deleted tasks list
      setDeletedTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task restored successfully!');
      return true;
    } catch (error) {
      console.error('Error restoring task:', error);
      toast.error('Failed to restore task');
      return false;
    }
  };

  const permanentlyDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks_dt2024')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      // Remove from deleted tasks list
      setDeletedTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task permanently deleted');
      return true;
    } catch (error) {
      console.error('Error permanently deleting task:', error);
      toast.error('Failed to permanently delete task');
      return false;
    }
  };

  const emptyTrash = async () => {
    try {
      const { error } = await supabase
        .from('tasks_dt2024')
        .delete()
        .not('deleted_at', 'is', null);

      if (error) throw error;

      setDeletedTasks([]);
      toast.success('All deleted tasks permanently removed');
      return true;
    } catch (error) {
      console.error('Error emptying trash:', error);
      toast.error('Failed to empty trash');
      return false;
    }
  };

  const bulkRestore = async (taskIds: string[]) => {
    try {
      const { error } = await supabase
        .from('tasks_dt2024')
        .update({ deleted_at: null })
        .in('id', taskIds);

      if (error) throw error;

      // Remove restored tasks from deleted tasks list
      setDeletedTasks(prev => prev.filter(task => !taskIds.includes(task.id)));
      toast.success(`${taskIds.length} task(s) restored successfully!`);
      return true;
    } catch (error) {
      console.error('Error bulk restoring tasks:', error);
      toast.error('Failed to restore selected tasks');
      return false;
    }
  };

  const bulkPermanentDelete = async (taskIds: string[]) => {
    try {
      const { error } = await supabase
        .from('tasks_dt2024')
        .delete()
        .in('id', taskIds);

      if (error) throw error;

      // Remove permanently deleted tasks from list
      setDeletedTasks(prev => prev.filter(task => !taskIds.includes(task.id)));
      toast.success(`${taskIds.length} task(s) permanently deleted`);
      return true;
    } catch (error) {
      console.error('Error bulk permanently deleting tasks:', error);
      toast.error('Failed to permanently delete selected tasks');
      return false;
    }
  };

  return {
    deletedTasks,
    loading,
    fetchDeletedTasks,
    restoreTask,
    permanentlyDeleteTask,
    emptyTrash,
    bulkRestore,
    bulkPermanentDelete,
  };
};