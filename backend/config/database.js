/**
 * SQLite Database Configuration
 * Simple file-based database for demonstration
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../househub.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

const testConnection = async () => {
  try {
    db.prepare('SELECT 1').get();
    console.log('✅ SQLite database connected successfully');
    console.log(`📁 Database file: ${dbPath}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = { db, testConnection };
