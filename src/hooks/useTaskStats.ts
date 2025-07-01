import {useMemo} from 'react';
import {Task,TaskStats} from '@/types';
import {format,isToday,startOfMonth,endOfMonth,eachDayOfInterval,isValid} from 'date-fns';

export const useTaskStats=(tasks: Task[]): TaskStats=> {
  return useMemo(()=> {
    const today=new Date();
    const todayTasks=tasks.filter(task=> isToday(new Date(task.dueDate)));
    const completedToday=todayTasks.filter(task=> task.completed);

    // Monthly data - track actual completion dates
    const monthStart=startOfMonth(today);
    const monthEnd=endOfMonth(today);
    const daysInMonth=eachDayOfInterval({start: monthStart,end: monthEnd});

    const monthlyData=daysInMonth.map(day=> {
      const dayStr=format(day,'yyyy-MM-dd');
      
      // Count tasks completed on this specific day
      const dayCompletions=tasks.filter(task=> {
        // Check if task was completed and has a completion date
        if (!task.completed) return false;
        
        // Use lastCompletedDate if available, otherwise fall back to updatedAt or dueDate
        let completionDate: string | undefined;
        
        if (task.lastCompletedDate) {
          completionDate=task.lastCompletedDate;
        } else if (task.updatedAt && task.completed) {
          // If task is completed and we have updatedAt, use that
          const updatedDate=new Date(task.updatedAt);
          if (isValid(updatedDate)) {
            completionDate=format(updatedDate,'yyyy-MM-dd');
          }
        } else if (task.completed && task.dueDate===dayStr) {
          // Fallback: if task is completed and due date matches
          completionDate=dayStr;
        }
        
        return completionDate===dayStr;
      });

      return {
        date: dayStr,
        count: dayCompletions.length,
      };
    });

    // Streaks for repeating tasks
    const repeatingTasks=tasks.filter(task=> task.repeatType && task.repeatType !=='none');
    const streaks=repeatingTasks.map(task=> ({
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
  },[tasks]);
};