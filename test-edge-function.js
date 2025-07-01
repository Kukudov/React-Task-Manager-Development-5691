// Test script to verify the Edge Function deployment and CORS
const testEdgeFunction = async () => {
  const supabaseUrl = 'https://hhfenfbfallnzeeksnir.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZmVuZmJmYWxsbnplZWtzbmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTAzMDksImV4cCI6MjA2Njc4NjMwOX0.IeR-F2SyyvLB_PVdvaA3iPynnwiFIMf288_KFadWl2U';
  
  console.log('🧪 Testing Edge Function CORS and deployment...');
  
  try {
    // Test OPTIONS request first (CORS preflight)
    console.log('1. Testing CORS preflight (OPTIONS)...');
    const optionsResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization, content-type',
      }
    });
    
    console.log('OPTIONS Status:', optionsResponse.status);
    console.log('CORS Headers:', Object.fromEntries(optionsResponse.headers.entries()));
    
    if (optionsResponse.ok) {
      console.log('✅ CORS preflight successful!');
    } else {
      console.log('❌ CORS preflight failed');
      return;
    }
    
    // Test actual POST request
    console.log('2. Testing actual email send...');
    const postResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test',
        to: 'test@example.com', // This will use mock mode
        subject: 'CORS Test Email',
        html: '<h1>Testing CORS fix!</h1>'
      }),
    });
    
    console.log('POST Status:', postResponse.status);
    const result = await postResponse.json();
    console.log('Response:', result);
    
    if (postResponse.ok) {
      console.log('✅ Edge Function working correctly!');
      console.log('📧 Provider:', result.provider);
    } else {
      console.log('❌ Edge Function error:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testEdgeFunction();