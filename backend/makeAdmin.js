require('dotenv').config();
const { Pool } = require('pg');
const readline = require('readline');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function makeUserAdmin() {
  try {
    // Show all users
    const users = await pool.query('SELECT id, email, role FROM users ORDER BY created_at');
    
    console.log('\n📋 Available users:');
    users.rows.forEach(user => {
      console.log(`  ${user.id}. ${user.email} (${user.role || 'user'})`);
    });
    
    rl.question('\n🔑 Enter user ID or email to make admin: ', async (input) => {
      try {
        let result;
        
        // Check if input is a number (ID) or email
        if (!isNaN(input)) {
          result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
            ['admin', parseInt(input)]
          );
        } else {
          result = await pool.query(
            'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, role',
            ['admin', input]
          );
        }
        
        if (result.rows.length > 0) {
          const user = result.rows[0];
          console.log(`\n✅ SUCCESS! ${user.email} is now an admin!`);
          console.log(`   ID: ${user.id}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Role: ${user.role}`);
          console.log('\n💡 Now logout and login again in the app to activate admin access.');
        } else {
          console.log('\n❌ User not found. Please check the ID or email.');
        }
        
        await pool.end();
        rl.close();
      } catch (error) {
        console.error('Error:', error.message);
        await pool.end();
        rl.close();
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
    rl.close();
  }
}

makeUserAdmin();
