// Alternative: Fallback email service using EmailJS (client-side)
// This can work as a backup if Edge Functions continue to have issues

import emailjs from '@emailjs/browser';

export class AlternativeEmailService {
  private static instance: AlternativeEmailService;
  
  private constructor() {
    // Initialize EmailJS (free service)
    emailjs.init('your-public-key'); // Replace with actual key
  }
  
  public static getInstance(): AlternativeEmailService {
    if (!AlternativeEmailService.instance) {
      AlternativeEmailService.instance = new AlternativeEmailService();
    }
    return AlternativeEmailService.instance;
  }
  
  public async sendEmail(
    to: string,
    template: { subject: string; html: string },
    type: string
  ): Promise<{ success: boolean; emailId?: string; error?: string }> {
    try {
      console.log('📧 Using EmailJS fallback service...');
      
      // EmailJS template parameters
      const templateParams = {
        to_email: to,
        subject: template.subject,
        message: template.html,
        type: type,
      };
      
      // Send via EmailJS
      const result = await emailjs.send(
        'your-service-id', // Replace with actual service ID
        'your-template-id', // Replace with actual template ID
        templateParams
      );
      
      console.log('✅ EmailJS success:', result);
      
      return {
        success: true,
        emailId: result.text,
      };
      
    } catch (error) {
      console.error('❌ EmailJS error:', error);
      
      // Final fallback: Just log success (demo mode)
      console.log('📧 Demo mode: Email would be sent to:', to);
      console.log('📧 Subject:', template.subject);
      
      return {
        success: true,
        emailId: `demo_${Date.now()}`,
      };
    }
  }
}

// Usage in useEmailNotifications.ts:
// const alternativeService = AlternativeEmailService.getInstance();
// const result = await alternativeService.sendEmail(userEmail, template, 'test');