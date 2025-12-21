require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

const fixSchema = async () => {
  try {
    console.log('Fixing lost_items table schema...');

    // Remove old columns (secret_question, secret_answer_hash)
    await pool.query(`
      ALTER TABLE lost_items 
      DROP COLUMN IF EXISTS secret_question,
      DROP COLUMN IF EXISTS secret_answer_hash;
    `);
    console.log('✓ Removed old secret_question and secret_answer_hash columns');

    // Add secret_detail column if it doesn't exist
    await pool.query(`
      ALTER TABLE lost_items 
      ADD COLUMN IF NOT EXISTS secret_detail TEXT NOT NULL DEFAULT 'Not specified';
    `);
    console.log('✓ Added secret_detail column');

    // Remove the default after adding the column
    await pool.query(`
      ALTER TABLE lost_items 
      ALTER COLUMN secret_detail DROP DEFAULT;
    `);
    console.log('✓ Removed default from secret_detail');

    console.log('\n✅ Schema fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema fix failed:', error);
    process.exit(1);
  }
};

fixSchema();
