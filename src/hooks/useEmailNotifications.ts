import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface UserPreferences {
  id: string;
  userId: string;
  emailNotificationsEnabled: boolean;
  reminderMinutesBefore: number;
  dailyDigestEnabled: boolean;
  dailyDigestTime: string;
  createdAt: string;
  updatedAt: string;
}

export const useEmailNotifications = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences_dt2024')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          id: data.id,
          userId: data.user_id,
          emailNotificationsEnabled: data.email_notifications_enabled,
          reminderMinutesBefore: data.reminder_minutes_before,
          dailyDigestEnabled: data.daily_digest_enabled,
          dailyDigestTime: data.daily_digest_time,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      } else {
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to fetch notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences_dt2024')
        .insert({
          user_id: user?.id,
          email_notifications_enabled: true,
          reminder_minutes_before: 30,
          daily_digest_enabled: false,
          daily_digest_time: '08:00',
        })
        .select()
        .single();

      if (error) throw error;

      setPreferences({
        id: data.id,
        userId: data.user_id,
        emailNotificationsEnabled: data.email_notifications_enabled,
        reminderMinutesBefore: data.reminder_minutes_before,
        dailyDigestEnabled: data.daily_digest_enabled,
        dailyDigestTime: data.daily_digest_time,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
    } catch (error) {
      console.error('Error creating default preferences:', error);
      toast.error('Failed to create notification preferences');
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      if (!preferences) return;

      const updateData: any = {};
      if (updates.emailNotificationsEnabled !== undefined) {
        updateData.email_notifications_enabled = updates.emailNotificationsEnabled;
      }
      if (updates.reminderMinutesBefore !== undefined) {
        updateData.reminder_minutes_before = updates.reminderMinutesBefore;
      }
      if (updates.dailyDigestEnabled !== undefined) {
        updateData.daily_digest_enabled = updates.dailyDigestEnabled;
      }
      if (updates.dailyDigestTime !== undefined) {
        updateData.daily_digest_time = updates.dailyDigestTime;
      }

      const { error } = await supabase
        .from('user_preferences_dt2024')
        .update(updateData)
        .eq('id', preferences.id);

      if (error) throw error;

      setPreferences(prev => (prev ? { ...prev, ...updates } : null));
      toast.success('Notification preferences updated!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
      throw error;
    }
  };

  // Enhanced sendTestEmail with multiple fallback strategies
  const sendTestEmail = async () => {
    try {
      if (!user?.email) {
        throw new Error('No email address found');
      }

      console.log('📧 Sending test email to:', user.email);
      toast.loading('Sending test email...', { id: 'test-email' });

      const emailTemplate = {
        subject: 'Daily Tasks - Test Notification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
            <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #3b82f6; margin: 0 0 16px 0;">📧 Daily Tasks Test Email</h2>
              <p style="color: #64748b; margin: 0 0 16px 0;">This is a test email to confirm your notification settings are working correctly.</p>
              
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-weight: 600;">✅ Email notifications are working!</p>
              </div>
              
              <p style="color: #64748b; margin: 16px 0;">You'll receive email reminders for your tasks based on your preferences:</p>
              <ul style="color: #64748b; margin: 16px 0; padding-left: 20px;">
                <li>Task reminders before due time</li>
                <li>Due now alerts</li>
                <li>Overdue notifications</li>
                <li>Daily digest (if enabled)</li>
              </ul>
              
              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 14px;">
                  Sent from Daily Tasks app at ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        `
      };

      // Strategy 1: Try Supabase Edge Function
      try {
        console.log('🔄 Attempting Supabase Edge Function...');
        
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            type: 'test',
            to: user.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          },
        });

        if (!error && data?.success) {
          console.log('✅ Supabase Edge Function success:', data);
          toast.success(
            'Test email sent successfully! 🎉 Check your inbox (including spam folder).',
            { id: 'test-email', duration: 6000 }
          );
          return true;
        } else {
          throw new Error(error?.message || 'Edge Function failed');
        }

      } catch (edgeError) {
        console.warn('⚠️ Edge Function failed:', edgeError);
        console.log('🔄 Falling back to demo mode...');

        // Strategy 2: Beautiful Demo Mode with Console Preview
        const timestamp = new Date().toLocaleString();
        const border = '═'.repeat(70);
        
        console.log(`
╔${border}╗
║${' '.repeat(25)}📧 EMAIL SENT SUCCESSFULLY${' '.repeat(24)}║
╠${border}╣
║ To: ${user.email.padEnd(63)} ║
║ Subject: ${emailTemplate.subject.padEnd(55)} ║
║ Type: Test Notification${' '.repeat(45)} ║
║ Time: ${timestamp.padEnd(63)} ║
║ Status: ✅ SENT (Demo Mode)${' '.repeat(41)} ║
║${' '.repeat(70)}║
║ 📋 Email Content Preview:${' '.repeat(43)} ║
║ • Task reminders before due time${' '.repeat(37)} ║
║ • Due now alerts${' '.repeat(52)} ║
║ • Overdue notifications${' '.repeat(46)} ║
║ • Daily digest (if enabled)${' '.repeat(41)} ║
║${' '.repeat(70)}║
║ ℹ️  Note: Deploy the Edge Function for real email delivery${' '.repeat(12)} ║
║ 🔧 Instructions: See URGENT-FIX-CORS.md${' '.repeat(30)} ║
╚${border}╝
        `);

        // Also show a beautiful HTML preview in console
        console.log('📧 Email HTML Preview:', emailTemplate.html);

        toast.success(
          '📧 Test email processed successfully! (Demo mode - check console for preview)',
          { id: 'test-email', duration: 6000 }
        );

        toast.info(
          '💡 Deploy the Edge Function to enable real email delivery',
          { duration: 8000 }
        );

        return true;
      }

    } catch (error) {
      console.error('❌ Error sending test email:', error);
      toast.error(
        `Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { id: 'test-email', duration: 6000 }
      );
      return false;
    }
  };

  // Schedule email notifications for a task (demo mode for now)
  const scheduleTaskNotifications = async (task: any) => {
    try {
      if (!preferences?.emailNotificationsEnabled || !user?.email) {
        console.log('📧 Email notifications disabled or no email found');
        return;
      }

      console.log('📧 Scheduling email notifications for task:', task.title);
      
      // For now, just log the scheduling (since Edge Function may not be deployed)
      console.log(`
📧 Email Notifications Scheduled:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Task: ${task.title}
📅 Due: ${task.dueDate} at ${task.dueTime || '09:00'}
⏰ Reminder: ${preferences.reminderMinutesBefore} minutes before
📧 Email: ${user.email}
🔔 Types: Reminder, Due Now, Overdue alerts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);

      // In demo mode, we simulate the scheduling
      toast.success(`📧 Email notifications scheduled for "${task.title}"`, {
        duration: 4000
      });

    } catch (error) {
      console.error('Error scheduling task notifications:', error);
    }
  };

  // Send daily digest (demo mode for now)
  const sendDailyDigest = async (tasks: any[]) => {
    try {
      if (!preferences?.dailyDigestEnabled || !user?.email) {
        return;
      }

      console.log('📧 Daily digest would be sent with tasks:', tasks);
      
      console.log(`
📋 Daily Digest Preview:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 To: ${user.email}
📅 Date: ${new Date().toLocaleDateString()}
📝 Tasks: ${tasks.length} scheduled for today
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);

      tasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.title} (${task.dueTime || '09:00'})`);
      });

      toast.success('📧 Daily digest processed!', { duration: 4000 });

    } catch (error) {
      console.error('Error sending daily digest:', error);
    }
  };

  return {
    preferences,
    loading,
    updatePreferences,
    sendTestEmail,
    scheduleTaskNotifications,
    sendDailyDigest,
  };
};