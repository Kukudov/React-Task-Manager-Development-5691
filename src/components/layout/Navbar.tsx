import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import NotificationSettings from '../settings/NotificationSettings';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheckCircle, FiLogOut, FiUser, FiBell } = FiIcons;

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-dark-800/50 backdrop-blur-xl border-b border-dark-700/50 px-[100px] py-4"
      >
        <div className="w-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <SafeIcon icon={FiCheckCircle} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Daily Tasks</h1>
              <p className="text-sm text-dark-400">Stay organized, stay productive</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-dark-300">
              <SafeIcon icon={FiUser} className="w-4 h-4" />
              <span className="text-sm">{user?.email}</span>
            </div>

            {/* Notification Settings Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotificationSettings(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-dark-700/50 hover:bg-dark-600/50 text-dark-300 hover:text-white rounded-lg transition-all duration-200"
              title="Notification Settings"
            >
              <SafeIcon icon={FiBell} className="w-4 h-4" />
              <span className="text-sm">Notifications</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-dark-700/50 hover:bg-dark-600/50 text-dark-300 hover:text-white rounded-lg transition-all duration-200"
            >
              <SafeIcon icon={FiLogOut} className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Notification Settings Modal */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
    </>
  );
};

export default Navbar;