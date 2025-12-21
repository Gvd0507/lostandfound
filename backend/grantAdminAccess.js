require('dotenv').config();
const db = require('./src/database/db');

const makeAllStudentsAdmin = async () => {
  try {
    console.log('\n=== GRANTING ADMIN ACCESS ===\n');
    
    // Make all GITAM students admin
    const result = await db.query(`
      UPDATE users 
      SET role = 'admin' 
      WHERE email LIKE '%@student.gitam.edu'
      RETURNING id, email, role
    `);
    
    console.log(`✅ Made ${result.rows.length} users admin:\n`);
    result.rows.forEach(user => {
      console.log(`  ${user.email} - Role: ${user.role}`);
    });
    
    console.log('\n💡 Please logout and login again to activate admin access.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAllStudentsAdmin();
