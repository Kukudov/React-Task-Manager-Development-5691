import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEmailNotifications } from '../../hooks/useEmailNotifications';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBell, FiMail, FiClock, FiSend, FiCheck, FiX } = FiIcons;

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const { preferences, loading, updatePreferences, sendTestEmail } = useEmailNotifications();
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const handleToggleNotifications = async () => {
    if (!preferences) return;
    setSaving(true);
    try {
      await updatePreferences({
        emailNotificationsEnabled: !preferences.emailNotificationsEnabled,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReminderTimeChange = async (minutes: number) => {
    if (!preferences) return;
    setSaving(true);
    try {
      await updatePreferences({
        reminderMinutesBefore: minutes,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDailyDigestToggle = async () => {
    if (!preferences) return;
    setSaving(true);
    try {
      await updatePreferences({
        dailyDigestEnabled: !preferences.dailyDigestEnabled,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDigestTimeChange = async (time: string) => {
    if (!preferences) return;
    setSaving(true);
    try {
      await updatePreferences({
        dailyDigestTime: time,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      await sendTestEmail();
    } finally {
      setSendingTest(false);
    }
  };

  if (!isOpen) return null;

  return (
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
        className="w-full max-w-md bg-dark-800 rounded-2xl shadow-2xl border border-dark-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <SafeIcon icon={FiBell} className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Email Notifications</h2>
              <p className="text-sm text-dark-400">Manage your task reminders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5 text-dark-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Enable/Disable Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiMail} className="w-5 h-5 text-primary-400" />
                  <div>
                    <h3 className="font-medium text-white">Email Notifications</h3>
                    <p className="text-sm text-dark-400">Receive task reminders via email</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleNotifications}
                  disabled={saving}
                  className={`
                    w-12 h-6 rounded-full transition-colors duration-200 relative
                    ${preferences?.emailNotificationsEnabled ? 'bg-primary-600' : 'bg-dark-600'}
                    ${saving ? 'opacity-50' : ''}
                  `}
                >
                  <motion.div
                    animate={{ x: preferences?.emailNotificationsEnabled ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                  >
                    {saving ? (
                      <div className="w-3 h-3 border border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                    ) : (
                      <SafeIcon
                        icon={preferences?.emailNotificationsEnabled ? FiCheck : FiX}
                        className={`w-3 h-3 ${
                          preferences?.emailNotificationsEnabled ? 'text-primary-600' : 'text-gray-400'
                        }`}
                      />
                    )}
                  </motion.div>
                </motion.button>
              </div>

              {/* Reminder Timing */}
              {preferences?.emailNotificationsEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <SafeIcon icon={FiClock} className="w-4 h-4 text-orange-400" />
                      <h4 className="font-medium text-white">Reminder Timing</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 30, 60].map((minutes) => (
                        <button
                          key={minutes}
                          onClick={() => handleReminderTimeChange(minutes)}
                          disabled={saving}
                          className={`
                            p-3 rounded-lg text-sm font-medium transition-colors
                            ${
                              preferences?.reminderMinutesBefore === minutes
                                ? 'bg-primary-600 text-white'
                                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                            }
                            ${saving ? 'opacity-50' : ''}
                          `}
                        >
                          {minutes}m before
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom reminder time */}
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Custom reminder (minutes before)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={preferences?.reminderMinutesBefore || 30}
                      onChange={(e) => handleReminderTimeChange(parseInt(e.target.value))}
                      disabled={saving}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Daily Digest */}
                  <div className="border-t border-dark-600 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">Daily Digest</h4>
                        <p className="text-sm text-dark-400">Daily summary of your tasks</p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDailyDigestToggle}
                        disabled={saving}
                        className={`
                          w-10 h-5 rounded-full transition-colors duration-200 relative
                          ${preferences?.dailyDigestEnabled ? 'bg-primary-600' : 'bg-dark-600'}
                          ${saving ? 'opacity-50' : ''}
                        `}
                      >
                        <motion.div
                          animate={{ x: preferences?.dailyDigestEnabled ? 20 : 0 }}
                          className="w-5 h-5 bg-white rounded-full shadow-lg"
                        />
                      </motion.button>
                    </div>

                    {preferences?.dailyDigestEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                          Digest time
                        </label>
                        <input
                          type="time"
                          value={preferences?.dailyDigestTime || '08:00'}
                          onChange={(e) => handleDigestTimeChange(e.target.value)}
                          disabled={saving}
                          className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Test Email */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendTest}
                    disabled={sendingTest}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-success-600 hover:bg-success-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    {sendingTest ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={FiSend} className="w-4 h-4" />
                        <span>Send Test Email</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationSettings;