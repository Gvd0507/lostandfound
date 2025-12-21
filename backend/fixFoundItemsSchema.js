require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

const fixSchema = async () => {
  try {
    console.log('Fixing found_items table schema...');

    // Remove secret_detail column (not needed for found items)
    await pool.query(`
      ALTER TABLE found_items 
      DROP COLUMN IF EXISTS secret_detail;
    `);
    console.log('✓ Removed secret_detail column from found_items');

    // Add secret_question and secret_answer_hash if they don't exist
    await pool.query(`
      ALTER TABLE found_items 
      ADD COLUMN IF NOT EXISTS secret_question TEXT NOT NULL DEFAULT 'Not specified',
      ADD COLUMN IF NOT EXISTS secret_answer_hash TEXT NOT NULL DEFAULT 'Not specified';
    `);
    console.log('✓ Added secret_question and secret_answer_hash columns');

    // Remove defaults
    await pool.query(`
      ALTER TABLE found_items 
      ALTER COLUMN secret_question DROP DEFAULT,
      ALTER COLUMN secret_answer_hash DROP DEFAULT;
    `);
    console.log('✓ Removed defaults from secret columns');

    console.log('\n✅ Schema fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema fix failed:', error);
    process.exit(1);
  }
};

fixSchema();
