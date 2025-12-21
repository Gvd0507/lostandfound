require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSecretFields() {
  try {
    const result = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('lost_items', 'found_items') 
        AND column_name LIKE '%secret%' 
      ORDER BY table_name, column_name
    `);
    
    console.log('\n📋 Secret-related fields:\n');
    result.rows.forEach(row => {
      console.log(`${row.table_name}.${row.column_name} (${row.data_type})`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

checkSecretFields();
