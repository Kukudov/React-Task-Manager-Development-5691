import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Task, RepeatType, RepeatConfig } from '@/types';
import { useCategories } from '../../hooks/useCategories';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiPlus, FiCalendar, FiType, FiFileText, FiRefreshCw, FiClock, FiRepeat, FiTag } = FiIcons;

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  editTask?: Task;
}

interface FormData {
  title: string;
  description: string;
  categoryId: string;
  dueDate: string;
  dueTime: string;
  repeatType: RepeatType;
  // Daily
  dailyInterval: number;
  // Weekly
  weeklyInterval: number;
  weekDays: number[];
  // Monthly
  monthlyType: 'date' | 'weekday';
  monthlyInterval: number;
  monthlyDate: number;
  monthlyWeekday: number;
  monthlyWeekdayOccurrence: number;
  // Hourly
  hourlyInterval: number;
  hourlyStartTime: string;
  hourlyEndTime: string;
  // Custom
  customEndDate: string;
}

const repeatOptions = [
  { value: 'none', label: 'No Repeat', icon: FiX },
  { value: 'daily', label: 'Daily', icon: FiRefreshCw },
  { value: 'weekly', label: 'Weekly', icon: FiCalendar },
  { value: 'monthly', label: 'Monthly', icon: FiCalendar },
  { value: 'hourly', label: 'Hourly', icon: FiClock },
];

