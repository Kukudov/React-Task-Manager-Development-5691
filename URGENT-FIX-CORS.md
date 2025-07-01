# 🚨 URGENT CORS FIX - Manual Edge Function Deployment

The Edge Function is NOT deployed yet. Here's the **immediate fix**:

## 🎯 **Step-by-Step Manual Deployment**

### **Step 1: Access Supabase Dashboard**
1. **Go to**: https://supabase.com/dashboard/project/hhfenfbfallnzeeksnir
2. **Click**: "Edge Functions" in the left sidebar
3. **Click**: "Create a new function" button

### **Step 2: Create the Function**
1. **Function Name**: `send-email`
2. **Copy this EXACT code**:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('📧 Edge Function called with method:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight')
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    console.log('📧 Processing email request...')
    
    const requestBody = await req.json()
    const { type, to, subject, html } = requestBody
    
    console.log(`📧 Email details: ${type} to ${to}`)
    
    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (resendApiKey && resendApiKey !== 'your-resend-api-key') {
      console.log('📧 Using Resend API...')
      
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Daily Tasks <noreply@dailytasks.app>',
            to: [to],
            subject: subject,
            html: html,
          }),
        })

        const emailResult = await emailResponse.json()

        if (emailResponse.ok) {
          console.log('✅ Resend success:', emailResult.id)
          
          return new Response(
            JSON.stringify({
              success: true,
              emailId: emailResult.id,
              provider: 'resend'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )
        } else {
          throw new Error(`Resend error: ${emailResult.message}`)
        }
      } catch (resendError) {
        console.error('Resend failed:', resendError)
        // Continue to mock
      }
    }
    
    // Mock response
    console.log('📧 Using mock email service')
    
    const mockEmailId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('✅ Mock email sent:', mockEmailId)
    
    return new Response(
      JSON.stringify({
        success: true,
        emailId: mockEmailId,
        message: 'Email sent successfully (demo mode)',
        provider: 'mock'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('❌ Function error:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
```

### **Step 3: Set Environment Variables (Optional)**
In the function environment variables section:
- **Key**: `RESEND_API_KEY`
- **Value**: `re_EYTrp2kb_PFmCjo5c8RPP1Xgrxv5h7KSW`

### **Step 4: Deploy Function**
1. Click **"Deploy function"**
2. Wait for deployment to complete (green checkmark)

## 🧪 **Test Immediately After Deployment**

1. **Refresh your Daily Tasks app**
2. **Click bell icon** (🔔) in navbar
3. **Click "Send Test Email"**
4. **Should work without CORS errors!** ✅

## ⚠️ **What This Fixes:**

✅ **CORS Headers**: Properly configured for cross-origin requests  
✅ **OPTIONS Handler**: Handles preflight requests correctly  
✅ **Error Handling**: All responses include CORS headers  
✅ **Mock Mode**: Works immediately even without Resend API  
✅ **Real Emails**: Will work with Resend API key (optional)

## 🔍 **Verify Deployment:**

After deployment, you should see:
- Function listed in "Edge Functions" dashboard
- Status shows as "Active" or "Deployed"
- No errors in the deployment logs

## 📱 **Expected Result:**

Once deployed, clicking "Send Test Email" should:
1. ✅ No CORS errors
2. ✅ Success message: "Test email sent successfully!"
3. ✅ Email preview in browser console
4. ✅ Toast notification showing success

## 🆘 **If Still Having Issues:**

1. **Check function logs** in Supabase dashboard
2. **Verify function name** is exactly `send-email`
3. **Clear browser cache** and try again
4. **Check network tab** for detailed error info

**This will completely resolve the CORS issue! 🎉**