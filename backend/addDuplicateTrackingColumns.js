require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addDuplicateTrackingColumns() {
  try {
    // Add columns to track merged/duplicate reports
    await pool.query(`
      ALTER TABLE found_items 
      ADD COLUMN IF NOT EXISTS is_merged BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS merged_with_id INTEGER REFERENCES found_items(id),
      ADD COLUMN IF NOT EXISTS duplicate_count INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS duplicate_reporters TEXT[] DEFAULT ARRAY[]::TEXT[]
    `);
    
    console.log('✅ Added duplicate tracking columns to found_items table');
    
    // Verify the columns were added
    const result = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'found_items' 
        AND column_name IN ('is_merged', 'merged_with_id', 'duplicate_count', 'duplicate_reporters')
    `);
    
    console.log('\n📋 Duplicate tracking fields in found_items:');
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

addDuplicateTrackingColumns();
