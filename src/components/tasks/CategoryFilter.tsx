import React from 'react';
import { motion } from 'framer-motion';
import { Category } from '@/types';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTag, FiList } = FiIcons;

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  taskCounts: Record<string, number>;
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

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  taskCounts,
}) => {
  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find(i => i.name === iconName);
    return iconData?.icon || FiTag;
  };

  return (
    <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-4">
      <h3 className="text-sm font-medium text-dark-300 mb-3">Filter by Category</h3>
      <div className="flex flex-wrap gap-2">
        {/* All Categories */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCategoryChange(null)}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
            ${selectedCategoryId === null
              ? 'bg-primary-600 text-white'
              : 'bg-dark-700/50 hover:bg-dark-600/50 text-dark-300 hover:text-white'
            }
          `}
        >
          <SafeIcon icon={FiList} className="w-4 h-4" />
          <span className="text-sm font-medium">All</span>
          {taskCounts.all > 0 && (
            <span className={`
              text-xs px-2 py-1 rounded-full font-medium
              ${selectedCategoryId === null
                ? 'bg-white/20 text-white'
                : 'bg-dark-600 text-dark-300'
              }
            `}>
              {taskCounts.all}
            </span>
          )}
        </motion.button>

        {/* Uncategorized */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCategoryChange('uncategorized')}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
            ${selectedCategoryId === 'uncategorized'
              ? 'bg-gray-600 text-white'
              : 'bg-dark-700/50 hover:bg-dark-600/50 text-dark-300 hover:text-white'
            }
          `}
        >
          <SafeIcon icon={FiTag} className="w-4 h-4" />
          <span className="text-sm font-medium">Uncategorized</span>
          {taskCounts.uncategorized > 0 && (
            <span className={`
              text-xs px-2 py-1 rounded-full font-medium
              ${selectedCategoryId === 'uncategorized'
                ? 'bg-white/20 text-white'
                : 'bg-dark-600 text-dark-300'
              }
            `}>
              {taskCounts.uncategorized}
            </span>
          )}
        </motion.button>

        {/* Category Filters */}
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCategoryChange(category.id)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 border
              ${selectedCategoryId === category.id
                ? 'text-white border-opacity-50'
                : 'bg-dark-700/50 hover:bg-dark-600/50 text-dark-300 hover:text-white border-transparent'
              }
            `}
            style={{
              backgroundColor: selectedCategoryId === category.id ? category.color + '40' : undefined,
              borderColor: selectedCategoryId === category.id ? category.color : undefined,
            }}
          >
            <SafeIcon
              icon={getIconComponent(category.icon)}
              className="w-4 h-4"
              style={{ color: selectedCategoryId === category.id ? category.color : undefined }}
            />
            <span className="text-sm font-medium">{category.name}</span>
            {taskCounts[category.id] > 0 && (
              <span className={`
                text-xs px-2 py-1 rounded-full font-medium
                ${selectedCategoryId === category.id
                  ? 'bg-white/20 text-white'
                  : 'bg-dark-600 text-dark-300'
                }
              `}>
                {taskCounts[category.id]}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;