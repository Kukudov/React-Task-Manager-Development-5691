import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    console.log('Processing email notifications...')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get pending notifications that should be sent now
    const { data: notifications, error } = await supabase
      .from('email_notifications_dt2024')
      .select(`
        *,
        tasks_dt2024!inner(title, description, due_date, due_time)
      `)
      .eq('email_status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(10); // Process in batches

    if (error) {
      console.error('Error fetching notifications:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log(`Found ${notifications?.length || 0} pending notifications`)

    const results = [];

    if (notifications && notifications.length > 0) {
      // Get user emails for notifications
      const userIds = [...new Set(notifications.map(n => n.user_id))]
      const { data: users } = await supabase.auth.admin.listUsers()
      const userEmailMap = new Map()
      
      if (users?.users) {
        users.users.forEach(user => {
          userEmailMap.set(user.id, user.email)
        })
      }

      for (const notification of notifications) {
        try {
          let subject = '';
          let html = '';
          const task = notification.tasks_dt2024;
          const userEmail = userEmailMap.get(notification.user_id);

          if (!userEmail) {
            console.error(`No email found for user ${notification.user_id}`)
            continue
          }

          // Generate email content based on notification type
          switch (notification.notification_type) {
            case 'reminder':
              subject = `⏰ Reminder: ${task.title}`;
              html = generateReminderEmail(task);
              break;
            case 'due_now':
              subject = `🔔 Due Now: ${task.title}`;
              html = generateDueNowEmail(task);
              break;
            case 'overdue':
              subject = `⚠️ Overdue: ${task.title}`;
              html = generateOverdueEmail(task);
              break;
            case 'daily_digest':
              subject = `📋 Your Daily Task Summary`;
              html = generateDailyDigestEmail(task);
              break;
          }

          console.log(`Sending ${notification.notification_type} email for task: ${task.title}`)

          // Send email via the send-email function
          const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: notification.notification_type,
              to: userEmail,
              subject: subject,
              html: html,
              taskId: notification.task_id,
              notificationId: notification.id,
            }),
          });

          if (emailResponse.ok) {
            results.push({ id: notification.id, status: 'sent' });
            console.log(`Successfully sent email for notification ${notification.id}`)
          } else {
            results.push({ id: notification.id, status: 'failed' });
            console.error(`Failed to send email for notification ${notification.id}`)
          }
        } catch (error) {
          console.error(`Error processing notification ${notification.id}:`, error);
          results.push({ id: notification.id, status: 'failed', error: error.message });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        processed: results.length, 
        results: results,
        total_pending: notifications?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in process-email-notifications function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function generateReminderEmail(task: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
      <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #3b82f6; margin: 0 0 16px 0;">⏰ Task Reminder</h2>
        
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; color: #1e40af;">${task.title}</h3>
          ${task.description ? `<p style="margin: 0; color: #64748b;">${task.description}</p>` : ''}
        </div>
        
        <div style="display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 14px;">
          <span>📅</span>
          <span>Due: ${new Date(task.due_date + ' ' + (task.due_time || '09:00')).toLocaleDateString()} at ${task.due_time || '09:00'}</span>
        </div>
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">
            This is a reminder for your upcoming task. You can manage your notification preferences in the Daily Tasks app.
          </p>
        </div>
      </div>
    </div>
  `;
}

function generateDueNowEmail(task: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
      <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #dc2626; margin: 0 0 16px 0;">🔔 Task Due Now</h2>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; color: #991b1b;">${task.title}</h3>
          ${task.description ? `<p style="margin: 0; color: #64748b;">${task.description}</p>` : ''}
        </div>
        
        <p style="color: #dc2626; font-weight: 600;">⚡ This task is due now!</p>
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">
            Don't forget to mark this task as complete once you're done!
          </p>
        </div>
      </div>
    </div>
  `;
}

function generateOverdueEmail(task: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
      <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #dc2626; margin: 0 0 16px 0;">⚠️ Overdue Task</h2>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; color: #991b1b;">${task.title}</h3>
          ${task.description ? `<p style="margin: 0; color: #64748b;">${task.description}</p>` : ''}
        </div>
        
        <p style="color: #dc2626; font-weight: 600;">📅 This task was due on ${new Date(task.due_date).toLocaleDateString()}</p>
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">
            Consider rescheduling this task or marking it complete if it's already done.
          </p>
        </div>
      </div>
    </div>
  `;
}

function generateDailyDigestEmail(task: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
      <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #3b82f6; margin: 0 0 16px 0;">📋 Your Daily Task Summary</h2>
        
        <p style="color: #64748b; margin: 0 0 16px 0;">Here's what you have planned for today:</p>
        
        <div style="background: #eff6ff; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h4 style="margin: 0 0 8px 0; color: #1e40af;">${task.title}</h4>
          ${task.description ? `<p style="margin: 0; color: #64748b; font-size: 14px;">${task.description}</p>` : ''}
        </div>
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">
            Have a productive day! 🚀
          </p>
        </div>
      </div>
    </div>
  `;
}