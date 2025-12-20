import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';

let model = null;

// Load MobileNet model
export const loadModel = async () => {
  if (!model) {
    model = await mobilenet.load();
  }
  return model;
};

// Extract image features (embeddings)
export const extractImageFeatures = async (imageElement) => {
  try {
    const loadedModel = await loadModel();
    
    // Get embeddings (second-to-last layer)
    const activation = loadedModel.infer(imageElement, true);
    
    // Convert to array
    const features = await activation.data();
    
    // Clean up
    activation.dispose();
    
    return Array.from(features);
  } catch (error) {
    console.error('Error extracting image features:', error);
    throw error;
  }
};

// Calculate cosine similarity between two feature vectors
export const cosineSimilarity = (vecA, vecB) => {
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

// Preprocess image for model
export const preprocessImage = (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
};

// Get image preview URL
export const getImagePreview = (file) => {
  return URL.createObjectURL(file);
};
