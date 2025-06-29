# Daily Task Manager

A modern, feature-rich daily task management application built with React, TypeScript, and Supabase. This app helps you stay organized and productive with beautiful dark theme UI, streak tracking, and comprehensive progress analytics.

## ✨ Features

### 🔐 Authentication
- User registration and login with Supabase Auth
- Secure session management
- Password visibility toggle
- Beautiful animated auth forms

### 📝 Task Management
- **CRUD Operations**: Create, read, update, and delete tasks
- **Task Fields**: Title, description, due date, daily repeat option
- **Daily Tasks**: Automatically reschedule completed daily tasks for the next day
- **Drag & Drop**: Reorder tasks with smooth animations
- **Smart Filtering**: Filter by today, tomorrow, upcoming, completed, or incomplete

### 📊 Progress Tracking
- **Daily Progress**: Visual progress bar showing completion percentage
- **Monthly Analytics**: Beautiful charts showing task completion trends
- **Streak Tracking**: Track consecutive days of completing daily tasks
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

4. **Set up the database**
   - Go to your Supabase SQL Editor
   - Run the SQL schema found in `src/lib/supabase.ts`

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard and analytics
│   ├── layout/         # Layout components
│   └── tasks/          # Task management components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
└── common/             # Shared components
```

## 🛠️ Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Real-time)
- **Animations**: Framer Motion
- **Charts**: ECharts
- **Drag & Drop**: @hello-pangea/dnd
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## 📱 Key Features Explained

### Daily Task Logic
When a daily task is marked as completed:
1. The task's streak count is updated
2. A new instance is automatically created for the next day
3. The original task remains as a historical record

### Streak Tracking
- Tracks consecutive days of completing daily tasks
- Displays streak count with fire emoji for 5+ days
- Resets if a day is missed

### Progress Analytics
- **Daily Progress**: Shows percentage of today's tasks completed
- **Monthly Chart**: Visual representation of daily task completion
- **Statistics Cards**: Quick overview of key metrics

### Responsive Design
- Mobile-first approach
- Adaptive layouts for different screen sizes
- Touch-friendly interactions

## 🔧 Configuration

### Environment Variables
Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database Schema
The app uses a single `tasks` table with RLS (Row Level Security) enabled. The schema is automatically created when you run the SQL from `src/lib/supabase.ts`.

## 📈 Performance Optimizations

- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo and useMemo for expensive operations
- **Optimistic Updates**: Immediate UI updates with rollback on error
- **Efficient Queries**: Optimized Supabase queries with proper indexing

## 🎯 Future Enhancements

- [ ] Task categories and tags
- [ ] Collaborative task sharing
- [ ] Push notifications
- [ ] Offline support with sync
- [ ] Advanced analytics and reporting
- [ ] Task templates
- [ ] Time tracking integration
- [ ] Calendar view

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Framer Motion](https://framer.com/motion) for smooth animations
- [ECharts](https://echarts.apache.org) for beautiful charts