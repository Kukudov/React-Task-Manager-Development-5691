import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Task, Category } from '@/types';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiEdit3, FiTrash2, FiCalendar, FiRefreshCw, FiTarget, FiClock, FiRepeat, FiTag } = FiIcons;

interface TaskItemProps {
  task: Task;
  category?: Category;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

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

const TaskItem: React.FC<TaskItemProps> = ({ task, category, onToggle, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getDateDisplay = () => {
    const date = new Date(task.dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd');
  };

  const getDateColor = () => {
    const date = new Date(task.dueDate);
    if (isPast(date) && !task.completed) return 'text-red-400';
    if (isToday(date)) return 'text-primary-400';
    return 'text-dark-400';
  };

  const getRepeatDisplay = () => {
    if (task.repeatType === 'none') return null;

    const config = task.repeatConfig;
    if (!config) return null;

    switch (task.repeatType) {
      case 'daily':
        return config.dailyInterval === 1 
          ? 'Daily' 
          : `Every ${config.dailyInterval} days`;
      
      case 'weekly':
        if (config.weekDays && config.weekDays.length > 0) {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const selectedDays = config.weekDays.map(d => days[d]).join(', ');
          const prefix = config.weeklyInterval === 1 ? 'Weekly' : `Every ${config.weeklyInterval} weeks`;
          return `${prefix} on ${selectedDays}`;
        }
        return config.weeklyInterval === 1 ? 'Weekly' : `Every ${config.weeklyInterval} weeks`;
      
      case 'monthly':
        const monthPrefix = config.monthlyInterval === 1 ? 'Monthly' : `Every ${config.monthlyInterval} months`;
        if (config.monthlyType === 'date') {
          return `${monthPrefix} on day ${config.monthlyDate}`;
        } else {
          const occurrences = ['', '1st', '2nd', '3rd', '4th', '', '', '', '', '', 'Last'];
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const occurrence = config.monthlyWeekdayOccurrence === -1 ? 'Last' : occurrences[config.monthlyWeekdayOccurrence || 1];
          const day = days[config.monthlyWeekday || 0];
          return `${monthPrefix} on ${occurrence} ${day}`;
        }
      
      case 'hourly':
        const hourPrefix = config.hourlyInterval === 1 ? 'Every hour' : `Every ${config.hourlyInterval} hours`;
        if (config.hourlyStartTime && config.hourlyEndTime) {
          return `${hourPrefix} (${config.hourlyStartTime}-${config.hourlyEndTime})`;
        }
        return hourPrefix;
      
      default:
        return 'Repeats';
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find(i => i.name === iconName);
    return iconData?.icon || FiTag;
  };

  const handleToggle = () => {
    onToggle(task.id, !task.completed);
  };

  const repeatDisplay = getRepeatDisplay();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        bg-dark-800/50 backdrop-blur-sm border rounded-xl p-4 transition-all duration-200
        ${task.completed 
          ? 'border-success-500/30 bg-success-500/5' 
          : 'border-dark-700 hover:border-dark-600'
        }
      `}
    >
      <div className="flex items-start space-x-4">
        {/* Interactive Checkbox */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggle}
          className={`
            w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 cursor-pointer
            ${task.completed 
              ? 'bg-success-500 border-success-500 text-white shadow-lg' 
              : 'border-dark-500 hover:border-primary-500 hover:bg-primary-500/10 hover:shadow-md'
            }
          `}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <SafeIcon icon={FiCheck} className="w-4 h-4" />
            </motion.div>
          )}
        </motion.button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Category Badge */}
              {category && (
                <div className="flex items-center space-x-1 mb-2">
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center"
                    style={{ backgroundColor: category.color + '40', border: `1px solid ${category.color}` }}
                  >
                    <SafeIcon
                      icon={getIconComponent(category.icon)}
                      className="w-2.5 h-2.5"
                      style={{ color: category.color }}
                    />
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: category.color }}
                  >
                    {category.name}
                  </span>
                </div>
              )}

              <h3
                className={`
                  font-medium transition-all duration-200 cursor-pointer
                  ${task.completed 
                    ? 'text-dark-400 line-through' 
                    : 'text-white hover:text-primary-300'
                  }
                `}
                onClick={handleToggle}
              >
                {task.title}
              </h3>
              
              {task.description && (
                <p
                  className={`
                    text-sm mt-1 transition-all duration-200
                    ${task.completed 
                      ? 'text-dark-500 line-through' 
                      : 'text-dark-300'
                    }
                  `}
                >
                  {task.description}
                </p>
              )}

              {/* Task Meta */}
              <div className="flex items-center space-x-4 mt-3 flex-wrap gap-2">
                {/* Date */}
                <div className={`flex items-center space-x-1 text-xs ${getDateColor()}`}>
                  <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                  <span>{getDateDisplay()}</span>
                  {task.dueTime && (
                    <>
                      <SafeIcon icon={FiClock} className="w-3 h-3 ml-2" />
                      <span>{task.dueTime}</span>
                    </>
                  )}
                </div>

                {/* Repeat Info */}
                {repeatDisplay && (
                  <div className="flex items-center space-x-1 text-xs text-primary-400">
                    <SafeIcon icon={FiRepeat} className="w-3 h-3" />
                    <span>{repeatDisplay}</span>
                  </div>
                )}

                {/* Streak Count */}
                {task.repeatType !== 'none' && task.streakCount && task.streakCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center space-x-1 text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full"
                  >
                    <SafeIcon icon={FiTarget} className="w-3 h-3" />
                    <span>{task.streakCount} streak</span>
                    {task.streakCount >= 5 && <span>🔥</span>}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
              className="flex items-center space-x-2"
            >
              <button
                onClick={() => onEdit(task)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-primary-400"
                aria-label="Edit task"
              >
                <SafeIcon icon={FiEdit3} className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-red-400"
                aria-label="Delete task"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskItem;