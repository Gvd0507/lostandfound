require('dotenv').config();
const db = require('./src/database/db');

const checkMatches = async () => {
  try {
    console.log('\n=== CHECKING MATCHES ===\n');
    
    const matches = await db.query(`
      SELECT 
        m.id as match_id,
        m.match_score,
        m.status as match_status,
        l.id as lost_id,
        l.item_name as lost_name,
        l.image_url as lost_image,
        f.id as found_id,
        f.item_name as found_name,
        f.image_url as found_image,
        l.user_id as lost_user,
        f.user_id as found_user
      FROM matches m
      JOIN lost_items l ON m.lost_item_id = l.id
      JOIN found_items f ON m.found_item_id = f.id
      ORDER BY m.created_at DESC
      LIMIT 10
    `);
    
    console.log('Total matches:', matches.rows.length);
    console.log('\n');
    
    matches.rows.forEach((match, idx) => {
      console.log(`Match #${idx + 1}:`);
      console.log(`  Match ID: ${match.match_id}`);
      console.log(`  Score: ${(match.match_score * 100).toFixed(1)}%`);
      console.log(`  Status: ${match.match_status}`);
      console.log(`  Lost: "${match.lost_name}" (ID: ${match.lost_id}, User: ${match.lost_user})`);
      console.log(`  Lost Image: ${match.lost_image ? match.lost_image.substring(0, 60) + '...' : 'No image'}`);
      console.log(`  Found: "${match.found_name}" (ID: ${match.found_id}, User: ${match.found_user})`);
      console.log(`  Found Image: ${match.found_image ? match.found_image.substring(0, 60) + '...' : 'No image'}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkMatches();
