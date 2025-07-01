import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { useDeletedTasks } from '../../hooks/useDeletedTasks';
import { useCategories } from '../../hooks/useCategories';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {
  FiTrash2,
  FiRotateCcw,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiRefreshCw,
  FiCalendar,
  FiClock,
  FiTag,
  FiInbox,
  FiCheckSquare
} = FiIcons;

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

const DeletedTasksView = ({ isOpen, onClose }) => {
  const {
    deletedTasks,
    loading,
    restoreTask,
    permanentlyDeleteTask,
    emptyTrash,
    bulkRestore,
    bulkPermanentDelete,
    fetchDeletedTasks
  } = useDeletedTasks();
  
  const { categories } = useCategories();
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const getIconComponent = (iconName) => {
    const iconData = availableIcons.find(i => i.name === iconName);
    return iconData?.icon || FiTag;
  };

  const getTaskCategory = (task) => {
    return categories.find(cat => cat.id === task.categoryId);
  };

  const handleSelectTask = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === deletedTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(deletedTasks.map(task => task.id)));
    }
  };

  const handleRestore = async (taskId) => {
    setActionLoading(true);
    await restoreTask(taskId);
    setActionLoading(false);
  };

  const handlePermanentDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to permanently delete this task? This action cannot be undone.')) {
      setActionLoading(true);
      await permanentlyDeleteTask(taskId);
      setActionLoading(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedTasks.size === 0) return;
    setActionLoading(true);
    const success = await bulkRestore(Array.from(selectedTasks));
    if (success) {
      setSelectedTasks(new Set());
    }
    setActionLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return;
    if (window.confirm(`Are you sure you want to permanently delete ${selectedTasks.size} task(s)? This action cannot be undone.`)) {
      setActionLoading(true);
      const success = await bulkPermanentDelete(Array.from(selectedTasks));
      if (success) {
        setSelectedTasks(new Set());
      }
      setActionLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    setActionLoading(true);
    const success = await emptyTrash();
    if (success) {
      setSelectedTasks(new Set());
    }
    setActionLoading(false);
    setShowEmptyConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-6xl bg-dark-800 rounded-2xl shadow-2xl border border-dark-700 max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
                <SafeIcon icon={FiTrash2} className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Deleted Tasks</h2>
                <p className="text-sm text-dark-400">
                  {deletedTasks.length} deleted task{deletedTasks.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Bulk Actions */}
              {selectedTasks.size > 0 && (
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBulkRestore}
                    disabled={actionLoading}
                    className="flex items-center space-x-2 px-3 py-2 bg-success-600 hover:bg-success-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiRotateCcw} className="w-4 h-4" />
                    <span className="text-sm">Restore ({selectedTasks.size})</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBulkDelete}
                    disabled={actionLoading}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    <span className="text-sm">Delete ({selectedTasks.size})</span>
                  </motion.button>
                </div>
              )}

              {/* Refresh */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchDeletedTasks}
                disabled={loading}
                className="p-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 text-dark-300 hover:text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiRefreshCw} className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>

              {/* Empty Trash */}
              {deletedTasks.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEmptyConfirm(true)}
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  <span className="text-sm">Empty Trash</span>
                </motion.button>
              )}

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5 text-dark-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : deletedTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-dark-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiInbox} className="w-8 h-8 text-dark-400" />
                </div>
                <h3 className="text-lg font-medium text-dark-300 mb-2">No deleted tasks</h3>
                <p className="text-dark-400">Deleted tasks will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All */}
                <div className="flex items-center justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSelectAll}
                    className="flex items-center space-x-2 px-3 py-2 bg-dark-700/50 hover:bg-dark-600/50 text-dark-300 hover:text-white rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiCheckSquare} className="w-4 h-4" />
                    <span className="text-sm">
                      {selectedTasks.size === deletedTasks.length ? 'Deselect All' : 'Select All'}
                    </span>
                  </motion.button>
                  
                  <span className="text-sm text-dark-400">
                    {selectedTasks.size} of {deletedTasks.length} selected
                  </span>
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                  {deletedTasks.map((task) => {
                    const category = getTaskCategory(task);
                    const isSelected = selectedTasks.has(task.id);

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`
                          bg-dark-700/30 border rounded-xl p-4 transition-all duration-200
                          ${isSelected 
                            ? 'border-primary-500/50 bg-primary-500/5' 
                            : 'border-dark-600 hover:border-dark-500'
                          }
                        `}
                      >
                        <div className="flex items-start space-x-4">
                          {/* Checkbox */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSelectTask(task.id)}
                            className={`
                              w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                              ${isSelected 
                                ? 'bg-primary-600 border-primary-600 text-white' 
                                : 'border-dark-500 hover:border-primary-500'
                              }
                            `}
                          >
                            {isSelected && (
                              <SafeIcon icon={FiCheck} className="w-3 h-3" />
                            )}
                          </motion.button>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0">
                            {/* Category Badge */}
                            {category && (
                              <div className="flex items-center space-x-1 mb-2">
                                <div
                                  className="w-4 h-4 rounded flex items-center justify-center"
                                  style={{
                                    backgroundColor: category.color + '40',
                                    border: `1px solid ${category.color}`
                                  }}
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

                            <h3 className="font-medium text-white line-through opacity-75">
                              {task.title}
                            </h3>
                            
                            {task.description && (
                              <p className="text-sm text-dark-400 mt-1 line-through">
                                {task.description}
                              </p>
                            )}

                            {/* Task Meta */}
                            <div className="flex items-center space-x-4 mt-3 text-xs text-dark-400">
                              <div className="flex items-center space-x-1">
                                <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                                <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                              </div>
                              
                              {task.dueTime && (
                                <div className="flex items-center space-x-1">
                                  <SafeIcon icon={FiClock} className="w-3 h-3" />
                                  <span>{task.dueTime}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-1">
                                <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                                <span>
                                  Deleted {formatDistanceToNow(new Date(task.deletedAt))} ago
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRestore(task.id)}
                              disabled={actionLoading}
                              className="p-2 bg-success-600/20 hover:bg-success-600/30 disabled:opacity-50 text-success-400 hover:text-success-300 rounded-lg transition-colors"
                              title="Restore task"
                            >
                              <SafeIcon icon={FiRotateCcw} className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePermanentDelete(task.id)}
                              disabled={actionLoading}
                              className="p-2 bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                              title="Permanently delete"
                            >
                              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Empty Trash Confirmation Modal */}
        <AnimatePresence>
          {showEmptyConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-60"
              onClick={() => setShowEmptyConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-dark-800 rounded-xl p-6 border border-dark-700 max-w-md w-full mx-4"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
                    <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Empty Trash</h3>
                    <p className="text-sm text-dark-400">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-dark-300 mb-6">
                  Are you sure you want to permanently delete all {deletedTasks.length} tasks? 
                  This will remove them completely and cannot be undone.
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowEmptyConfirm(false)}
                    className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEmptyTrash}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    {actionLoading ? 'Deleting...' : 'Empty Trash'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeletedTasksView;