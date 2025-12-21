require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addSecretAnswerHashColumn() {
  try {
    // Add secret_answer_hash column to found_items
    await pool.query(`
      ALTER TABLE found_items 
      ADD COLUMN IF NOT EXISTS secret_answer_hash TEXT
    `);
    
    console.log('✅ Added secret_answer_hash column to found_items table');
    
    // Verify the column was added
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'found_items' 
        AND column_name LIKE '%secret%'
    `);
    
    console.log('\n📋 Secret fields in found_items:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addSecretAnswerHashColumn();
