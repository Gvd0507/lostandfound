const { cosineSimilarity } = require('./imageAnalysis');
const { 
  semanticSimilarity, 
  temporalProximity, 
  spatialProximity 
} = require('./textAnalysis');
const config = require('../config');
const db = require('../database/db');
const { createNotification } = require('../controllers/notificationsController');

// Calculate overall match score
const calculateMatchScore = (lostItem, foundItem) => {
  // CRITICAL: Categories MUST match exactly - no cross-category matching
  if (lostItem.category !== foundItem.category) {
    return {
      totalScore: 0,
      breakdown: {
        image: 0,
        description: 0,
        itemName: 0,
        category: 0,
        temporal: 0,
        spatial: 0,
      },
      reason: 'Category mismatch'
    };
  }

  let scores = {
    image: 0,
    description: 0,
    itemName: 0,
    category: 1.0, // Already verified above
    temporal: 0,
    spatial: 0,
  };

  // Item name similarity (CRITICAL - must be similar)
  scores.itemName = semanticSimilarity(
    lostItem.item_name.toLowerCase(),
    foundItem.item_name.toLowerCase()
  );

  // REJECT if item names are too different
  if (scores.itemName < 0.4) {
    return {
      totalScore: 0,
      breakdown: scores,
      reason: `Item names too different: "${lostItem.item_name}" vs "${foundItem.item_name}"`
    };
  }

  // Image similarity (if both have images)
  if (lostItem.image_features && foundItem.image_features) {
    const lostFeatures = JSON.parse(lostItem.image_features);
    const foundFeatures = JSON.parse(foundItem.image_features);
    scores.image = cosineSimilarity(lostFeatures, foundFeatures);
  }

  // Description similarity
  scores.description = semanticSimilarity(lostItem.description, foundItem.description);

  // Temporal proximity (date lost vs date found)
  scores.temporal = temporalProximity(lostItem.date_lost, foundItem.date_found);

  // Spatial proximity (location similarity)
  scores.spatial = spatialProximity(lostItem.location, foundItem.location);

  // Weighted average with item name as critical factor
  const weights = {
    itemName: 0.25,    // 25% - CRITICAL
    image: 0.30,       // 30% weight
    description: 0.25, // 25% weight
    category: 0.10,    // 10% weight (already checked)
    temporal: 0.05,    // 5% weight
    spatial: 0.05,     // 5% weight
  };

  const totalScore = 
    (scores.itemName * weights.itemName) +
    (scores.image * weights.image) +
    (scores.description * weights.description) +
    (scores.category * weights.category) +
    (scores.temporal * weights.temporal) +
    (scores.spatial * weights.spatial);

  return {
    totalScore: Math.min(totalScore, 1.0),
    breakdown: scores,
  };
};

// Find potential matches for a lost item
const findMatchesForLostItem = async (lostItemId) => {
  try {
    // Get the lost item
    const lostResult = await db.query(
      'SELECT * FROM lost_items WHERE id = $1',
      [lostItemId]
    );
    
    if (lostResult.rows.length === 0) {
      throw new Error('Lost item not found');
    }

    const lostItem = lostResult.rows[0];

    // Get all pending found items in the same category
    const foundResult = await db.query(
      `SELECT * FROM found_items 
       WHERE status = 'pending' 
       AND category = $1 
       ORDER BY date_found DESC`,
      [lostItem.category]
    );

    const potentialMatches = [];

    for (const foundItem of foundResult.rows) {
      const matchScore = calculateMatchScore(lostItem, foundItem);

      if (matchScore.totalScore >= config.ai.matchScoreThreshold) {
        potentialMatches.push({
          foundItem,
          score: matchScore,
        });
      }
    }

    // Sort by score (highest first)
    potentialMatches.sort((a, b) => b.score.totalScore - a.score.totalScore);

    return potentialMatches;
  } catch (error) {
    console.error('Error finding matches for lost item:', error);
    throw error;
  }
};

// Find potential matches for a found item
const findMatchesForFoundItem = async (foundItemId) => {
  try {
    // Get the found item
    const foundResult = await db.query(
      'SELECT * FROM found_items WHERE id = $1',
      [foundItemId]
    );
    
    if (foundResult.rows.length === 0) {
      throw new Error('Found item not found');
    }

    const foundItem = foundResult.rows[0];

    // Get all pending lost items in the same category
    const lostResult = await db.query(
      `SELECT * FROM lost_items 
       WHERE status = 'pending' 
       AND category = $1 
       ORDER BY date_lost DESC`,
      [foundItem.category]
    );

    const potentialMatches = [];

    for (const lostItem of lostResult.rows) {
      const matchScore = calculateMatchScore(lostItem, foundItem);

      if (matchScore.totalScore >= config.ai.matchScoreThreshold) {
        potentialMatches.push({
          lostItem,
          score: matchScore,
        });
      }
    }

    // Sort by score (highest first)
    potentialMatches.sort((a, b) => b.score.totalScore - a.score.totalScore);

    return potentialMatches;
  } catch (error) {
    console.error('Error finding matches for found item:', error);
    throw error;
  }
};

// Create a match in the database
const createMatch = async (lostItemId, foundItemId, matchScore) => {
  try {
    const result = await db.query(
      `INSERT INTO matches 
       (lost_item_id, found_item_id, match_score, image_similarity, text_similarity, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        lostItemId,
        foundItemId,
        matchScore.totalScore,
        matchScore.breakdown.image,
        matchScore.breakdown.description,
        'matched'
      ]
    );

    const matchId = result.rows[0].id;

    // Update item statuses
    await db.query(
      'UPDATE lost_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['matched', lostItemId]
    );
    await db.query(
      'UPDATE found_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['matched', foundItemId]
    );

    // Get item details for notifications
    const lostItemResult = await db.query(
      'SELECT item_name, user_id FROM lost_items WHERE id = $1',
      [lostItemId]
    );
    const foundItemResult = await db.query(
      'SELECT item_name, user_id FROM found_items WHERE id = $1',
      [foundItemId]
    );

    const lostItem = lostItemResult.rows[0];
    const foundItem = foundItemResult.rows[0];

    // Create notifications for both users
    await createNotification(
      lostItem.user_id,
      'match_found',
      'Match Found!',
      `We found a potential match for your lost item: ${lostItem.item_name}`,
      matchId
    );

    await createNotification(
      foundItem.user_id,
      'match_found',
      'Match Found!',
      `We found a potential match for your found item: ${foundItem.item_name}`,
      matchId
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
};

// Automatic matching when new item is reported
const autoMatch = async (itemType, itemId) => {
  try {
    let matches;
    
    if (itemType === 'lost') {
      matches = await findMatchesForLostItem(itemId);
      
      if (matches.length > 0) {
        // Create match with the best candidate
        const bestMatch = matches[0];
        await createMatch(itemId, bestMatch.foundItem.id, bestMatch.score);
        return { matched: true, matchCount: matches.length };
      }
    } else if (itemType === 'found') {
      matches = await findMatchesForFoundItem(itemId);
      
      if (matches.length > 0) {
        // Create match with the best candidate
        const bestMatch = matches[0];
        await createMatch(bestMatch.lostItem.id, itemId, bestMatch.score);
        return { matched: true, matchCount: matches.length };
      }
    }

    return { matched: false, matchCount: 0 };
  } catch (error) {
    console.error('Error in auto matching:', error);
    throw error;
  }
};

module.exports = {
  calculateMatchScore,
  findMatchesForLostItem,
  findMatchesForFoundItem,
  createMatch,
  autoMatch,
};
