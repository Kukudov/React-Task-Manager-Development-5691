import React from 'react';
import { motion } from 'framer-motion';
import { FilterType } from '@/types';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiList, FiCalendar, FiClock, FiArrowRight, FiCheck, FiX } = FiIcons;

interface TaskFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  taskCounts: Record<FilterType, number>;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ 
  activeFilter, 
  onFilterChange, 
  taskCounts 
}) => {
  const filters: Array<{ key: FilterType; label: string; icon: any; color: string }> = [
    { key: 'all', label: 'All Tasks', icon: FiList, color: 'text-dark-400' },
    { key: 'today', label: 'Today', icon: FiCalendar, color: 'text-primary-400' },
    { key: 'tomorrow', label: 'Tomorrow', icon: FiClock, color: 'text-blue-400' },
    { key: 'upcoming', label: 'Upcoming', icon: FiArrowRight, color: 'text-purple-400' },
    { key: 'completed', label: 'Completed', icon: FiCheck, color: 'text-success-400' },
    { key: 'incomplete', label: 'Incomplete', icon: FiX, color: 'text-orange-400' },
  ];

  return (
    <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-4">
      <h3 className="text-sm font-medium text-dark-300 mb-3">Filter Tasks</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {filters.map((filter) => (
          <motion.button
            key={filter.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilterChange(filter.key)}
            className={`
              flex items-center justify-between p-3 rounded-lg transition-all duration-200
              ${activeFilter === filter.key
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700/50 hover:bg-dark-600/50 text-dark-300 hover:text-white'
              }
            `}
          >
            <div className="flex items-center space-x-2">
              <SafeIcon 
                icon={filter.icon} 
                className={`w-4 h-4 ${
                  activeFilter === filter.key ? 'text-white' : filter.color
                }`} 
              />
              <span className="text-sm font-medium">{filter.label}</span>
            </div>
            
            {taskCounts[filter.key] > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`
                  text-xs px-2 py-1 rounded-full font-medium
                  ${activeFilter === filter.key
                    ? 'bg-white/20 text-white'
                    : 'bg-dark-600 text-dark-300'
                  }
                `}
              >
                {taskCounts[filter.key]}
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TaskFilters;