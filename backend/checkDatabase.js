require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
  try {
    console.log('\n🔍 Checking database status...\n');

    // Check users table
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users: ${usersResult.rows[0].count} records`);
    
    const usersList = await pool.query('SELECT id, email, role FROM users ORDER BY created_at LIMIT 5');
    if (usersList.rows.length > 0) {
      console.log('   Sample users:');
      usersList.rows.forEach(u => console.log(`   - ${u.email} (${u.role || 'user'})`));
    }

    // Check lost_items
    const lostResult = await pool.query('SELECT COUNT(*) as count FROM lost_items');
    console.log(`\n📦 Lost Items: ${lostResult.rows[0].count} records`);

    // Check found_items
    const foundResult = await pool.query('SELECT COUNT(*) as count FROM found_items');
    console.log(`📦 Found Items: ${foundResult.rows[0].count} records`);

    // Check matches
    const matchesResult = await pool.query('SELECT COUNT(*) as count FROM matches');
    console.log(`🔗 Matches: ${matchesResult.rows[0].count} records`);

    // Check notifications
    const notificationsResult = await pool.query('SELECT COUNT(*) as count FROM notifications');
    console.log(`🔔 Notifications: ${notificationsResult.rows[0].count} records`);

    // Check admin_cases
    const adminCasesResult = await pool.query('SELECT COUNT(*) as count FROM admin_cases');
    console.log(`⚖️  Admin Cases: ${adminCasesResult.rows[0].count} records`);

    // Check if where_to_find column exists
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'found_items' AND column_name = 'where_to_find'
    `);
    console.log(`\n✓ where_to_find column exists: ${columnsResult.rows.length > 0 ? 'Yes' : 'No'}`);

    // Check if role column exists
    const roleResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    console.log(`✓ role column exists: ${roleResult.rows.length > 0 ? 'Yes' : 'No'}`);

    console.log('\n✅ Database check complete!\n');
    
    await pool.end();
  } catch (error) {
    console.error('\n❌ Database error:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Database connection lost');
    console.error('2. Tables were dropped');
    console.error('3. Wrong database connection string');
    console.error('\nTo fix: Run "node src/database/setup.js" to recreate tables\n');
    await pool.end();
    process.exit(1);
  }
}

checkDatabase();
