// ===============================================
// MySQL Local Configuration
// ===============================================

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const MYSQL_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'your_mysql_password', // Change this
  database: 'daily_tasks',
  multipleStatements: true
};

export async function setupMySQLDatabase() {
  let connection;
  
  try {
    console.log('🔗 Connecting to MySQL...');
    
    // First connect without database to create it
    connection = await mysql.createConnection({
      ...MYSQL_CONFIG,
      database: undefined
    });
    
    // Create database if it doesn't exist
    console.log('🗄️ Creating database...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${MYSQL_CONFIG.database}`);
    await connection.execute(`USE ${MYSQL_CONFIG.database}`);
    
    // Read and execute schema
    console.log('📋 Setting up tables...');
    const schemaPath = path.join('migration', 'supabase-to-mysql.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by statements and execute
    const statements = schema.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    console.log('✅ Database setup completed!');
    
    // Check if exported data exists and import it
    const dataPath = path.join('migration', 'exported-data.sql');
    if (fs.existsSync(dataPath)) {
      console.log('📥 Importing exported data...');
      const data = fs.readFileSync(dataPath, 'utf8');
      const dataStatements = data.split(';').filter(stmt => stmt.trim());
      
      for (const statement of dataStatements) {
        if (statement.trim() && !statement.includes('--')) {
          await connection.execute(statement);
        }
      }
      
      console.log('✅ Data import completed!');
    }
    
    return connection;
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

export { MYSQL_CONFIG };