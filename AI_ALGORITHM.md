# AI Matching Algorithm Documentation

## Overview

The Lost and Found system uses a sophisticated multi-factor matching algorithm that combines computer vision and natural language processing to automatically match lost items with found items.

## Algorithm Architecture

### 1. Hybrid Matching Approach

The algorithm uses five key factors to determine if a found item matches a lost item:

```
Match Score = (0.35 × Image Similarity) + 
              (0.30 × Text Similarity) + 
              (0.15 × Category Match) + 
              (0.10 × Temporal Proximity) + 
              (0.10 × Spatial Proximity)
```

### 2. Component Breakdown

#### 2.1 Image Similarity (35% weight)

**Technology**: MobileNet CNN (Convolutional Neural Network)

**How it works**:
1. When an image is uploaded, it's processed through MobileNet
2. Extract 1024-dimensional feature vector from the penultimate layer
3. These features represent the "essence" of the image
4. Compare vectors using cosine similarity

**Code Implementation**:
```javascript
// Extract features
const imageTensor = tf.node.decodeImage(imageBuffer, 3);
const activation = model.infer(imageTensor, true);
const features = await activation.array();

// Calculate similarity
cosineSimilarity = dotProduct / (normA * normB);
```

**Why MobileNet?**
- Lightweight (runs on CPU)
- Pre-trained on ImageNet (1000 object categories)
- Good at recognizing common objects
- Fast inference time (~100ms)

**Threshold**: 0.75 (75% similarity)

#### 2.2 Text Similarity (30% weight)

**Technologies**: 
- Natural Language Toolkit (Natural.js)
- TF-IDF (Term Frequency-Inverse Document Frequency)
- Levenshtein Distance

**How it works**:
1. **Tokenization**: Break descriptions into words
2. **Stop Words Removal**: Filter common words (the, a, is, etc.)
3. **TF-IDF Analysis**: Identify important keywords
4. **Semantic Matching**: 
   - 40% Levenshtein similarity (character-level)
   - 60% Keyword overlap (Jaccard similarity)

**Example**:
```
Lost: "Blue Nike backpack with torn strap"
Found: "Blue Nike bag with damaged strap"

Tokens Lost: [blue, nike, backpack, torn, strap]
Tokens Found: [blue, nike, bag, damaged, strap]
Overlap: {blue, nike, strap} = 3/6 = 0.5
Levenshtein: ~0.7
Final: 0.4×0.7 + 0.6×0.5 = 0.58
```

**Threshold**: 0.60 (60% similarity)

#### 2.3 Category Match (15% weight)

**How it works**:
- Binary matching: 1.0 if categories match, 0.0 if different
- Categories: Electronics, Books, Clothing, etc.

**Why it matters**:
- Prevents matching a laptop with a water bottle
- Quick pre-filter before expensive computations

#### 2.4 Temporal Proximity (10% weight)

**How it works**:
```javascript
temporalScore = 1 - (daysDifference / maxDaysDifference)
```

**Example**:
- Item lost on Jan 1, found on Jan 2: Score = 1 - (1/7) = 0.86
- Item lost on Jan 1, found on Jan 8: Score = 0.0

**Max difference**: 7 days (configurable)

**Why it matters**:
- Items found soon after being lost are more likely to match
- Reduces false positives from old reports

#### 2.5 Spatial Proximity (10% weight)

**How it works**:
- Text similarity between location strings
- "Library 3rd Floor" vs "Library Third Floor" = 0.9
- "Library" vs "Cafeteria" = 0.2

**Why it matters**:
- Items found near where they were lost are more likely to match
- Helps distinguish between similar items in different locations

### 3. Matching Workflow

```
┌─────────────────┐
│ New Item Report │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract Features│
│ - Image: 1024-d │
│ - Text: Tokens  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Query Database  │
│ Same Category   │
│ Status: Pending │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Calculate Scores│
│ For Each Item   │
└────────┬────────┘
         │
         ▼
    Score ≥ 0.70? ──No──► No Match
         │
        Yes
         │
         ▼
┌─────────────────┐
│ Create Match    │
│ Status: Matched │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Notify Users    │
│ Ask Secret Q    │
└─────────────────┘
```

### 4. Verification System

#### Phase 1: Secret Question (Lost Reporter)
- When reporting lost item, user sets secret question
- Example: "What color is the sticker inside?"
- Answer is hashed using bcrypt (secure)

