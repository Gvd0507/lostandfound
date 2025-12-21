require('dotenv').config();
const db = require('./src/database/db');

const checkAllMatches = async () => {
  try {
    const result = await db.query(`
      SELECT 
        m.id, 
        m.status, 
        li.item_name as lost, 
        li.user_id as lost_user, 
        fi.item_name as found, 
        fi.user_id as found_user, 
        fi.secret_question 
      FROM matches m 
      JOIN lost_items li ON m.lost_item_id = li.id 
      JOIN found_items fi ON m.found_item_id = fi.id 
      ORDER BY m.created_at DESC
    `);
    
    console.log('\nALL MATCHES:\n');
    result.rows.forEach(m => {
      console.log(`Match ${m.id}: ${m.status}`);
      console.log(`  Lost: '${m.lost}' (user ${m.lost_user})`);
      console.log(`  Found: '${m.found}' (user ${m.found_user})`);
      console.log(`  Question: '${m.secret_question}'`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAllMatches();
