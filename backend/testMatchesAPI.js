require('dotenv').config();
const db = require('./src/database/db');

const testMatchesAPI = async () => {
  try {
    // Simulate getting matches for user 3 (bpenta - lost item owner)
    const userId = 3;
    
    const result = await db.query(
      `SELECT 
        m.*,
        li.item_name as lost_item_name,
        li.category as lost_category,
        li.image_url as lost_image_url,
        li.user_id as lost_user_id,
        fi.item_name as found_item_name,
        fi.category as found_category,
        fi.image_url as found_image_url,
        fi.user_id as found_user_id,
        fi.secret_question,
        fi.where_to_find
      FROM matches m
      JOIN lost_items li ON m.lost_item_id = li.id
      JOIN found_items fi ON m.found_item_id = fi.id
      WHERE li.user_id = $1 OR fi.user_id = $1
      ORDER BY m.created_at DESC`,
      [userId]
    );
    
    console.log('\n=== MATCHES API RESPONSE FOR USER', userId, '===\n');
    
    const matches = result.rows.map(match => {
      const isLostReporter = match.lost_user_id === userId;
      
      return {
        id: match.id,
        status: match.status,
        yourItem: { type: isLostReporter ? 'lost' : 'found' },
        secretQuestion: isLostReporter ? match.secret_question : null,
        whereToFind: isLostReporter ? match.where_to_find : null,
        _debug: {
          isLostReporter,
          lost_user_id: match.lost_user_id,
          found_user_id: match.found_user_id,
          rawSecretQuestion: match.secret_question
        }
      };
    });
    
    console.log(JSON.stringify(matches, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testMatchesAPI();
