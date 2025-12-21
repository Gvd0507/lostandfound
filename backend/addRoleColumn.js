require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addRoleColumn() {
  try {
    // Add role column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'
    `);
    console.log('✓ Role column added successfully');
    
    // List all users
    const result = await pool.query('SELECT id, email, role FROM users ORDER BY created_at');
    console.log('\n📋 Current users in database:');
    if (result.rows.length === 0) {
      console.log('No users found. Register a user first!');
    } else {
      result.rows.forEach(user => {
        console.log(`  ID: ${user.id} | Email: ${user.email} | Role: ${user.role || 'user'}`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addRoleColumn();
