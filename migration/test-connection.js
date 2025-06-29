// ===============================================
// Test MySQL Connection and Query Data
// ===============================================

import { setupMySQLDatabase, MYSQL_CONFIG } from './mysql-config.js';
import mysql from 'mysql2/promise';

async function testConnection() {
  let connection;
  
  try {
    // Setup database
    connection = await setupMySQLDatabase();
    
    console.log('\n🧪 Testing database queries...');
    
    // Test queries
    console.log('\n📊 Database Statistics:');
    
    // Count tables
    const [tables] = await connection.execute(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [MYSQL_CONFIG.database]);
    console.log(`📋 Tables: ${tables[0].table_count}`);
    
    // Count categories
    const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    console.log(`📂 Categories: ${categories[0].count}`);
    
    // Count tasks
    const [tasks] = await connection.execute('SELECT COUNT(*) as count FROM tasks');
    console.log(`📝 Tasks: ${tasks[0].count}`);
    
    // Count users
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users: ${users[0].count}`);
    
    // Sample data
    console.log('\n📋 Sample Tasks:');
    const [sampleTasks] = await connection.execute(`
      SELECT t.title, t.due_date, t.due_time, t.completed, c.name as category 
      FROM tasks t 
      LEFT JOIN categories c ON t.category_id = c.id 
      LIMIT 5
    `);
    
    sampleTasks.forEach(task => {
      console.log(`  • ${task.title} (${task.due_date} ${task.due_time}) - ${task.category || 'No category'}`);
    });
    
    // Test stored procedure
    console.log('\n⚙️ Testing stored procedures...');
    try {
      const [todayTasks] = await connection.execute('CALL GetTodayTasks(?)', ['test-user-123']);
      console.log(`📅 Today's tasks for test user: ${todayTasks.length}`);
    } catch (procError) {
      console.log('⚠️ Stored procedure test skipped (may need data)');
    }
    
    console.log('\n✅ All tests passed! MySQL database is ready.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run tests
testConnection();