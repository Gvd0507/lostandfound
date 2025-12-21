require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

const addTimeColumns = async () => {
  try {
    console.log('Adding time_lost and time_found columns...');

    // Add time_lost column to lost_items table
    await pool.query(`
      ALTER TABLE lost_items 
      ADD COLUMN IF NOT EXISTS time_lost TIME;
    `);
    console.log('✓ Added time_lost column to lost_items');

    // Add time_found column to found_items table
    await pool.query(`
      ALTER TABLE found_items 
      ADD COLUMN IF NOT EXISTS time_found TIME;
    `);
    console.log('✓ Added time_found column to found_items');

    // Also add where_to_find column to found_items if it doesn't exist
    await pool.query(`
      ALTER TABLE found_items 
      ADD COLUMN IF NOT EXISTS where_to_find TEXT;
    `);
    console.log('✓ Added where_to_find column to found_items');

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

addTimeColumns();
