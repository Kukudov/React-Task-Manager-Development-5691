import { useMemo } from 'react';
import { Task, TaskStats } from '@/types';
import { format, isToday, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export const useTaskStats = (tasks: Task[]): TaskStats => {
  return useMemo(() => {
    const today = new Date();
    const todayTasks = tasks.filter(task => isToday(new Date(task.dueDate)));
    const completedToday = todayTasks.filter(task => task.completed);

    // Monthly data
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const monthlyData = daysInMonth.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(task => task.dueDate === dayStr && task.completed);
      return {
        date: dayStr,
        count: dayTasks.length,
      };
    });

    // Streaks
    const dailyTasks = tasks.filter(task => task.isDaily);
    const streaks = dailyTasks.map(task => ({
      taskId: task.id,
      count: task.streakCount || 0,
    }));

    return {
      totalTasks: todayTasks.length,
      completedTasks: completedToday.length,
      dailyProgress: todayTasks.length > 0 ? (completedToday.length / todayTasks.length) * 100 : 0,
      monthlyData,
      streaks,
    };
  }, [tasks]);
};