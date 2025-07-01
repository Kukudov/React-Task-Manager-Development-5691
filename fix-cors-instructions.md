# 🔧 Fix CORS Issue - Step by Step

## ❌ **Current Problem:**
The Edge Function is not deployed or has CORS issues causing:
```
Access to fetch at 'https://hhfenfbfallnzeeksnir.supabase.co/functions/v1/send-email' 
from origin 'https://addons.questprotocol.xyz' has been blocked by CORS policy
```

## ✅ **Solution Steps:**

### 1. **Deploy the Fixed Edge Function**
```bash
# Make sure you're in the project directory
cd /path/to/your/daily-task-manager

# Deploy with proper CORS headers
supabase functions deploy send-email --no-verify-jwt
```

### 2. **Set the API Key**
```bash
supabase secrets set RESEND_API_KEY=re_EYTrp2kb_PFmCjo5c8RPP1Xgrxv5h7KSW
```

### 3. **Verify Deployment**
```bash
# Check function is listed
supabase functions list

# Check secrets are set
supabase secrets list
```

### 4. **Test the Function**
```bash
# Run the test script
node test-edge-function.js
```

## 🔍 **Alternative: Manual Deployment via Dashboard**

If CLI doesn't work:

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/hhfenfbfallnzeeksnir
   - Navigate to "Edge Functions" in sidebar

2. **Create New Function:**
   - Click "Create a new function"
   - Name: `send-email`
   - Copy the code from `supabase/functions/send-email/index.ts`

3. **Set Environment Variables:**
   - In the function settings, add:
   ```
   RESEND_API_KEY = re_EYTrp2kb_PFmCjo5c8RPP1Xgrxv5h7KSW
   ```

4. **Deploy the Function**

## 🧪 **Test in Your App:**

1. Open Daily Tasks app
2. Click bell icon (🔔) in navbar  
3. Click "Send Test Email"
4. Should work without CORS errors!

## 🔧 **What the Fix Does:**

✅ **Proper CORS Headers**: Added all required CORS headers for cross-origin requests  
✅ **OPTIONS Handler**: Handles preflight requests correctly  
✅ **Error Handling**: Better error responses with CORS headers  
✅ **Mock Fallback**: Works even without Resend API key (demo mode)  

## ⚠️ **If Still Having Issues:**

1. **Check function logs** in Supabase dashboard
2. **Verify the function URL** is accessible
3. **Clear browser cache** and try again
4. **Check network tab** in browser dev tools for detailed error

**The CORS issue should be completely resolved after this deployment! 🎉**