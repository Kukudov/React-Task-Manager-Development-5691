// ===============================================
// Supabase Data Export Script
// Run this to export data from Supabase
// ===============================================

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Your Supabase credentials
const SUPABASE_URL = 'https://hhfenfbfallnzeeksnir.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZmVuZmJmYWxsbnplZWtzbmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTAzMDksImV4cCI6MjA2Njc4NjMwOX0.IeR-F2SyyvLB_PVdvaA3iPynnwiFIMf288_KFadWl2U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function exportData() {
  try {
    console.log('🚀 Starting data export from Supabase...');
    
    // Export categories
    console.log('📂 Exporting categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories_dt2024')
      .select('*');
    
    if (categoriesError) throw categoriesError;
    
    // Export tasks
    console.log('📝 Exporting tasks...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks_dt2024')
      .select('*');
    
    if (tasksError) throw tasksError;
    
    // Generate MySQL INSERT statements
    const generateInsert = (tableName, data, columnMapping = {}) => {
      if (!data || data.length === 0) return '';
      
      const columns = Object.keys(data[0]);
      const mappedColumns = columns.map(col => columnMapping[col] || col);
      
      let sql = `-- Insert data into ${tableName}\n`;
      sql += `INSERT INTO ${tableName} (${mappedColumns.join(', ')}) VALUES\n`;
      
      const values = data.map(row => {
        const rowValues = columns.map(col => {
          const value = row[col];
          if (value === null || value === undefined) return 'NULL';
          if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
          if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
          if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
          return value;
        });
        return `(${rowValues.join(', ')})`;
      });
      
      sql += values.join(',\n') + ';\n\n';
      return sql;
    };
    
    // Column mappings for MySQL compatibility
    const categoryMapping = {
      'user_id': 'user_id',
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    };
    
    const taskMapping = {
      'category_id': 'category_id',
      'repeat_type': 'repeat_type',
      'repeat_config': 'repeat_config',
      'due_date': 'due_date',
      'due_time': 'due_time',
      'user_id': 'user_id',
      'streak_count': 'streak_count',
      'last_completed_date': 'last_completed_date',
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    };
    
    // Generate SQL file
    let exportSql = '-- ===============================================\n';
    exportSql += '-- Exported Data from Supabase\n';
    exportSql += `-- Generated on: ${new Date().toISOString()}\n`;
    exportSql += '-- ===============================================\n\n';
    
    exportSql += '-- Clear existing data (uncomment if needed)\n';
    exportSql += '-- DELETE FROM tasks;\n';
    exportSql += '-- DELETE FROM categories;\n\n';
    
    exportSql += generateInsert('categories', categories, categoryMapping);
    exportSql += generateInsert('tasks', tasks, taskMapping);
    
    // Export to file
    const exportDir = 'migration';
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    const exportPath = path.join(exportDir, 'exported-data.sql');
    fs.writeFileSync(exportPath, exportSql);
    
    console.log('✅ Data export completed!');
    console.log(`📁 Categories exported: ${categories.length}`);
    console.log(`📝 Tasks exported: ${tasks.length}`);
    console.log(`💾 SQL file saved to: ${exportPath}`);
    
    // Also save as JSON for backup
    const jsonData = {
      categories,
      tasks,
      exportDate: new Date().toISOString()
    };
    
    const jsonPath = path.join(exportDir, 'exported-data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    console.log(`📄 JSON backup saved to: ${jsonPath}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  }
}

// Run the export
exportData();