require('dotenv').config();
const db = require('./src/database/db');

const createTestMatch = async () => {
  try {
    console.log('\n=== Creating Test Match for Verification ===\n');
    
    // Reset match #8 back to 'matched' status so you can test verification
    await db.query(`
      UPDATE matches 
      SET status = 'matched', 
          verification_attempts = 0,
          verified_at = NULL
      WHERE id = 8
    `);
    
    // Also reset the items back to 'matched' status
    await db.query(`UPDATE lost_items SET status = 'matched' WHERE id = 13`);
    await db.query(`UPDATE found_items SET status = 'matched' WHERE id = 10`);
    
    console.log('✅ Match #8 reset to "matched" status');
    console.log('   Lost item: powerbank (user 3 - bpenta)');
    console.log('   Found item: powerbank (user 2 - scheruku)');
    console.log('   Question: "how many c ports and a ports does it have"');
    console.log('   Answer: "4"');
    console.log('\n💡 Now login as bpenta@student.gitam.edu to see the verification button!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestMatch();
