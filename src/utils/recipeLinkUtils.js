// Utility functions for recipe linking feature

/**
 * Prefix used to trigger recipe search in ingredient fields
 */
export const RECIPE_SEARCH_PREFIX = '@';

/**
 * Formats a recipe as an ingredient link
 * @param {string} recipeId - The ID of the recipe
 * @param {string} recipeTitle - The title of the recipe
 * @returns {string} Formatted recipe link string
 */
export const formatRecipeLink = (recipeId, recipeTitle) => {
  return `RECIPE_LINK:${recipeId}:${recipeTitle}`;
};

/**
 * Checks if an ingredient is a recipe link
 * @param {string} ingredient - The ingredient string to check
 * @returns {boolean} True if the ingredient is a recipe link
 */
export const isRecipeLink = (ingredient) => {
  return typeof ingredient === 'string' && ingredient.startsWith('RECIPE_LINK:');
};

/**
 * Parses a recipe link to extract its components
 * @param {string} ingredient - The recipe link string
 * @returns {object|null} Object with recipeId and recipeTitle, or null if not a valid link
 */
export const parseRecipeLink = (ingredient) => {
  if (!isRecipeLink(ingredient)) {
    return null;
  }
  
  const parts = ingredient.split(':');
  if (parts.length < 3) {
    return null;
  }
  
  return {
    recipeId: parts[1],
    recipeTitle: parts.slice(2).join(':'), // Handle titles with colons
  };
};

/**
 * Gets the display title from a recipe link
 * @param {string} ingredient - The recipe link string
 * @returns {string} The recipe title or 'Unbekanntes Rezept' if invalid
 */
export const getRecipeLinkTitle = (ingredient) => {
  const parsed = parseRecipeLink(ingredient);
  return parsed ? parsed.recipeTitle : 'Unbekanntes Rezept';
};
