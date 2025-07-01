import React from 'react';
import {motion} from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {FiTrendingUp,FiTarget,FiPieChart}=FiIcons;

const availableIcons=[
  {name: 'FiBriefcase',icon: FiIcons.FiBriefcase},
  {name: 'FiHeart',icon: FiIcons.FiHeart},
  {name: 'FiBook',icon: FiIcons.FiBook},
  {name: 'FiUser',icon: FiIcons.FiUser},
  {name: 'FiHome',icon: FiIcons.FiHome},
  {name: 'FiDollarSign',icon: FiIcons.FiDollarSign},
  {name: 'FiCoffee',icon: FiIcons.FiCoffee},
  {name: 'FiMusic',icon: FiIcons.FiMusic},
  {name: 'FiCamera',icon: FiIcons.FiCamera},
  {name: 'FiGamepad',icon: FiIcons.FiGamepad},
  {name: 'FiShoppingCart',icon: FiIcons.FiShoppingCart},
  {name: 'FiActivity',icon: FiIcons.FiActivity},
];

const CategoryStats=({categories,tasks,onCategoryClick})=> {
  const getIconComponent=(iconName)=> {
    const iconData=availableIcons.find(i=> i.name===iconName);
    return iconData?.icon || FiIcons.FiTag;
  };

  const getCategoryStats=()=> {
    return categories.map(category=> {
      const categoryTasks=tasks.filter(task=> task.categoryId===category.id);
      const completedTasks=categoryTasks.filter(task=> task.completed);
      
      // Calculate completion rate
      const completionRate=categoryTasks.length > 0 
        ? Math.round((completedTasks.length / categoryTasks.length) * 100) 
        : 0;

      console.log(`Category ${category.name}:`, {
        totalTasks: categoryTasks.length,
        completedTasks: completedTasks.length,
        completionRate
      });

      return {
        ...category,
        totalTasks: categoryTasks.length,
        completedTasks: completedTasks.length,
        completionRate,
      };
    }).filter(categoryStats=> categoryStats.totalTasks > 0) // Only show categories with tasks
      .sort((a,b)=> b.totalTasks - a.totalTasks);
  };

  const categoryStats=getCategoryStats();
  
  // Calculate uncategorized tasks
  const uncategorizedTasks=tasks.filter(task=> !task.categoryId);
  const uncategorizedCompleted=uncategorizedTasks.filter(task=> task.completed);
  const uncategorizedRate=uncategorizedTasks.length > 0 
    ? Math.round((uncategorizedCompleted.length / uncategorizedTasks.length) * 100) 
    : 0;

  // Debug logging
  console.log('All tasks:', tasks.length);
  console.log('Categories:', categories.length);
  console.log('Category stats:', categoryStats);
  console.log('Uncategorized tasks:', uncategorizedTasks.length, 'completed:', uncategorizedCompleted.length);

  if (categoryStats.length===0 && uncategorizedTasks.length===0) {
    return (
      <motion.div
        initial={{opacity: 0,y: 20}}
        animate={{opacity: 1,y: 0}}
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6"
      >
        <div className="text-center">
          <SafeIcon icon={FiPieChart} className="w-12 h-12 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-300 mb-2">No Category Data</h3>
          <p className="text-dark-400 text-sm">Create some tasks with categories to see statistics</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{opacity: 0,y: 20}}
      animate={{opacity: 1,y: 0}}
      transition={{delay: 0.6}}
      className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6"
    >
      <div className="flex items-center space-x-2 mb-6">
        <SafeIcon icon={FiPieChart} className="w-5 h-5 text-primary-400" />
        <h3 className="text-lg font-semibold text-white">Category Overview</h3>
      </div>

      <div className="space-y-4">
        {/* Category Statistics - Clickable */}
        {categoryStats.map((category,index)=> (
          <motion.div
            key={category.id}
            initial={{opacity: 0,x: -20}}
            animate={{opacity: 1,x: 0}}
            transition={{delay: 0.1 * index}}
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
            onClick={()=> onCategoryClick && onCategoryClick(category.id)}
            className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg hover:bg-dark-700/50 transition-all cursor-pointer border border-transparent hover:border-dark-600"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: category.color + '20',
                  border: `1px solid ${category.color}`
                }}
              >
                <SafeIcon
                  icon={getIconComponent(category.icon)}
                  className="w-4 h-4"
                  style={{color: category.color}}
                />
              </div>
              <div>
                <h4 className="font-medium text-white text-sm">{category.name}</h4>
                <p className="text-xs text-dark-400">
                  {category.completedTasks}/{category.totalTasks} completed
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{category.completionRate}%</p>
                <div className="w-16 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                  <motion.div
                    initial={{width: 0}}
                    animate={{width: `${category.completionRate}%`}}
                    transition={{duration: 1,delay: 0.2 * index}}
                    className="h-full rounded-full"
                    style={{backgroundColor: category.color}}
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-dark-400 w-8 text-center">
                {category.totalTasks}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Uncategorized Tasks - Clickable */}
        {uncategorizedTasks.length > 0 && (
          <motion.div
            initial={{opacity: 0,x: -20}}
            animate={{opacity: 1,x: 0}}
            transition={{delay: 0.1 * categoryStats.length}}
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
            onClick={()=> onCategoryClick && onCategoryClick('uncategorized')}
            className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg hover:bg-dark-700/50 transition-all cursor-pointer border border-transparent hover:border-dark-600"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-600/20 border border-gray-500">
                <SafeIcon icon={FiIcons.FiTag} className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <h4 className="font-medium text-white text-sm">Uncategorized</h4>
                <p className="text-xs text-dark-400">
                  {uncategorizedCompleted.length}/{uncategorizedTasks.length} completed
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{uncategorizedRate}%</p>
                <div className="w-16 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                  <motion.div
                    initial={{width: 0}}
                    animate={{width: `${uncategorizedRate}%`}}
                    transition={{duration: 1,delay: 0.2 * categoryStats.length}}
                    className="h-full bg-gray-500 rounded-full"
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-dark-400 w-8 text-center">
                {uncategorizedTasks.length}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CategoryStats;