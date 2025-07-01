// Client-side email service for development and demo
export interface EmailTemplate {
  subject: string;
  html: string;
}

export interface MockEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  timestamp: string;
  status: 'sent' | 'failed';
  type: 'test' | 'reminder' | 'due_now' | 'overdue' | 'daily_digest';
}

export class EmailService {
  private static instance: EmailService;
  private mockEmails: MockEmail[] = [];

  private constructor() {
    this.loadMockEmails();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private loadMockEmails(): void {
    try {
      const stored = localStorage.getItem('mockEmails');
      if (stored) {
        this.mockEmails = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading mock emails:', error);
      this.mockEmails = [];
    }
  }

  private saveMockEmails(): void {
    try {
      // Keep only last 50 emails
      const emailsToSave = this.mockEmails.slice(-50);
      localStorage.setItem('mockEmails', JSON.stringify(emailsToSave));
    } catch (error) {
      console.error('Error saving mock emails:', error);
    }
  }

  public async sendEmail(
    to: string,
    template: EmailTemplate,
    type: MockEmail['type'] = 'test'
  ): Promise<{ success: boolean; emailId?: string; error?: string }> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      // Simulate occasional failures for realism (5% failure rate)
      if (Math.random() < 0.05) {
        throw new Error('Network timeout (simulated)');
      }

      const email: MockEmail = {
        id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        to,
        subject: template.subject,
        html: template.html,
        timestamp: new Date().toISOString(),
        status: 'sent',
        type
      };

      this.mockEmails.push(email);
      this.saveMockEmails();

      // Log beautiful email preview
      this.logEmailPreview(email);

      return {
        success: true,
        emailId: email.id
      };
    } catch (error) {
      console.error('Mock email service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private logEmailPreview(email: MockEmail): void {
    const border = '═'.repeat(60);
    const timestamp = new Date(email.timestamp).toLocaleString();

    console.log(`
╔${border}╗
║${' '.repeat(20)}📧 EMAIL SENT SUCCESSFULLY${' '.repeat(19)}║
╠${border}╣
║ ID: ${email.id.padEnd(54)}║
║ To: ${email.to.padEnd(54)}║
║ Subject: ${email.subject.padEnd(49)}║
║ Type: ${email.type.padEnd(52)}║
║ Time: ${timestamp.padEnd(52)}║
║ Status: ✅ SENT (Mock Mode)${' '.repeat(30)}║
╚${border}╝
    `);

    // Also log HTML preview for debugging
    console.log('📧 Email HTML Preview:', email.html);
  }

  public getMockEmails(): MockEmail[] {
    return [...this.mockEmails].reverse(); // Most recent first
  }

  public clearMockEmails(): void {
    this.mockEmails = [];
    localStorage.removeItem('mockEmails');
    console.log('🗑️ Mock emails cleared');
  }

  // Email templates
  public static getTestEmailTemplate(): EmailTemplate {
    return {
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
                You can modify your notification preferences in the app settings.
              </p>
            </div>
          </div>
        </div>
      `
    };
  }

  public static getReminderEmailTemplate(
    taskTitle: string,
    taskDescription?: string,
    dueDate?: string,
    dueTime?: string
  ): EmailTemplate {
    return {
      subject: `⏰ Reminder: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #3b82f6; margin: 0 0 16px 0;">⏰ Task Reminder</h2>
            
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 4px;">
              <h3 style="margin: 0 0 8px 0; color: #1e40af;">${taskTitle}</h3>
              ${taskDescription ? `<p style="margin: 0; color: #64748b;">${taskDescription}</p>` : ''}
            </div>
            
            ${dueDate ? `
              <div style="display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 14px;">
                <span>📅</span>
                <span>Due: ${dueDate}${dueTime ? ` at ${dueTime}` : ''}</span>
              </div>
            ` : ''}
            
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                This is a reminder for your upcoming task. You can manage your notification preferences in the Daily Tasks app.
              </p>
            </div>
          </div>
        </div>
      `
    };
  }

  public static getDueNowEmailTemplate(
    taskTitle: string,
    taskDescription?: string
  ): EmailTemplate {
    return {
      subject: `🔔 Due Now: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #dc2626; margin: 0 0 16px 0;">🔔 Task Due Now</h2>
            
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0; border-radius: 4px;">
              <h3 style="margin: 0 0 8px 0; color: #991b1b;">${taskTitle}</h3>
              ${taskDescription ? `<p style="margin: 0; color: #64748b;">${taskDescription}</p>` : ''}
            </div>
            
            <p style="color: #dc2626; font-weight: 600;">⚡ This task is due now!</p>
            
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                Don't forget to mark this task as complete once you're done!
              </p>
            </div>
          </div>
        </div>
      `
    };
  }

  public static getOverdueEmailTemplate(
    taskTitle: string,
    taskDescription?: string,
    dueDate?: string
  ): EmailTemplate {
    return {
      subject: `⚠️ Overdue: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #dc2626; margin: 0 0 16px 0;">⚠️ Overdue Task</h2>
            
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0; border-radius: 4px;">
              <h3 style="margin: 0 0 8px 0; color: #991b1b;">${taskTitle}</h3>
              ${taskDescription ? `<p style="margin: 0; color: #64748b;">${taskDescription}</p>` : ''}
            </div>
            
            ${dueDate ? `<p style="color: #dc2626; font-weight: 600;">📅 This task was due on ${dueDate}</p>` : ''}
            
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                Consider rescheduling this task or marking it complete if it's already done.
              </p>
            </div>
          </div>
        </div>
      `
    };
  }

  public static getDailyDigestEmailTemplate(tasks: Array<{ title: string; description?: string; dueTime?: string }>): EmailTemplate {
    const tasksList = tasks.map(task => `
      <div style="background: #eff6ff; border-radius: 8px; padding: 16px; margin: 8px 0;">
        <h4 style="margin: 0 0 8px 0; color: #1e40af;">${task.title}</h4>
        ${task.description ? `<p style="margin: 0; color: #64748b; font-size: 14px;">${task.description}</p>` : ''}
        ${task.dueTime ? `<p style="margin: 4px 0 0 0; color: #3b82f6; font-size: 12px;">⏰ ${task.dueTime}</p>` : ''}
      </div>
    `).join('');

    return {
      subject: `📋 Your Daily Task Summary - ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #3b82f6; margin: 0 0 16px 0;">📋 Your Daily Task Summary</h2>
            <p style="color: #64748b; margin: 0 0 16px 0;">Here's what you have planned for today:</p>
            
            ${tasksList}
            
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                Have a productive day! 🚀
              </p>
            </div>
          </div>
        </div>
      `
    };
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();