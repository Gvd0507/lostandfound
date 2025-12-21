const db = require('../database/db');
const { textSimilarity, keywordOverlapScore } = require('./textAnalysis');

/**
 * Check if a found item is a duplicate of existing reports
 * Compares: item name, category, location, and time found
 * Returns the original report if duplicate found, null otherwise
 */
const checkForDuplicates = async (newItem) => {
  try {
    // Get all active found items from the same category (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const result = await db.query(
      `SELECT 
        fi.id, 
        fi.item_name, 
        fi.category, 
        fi.location, 
        fi.date_found, 
        fi.time_found,
        fi.description,
        fi.duplicate_count,
        fi.is_merged,
        fi.merged_with_id,
        fi.user_id
      FROM found_items fi
      WHERE fi.category = $1 
        AND fi.status != 'closed'
        AND fi.date_found >= $2
        AND fi.is_merged = false
      ORDER BY fi.created_at DESC`,
      [newItem.category, sevenDaysAgo.toISOString().split('T')[0]]
    );

    const existingItems = result.rows;

    // Compare new item with each existing item
    for (const existing of existingItems) {
      const similarityScore = calculateItemSimilarity(newItem, existing);
      
      // If similarity is above threshold (85%), consider it a duplicate
      if (similarityScore >= 0.85) {
        console.log(`🔍 Duplicate detected! Similarity: ${(similarityScore * 100).toFixed(1)}%`);
        console.log(`   Original: ${existing.item_name} at ${existing.location}`);
        console.log(`   New: ${newItem.itemName} at ${newItem.location}`);
        return existing;
      }
    }

    return null; // No duplicate found
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return null; // On error, don't block the submission
  }
};

/**
 * Calculate similarity score between two items
 * Considers: item name, location, date, time, and description
 */
const calculateItemSimilarity = (newItem, existingItem) => {
  let scores = [];
  let weights = [];

  // 1. Item name similarity (weight: 35%)
  const nameSimilarity = textSimilarity(
    newItem.itemName || '',
    existingItem.item_name || ''
  );
  scores.push(nameSimilarity);
  weights.push(0.35);

  // 2. Location similarity (weight: 30%)
  const locationSimilarity = textSimilarity(
    newItem.location || '',
    existingItem.location || ''
  );
  scores.push(locationSimilarity);
  weights.push(0.30);

  // 3. Description keyword overlap (weight: 20%)
  const descriptionSimilarity = keywordOverlapScore(
    newItem.description || '',
    existingItem.description || ''
  );
  scores.push(descriptionSimilarity);
  weights.push(0.20);

  // 4. Date proximity (weight: 10%)
  const dateSimilarity = calculateDateSimilarity(
    newItem.dateFound,
    existingItem.date_found
  );
  scores.push(dateSimilarity);
  weights.push(0.10);

  // 5. Time proximity if both have time (weight: 5%)
  if (newItem.timeFound && existingItem.time_found) {
    const timeSimilarity = calculateTimeSimilarity(
      newItem.timeFound,
      existingItem.time_found
    );
    scores.push(timeSimilarity);
    weights.push(0.05);
  }

  // Calculate weighted average
  let totalScore = 0;
  let totalWeight = 0;
  for (let i = 0; i < scores.length; i++) {
    totalScore += scores[i] * weights[i];
    totalWeight += weights[i];
  }

  return totalScore / totalWeight;
};

/**
 * Calculate similarity based on date proximity
 * Same day = 1.0, within 1 day = 0.8, within 2 days = 0.6, etc.
 */
const calculateDateSimilarity = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffDays = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 1.0;
  if (diffDays <= 1) return 0.8;
  if (diffDays <= 2) return 0.6;
  if (diffDays <= 3) return 0.4;
  return 0.0;
};

/**
 * Calculate similarity based on time proximity
 * Within 1 hour = 1.0, within 2 hours = 0.7, within 4 hours = 0.5, etc.
 */
const calculateTimeSimilarity = (time1, time2) => {
  if (!time1 || !time2) return 0.5; // Neutral if time not provided

  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  
  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;
  
  const diffMinutes = Math.abs(minutes1 - minutes2);
  const diffHours = diffMinutes / 60;

  if (diffHours <= 1) return 1.0;
  if (diffHours <= 2) return 0.7;
  if (diffHours <= 4) return 0.5;
  if (diffHours <= 6) return 0.3;
  return 0.0;
};

/**
 * Merge a duplicate report into the original
 * Updates the original's duplicate count and tracks reporters
 */
const mergeDuplicateReport = async (originalId, newReportUserId) => {
  try {
    await db.query(
      `UPDATE found_items 
       SET duplicate_count = duplicate_count + 1,
           duplicate_reporters = array_append(duplicate_reporters, $2::text)
       WHERE id = $1`,
      [originalId, newReportUserId.toString()]
    );

    console.log(`✅ Merged duplicate report into item #${originalId}`);
    return true;
  } catch (error) {
    console.error('Error merging duplicate:', error);
    return false;
  }
};

module.exports = {
  checkForDuplicates,
  mergeDuplicateReport,
  calculateItemSimilarity,
};
