# 🚀 Supabase to MySQL Migration Guide

This guide will help you migrate your Daily Task Manager from Supabase to a local MySQL database.

## 📋 Prerequisites

### 1. Install MySQL
**On macOS (using Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**On Windows:**
- Download MySQL Community Server from [mysql.com](https://dev.mysql.com/downloads/mysql/)
- Run the installer and follow the setup wizard

### 2. Secure MySQL Installation
```bash
sudo mysql_secure_installation
```
- Set a root password
- Remove anonymous users
- Disallow root login remotely
- Remove test database

### 3. Create MySQL User (Optional but Recommended)
```sql
mysql -u root -p
CREATE USER 'taskmanager'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON daily_tasks.* TO 'taskmanager'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 🛠️ Migration Steps

### Step 1: Setup Migration Tools
```bash
# Navigate to migration directory
cd migration

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your MySQL credentials
```

### Step 2: Export Data from Supabase
```bash
# Export all data from Supabase
npm run export
```
This will create:
- `exported-data.sql` - MySQL-compatible SQL file
- `exported-data.json` - JSON backup

### Step 3: Setup MySQL Database
```bash
# Create database and tables
npm run setup
```
This will:
- Create the `daily_tasks` database
- Create all tables with proper schema
- Set up indexes and relationships
- Create stored procedures and views

### Step 4: Verify Migration
```bash
# Test the database setup
npm run test
```
This will:
- Test database connection
- Show table counts
- Display sample data
- Test stored procedures

### Step 5: Complete Migration (All Steps)
```bash
# Run everything in sequence
npm run migrate
```

## 📊 Database Schema Differences

### Supabase → MySQL Mappings

| Supabase Type | MySQL Type | Notes |
|---------------|------------|-------|
| `UUID` | `VARCHAR(36)` | Using UUID() function |
| `JSONB` | `JSON` | MySQL 5.7+ native JSON |
| `TIMESTAMP WITH TIME ZONE` | `TIMESTAMP` | MySQL handles timezone differently |
| `auth.users` | `users` table | Custom user management |

### Key Changes Made

1. **Authentication**: 
   - Replaced Supabase Auth with custom `users` table
   - Added password hashing fields
   - Email confirmation tracking

2. **UUIDs**: 
   - Using MySQL's `UUID()` function
   - VARCHAR(36) storage for compatibility

3. **JSON Fields**: 
   - `repeat_config` uses MySQL JSON type
   - Maintains full functionality

4. **Indexes**: 
   - Optimized for MySQL query patterns
   - Added composite indexes for performance

## 🔧 Configuration Files

### MySQL Connection (`mysql-config.js`)
```javascript
const MYSQL_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'your_password',
  database: 'daily_tasks'
};
```

### Environment Variables (`.env`)
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=daily_tasks
```

## 📈 Performance Optimizations

### Indexes Created
```sql
-- Primary performance indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

### Stored Procedures
- `GetTodayTasks(user_id)` - Optimized today's tasks query
- `CompleteTask(task_id)` - Handle task completion with streaks
- `GetCompletionRate(user_id, from_date, to_date)` - Calculate completion rates

## 🔍 Troubleshooting

### Common Issues

**1. MySQL Connection Refused**
```bash
# Check if MySQL is running
sudo systemctl status mysql
# Start MySQL if stopped
sudo systemctl start mysql
```

**2. Permission Denied**
```sql
-- Grant proper permissions
GRANT ALL PRIVILEGES ON daily_tasks.* TO 'username'@'localhost';
FLUSH PRIVILEGES;
```

**3. Character Encoding Issues**
```sql
-- Set proper character set
ALTER DATABASE daily_tasks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**4. JSON Column Issues (MySQL < 5.7)**
- Upgrade to MySQL 5.7+ or MariaDB 10.2+
- Alternative: Use TEXT column with JSON validation

### Verification Queries

**Check table structure:**
```sql
DESCRIBE tasks;
SHOW CREATE TABLE tasks;
```

**Verify data integrity:**
```sql
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM categories;
SELECT * FROM task_summary LIMIT 5;
```

**Test stored procedures:**
```sql
CALL GetTodayTasks('user-id-here');
SELECT GetCompletionRate('user-id-here', '2024-01-01', '2024-12-31');
```

## 🚀 Next Steps

### Update Application Configuration

After successful migration, update your app to use MySQL:

1. **Install MySQL client:**
```bash
npm install mysql2
```

2. **Update connection configuration:**
```javascript
import mysql from 'mysql2/promise';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'taskmanager',
  password: 'secure_password',
  database: 'daily_tasks'
});
```

3. **Replace Supabase queries with MySQL queries**
4. **Implement custom authentication** (replace Supabase Auth)
5. **Test all functionality** thoroughly

### Production Considerations

- **Backup Strategy**: Set up automated MySQL backups
- **Security**: Use SSL connections, limit user permissions
- **Performance**: Monitor and optimize queries
- **Scaling**: Consider read replicas for high traffic

## 📋 Migration Checklist

- [ ] MySQL server installed and running
- [ ] Migration tools setup (`npm install`)
- [ ] Environment variables configured
- [ ] Data exported from Supabase
- [ ] MySQL database created
- [ ] Tables and schema setup
- [ ] Data imported successfully
- [ ] Stored procedures created
- [ ] Connection tested
- [ ] Sample queries verified
- [ ] Application updated to use MySQL
- [ ] Authentication system implemented
- [ ] Full functionality tested

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify MySQL server status and permissions
3. Review error logs in the console output
4. Test with sample data first
5. Ensure MySQL version compatibility (5.7+)

**Success! 🎉** Your Daily Task Manager is now running on MySQL locally.