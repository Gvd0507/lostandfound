const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');
const mobilenet = require('@tensorflow-models/mobilenet');
const sharp = require('sharp');
const fs = require('fs').promises;

let model = null;

// Load MobileNet model
const loadModel = async () => {
  if (!model) {
    console.log('Loading MobileNet model...');
    model = await mobilenet.load();
    console.log('✓ MobileNet model loaded');
  }
  return model;
};

// Extract image features from file path or buffer
const extractImageFeatures = async (imagePath) => {
  try {
    await loadModel();

    // Read and preprocess image
    const imageBuffer = await sharp(imagePath)
      .resize(224, 224)
      .toFormat('jpeg')
      .toBuffer();

    // Convert to tensor (decode from buffer)
    const imageTensor = tf.browser.fromPixels(
      { data: imageBuffer, width: 224, height: 224 }
    );

    // Get embeddings (internal activation)
    const activation = model.infer(imageTensor, true);
    
    // Convert to array
    const features = await activation.array();
    
    // Clean up tensors
    imageTensor.dispose();
    activation.dispose();

    // Flatten features
    const flatFeatures = features.flat(2);
    
    return flatFeatures;
  } catch (error) {
    console.error('Error extracting image features:', error);
    throw error;
  }
};

// Calculate cosine similarity
const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
};

module.exports = {
  loadModel,
  extractImageFeatures,
  cosineSimilarity,
};
