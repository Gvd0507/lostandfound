require('dotenv').config();
const db = require('./src/database/db');

const resetAdminAccess = async () => {
  try {
    console.log('\n=== RESETTING ADMIN ACCESS ===\n');
    
    // Set all users to 'user' role first
    await db.query(`UPDATE users SET role = 'user'`);
    console.log('✓ Reset all users to regular users');
    
    // Set only vgade@student.gitam.edu as admin
    const result = await db.query(`
      UPDATE users 
      SET role = 'admin' 
      WHERE email = 'vgade@student.gitam.edu'
      RETURNING id, email, role
    `);
    
    if (result.rows.length > 0) {
      console.log(`✅ Admin access granted to: ${result.rows[0].email}\n`);
    } else {
      console.log('⚠️  User vgade@student.gitam.edu not found!\n');
    }
    
    // Show all users
    const allUsers = await db.query('SELECT id, email, role FROM users ORDER BY id');
    console.log('Current user roles:');
    allUsers.rows.forEach(user => {
      console.log(`  ${user.email} - ${user.role}`);
    });
    
    console.log('\n💡 Users need to logout and login again to see changes.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetAdminAccess();
