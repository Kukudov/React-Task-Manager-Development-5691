# 📧 Email Troubleshooting Checklist

## 🔍 **Systematic Debugging Steps**

### **1. Verify Edge Function Deployment**
- [ ] Function appears in Supabase dashboard
- [ ] Function status shows "Active"
- [ ] No deployment errors in logs

### **2. Check Environment Variables**
- [ ] `RESEND_API_KEY` is set in Edge Function environment
- [ ] API key value: `re_EYTrp2kb_PFmCjo5c8RPP1Xgrxv5h7KSW`
- [ ] No extra spaces or characters in the key

### **3. Test Function Response**
Run this in browser console:
```javascript
// Replace YOUR_EMAIL with your actual email
const testEmail = async () => {
  const response = await fetch('https://hhfenfbfallnzeeksnir.supabase.co/functions/v1/send-email', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZmVuZmJmYWxsbnplZWtzbmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTAzMDksImV4cCI6MjA2Njc4NjMwOX0.IeR-F2SyyvLB_PVdvaA3iPynnwiFIMf288_KFadWl2U',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'test',
      to: 'YOUR_EMAIL@example.com',
      subject: 'Test Email',
      html: '<h1>Test</h1>'
    }),
  });
  const result = await response.json();
  console.log('Response:', result);
  return result;
};
testEmail();
```

### **4. Check Resend API Status**
- [ ] Visit https://resend.com/api-keys
- [ ] Verify the API key is active
- [ ] Check usage limits and quotas
- [ ] Verify domain verification status

### **5. Email Delivery Checks**
- [ ] Check primary inbox
- [ ] Check spam/junk folder
- [ ] Check promotions tab (Gmail)
- [ ] Check all mail/recent (Gmail)
- [ ] Try different email providers (Gmail, Outlook, etc.)

### **6. Common Issues & Solutions**

#### **Issue: API Key Invalid**
```bash
# Regenerate API key in Resend
# Update in Supabase Edge Function environment variables
```

#### **Issue: Domain Not Verified**
```
From address: noreply@dailytasks.app (unverified domain)
Solution: Either verify domain or use default Resend domain
```

#### **Issue: Rate Limiting**
```
Check Resend dashboard for rate limit status
Free tier: 100 emails/day
```

#### **Issue: Email Going to Spam**
```
1. Use verified domain
2. Add SPF/DKIM records
3. Avoid spam trigger words
4. Test with different email providers
```

### **7. Debug Output Analysis**

Look for these in Edge Function logs:
- ✅ "Email sent successfully via Resend!"
- ❌ "Resend API error"
- ⚠️ "No valid Resend API key"
- ℹ️ "Using mock email service"

### **8. Alternative Testing**

If still not working, try this direct Resend API test:
```javascript
const testResendDirect = async () => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_EYTrp2kb_PFmCjo5c8RPP1Xgrxv5h7KSW',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Daily Tasks <noreply@dailytasks.app>',
      to: ['YOUR_EMAIL@example.com'],
      subject: 'Direct Resend Test',
      html: '<h1>Testing Resend directly</h1>'
    }),
  });
  const result = await response.json();
  console.log('Direct Resend result:', result);
};
testResendDirect();
```

## 🎯 **Most Likely Issues:**

1. **Environment Variable Not Set** (90% of cases)
2. **Email Going to Spam** (5% of cases)
3. **API Key Invalid/Expired** (3% of cases)
4. **Rate Limiting** (2% of cases)

## 🚀 **Quick Fix Steps:**

1. **Check Edge Function logs first**
2. **Verify environment variable is set**
3. **Test with direct browser console call**
4. **Check spam folder thoroughly**
5. **Try different email address**

**Let me know what you see in the Edge Function logs! 🔍**