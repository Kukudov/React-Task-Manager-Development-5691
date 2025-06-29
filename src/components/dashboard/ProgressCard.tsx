import React from 'react';
import { motion } from 'framer-motion';
import { TaskStats } from '@/types';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTrendingUp, FiTarget, FiCalendar, FiAward } = FiIcons;

interface ProgressCardProps {
  stats: TaskStats;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ stats }) => {
  const progressPercentage = Math.round(stats.dailyProgress);
  const topStreak = Math.max(...stats.streaks.map(s => s.count), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Daily Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center">
            <SafeIcon icon={FiTarget} className="w-6 h-6 text-primary-400" />
          </div>
          <span className="text-2xl font-bold text-white">{progressPercentage}%</span>
        </div>
        
        <h3 className="text-sm font-medium text-dark-300 mb-2">Today's Progress</h3>
        <p className="text-xs text-dark-400">
          {stats.completedTasks} of {stats.totalTasks} tasks completed
        </p>
        
        {/* Progress Bar */}
        <div className="mt-4 bg-dark-700 rounded-full h-2">
          <motion.div
            className="bg-primary-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Total Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
            <SafeIcon icon={FiCalendar} className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-white">{stats.totalTasks}</span>
        </div>
        
        <h3 className="text-sm font-medium text-dark-300 mb-2">Today's Tasks</h3>
        <p className="text-xs text-dark-400">
          {stats.totalTasks === 0 ? 'No tasks scheduled' : 'Tasks for today'}
        </p>
      </motion.div>

      {/* Completed Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-success-600/20 rounded-xl flex items-center justify-center">
            <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-success-400" />
          </div>
          <span className="text-2xl font-bold text-white">{stats.completedTasks}</span>
        </div>
        
        <h3 className="text-sm font-medium text-dark-300 mb-2">Completed</h3>
        <p className="text-xs text-dark-400">
          Tasks finished today
        </p>
      </motion.div>

      {/* Best Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
            <SafeIcon icon={FiAward} className="w-6 h-6 text-orange-400" />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-2xl font-bold text-white">{topStreak}</span>
            {topStreak >= 5 && <span className="text-lg">🔥</span>}
          </div>
        </div>
        
        <h3 className="text-sm font-medium text-dark-300 mb-2">Best Streak</h3>
        <p className="text-xs text-dark-400">
          {topStreak === 0 ? 'Start your first streak!' : 'Consecutive days'}
        </p>
      </motion.div>
    </div>
  );
};

export default ProgressCard;