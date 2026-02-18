/**
 * Utility functions for managing category images
 * Each image can be linked to multiple meal categories
 * Each category can only be linked to one image
 */

import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const CATEGORY_IMAGES_KEY = 'categoryImages';
let idCounter = 0;
let migrationDone = false;

/**
 * Reset migration flag (for testing purposes)
 * @private
 */
export function _resetMigrationFlag() {
  migrationDone = false;
}

/**
 * Generate a unique ID for an image
 * @returns {string} Unique ID
 */
function generateId() {
  return `${Date.now()}-${idCounter++}`;
}

/**
 * Migrate category images from localStorage to Firestore
 * This is a one-time operation to preserve existing data
 * @returns {Promise<Array>} Migrated images or empty array
 */
async function migrateFromLocalStorage() {
  if (migrationDone) return [];
  
  const stored = localStorage.getItem(CATEGORY_IMAGES_KEY);
  if (stored) {
    try {
      const images = JSON.parse(stored);
      if (images && images.length > 0) {
        console.log('Migrating category images from localStorage to Firestore...');
        // Save to Firestore
        await saveCategoryImages(images);
        // Clear from localStorage after successful migration
        localStorage.removeItem(CATEGORY_IMAGES_KEY);
        console.log('Migration completed successfully');
        migrationDone = true;
        return images;
      }
    } catch (e) {
      console.error('Error during migration:', e);
    }
  }
  migrationDone = true;
  return [];
}

/**
 * Get all category images from Firestore
 * Automatically migrates from localStorage if needed
 * @returns {Promise<Array>} Array of image objects with structure: { id, image, categories }
 */
export async function getCategoryImages() {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'app'));
    
    if (settingsDoc.exists()) {
      const settings = settingsDoc.data();
      if (settings.categoryImages && Array.isArray(settings.categoryImages) && settings.categoryImages.length > 0) {
        return settings.categoryImages;
      }
    }
    
    // Try migration from localStorage if no Firestore data exists
    const migratedImages = await migrateFromLocalStorage();
    return migratedImages;
  } catch (error) {
    console.error('Error getting category images from Firestore:', error);
    
    // Fallback to localStorage on error
    const stored = localStorage.getItem(CATEGORY_IMAGES_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing category images from localStorage:', e);
      }
    }
    return [];
  }
}

/**
 * Save category images to Firestore
 * @param {Array} images - Array of image objects
 * @throws {Error} If Firestore quota is exceeded or other storage error occurs
 */
export async function saveCategoryImages(images) {
  try {
    const settingsRef = doc(db, 'settings', 'app');
    await updateDoc(settingsRef, { categoryImages: images });
  } catch (error) {
    if (error.code === 'resource-exhausted') {
      throw new Error('Speicherplatz voll. Bitte entfernen Sie einige Kategoriebilder oder verwenden Sie kleinere Bilder.');
    }
    throw error;
  }
}

/**
 * Add a new category image
 * @param {string} imageBase64 - Base64 encoded image
 * @param {Array} categories - Array of category names
 * @returns {Promise<Object>} The newly created image object
 */
export async function addCategoryImage(imageBase64, categories = []) {
  const images = await getCategoryImages();
  const newImage = {
    id: generateId(),
    image: imageBase64,
    categories: categories
  };
  images.push(newImage);
  await saveCategoryImages(images);
  return newImage;
}

/**
 * Update an existing category image
 * @param {string} id - Image ID
 * @param {Object} updates - Object with fields to update (image, categories)
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function updateCategoryImage(id, updates) {
  const images = await getCategoryImages();
  const index = images.findIndex(img => img.id === id);
  if (index === -1) return false;
  
  images[index] = { ...images[index], ...updates };
  await saveCategoryImages(images);
  return true;
}

/**
 * Remove a category image
 * @param {string} id - Image ID to remove
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function removeCategoryImage(id) {
  const images = await getCategoryImages();
  const filtered = images.filter(img => img.id !== id);
  if (filtered.length === images.length) return false;
  
  await saveCategoryImages(filtered);
  return true;
}

/**
 * Get the image for a specific category
 * @param {string} categoryName - Name of the meal category
 * @returns {Promise<string|null>} Base64 image string or null if not found
 */
export async function getImageForCategory(categoryName) {
  const images = await getCategoryImages();
  const image = images.find(img => img.categories.includes(categoryName));
  return image ? image.image : null;
}

/**
 * Get the first matching image for any of the given categories
 * @param {Array} categories - Array of category names
 * @returns {Promise<string|null>} Base64 image string or null if not found
 */
export async function getImageForCategories(categories) {
  if (!categories || categories.length === 0) return null;
  
  const images = await getCategoryImages();
  for (const category of categories) {
    const image = images.find(img => img.categories.includes(category));
    if (image) return image.image;
  }
  return null;
}

/**
 * Check if a category is already assigned to an image
 * @param {string} categoryName - Name of the category
 * @param {string} excludeImageId - Optional image ID to exclude from check (for editing)
 * @returns {Promise<boolean>} True if category is already assigned
 */
export async function isCategoryAssigned(categoryName, excludeImageId = null) {
  const images = await getCategoryImages();
  return images.some(img => 
    img.id !== excludeImageId && img.categories.includes(categoryName)
  );
}

/**
 * Validate that categories can be assigned to an image
 * Returns array of categories that are already assigned to other images
 * @param {Array} categories - Array of category names to validate
 * @param {string} excludeImageId - Optional image ID to exclude from check
 * @returns {Promise<Array>} Array of category names that are already assigned
 */
export async function getAlreadyAssignedCategories(categories, excludeImageId = null) {
  const assigned = [];
  for (const category of categories) {
    if (await isCategoryAssigned(category, excludeImageId)) {
      assigned.push(category);
    }
  }
  return assigned;
}
