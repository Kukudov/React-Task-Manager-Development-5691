import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useTaskStats } from '@/hooks/useTaskStats';
import { useCategories } from '@/hooks/useCategories';
import { Task, FilterType } from '@/types';

// Components
import AuthForm from '@/components/auth/AuthForm';
import Navbar from '@/components/layout/Navbar';
import TaskForm from '@/components/tasks/TaskForm';
import TaskList from '@/components/tasks/TaskList';
import TaskFilters from '@/components/tasks/TaskFilters';
import CategoryFilter from '@/components/tasks/CategoryFilter';
import CategoryManager from '@/components/categories/CategoryManager';
import CategoryStats from '@/components/dashboard/CategoryStats';
import ProgressCard from '@/components/dashboard/ProgressCard';
import MonthlyChart from '@/components/dashboard/MonthlyChart';
import SafeIcon from '@/common/SafeIcon';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiRefreshCw, FiSettings } = FiIcons;

import './App.css';

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    tasks, 
    allTasks, 
    loading: tasksLoading, 
    filter, 
    setFilter, 
    categoryFilter, 
    setCategoryFilter,
    addTask, 
    updateTask, 
    deleteTask, 
    refreshTasks 
  } = useTasks();
  const { categories } = useCategories();
  const stats = useTaskStats(allTasks);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  // Calculate task counts for filters
  const taskCounts: Record<FilterType, number> = {
    all: allTasks.length,
    today: allTasks.filter(t => {
      const today = new Date();
      const taskDate = new Date(t.dueDate);
      return taskDate.toDateString() === today.toDateString();
    }).length,
    tomorrow: allTasks.filter(t => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const taskDate = new Date(t.dueDate);
      return taskDate.toDateString() === tomorrow.toDateString();
    }).length,
    upcoming: allTasks.filter(t => {
      const taskDate = new Date(t.dueDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return taskDate > tomorrow;
    }).length,
    completed: allTasks.filter(t => t.completed).length,
    incomplete: allTasks.filter(t => !t.completed).length,
  };

  // Calculate category task counts
  const categoryTaskCounts: Record<string, number> = {
    all: allTasks.length,
    uncategorized: allTasks.filter(t => !t.categoryId).length,
  };

  categories.forEach(category => {
    categoryTaskCounts[category.id] = allTasks.filter(t => t.categoryId === category.id).length;
  });

  const handleTaskSubmit = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
      setEditingTask(undefined);
    } else {
      await addTask(taskData);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  // Handle task completion toggle
  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    await updateTask(taskId, { completed });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      <Navbar />
      <main className="w-full px-[100px] py-8">
        {/* Progress Cards */}
        <ProgressCard stats={stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Your Tasks</h2>
                <p className="text-dark-400 mt-1">
                  Stay organized and productive with your daily tasks
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCategoryManager(true)}
                  className="p-3 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded-xl transition-all duration-200"
                  title="Manage Categories"
                >
                  <SafeIcon icon={FiSettings} className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshTasks}
                  className="p-3 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded-xl transition-all duration-200"
                >
                  <SafeIcon icon={FiRefreshCw} className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTaskForm(true)}
                  className="flex items-center space-x-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all duration-200"
                >
                  <SafeIcon icon={FiPlus} className="w-5 h-5" />
                  <span>Add Task</span>
                </motion.button>
              </div>
            </div>

            {/* Filters */}
            <TaskFilters
              activeFilter={filter}
              onFilterChange={setFilter}
              taskCounts={taskCounts}
            />

            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              selectedCategoryId={categoryFilter}
              onCategoryChange={setCategoryFilter}
              taskCounts={categoryTaskCounts}
            />

            {/* Task List */}
            <div className="bg-dark-800/30 backdrop-blur-sm border border-dark-700/50 rounded-xl p-6">
              {tasksLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : (
                <TaskList
                  tasks={tasks}
                  categories={categories}
                  onToggle={handleTaskToggle}
                  onEdit={handleEditTask}
                  onDelete={deleteTask}
                />
              )}
            </div>
          </div>

          {/* Analytics Section */}
          <div className="space-y-6">
            {/* Monthly Progress Chart */}
            <div className="mt-[88px]">
              <MonthlyChart stats={stats} />
            </div>

            {/* Category Statistics */}
            <CategoryStats categories={categories} tasks={allTasks} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={handleCloseForm}
        onSubmit={handleTaskSubmit}
        editTask={editingTask}
      />

      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;