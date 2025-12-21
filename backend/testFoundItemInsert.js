require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testFoundItemInsert() {
  try {
    console.log('\n🧪 Testing found item insertion...\n');

    // Test insert with minimal data
    const result = await pool.query(
      `INSERT INTO found_items 
       (user_id, item_name, category, description, location, date_found, image_url, secret_detail, where_to_find)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        1, // user_id
        'Test Item',
        'Electronics',
        'Test description',
        'Test location',
        '2025-12-21',
        'https://test-image.jpg',
        'Test secret',
        'Test pickup location'
      ]
    );

    console.log('✅ Insert successful!');
    console.log('Inserted item:', result.rows[0]);

    // Check total count
    const countResult = await pool.query('SELECT COUNT(*) as count FROM found_items');
    console.log(`\n📦 Total found items: ${countResult.rows[0].count}`);

    // Delete the test item
    await pool.query('DELETE FROM found_items WHERE item_name = $1', ['Test Item']);
    console.log('\n🗑️  Test item deleted');

    await pool.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    await pool.end();
    process.exit(1);
  }
}

testFoundItemInsert();
