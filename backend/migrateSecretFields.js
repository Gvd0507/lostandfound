require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateSecretFields() {
  try {
    console.log('\n🔄 Migrating secret question/detail fields...\n');

    // Add new columns with temporary names
    console.log('1️⃣ Adding new columns...');
    
    // Add secret_detail to lost_items (what the owner knows)
    await pool.query(`
      ALTER TABLE lost_items 
      ADD COLUMN IF NOT EXISTS secret_detail TEXT
    `);
    
    // Add secret_question to found_items (what the finder asks)
    await pool.query(`
      ALTER TABLE found_items 
      ADD COLUMN IF NOT EXISTS secret_question TEXT
    `);
    
    console.log('✅ New columns added');

    // For existing data, we can migrate or just mark them as needing update
    console.log('\n2️⃣ Updating existing records to use new fields...');
    
    // Copy existing secret_answer_hash to secret_detail for lost items
    await pool.query(`
      UPDATE lost_items 
      SET secret_detail = 'Please update this item' 
      WHERE secret_detail IS NULL
    `);
    
    // Copy existing secret_detail to secret_question for found items  
    await pool.query(`
      UPDATE found_items 
      SET secret_question = 'Please update this item'
      WHERE secret_question IS NULL
    `);

    console.log('✅ Existing records updated');

    console.log('\n3️⃣ Checking column status...');
    
    const lostColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'lost_items' AND column_name IN ('secret_question', 'secret_answer_hash', 'secret_detail')
      ORDER BY column_name
    `);
    console.log('Lost items columns:', lostColumns.rows.map(r => r.column_name));
    
    const foundColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'found_items' AND column_name IN ('secret_detail', 'secret_question')
      ORDER BY column_name
    `);
    console.log('Found items columns:', foundColumns.rows.map(r => r.column_name));

    console.log('\n✅ Migration complete!');
    console.log('\nNew structure:');
    console.log('📦 Lost Items: secret_detail (the answer/detail only owner knows)');
    console.log('📦 Found Items: secret_question (question for owner to answer)');
    
    await pool.end();
  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

migrateSecretFields();
