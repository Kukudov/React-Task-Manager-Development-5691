import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  format,
  isToday,
  isTomorrow,
  isAfter,
  startOfDay,
  addDays,
  addHours,
  addWeeks,
  addMonths,
  getDay,
  setDay,
  getDate,
  setDate,
  startOfMonth,
  endOfMonth,
  isWithinInterval
} from 'date-fns';
import toast from 'react-hot-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTasks();
      processRepeatingTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      // Only fetch non-deleted tasks
      const { data, error } = await supabase
        .from('tasks_dt2024')
        .select('*')
        .is('deleted_at', null)
        .order('due_date', { ascending: true });

      if (error) throw error;

      const formattedTasks = data.map(task => ({
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
        userId: task.user_id,
        streakCount: task.streak_count || 0,
        lastCompletedDate: task.last_completed_date,
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const getNextOccurrence = (task, fromDate = new Date()) => {
    if (!task.repeatConfig) return null;

    const config = task.repeatConfig;
    let nextDate = new Date(fromDate);

    switch (task.repeatType) {
      case 'daily':
        nextDate = addDays(nextDate, config.dailyInterval || 1);
        break;
      case 'weekly':
        if (config.weekDays && config.weekDays.length > 0) {
          const currentDay = getDay(nextDate);
          const sortedDays = [...config.weekDays].sort();
          
          // Find next occurring day
          let nextDay = sortedDays.find(day => day > currentDay);
          if (!nextDay) {
            // If no day this week, get first day of next interval
            nextDay = sortedDays[0];
            nextDate = addWeeks(nextDate, config.weeklyInterval || 1);
          }
          nextDate = setDay(nextDate, nextDay, { weekStartsOn: 0 });
        } else {
          nextDate = addWeeks(nextDate, config.weeklyInterval || 1);
        }
        break;
      case 'monthly':
        if (config.monthlyType === 'date') {
          // By specific date of month
          nextDate = addMonths(nextDate, config.monthlyInterval || 1);
          nextDate = setDate(nextDate, config.monthlyDate || 1);
        } else {
          // By weekday occurrence (e.g., 2nd Monday)
          const targetWeekday = config.monthlyWeekday || 1;
          const occurrence = config.monthlyWeekdayOccurrence || 1;
          nextDate = addMonths(nextDate, config.monthlyInterval || 1);
          
          const monthStart = startOfMonth(nextDate);
          const monthEnd = endOfMonth(nextDate);
          
          if (occurrence === -1) {
            // Last occurrence
            let lastOccurrence = monthEnd;
            while (getDay(lastOccurrence) !== targetWeekday) {
              lastOccurrence = addDays(lastOccurrence, -1);
            }
            nextDate = lastOccurrence;
          } else {
            // Nth occurrence
            let occurrenceDate = monthStart;
            let count = 0;
            while (isWithinInterval(occurrenceDate, { start: monthStart, end: monthEnd })) {
              if (getDay(occurrenceDate) === targetWeekday) {
                count++;
                if (count === occurrence) {
                  nextDate = occurrenceDate;
                  break;
                }
              }
              occurrenceDate = addDays(occurrenceDate, 1);
            }
          }
        }
        break;
      case 'hourly':
        nextDate = addHours(nextDate, config.hourlyInterval || 1);
        break;
      default:
        return null;
    }

    // Check if we've passed the end date
    if (config.customEndDate && nextDate > new Date(config.customEndDate)) {
      return null;
    }

    return nextDate;
  };

  const processRepeatingTasks = async () => {
    try {
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');

      // Get all repeating tasks that might need new instances (non-deleted)
      const { data: repeatingTasks, error } = await supabase
        .from('tasks_dt2024')
        .select('*')
        .neq('repeat_type', 'none')
        .eq('completed', true)
        .is('deleted_at', null)
        .lt('due_date', today);

      if (error) throw error;

      for (const taskData of repeatingTasks) {
        const task = {
          id: taskData.id,
          title: taskData.title,
          description: taskData.description,
          categoryId: taskData.category_id,
          repeatType: taskData.repeat_type,
          repeatConfig: taskData.repeat_config,
          dueDate: taskData.due_date,
          dueTime: taskData.due_time || '09:00',
          completed: taskData.completed,
          createdAt: taskData.created_at,
          updatedAt: taskData.updated_at,
          userId: taskData.user_id,
          streakCount: taskData.streak_count || 0,
          lastCompletedDate: taskData.last_completed_date,
        };

        const nextOccurrence = getNextOccurrence(task, new Date(task.dueDate));
        if (!nextOccurrence) continue;

        const nextDateStr = format(nextOccurrence, 'yyyy-MM-dd');
        const nextTimeStr = task.dueTime || '09:00';

        // Check if instance already exists
        const { data: existingTask } = await supabase
          .from('tasks_dt2024')
          .select('id')
          .eq('title', task.title)
          .eq('due_date', nextDateStr)
          .eq('due_time', nextTimeStr)
          .eq('repeat_type', task.repeatType)
          .is('deleted_at', null)
          .single();

        if (!existingTask) {
          // Create new instance
          await supabase.from('tasks_dt2024').insert({
            title: task.title,
            description: task.description,
            category_id: task.categoryId,
            repeat_type: task.repeatType,
            repeat_config: task.repeatConfig,
            due_date: nextDateStr,
            due_time: nextTimeStr,
            completed: false,
            user_id: task.userId,
            streak_count: task.streakCount || 0,
          });
        }
      }

      // Refresh tasks after processing
      fetchTasks();
    } catch (error) {
      console.error('Error processing repeating tasks:', error);
    }
  };

  const addTask = async (taskData) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Prepare insert data with proper null handling
      const insertData = {
        title: taskData.title,
        description: taskData.description || null,
        category_id: taskData.categoryId || null,
        repeat_type: taskData.repeatType || 'none',
        repeat_config: taskData.repeatConfig || null,
        due_date: taskData.dueDate,
        due_time: taskData.dueTime || '09:00',
        completed: taskData.completed || false,
        user_id: user.id,
        streak_count: 0,
      };

      const { data, error } = await supabase
        .from('tasks_dt2024')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      const newTask = {
        id: data.id,
        title: data.title,
        description: data.description,
        categoryId: data.category_id,
        repeatType: data.repeat_type,
        repeatConfig: data.repeat_config,
        dueDate: data.due_date,
        dueTime: data.due_time,
        completed: data.completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id,
        streakCount: data.streak_count || 0,
        lastCompletedDate: data.last_completed_date,
      };

      setTasks(prev => [...prev, newTask]);
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task: ' + error.message);
      throw error;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) throw new Error('Task not found');

      // Prepare update data with proper null handling and column mapping
      const updateData = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
      if (updates.repeatType !== undefined) updateData.repeat_type = updates.repeatType;
      if (updates.repeatConfig !== undefined) updateData.repeat_config = updates.repeatConfig;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
      if (updates.dueTime !== undefined) updateData.due_time = updates.dueTime;

      // Handle completion with auto-rescheduling for repeating tasks
      if (updates.completed !== undefined) {
        const isRepeatingTask = task.repeatType && task.repeatType !== 'none';
        const isCompletingTask = updates.completed && !task.completed;

        if (isRepeatingTask && isCompletingTask) {
          // Calculate next occurrence
          const nextOccurrence = getNextOccurrence(task);
          if (nextOccurrence) {
            const nextDateStr = format(nextOccurrence, 'yyyy-MM-dd');

            // Check if next instance already exists
            const { data: existingNextTask } = await supabase
              .from('tasks_dt2024')
              .select('id')
              .eq('title', task.title)
              .eq('due_date', nextDateStr)
              .eq('due_time', task.dueTime)
              .eq('repeat_type', task.repeatType)
              .is('deleted_at', null)
              .single();

            // Update current task's due date to next occurrence if no future instance exists
            if (!existingNextTask) {
              updateData.due_date = nextDateStr;
              updateData.completed = false; // Reset completion for next occurrence

              // Handle streak logic and completion tracking
              const today = format(new Date(), 'yyyy-MM-dd');
              if (isToday(new Date(task.dueDate))) {
                const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
                const wasCompletedYesterday = task.lastCompletedDate === yesterday;
                updateData.streak_count = wasCompletedYesterday 
                  ? (task.streakCount || 0) + 1 
                  : 1;
                updateData.last_completed_date = today;
              }
              toast.success('Task completed! 🎉 Scheduled for next occurrence.');
            } else {
              // If next instance exists, just mark current as completed
              updateData.completed = updates.completed;
              
              // Handle streak logic and completion tracking
              const today = format(new Date(), 'yyyy-MM-dd');
              if (isToday(new Date(task.dueDate))) {
                const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
                const wasCompletedYesterday = task.lastCompletedDate === yesterday;
                updateData.streak_count = wasCompletedYesterday 
                  ? (task.streakCount || 0) + 1 
                  : 1;
                updateData.last_completed_date = today;
              }
              toast.success('Task completed! 🎉');
            }
          } else {
            // No next occurrence (reached end date), just mark as completed
            updateData.completed = updates.completed;
            
            // Still track completion date for charts
            if (updates.completed) {
              const today = format(new Date(), 'yyyy-MM-dd');
              updateData.last_completed_date = today;
            }
            toast.success('Task completed! 🎉');
          }
        } else {
          // Non-repeating task or uncompleting a task
          updateData.completed = updates.completed;
          if (updates.completed) {
            // Track completion date for non-repeating tasks too
            const today = format(new Date(), 'yyyy-MM-dd');
            updateData.last_completed_date = today;
            toast.success('Task completed! 🎉');
          } else {
            // If uncompleting, clear the completion date
            updateData.last_completed_date = null;
            toast.success('Task marked incomplete');
          }
        }
      }

      console.log('Updating task with data:', updateData);

      const { error } = await supabase
        .from('tasks_dt2024')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      // Update local state
      setTasks(prev =>
        prev.map(task =>
          task.id === id
            ? {
                ...task,
                ...updates,
                dueDate: updateData.due_date || task.dueDate,
                completed: updateData.completed !== undefined ? updateData.completed : task.completed,
                streakCount: updateData.streak_count || task.streakCount,
                lastCompletedDate: updateData.last_completed_date !== undefined 
                  ? updateData.last_completed_date 
                  : task.lastCompletedDate,
              }
            : task
        )
      );

    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task: ' + error.message);
      throw error;
    }
  };

  // Soft delete task (move to trash)
  const deleteTask = async (id) => {
    try {
      const { error } = await supabase
        .from('tasks_dt2024')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Remove from current tasks list
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task moved to trash');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      throw error;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    const today = startOfDay(new Date());

    // Filter by time/status
    let timeMatch = true;
    switch (filter) {
      case 'all':
        // IMPORTANT: Hide completed tasks from "All Tasks" view
        timeMatch = !task.completed;
        break;
      case 'today':
        timeMatch = isToday(taskDate) && !task.completed;
        break;
      case 'tomorrow':
        timeMatch = isTomorrow(taskDate) && !task.completed;
        break;
      case 'upcoming':
        timeMatch = isAfter(taskDate, today) && !isToday(taskDate) && !isTomorrow(taskDate) && !task.completed;
        break;
      case 'completed':
        timeMatch = task.completed;
        break;
      case 'incomplete':
        timeMatch = !task.completed;
        break;
      default:
        timeMatch = true;
    }

    // Filter by category
    let categoryMatch = true;
    if (categoryFilter !== null) {
      if (categoryFilter === 'uncategorized') {
        categoryMatch = !task.categoryId;
      } else {
        categoryMatch = task.categoryId === categoryFilter;
      }
    }

    return timeMatch && categoryMatch;
  });

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    loading,
    filter,
    setFilter,
    categoryFilter,
    setCategoryFilter,
    addTask,
    updateTask,
    deleteTask,
    refreshTasks: fetchTasks,
  };
};