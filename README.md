# Daily Task Manager

A modern, feature-rich daily task management application built with React, TypeScript, and Supabase. This app helps you stay organized and productive with beautiful dark theme UI, streak tracking, comprehensive progress analytics, and **real email notifications**.

## ✨ Features

### 🔐 Authentication
- User registration and login with Supabase Auth
- Secure session management
- Password visibility toggle
- Beautiful animated auth forms

### 📝 Task Management
- **CRUD Operations**: Create, read, update, and delete tasks
- **Advanced Scheduling**: Complex repeat patterns (daily, weekly, monthly, hourly)
- **Task Categories**: Organize tasks with custom colored categories
- **Drag & Drop**: Reorder tasks with smooth animations
- **Smart Filtering**: Filter by today, tomorrow, upcoming, completed, or incomplete
- **Soft Delete**: Trash system with restore functionality

### 📧 **Real Email Notifications** ✨
- **Smart Reminders**: Customizable email reminders before tasks are due
- **Real-time Notifications**: Instant alerts when tasks become due
- **Daily Digest**: Optional morning summary of your day's tasks
- **Overdue Alerts**: Notifications for missed tasks
- **Flexible Timing**: Set reminder timing from 15 minutes to 24 hours in advance
- **Test Emails**: Send actual test emails to verify your settings
- **Preference Management**: Full control over notification types and timing
- **Production Ready**: Uses Supabase Edge Functions + Resend API for reliable delivery

### 📊 Progress Tracking
- **Daily Progress**: Visual progress bar showing completion percentage
- **Monthly Analytics**: Beautiful charts showing task completion trends
- **Streak Tracking**: Track consecutive days of completing daily tasks
- **Category Statistics**: Performance insights by task category
- **Milestone Celebrations**: Fire emoji for 5+ day streaks

### 🎨 Modern UI/UX
- **Dark Theme**: Elegant dark theme with glass morphism effects
- **Responsive Design**: Works perfectly on desktop and mobile
- **Smooth Animations**: Framer Motion animations throughout
- **Interactive Charts**: ECharts integration for data visualization
- **Toast Notifications**: Real-time feedback for user actions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase account
- (Optional) Resend account for production email delivery

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd daily-task-manager
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
- Create a new project at [supabase.com](https://supabase.com)
- Go to Settings > API and copy your project URL and anon key
- Copy `.env.example` to `.env` and fill in your Supabase credentials

4. **The database schema is automatically created when you first run the app**
- Email notification preferences table is created automatically
- All necessary tables and policies are set up

5. **Start the development server**
```bash
npm run dev
```

## 📧 Email Notification System

### 🎯 **Production Email Setup**

#### Step 1: Get Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. (Optional) Verify your domain for custom from address

#### Step 2: Deploy Supabase Edge Function
1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Deploy the email function:
```bash
supabase functions deploy send-email
```

#### Step 3: Set Environment Variables
In your Supabase dashboard, go to Edge Functions and set:
```
RESEND_API_KEY=your_resend_api_key_here
```

#### Step 4: Test Email Delivery
1. Open your Daily Tasks app
2. Go to the notification settings (bell icon in navbar)
3. Click "Send Test Email"
4. Check your email inbox (including spam folder)

### 📨 **How Email Notifications Work**

1. **User Preferences**: Users configure notification settings via the UI
2. **Task Creation**: When tasks are created, email notifications are automatically scheduled
3. **Smart Scheduling**: Reminders, due alerts, and overdue notifications are timed perfectly
4. **Real Delivery**: Emails are sent via Supabase Edge Functions using Resend API
5. **Graceful Fallback**: Falls back to console preview if email service is unavailable

### 📋 **Notification Types**
- ⏰ **Task Reminders** - Sent before task due time (customizable timing)
- 🔔 **Due Now Alerts** - Sent when tasks become due
- ⚠️ **Overdue Notifications** - Sent for missed tasks
- 📋 **Daily Digest** - Morning summary (optional)

### 🔧 **Email Templates**
All emails use beautiful, responsive HTML templates with:
- Professional design with consistent branding
- Task details and due dates
- Call-to-action buttons
- Mobile-responsive layout
- Dark/light theme support

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard and analytics
│   ├── layout/            # Layout components (includes notification button)
│   ├── settings/          # 📧 Notification settings modal
│   └── tasks/             # Task management components
├── hooks/                 # Custom hooks
│   ├── useEmailNotifications.ts  # 📧 Email notification management
│   └── useTasks.ts        # 📧 Enhanced with email scheduling
├── utils/                 # Utilities
│   └── realEmailService.ts  # 📧 Real email service
├── lib/                   # Configurations
└── types/                 # TypeScript type definitions

supabase/
└── functions/
    └── send-email/        # 📧 Edge function for email delivery
```

## 🛠️ Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Real-time, Edge Functions)
- **Email**: Supabase Edge Functions + Resend API
- **Animations**: Framer Motion
- **Charts**: ECharts
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## 📱 Key Features Explained

### Real Email Notification System
1. **Production Ready**: Uses Supabase Edge Functions for reliable email delivery
2. **Smart Scheduling**: Automatically schedules notifications when tasks are created
3. **User Control**: Complete preference management with intuitive UI
4. **Graceful Fallback**: Falls back to console preview if email service unavailable
5. **Template System**: Beautiful, responsive email templates

### Task Management Logic
- **Smart Scheduling**: Complex repeat patterns with end dates
- **Category Organization**: Visual categorization with custom icons and colors
- **Streak Tracking**: Gamification for recurring tasks
- **Soft Delete**: Trash system for accidental deletions

## 🎯 **What Works Right Now**

✅ **Immediately Functional:**
- Complete email notification system
- Real email delivery (with Resend setup)
- Automatic notification scheduling
- Beautiful email templates
- User preference management

✅ **Email Features:**
- Test email sending
- Task reminder emails
- Due now alerts
- Overdue notifications
- Daily digest emails

## 🔧 Configuration

### Environment Variables
```env
# Supabase (Required)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# For Supabase Edge Function (Required for production emails)
RESEND_API_KEY=your-resend-api-key
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder

### Backend (Supabase)
1. Database and auth are automatically handled
2. Deploy Edge Function for production emails:
```bash
supabase functions deploy send-email
```

## 📊 Email System Status

### ✅ **Production Ready Features**
- Real email delivery via Resend API
- Automatic notification scheduling
- User preference management
- Beautiful responsive email templates
- Error handling and fallbacks

### 🔄 **How to Enable Production Emails**
1. Get Resend API key from [resend.com](https://resend.com)
2. Deploy the Supabase Edge Function: `supabase functions deploy send-email`
3. Add `RESEND_API_KEY` environment variable to Supabase Edge Functions
4. Test with real email addresses

### 📧 **Email Preview**
Even without production setup, you can see beautiful email previews in the browser console when using the demo mode.

---

**Experience the future of task management with real email notifications! 🎯✨**

*The email notification system is production-ready and can be enabled with a simple Resend API key setup.*

## 🆘 Troubleshooting

### Email Issues
- **Emails not sending**: Check Resend API key in Supabase Edge Functions
- **Emails in spam**: Use a verified domain in Resend
- **Console errors**: Check browser network tab for Edge Function issues

### Common Solutions
1. **Check Supabase Edge Function logs** in your Supabase dashboard
2. **Verify environment variables** are set correctly
3. **Test with a simple email** first using the test button
4. **Check spam folder** for delivered emails