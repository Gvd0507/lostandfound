require('dotenv').config();
const db = require('./src/database/db');

const fixWrongMatch = async () => {
  try {
    console.log('Deleting wrong match (powerbank matched with phone)...');
    
    // Delete Match #7 (powerbank-phone mismatch)
    await db.query('DELETE FROM matches WHERE id = 7');
    
    // Reset the items back to pending
    await db.query("UPDATE lost_items SET status = 'pending' WHERE id = 12");
    await db.query("UPDATE found_items SET status = 'pending' WHERE id = 7");
    
    console.log('✅ Wrong match deleted and items reset to pending');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixWrongMatch();
