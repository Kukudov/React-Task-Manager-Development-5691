import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiEdit3, FiTrash2, FiCalendar, FiRefreshCw, FiTarget } = FiIcons;

const TaskItem = ({ task, onToggle, onEdit, onDelete }) => {
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

  const handleToggle = () => {
    onToggle(task.id, !task.completed);
  };

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
              <div className="flex items-center space-x-4 mt-3">
                <div className={`flex items-center space-x-1 text-xs ${getDateColor()}`}>
                  <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                  <span>{getDateDisplay()}</span>
                </div>

                {task.isDaily && (
                  <div className="flex items-center space-x-1 text-xs text-primary-400">
                    <SafeIcon icon={FiRefreshCw} className="w-3 h-3" />
                    <span>Daily</span>
                  </div>
                )}

                {task.isDaily && task.streakCount && task.streakCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center space-x-1 text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full"
                  >
                    <SafeIcon icon={FiTarget} className="w-3 h-3" />
                    <span>{task.streakCount} day{task.streakCount > 1 ? 's' : ''}</span>
                    {task.streakCount >= 5 && <span>🔥</span>}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ 
                opacity: isHovered ? 1 : 0,
                x: isHovered ? 0 : 10
              }}
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