// Test script to verify the Edge Function is working
// Run this after deployment: node test-email-function.js

const testEmailFunction = async () => {
  const supabaseUrl = 'https://hhfenfbfallnzeeksnir.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZmVuZmJmYWxsbnplZWtzbmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTAzMDksImV4cCI6MjA2Njc4NjMwOX0.IeR-F2SyyvLB_PVdvaA3iPynnwiFIMf288_KFadWl2U';
  
  try {
    console.log('🧪 Testing Edge Function...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test',
        to: 'your-email@example.com', // Replace with your email
        subject: 'Test Email from Daily Tasks',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #3b82f6;">🎉 Email Function Test</h2>
            <p>If you're reading this, your Supabase Edge Function is working perfectly!</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
        `
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Test successful!');
      console.log('📧 Email ID:', result.emailId);
      console.log('🔧 Provider:', result.provider);
    } else {
      console.error('❌ Test failed:', result);
    }
  } catch (error) {
    console.error('❌ Error testing function:', error);
  }
};

// Uncomment to run the test
// testEmailFunction();

console.log('📧 Email function test script ready!');
console.log('Update the email address in the script and uncomment the last line to test.');