#### Phase 2: Automatic Matching
- AI finds potential match
- System asks found-item reporter the secret question

#### Phase 3: Verification
- **If answer matches**: Items are paired, users can exchange
- **If answer doesn't match**: 
  - Allow 2 more attempts (total 3)
  - After 3 failed attempts → escalate to admin

#### Phase 4: Secret Detail (Found Reporter)
- If no lost report exists yet
- Found-item reporter provides unique detail
- When owner files lost report, they're asked this detail

### 5. Edge Cases & Solutions

#### Case 1: Multiple Similar Items
**Problem**: Two people lost identical blue laptops

**Solution**:
1. Match both with highest scores
2. Use secret questions to verify
3. Wrong answer → check second match
4. Temporal/spatial data helps distinguish

#### Case 2: Low-Confidence Matches
**Problem**: Score between 0.65-0.70 (near threshold)

**Solution**:
- Don't auto-match
- Send to admin review
- Admin sees both images and descriptions
- Manual verification

#### Case 3: No Image for Lost Item
**Problem**: User doesn't have photo of lost item

**Solution**:
- Image similarity score = 0
- Rely heavily on text (60% weight)
- Category and location become more important
- Threshold may need to be lowered

#### Case 4: Stock Images
**Problem**: User uploads generic stock photo of item

**Solution**:
- Stock images have high intra-class similarity
- Secret questions become critical
- System learns common stock photos over time
- Admin review for suspicious patterns

### 6. Performance Metrics

**Accuracy Goals**:
- True Positive Rate: > 90%
- False Positive Rate: < 5%
- Processing Time: < 3 seconds per match

**Current Performance** (theoretical):
- Image feature extraction: ~200ms
- Text analysis: ~50ms
- Similarity calculations: ~10ms per comparison
- Total (10 comparisons): ~2.5 seconds

### 7. AI Models Used

#### MobileNet v2
- **Size**: 14MB
- **Parameters**: 3.5M
- **Input**: 224×224×3 images
- **Output**: 1024-d feature vector
- **Training**: Pre-trained on ImageNet
- **License**: Apache 2.0 (free to use)

#### Natural Language Processing
- **Library**: Natural.js
- **Algorithms**: 
  - TF-IDF for keyword extraction
  - Levenshtein distance for string matching
  - Porter stemmer for word normalization
- **License**: MIT (free to use)

### 8. Improvements & Future Work

**Potential Enhancements**:
1. **Fine-tuning**: Train MobileNet on campus-specific items
2. **User Feedback**: Learn from verified/rejected matches
3. **Temporal Patterns**: Analyze when items are typically lost
4. **Location Clustering**: Group nearby locations
5. **Multi-language**: Support descriptions in multiple languages
6. **OCR**: Extract text from images (ID cards, books)

**Advanced Features**:
1. **Duplicate Detection**: Merge duplicate reports
2. **Fraud Detection**: Identify suspicious patterns
3. **Predictive Analysis**: Suggest likely match locations
4. **Image Quality Check**: Warn if image is too blurry

### 9. Privacy & Security

**Data Protection**:
- User identity never shown to other users
- Only admin sees full details
- Secret answers are hashed (bcrypt with 10 rounds)
- Images stored securely on Cloudinary
- API requires authentication

**Anonymization**:
- Match notifications don't include reporter names
- Email addresses are masked
- Contact exchange only after verification

### 10. Testing the Algorithm

**Test Cases**:

```bash
# Test 1: Identical items
Lost: "Red leather wallet with driver's license"
Found: "Red leather wallet with ID inside"
Expected: Match score > 0.85

# Test 2: Similar but different
Lost: "iPhone 13 with black case"
Found: "iPhone 14 with black case"
Expected: Match score 0.70-0.80

# Test 3: Different items, same category
Lost: "Blue headphones"
Found: "Red headphones"
Expected: Match score < 0.60

# Test 4: Temporal mismatch
Lost: Jan 1, 2024
Found: Feb 1, 2024
Expected: Temporal score = 0

# Test 5: Location match
Lost: "Library 2nd Floor"
Found: "Library Second Floor"
Expected: Spatial score > 0.85
```

## Conclusion

The matching algorithm balances speed, accuracy, and privacy through:
- Multi-modal analysis (image + text)
- Weighted scoring system
- Verification through secret questions
- Human oversight for edge cases
- Continuous learning potential

This hybrid approach achieves high accuracy while maintaining system performance and user privacy.