const weekDayOptions = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const monthlyWeekdayOccurrences = [
  { value: 1, label: 'First' },
  { value: 2, label: 'Second' },
  { value: 3, label: 'Third' },
  { value: 4, label: 'Fourth' },
  { value: -1, label: 'Last' },
];

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSubmit, editTask }) => {
  const [loading, setLoading] = useState(false);
  const { categories } = useCategories();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<FormData>({
    defaultValues: editTask ? {
      title: editTask.title,
      description: editTask.description || '',
      categoryId: editTask.categoryId || '',
      dueDate: editTask.dueDate,
      dueTime: editTask.dueTime || '09:00',
      repeatType: editTask.repeatType,
      dailyInterval: editTask.repeatConfig?.dailyInterval || 1,
      weeklyInterval: editTask.repeatConfig?.weeklyInterval || 1,
      weekDays: editTask.repeatConfig?.weekDays || [],
      monthlyType: editTask.repeatConfig?.monthlyType || 'date',
      monthlyInterval: editTask.repeatConfig?.monthlyInterval || 1,
      monthlyDate: editTask.repeatConfig?.monthlyDate || 1,
      monthlyWeekday: editTask.repeatConfig?.monthlyWeekday || 1,
      monthlyWeekdayOccurrence: editTask.repeatConfig?.monthlyWeekdayOccurrence || 1,
      hourlyInterval: editTask.repeatConfig?.hourlyInterval || 1,
      hourlyStartTime: editTask.repeatConfig?.hourlyStartTime || '09:00',
      hourlyEndTime: editTask.repeatConfig?.hourlyEndTime || '17:00',
      customEndDate: editTask.repeatConfig?.customEndDate || '',
    } : {
      title: '',
      description: '',
      categoryId: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      dueTime: '09:00',
      repeatType: 'none',
      dailyInterval: 1,
      weeklyInterval: 1,
      weekDays: [],
      monthlyType: 'date',
      monthlyInterval: 1,
      monthlyDate: 1,
      monthlyWeekday: 1,
      monthlyWeekdayOccurrence: 1,
      hourlyInterval: 1,
      hourlyStartTime: '09:00',
      hourlyEndTime: '17:00',
      customEndDate: '',
    },
  });

  const repeatType = watch('repeatType');
  const monthlyType = watch('monthlyType');
  const weekDays = watch('weekDays');

  const handleFormSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const repeatConfig: RepeatConfig = {};

      // Build repeat configuration based on type
      switch (data.repeatType) {
        case 'daily':
          repeatConfig.dailyInterval = data.dailyInterval;
          break;
        case 'weekly':
          repeatConfig.weeklyInterval = data.weeklyInterval;
          repeatConfig.weekDays = data.weekDays;
          break;
        case 'monthly':
          repeatConfig.monthlyType = data.monthlyType;
          repeatConfig.monthlyInterval = data.monthlyInterval;
          if (data.monthlyType === 'date') {
            repeatConfig.monthlyDate = data.monthlyDate;
          } else {
            repeatConfig.monthlyWeekday = data.monthlyWeekday;
            repeatConfig.monthlyWeekdayOccurrence = data.monthlyWeekdayOccurrence;
          }
          break;
        case 'hourly':
          repeatConfig.hourlyInterval = data.hourlyInterval;
          repeatConfig.hourlyStartTime = data.hourlyStartTime;
          repeatConfig.hourlyEndTime = data.hourlyEndTime;
          break;
      }

      if (data.customEndDate) {
        repeatConfig.customEndDate = data.customEndDate;
      }

      await onSubmit({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId || undefined,
        dueDate: data.dueDate,
        dueTime: data.dueTime,
        repeatType: data.repeatType,
        repeatConfig: data.repeatType === 'none' ? undefined : repeatConfig,
        completed: editTask?.completed || false,
      });
      
      reset();
      onClose();
    } catch (error) {
      console.error('Form submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleWeekDay = (day: number) => {
    const currentDays = getValues('weekDays');
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    setValue('weekDays', newDays);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleClose}
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
              <h2 className="text-xl font-semibold text-white">
                {editTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Task Title
                </label>
                <div className="relative">
                  <SafeIcon icon={FiType} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full pl-12 pr-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Enter task title"
                  />
                </div>
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Category (Optional)
                </label>
                <div className="relative">
                  <SafeIcon icon={FiTag} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
                  <select
                    {...register('categoryId')}
                    className="w-full pl-12 pr-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Description (Optional)
                </label>
                <div className="relative">
                  <SafeIcon icon={FiFileText} className="absolute left-3 top-3 text-dark-400 w-5 h-5" />
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full pl-12 pr-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder="Add a description..."
                  />
                </div>
              </div>

              {/* Due Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Due Date
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiCalendar} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
                    <input
                      type="date"
                      {...register('dueDate', { required: 'Due date is required' })}
                      className="w-full pl-12 pr-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.dueDate && (
                    <p className="mt-1 text-sm text-red-400">{errors.dueDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Due Time
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiClock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
                    <input
                      type="time"
                      {...register('dueTime')}
                      className="w-full pl-12 pr-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Repeat Type */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-3">
                  Repeat Options
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {repeatOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setValue('repeatType', option.value as RepeatType)}
                      className={`
                        flex flex-col items-center p-3 rounded-lg transition-all duration-200
                        ${repeatType === option.value 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-dark-700/50 hover:bg-dark-600/50 text-dark-300 hover:text-white'
                        }
                      `}
                    >
                      <SafeIcon icon={option.icon} className="w-5 h-5 mb-1" />
                      <span className="text-xs font-medium">{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Repeat Configuration */}
              <AnimatePresence>
                {repeatType === 'daily' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4"
                  >
                    <h4 className="text-primary-300 font-medium mb-3">Daily Repeat Settings</h4>
                    <div className="flex items-center space-x-3">
                      <label className="text-sm text-dark-300">Repeat every</label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        {...register('dailyInterval')}
                        className="w-20 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-center"
                      />
                      <label className="text-sm text-dark-300">day(s)</label>
                    </div>
                  </motion.div>
                )}

                {repeatType === 'weekly' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
                  >
                    <h4 className="text-blue-300 font-medium mb-3">Weekly Repeat Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <label className="text-sm text-dark-300">Repeat every</label>
                        <input
                          type="number"
                          min="1"
                          max="52"
                          {...register('weeklyInterval')}
                          className="w-20 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-center"
                        />
                        <label className="text-sm text-dark-300">week(s)</label>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-dark-300 mb-2">On these days:</label>
                        <div className="flex flex-wrap gap-2">
                          {weekDayOptions.map((day) => (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => toggleWeekDay(day.value)}
                              className={`
                                px-3 py-2 rounded-lg text-xs font-medium transition-colors
                                ${weekDays.includes(day.value)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                }
                              `}
                            >
                              {day.short}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {repeatType === 'monthly' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4"
                  >
                    <h4 className="text-purple-300 font-medium mb-3">Monthly Repeat Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <label className="text-sm text-dark-300">Repeat every</label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          {...register('monthlyInterval')}
                          className="w-20 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-center"
                        />
                        <label className="text-sm text-dark-300">month(s)</label>
                      </div>

                      <div>
                        <label className="block text-sm text-dark-300 mb-2">Repeat by:</label>
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              value="date"
                              {...register('monthlyType')}
                              className="text-purple-600"
                            />
                            <span className="text-sm text-dark-300">Day of month</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              value="weekday"
                              {...register('monthlyType')}
                              className="text-purple-600"
                            />
                            <span className="text-sm text-dark-300">Day of week</span>
                          </label>
                        </div>
                      </div>

                      {monthlyType === 'date' ? (
                        <div className="flex items-center space-x-3">
                          <label className="text-sm text-dark-300">On the</label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            {...register('monthlyDate')}
                            className="w-20 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-center"
                          />
                          <label className="text-sm text-dark-300">day of the month</label>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3 flex-wrap">
                          <label className="text-sm text-dark-300">On the</label>
                          <select
                            {...register('monthlyWeekdayOccurrence')}
                            className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                          >
                            {monthlyWeekdayOccurrences.map((occ) => (
                              <option key={occ.value} value={occ.value}>
                                {occ.label}
                              </option>
                            ))}
                          </select>
                          <select
                            {...register('monthlyWeekday')}
                            className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                          >
                            {weekDayOptions.map((day) => (
                              <option key={day.value} value={day.value}>
                                {day.label}
                              </option>
                            ))}
                          </select>
                          <label className="text-sm text-dark-300">of the month</label>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {repeatType === 'hourly' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4"
                  >
                    <h4 className="text-orange-300 font-medium mb-3">Hourly Repeat Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <label className="text-sm text-dark-300">Repeat every</label>
                        <input
                          type="number"
                          min="1"
                          max="24"
                          {...register('hourlyInterval')}
                          className="w-20 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-center"
                        />
                        <label className="text-sm text-dark-300">hour(s)</label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-dark-300 mb-2">Start Time</label>
                          <input
                            type="time"
                            {...register('hourlyStartTime')}
                            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-dark-300 mb-2">End Time</label>
                          <input
                            type="time"
                            {...register('hourlyEndTime')}
                            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {repeatType !== 'none' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-dark-700/30 border border-dark-600/50 rounded-xl p-4"
                  >
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      {...register('customEndDate')}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                      placeholder="Leave empty for no end date"
                    />
                    <p className="text-xs text-dark-400 mt-1">
                      Leave empty to repeat indefinitely
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <SafeIcon icon={editTask ? FiType : FiPlus} className="w-5 h-5" />
                      <span>{editTask ? 'Update Task' : 'Add Task'}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskForm;