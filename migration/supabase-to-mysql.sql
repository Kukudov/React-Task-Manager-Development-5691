-- ===============================================
-- Supabase to MySQL Migration Script
-- Daily Task Manager Database
-- ===============================================

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ===============================================
-- 1. Users Table (MySQL equivalent of Supabase auth.users)
-- ===============================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_created_at (created_at)
);

-- ===============================================
-- 2. Categories Table
-- ===============================================
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_categories_user_id (user_id),
    INDEX idx_categories_name (name)
);

-- ===============================================
-- 3. Tasks Table
-- ===============================================
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category_id VARCHAR(36),
    repeat_type ENUM('none', 'daily', 'weekly', 'monthly', 'hourly') DEFAULT 'none',
    repeat_config JSON,
    due_date DATE NOT NULL,
    due_time TIME DEFAULT '09:00:00',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id VARCHAR(36) NOT NULL,
    streak_count INT DEFAULT 0,
    last_completed_date DATE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_tasks_user_id (user_id),
    INDEX idx_tasks_due_date (due_date),
    INDEX idx_tasks_category_id (category_id),
    INDEX idx_tasks_completed (completed),
    INDEX idx_tasks_repeat_type (repeat_type)
);

-- ===============================================
-- 4. Insert Default Categories (Optional)
-- ===============================================
INSERT INTO categories (id, name, color, icon, user_id, created_at, updated_at) VALUES
(UUID(), 'Work', '#3b82f6', 'FiBriefcase', 'default-user-id', NOW(), NOW()),
(UUID(), 'Health', '#22c55e', 'FiHeart', 'default-user-id', NOW(), NOW()),
(UUID(), 'Learning', '#8b5cf6', 'FiBook', 'default-user-id', NOW(), NOW()),
(UUID(), 'Personal', '#f59e0b', 'FiUser', 'default-user-id', NOW(), NOW()),
(UUID(), 'Home', '#ef4444', 'FiHome', 'default-user-id', NOW(), NOW()),
(UUID(), 'Finance', '#06b6d4', 'FiDollarSign', 'default-user-id', NOW(), NOW());

-- ===============================================
-- 5. Create Views for Easier Querying
-- ===============================================
CREATE VIEW task_summary AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.due_date,
    t.due_time,
    t.completed,
    t.repeat_type,
    t.streak_count,
    c.name as category_name,
    c.color as category_color,
    c.icon as category_icon,
    u.email as user_email
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN users u ON t.user_id = u.id;

-- ===============================================
-- 6. Stored Procedures for Common Operations
-- ===============================================

DELIMITER //

-- Procedure to get user's tasks for today
CREATE PROCEDURE GetTodayTasks(IN user_uuid VARCHAR(36))
BEGIN
    SELECT * FROM task_summary 
    WHERE user_id = user_uuid 
    AND due_date = CURDATE()
    ORDER BY due_time, title;
END //

-- Procedure to mark task as complete and update streak
CREATE PROCEDURE CompleteTask(IN task_uuid VARCHAR(36))
BEGIN
    DECLARE current_streak INT DEFAULT 0;
    DECLARE last_date DATE;
    DECLARE yesterday DATE DEFAULT DATE_SUB(CURDATE(), INTERVAL 1 DAY);
    
    -- Get current streak and last completed date
    SELECT streak_count, last_completed_date 
    INTO current_streak, last_date
    FROM tasks 
    WHERE id = task_uuid;
    
    -- Calculate new streak
    IF last_date = yesterday THEN
        SET current_streak = current_streak + 1;
    ELSE
        SET current_streak = 1;
    END IF;
    
    -- Update task
    UPDATE tasks 
    SET completed = TRUE,
        streak_count = current_streak,
        last_completed_date = CURDATE(),
        updated_at = NOW()
    WHERE id = task_uuid;
END //

-- Function to get user's completion rate
CREATE FUNCTION GetCompletionRate(user_uuid VARCHAR(36), date_from DATE, date_to DATE)
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_tasks INT DEFAULT 0;
    DECLARE completed_tasks INT DEFAULT 0;
    DECLARE completion_rate DECIMAL(5,2) DEFAULT 0.00;
    
    SELECT COUNT(*) INTO total_tasks
    FROM tasks 
    WHERE user_id = user_uuid 
    AND due_date BETWEEN date_from AND date_to;
    
    SELECT COUNT(*) INTO completed_tasks
    FROM tasks 
    WHERE user_id = user_uuid 
    AND due_date BETWEEN date_from AND date_to
    AND completed = TRUE;
    
    IF total_tasks > 0 THEN
        SET completion_rate = (completed_tasks / total_tasks) * 100;
    END IF;
    
    RETURN completion_rate;
END //

DELIMITER ;

-- ===============================================
-- 7. Sample Data for Testing (Optional)
-- ===============================================
INSERT INTO users (id, email, password_hash, email_confirmed) VALUES
('test-user-123', 'test@example.com', '$2b$10$example.hash.here', TRUE);

INSERT INTO tasks (id, title, description, due_date, due_time, user_id, repeat_type, completed) VALUES
(UUID(), 'Morning Exercise', 'Go for a 30-minute run', CURDATE(), '07:00:00', 'test-user-123', 'daily', FALSE),
(UUID(), 'Check Emails', 'Review and respond to emails', CURDATE(), '09:00:00', 'test-user-123', 'daily', TRUE),
(UUID(), 'Team Meeting', 'Weekly team standup meeting', CURDATE(), '14:00:00', 'test-user-123', 'weekly', FALSE),
(UUID(), 'Grocery Shopping', 'Buy weekly groceries', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', 'test-user-123', 'none', FALSE);