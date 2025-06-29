export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  repeatType: RepeatType;
  repeatConfig?: RepeatConfig;
  dueDate: string;
  dueTime?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  streakCount?: number;
  lastCompletedDate?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  dailyProgress: number;
  monthlyData: Array<{
    date: string;
    count: number;
  }>;
  streaks: Array<{
    taskId: string;
    count: number;
  }>;
  categoryStats: Array<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    totalTasks: number;
    completedTasks: number;
  }>;
}

export type FilterType = 'all' | 'today' | 'tomorrow' | 'upcoming' | 'completed' | 'incomplete';
export type ViewMode = 'list' | 'calendar';

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'hourly' | 'custom';

export interface RepeatConfig {
  // Daily
  dailyInterval?: number;

  // Weekly
  weeklyInterval?: number;
  weekDays?: number[];

  // Monthly
  monthlyType?: 'date' | 'weekday';
  monthlyInterval?: number;
  monthlyDate?: number;
  monthlyWeekday?: number;
  monthlyWeekdayOccurrence?: number;

  // Hourly
  hourlyInterval?: number;
  hourlyStartTime?: string;
  hourlyEndTime?: string;

  // Custom
  customDates?: string[];
  customEndDate?: string;
}

export interface RepeatOption {
  value: RepeatType;
  label: string;
  icon: any;
}

export interface WeekdayOption {
  value: number;
  label: string;
  short: string;
}

export interface MonthlyWeekdayOption {
  value: number;
  label: string;
}