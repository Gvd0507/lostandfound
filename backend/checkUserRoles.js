require('dotenv').config();
const db = require('./src/database/db');

const checkUsers = async () => {
  try {
    console.log('\n=== CHECKING USER ROLES ===\n');
    
    const users = await db.query('SELECT id, email, role, display_name FROM users ORDER BY id');
    
    console.log('All users:');
    users.rows.forEach(user => {
      console.log(`  ${user.id}: ${user.email} - Role: ${user.role || 'NULL'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();
