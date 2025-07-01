# Supabase Email Backend Setup Guide

## ✅ **Your Resend API Key:**
```
re_EYTrp2kb_PFmCjo5c8RPP1Xgrxv5h7KSW
```

## 🚀 **Step-by-Step Setup:**

### 1. **Install Supabase CLI** (if not already installed)
```bash
npm install -g supabase
```

### 2. **Login to Supabase**
```bash
supabase login
```

### 3. **Link Your Project**
```bash
supabase link --project-ref hhfenfbfallnzeeksnir
```

### 4. **Deploy the Edge Function**
```bash
supabase functions deploy send-email
```

### 5. **Set the API Key**
```bash
supabase secrets set RESEND_API_KEY=re_EYTrp2kb_PFmCjo5c8RPP1Xgrxv5h7KSW
```

## 🔍 **Verify Setup:**

### Check if the function is deployed:
```bash
supabase functions list
```

### Check if the secret is set:
```bash
supabase secrets list
```

## 🧪 **Test the Email System:**

1. Open your Daily Tasks app
2. Click the bell icon (🔔) in the navbar
3. Click "Send Test Email"
4. Check your email inbox (and spam folder)

## 📊 **Monitor Edge Function:**

You can monitor your Edge Function in the Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/hhfenfbfallnzeeksnir
2. Navigate to "Edge Functions" in the sidebar
3. Click on "send-email" function
4. View logs and invocations

## ⚠️ **Important Notes:**

- **Resend Free Tier**: 3,000 emails per month
- **From Address**: Currently set to "Daily Tasks <noreply@dailytasks.app>"
- **Domain Verification**: For production, consider verifying your own domain in Resend

## 🔧 **Alternative Setup (via Dashboard):**

If CLI doesn't work, you can also:

1. Go to your Supabase Dashboard
2. Navigate to Edge Functions
3. Create a new function called "send-email"
4. Copy the code from `supabase/functions/send-email/index.ts`
5. Add environment variable `RESEND_API_KEY` with your key

## 📧 **Email Templates Available:**

- ⏰ **Task Reminders**: Before due time
- 🔔 **Due Now Alerts**: When task becomes due  
- ⚠️ **Overdue Notifications**: For missed tasks
- 📋 **Daily Digest**: Morning summary
- 🧪 **Test Emails**: Verify setup

## 🎯 **What Happens Next:**

Once deployed, your Daily Tasks app will:
1. ✅ Send real emails to users' inboxes
2. ✅ Schedule notifications automatically
3. ✅ Handle all email types (reminders, alerts, digest)
4. ✅ Provide beautiful, responsive email templates
5. ✅ Fall back gracefully if email service is down

**Your email notification system is now production-ready! 🎉**