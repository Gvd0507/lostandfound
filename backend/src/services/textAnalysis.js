const natural = require('natural');
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

// Calculate Levenshtein distance
const levenshteinDistance = (str1, str2) => {
  return natural.LevenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
};

// Calculate text similarity using Levenshtein
const textSimilarity = (text1, text2) => {
  const str1 = text1.toLowerCase().trim();
  const str2 = text2.toLowerCase().trim();

  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  const maxLength = Math.max(str1.length, str2.length);
  const distance = levenshteinDistance(str1, str2);

  return 1 - (distance / maxLength);
};

// Extract keywords using TF-IDF
const extractKeywords = (text, maxKeywords = 10) => {
  const tfidf = new TfIdf();
  tfidf.addDocument(text.toLowerCase());

  const keywords = [];
  tfidf.listTerms(0).slice(0, maxKeywords).forEach(item => {
    keywords.push(item.term);
  });

  return keywords;
};

// Calculate keyword overlap score (Jaccard similarity)
const keywordOverlapScore = (text1, text2) => {
  const tokens1 = new Set(tokenizer.tokenize(text1.toLowerCase()));
  const tokens2 = new Set(tokenizer.tokenize(text2.toLowerCase()));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return intersection.size / union.size;
};

// Calculate semantic similarity using multiple methods
const semanticSimilarity = (text1, text2) => {
  // Combine multiple similarity measures
  const levenSim = textSimilarity(text1, text2);
  const keywordSim = keywordOverlapScore(text1, text2);
  
  // Weighted average
  return (levenSim * 0.4) + (keywordSim * 0.6);
};

// Check temporal proximity (dates within a reasonable range)
const temporalProximity = (date1, date2, maxDaysDiff = 7) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 1.0;
  if (diffDays > maxDaysDiff) return 0.0;
  
  return 1 - (diffDays / maxDaysDiff);
};

// Check spatial proximity (location similarity)
const spatialProximity = (location1, location2) => {
  return textSimilarity(location1, location2);
};

module.exports = {
  levenshteinDistance,
  textSimilarity,
  extractKeywords,
  keywordOverlapScore,
  semanticSimilarity,
  temporalProximity,
  spatialProximity,
};
