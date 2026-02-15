import {
  RECIPE_SEARCH_PREFIX,
  formatRecipeLink,
  isRecipeLink,
  parseRecipeLink,
  getRecipeLinkTitle,
} from './recipeLinkUtils';

describe('recipeLinkUtils', () => {
  describe('formatRecipeLink', () => {
    it('should format a recipe link correctly', () => {
      const result = formatRecipeLink('abc123', 'Pasta Sauce');
      expect(result).toBe('RECIPE_LINK:abc123:Pasta Sauce');
    });

    it('should handle recipe titles with special characters', () => {
      const result = formatRecipeLink('xyz789', 'Mom\'s Special: Pizza Sauce');
      expect(result).toBe('RECIPE_LINK:xyz789:Mom\'s Special: Pizza Sauce');
    });
  });

  describe('isRecipeLink', () => {
    it('should return true for valid recipe links', () => {
      expect(isRecipeLink('RECIPE_LINK:123:Test')).toBe(true);
      expect(isRecipeLink('RECIPE_LINK:abc:Another Recipe')).toBe(true);
    });

    it('should return false for non-recipe-link strings', () => {
      expect(isRecipeLink('200g flour')).toBe(false);
      expect(isRecipeLink('Just a regular ingredient')).toBe(false);
      expect(isRecipeLink('')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isRecipeLink(null)).toBe(false);
      expect(isRecipeLink(undefined)).toBe(false);
      expect(isRecipeLink(123)).toBe(false);
    });
  });

  describe('parseRecipeLink', () => {
    it('should parse a valid recipe link', () => {
      const result = parseRecipeLink('RECIPE_LINK:abc123:Pasta Sauce');
      expect(result).toEqual({
        recipeId: 'abc123',
        recipeTitle: 'Pasta Sauce',
      });
    });

    it('should handle recipe titles with colons', () => {
      const result = parseRecipeLink('RECIPE_LINK:xyz789:Mom\'s Special: Pizza Sauce');
      expect(result).toEqual({
        recipeId: 'xyz789',
        recipeTitle: 'Mom\'s Special: Pizza Sauce',
      });
    });

    it('should return null for non-recipe-link strings', () => {
      expect(parseRecipeLink('200g flour')).toBeNull();
      expect(parseRecipeLink('Just a regular ingredient')).toBeNull();
    });

    it('should return null for malformed recipe links', () => {
      expect(parseRecipeLink('RECIPE_LINK:only-id')).toBeNull();
      expect(parseRecipeLink('RECIPE_LINK:')).toBeNull();
    });
  });

  describe('getRecipeLinkTitle', () => {
    it('should extract the title from a valid recipe link', () => {
      const title = getRecipeLinkTitle('RECIPE_LINK:abc123:Pasta Sauce');
      expect(title).toBe('Pasta Sauce');
    });

    it('should handle titles with colons', () => {
      const title = getRecipeLinkTitle('RECIPE_LINK:xyz:Mom\'s Special: Pizza');
      expect(title).toBe('Mom\'s Special: Pizza');
    });

    it('should return fallback text for invalid links', () => {
      expect(getRecipeLinkTitle('not a link')).toBe('Unbekanntes Rezept');
      expect(getRecipeLinkTitle('RECIPE_LINK:only-id')).toBe('Unbekanntes Rezept');
    });
  });

  describe('RECIPE_SEARCH_PREFIX', () => {
    it('should be defined', () => {
      expect(RECIPE_SEARCH_PREFIX).toBe('@');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty recipe titles', () => {
      const result = formatRecipeLink('id123', '');
      expect(result).toBe('RECIPE_LINK:id123:');
      
      const parsed = parseRecipeLink(result);
      expect(parsed).toEqual({
        recipeId: 'id123',
        recipeTitle: '',
      });
    });

    it('should handle very long recipe titles', () => {
      const longTitle = 'A'.repeat(500);
      const link = formatRecipeLink('id123', longTitle);
      const parsed = parseRecipeLink(link);
      expect(parsed.recipeTitle).toBe(longTitle);
    });

    it('should handle recipe IDs with special characters', () => {
      const result = formatRecipeLink('abc-123_xyz', 'Test Recipe');
      expect(result).toBe('RECIPE_LINK:abc-123_xyz:Test Recipe');
      
      const parsed = parseRecipeLink(result);
      expect(parsed.recipeId).toBe('abc-123_xyz');
    });
  });
});
