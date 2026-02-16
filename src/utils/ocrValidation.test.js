/**
 * OCR Validation Utility Tests
 */

import {
  validateOcrResult,
  getValidationSummary,
  isValidationAcceptable
} from './ocrValidation';

describe('ocrValidation', () => {
  describe('validateOcrResult', () => {
    test('validates complete recipe with all fields', () => {
      const recipe = {
        title: 'Spaghetti Carbonara',
        portionen: 4,
        kochdauer: 30,
        kulinarik: ['Italienisch'],
        ingredients: ['400g Spaghetti', '200g Pancetta', '4 Eier'],
        steps: ['Nudeln kochen', 'Pancetta braten', 'Eier unterrühren'],
        _detected: { portionen: true, kochdauer: true }
      };

      const result = validateOcrResult(recipe);

      expect(result.detected.title).toBe(true);
      expect(result.detected.cuisine).toBe(true);
      expect(result.detected.servings).toBe(true);
      expect(result.detected.cookingTime).toBe(true);
      expect(result.detected.ingredients).toBe(true);
      expect(result.detected.steps).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
    });

    test('detects missing title (fallback used)', () => {
      const recipe = {
        title: 'OCR-Rezept',
        portionen: 4,
        ingredients: ['Mehl', 'Zucker'],
        steps: ['Mix ingredients']
      };

      const result = validateOcrResult(recipe);

      expect(result.detected.title).toBe(false);
      expect(result.warnings).toContain('Kein Rezepttitel gefunden');
    });

    test('detects missing cuisine', () => {
      const recipe = {
        title: 'Test Recipe',
        portionen: 6,
        kulinarik: [],
        ingredients: ['Mehl'],
        steps: ['Mix']
      };

      const result = validateOcrResult(recipe);

      expect(result.detected.cuisine).toBe(false);
      expect(result.warnings).toContain('Kulinarik nicht erkannt');
    });

    test('detects missing servings (default used)', () => {
      const recipe = {
        title: 'Test Recipe',
        portionen: 4, // Default value
        ingredients: ['Mehl'],
        steps: ['Mix']
      };

      const result = validateOcrResult(recipe);

      expect(result.detected.servings).toBe(false);
      expect(result.warnings).toContain('Portionenanzahl nicht erkannt (Standard: 4 verwendet)');
    });

    test('detects missing cooking time (default used)', () => {
      const recipe = {
        title: 'Test Recipe',
        kochdauer: 30, // Default value
        portionen: 6,
        ingredients: ['Mehl'],
        steps: ['Mix']
      };

      const result = validateOcrResult(recipe);

      expect(result.detected.cookingTime).toBe(false);
      expect(result.warnings).toContain('Zubereitungsdauer nicht erkannt (Standard: 30 Minuten verwendet)');
    });

    test('marks recipe as invalid when no ingredients', () => {
      const recipe = {
        title: 'Test Recipe',
        ingredients: [],
        steps: ['Mix ingredients']
      };

      const result = validateOcrResult(recipe);

      expect(result.isValid).toBe(false);
      expect(result.detected.ingredients).toBe(false);
      expect(result.warnings).toContain('Keine Zutaten erkannt');
    });

    test('marks recipe as invalid when no steps', () => {
      const recipe = {
        title: 'Test Recipe',
        ingredients: ['Mehl', 'Zucker'],
        steps: []
      };

      const result = validateOcrResult(recipe);

      expect(result.isValid).toBe(false);
      expect(result.detected.steps).toBe(false);
      expect(result.warnings).toContain('Keine Zubereitungsschritte erkannt');
    });

    test('validates recipe with explicit servings', () => {
      const recipe = {
        title: 'Test',
        portionen: 8,
        ingredients: ['Mehl'],
        steps: ['Mix'],
        _detected: { portionen: true, kochdauer: false }
      };

      const result = validateOcrResult(recipe);

      expect(result.detected.servings).toBe(true);
      expect(result.confidence.servings).toBe(95);
    });

    test('validates recipe with explicit cooking time', () => {
      const recipe = {
        title: 'Test',
        kochdauer: 45,
        portionen: 6,
        ingredients: ['Mehl'],
        steps: ['Mix'],
        _detected: { portionen: false, kochdauer: true }
      };

      const result = validateOcrResult(recipe);

      expect(result.detected.cookingTime).toBe(true);
      expect(result.confidence.cookingTime).toBe(95);
    });

    test('warns about unusual servings value', () => {
      const recipe = {
        title: 'Test',
        portionen: 100,
        ingredients: ['Mehl'],
        steps: ['Mix']
      };

      const result = validateOcrResult(recipe);

      expect(result.detected.servings).toBe(true);
      expect(result.confidence.servings).toBe(60);
      expect(result.warnings.some(w => w.includes('Ungewöhnliche Portionenanzahl'))).toBe(true);
    });

    test('warns about unusual cooking time', () => {
      const recipe = {
        title: 'Test',
        kochdauer: 1000,
        portionen: 4,
        ingredients: ['Mehl'],
        steps: ['Mix']
      };

      const result = validateOcrResult(recipe);

      expect(result.detected.cookingTime).toBe(true);
      expect(result.confidence.cookingTime).toBe(60);
      expect(result.warnings.some(w => w.includes('Ungewöhnliche Kochdauer'))).toBe(true);
    });

    test('warns when only one ingredient detected', () => {
      const recipe = {
        title: 'Test',
        ingredients: ['Mehl'],
        steps: ['Mix']
      };

      const result = validateOcrResult(recipe);

      expect(result.detected.ingredients).toBe(true);
      expect(result.confidence.ingredients).toBe(50);
      expect(result.warnings).toContain('Nur eine Zutat erkannt - ist das korrekt?');
    });

    test('warns when too many ingredients detected', () => {
      const recipe = {
        title: 'Test',
        ingredients: Array(35).fill('Ingredient'),
        steps: ['Mix']
      };

      const result = validateOcrResult(recipe);

      expect(result.detected.ingredients).toBe(true);
      expect(result.warnings.some(w => w.includes('Sehr viele Zutaten erkannt'))).toBe(true);
    });

    test('warns when too many steps detected', () => {
      const recipe = {
        title: 'Test',
        ingredients: ['Mehl'],
        steps: Array(25).fill('Step')
      };

      const result = validateOcrResult(recipe);

      expect(result.detected.steps).toBe(true);
      expect(result.warnings.some(w => w.includes('Sehr viele Zubereitungsschritte erkannt'))).toBe(true);
    });

    test('calculates higher confidence for longer titles', () => {
      const shortTitle = {
        title: 'Pasta',
        ingredients: ['Pasta'],
        steps: ['Cook']
      };

      const longTitle = {
        title: 'Delicious Traditional Italian Carbonara',
        ingredients: ['Pasta'],
        steps: ['Cook']
      };

      const shortResult = validateOcrResult(shortTitle);
      const longResult = validateOcrResult(longTitle);

      expect(longResult.confidence.title).toBeGreaterThan(shortResult.confidence.title);
    });

    test('calculates higher confidence for more ingredients', () => {
      const fewIngredients = {
        title: 'Test',
        ingredients: ['A', 'B'],
        steps: ['Mix']
      };

      const manyIngredients = {
        title: 'Test',
        ingredients: ['A', 'B', 'C', 'D', 'E', 'F'],
        steps: ['Mix']
      };

      const fewResult = validateOcrResult(fewIngredients);
      const manyResult = validateOcrResult(manyIngredients);

      expect(manyResult.confidence.ingredients).toBeGreaterThan(fewResult.confidence.ingredients);
    });

    test('provides suggestions when score is low', () => {
      const recipe = {
        title: 'OCR-Rezept', // Fallback title
        portionen: 4,        // Default
        kochdauer: 30,       // Default
        kulinarik: [],
        ingredients: ['Mehl'],
        steps: ['Mix']
      };

      const result = validateOcrResult(recipe);

      expect(result.score).toBeLessThan(50);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0]).toContain('Erkennungsqualität ist niedrig');
    });

    test('provides suggestions when score is moderate', () => {
      const recipe = {
        title: 'Test Recipe',
        portionen: 4,
        kochdauer: 30,
        kulinarik: [],
        ingredients: ['Mehl', 'Zucker'],
        steps: ['Mix', 'Bake']
      };

      const result = validateOcrResult(recipe);

      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.score).toBeLessThan(70);
      expect(result.suggestions.some(s => s.includes('mittelmäßig'))).toBe(true);
    });

    test('throws error for invalid input', () => {
      expect(() => validateOcrResult(null)).toThrow('Ungültiges Rezeptobjekt');
      expect(() => validateOcrResult('string')).toThrow('Ungültiges Rezeptobjekt');
      expect(() => validateOcrResult(123)).toThrow('Ungültiges Rezeptobjekt');
    });

    test('handles recipe with empty string title', () => {
      const recipe = {
        title: '',
        ingredients: ['Mehl'],
        steps: ['Mix']
      };

      const result = validateOcrResult(recipe);

      expect(result.detected.title).toBe(false);
      expect(result.warnings).toContain('Kein Rezepttitel gefunden');
    });

    test('handles recipe with whitespace-only title', () => {
      const recipe = {
        title: '   ',
        ingredients: ['Mehl'],
        steps: ['Mix']
      };

      const result = validateOcrResult(recipe);

      expect(result.detected.title).toBe(false);
    });

    test('overall score is between 0 and 100', () => {
      const minimalRecipe = {
        title: '',
        ingredients: [],
        steps: []
      };

      const fullRecipe = {
        title: 'Complete Recipe with All Details',
        portionen: 6,
        kochdauer: 45,
        kulinarik: ['Italienisch', 'Mediterran'],
        ingredients: ['A', 'B', 'C', 'D', 'E'],
        steps: ['Step 1', 'Step 2', 'Step 3']
      };

      const minResult = validateOcrResult(minimalRecipe);
      const fullResult = validateOcrResult(fullRecipe);

      expect(minResult.score).toBeGreaterThanOrEqual(0);
      expect(minResult.score).toBeLessThanOrEqual(100);
      expect(fullResult.score).toBeGreaterThanOrEqual(0);
      expect(fullResult.score).toBeLessThanOrEqual(100);
      expect(fullResult.score).toBeGreaterThan(minResult.score);
    });
  });

  describe('getValidationSummary', () => {
    test('generates German summary for complete recipe', () => {
      const recipe = {
        title: 'Spaghetti Carbonara',
        portionen: 4,
        kochdauer: 30,
        kulinarik: ['Italienisch'],
        ingredients: ['Pasta', 'Eggs'],
        steps: ['Cook', 'Mix']
      };

      const validation = validateOcrResult(recipe);
      const summary = getValidationSummary(validation, 'de');

      expect(summary).toContain('Erkennungsqualität');
      expect(summary).toContain('Rezepttitel');
      expect(summary).toContain('✓');
    });

    test('generates English summary for complete recipe', () => {
      const recipe = {
        title: 'Spaghetti Carbonara',
        portionen: 4,
        kochdauer: 30,
        kulinarik: ['Italian'],
        ingredients: ['Pasta', 'Eggs'],
        steps: ['Cook', 'Mix']
      };

      const validation = validateOcrResult(recipe);
      const summary = getValidationSummary(validation, 'en');

      expect(summary).toContain('Recognition Quality');
      expect(summary).toContain('Recipe Title');
      expect(summary).toContain('✓');
    });

    test('shows quality rating as Excellent for high score', () => {
      const recipe = {
        title: 'Complete Recipe',
        portionen: 6,
        kochdauer: 45,
        kulinarik: ['Test'],
        ingredients: ['A', 'B', 'C', 'D', 'E'],
        steps: ['1', '2', '3', '4']
      };

      const validation = validateOcrResult(recipe);
      const summary = getValidationSummary(validation, 'de');

      expect(validation.score).toBeGreaterThanOrEqual(85);
      expect(summary).toContain('Ausgezeichnet');
    });

    test('shows quality rating as Good for moderate-high score', () => {
      const recipe = {
        title: 'Test Recipe',
        portionen: 6,
        kochdauer: 30,
        ingredients: ['A', 'B', 'C'],
        steps: ['1', '2'],
        _detected: { portionen: true, kochdauer: false }
      };

      const validation = validateOcrResult(recipe);
      const summary = getValidationSummary(validation, 'de');

      expect(validation.score).toBeGreaterThanOrEqual(60);
      expect(validation.score).toBeLessThan(85);
      if (validation.score >= 70) {
        expect(summary).toContain('Gut');
      }
    });

    test('lists detected and not detected items separately', () => {
      const recipe = {
        title: 'Test',
        portionen: 4, // Default - not detected
        ingredients: ['Mehl'],
        steps: ['Mix']
      };

      const validation = validateOcrResult(recipe);
      const summary = getValidationSummary(validation, 'de');

      expect(summary).toContain('Erkannt:');
      expect(summary).toContain('Nicht erkannt:');
      expect(summary).toContain('✓');
      expect(summary).toContain('✗');
    });

    test('handles empty validation result', () => {
      const summary = getValidationSummary(null, 'de');
      expect(summary).toBe('');
    });

    test('defaults to German when invalid language provided', () => {
      const recipe = {
        title: 'Test',
        ingredients: ['A'],
        steps: ['1']
      };

      const validation = validateOcrResult(recipe);
      const summary = getValidationSummary(validation, 'invalid');

      expect(summary).toContain('Erkennungsqualität');
    });
  });

  describe('isValidationAcceptable', () => {
    test('returns true for valid recipe with good score', () => {
      const recipe = {
        title: 'Test Recipe',
        portionen: 6,
        kochdauer: 45,
        kulinarik: ['Test'],
        ingredients: ['A', 'B', 'C'],
        steps: ['1', '2', '3']
      };

      const validation = validateOcrResult(recipe);
      const acceptable = isValidationAcceptable(validation);

      expect(acceptable).toBe(true);
    });

    test('returns false when ingredients missing', () => {
      const recipe = {
        title: 'Test Recipe',
        ingredients: [],
        steps: ['Mix']
      };

      const validation = validateOcrResult(recipe);
      const acceptable = isValidationAcceptable(validation);

      expect(acceptable).toBe(false);
    });

    test('returns false when steps missing', () => {
      const recipe = {
        title: 'Test Recipe',
        ingredients: ['Mehl'],
        steps: []
      };

      const validation = validateOcrResult(recipe);
      const acceptable = isValidationAcceptable(validation);

      expect(acceptable).toBe(false);
    });

    test('returns false when score below minimum', () => {
      const recipe = {
        title: 'OCR-Rezept', // Fallback
        portionen: 4,
        kochdauer: 30,
        kulinarik: [],
        ingredients: ['A'],
        steps: ['1']
      };

      const validation = validateOcrResult(recipe);
      const acceptable = isValidationAcceptable(validation, 50);

      expect(validation.score).toBeLessThan(50);
      expect(acceptable).toBe(false);
    });

    test('respects custom minimum score', () => {
      const recipe = {
        title: 'Test',
        ingredients: ['A', 'B'],
        steps: ['1', '2']
      };

      const validation = validateOcrResult(recipe);
      
      // Should pass with lower threshold
      expect(isValidationAcceptable(validation, 40)).toBe(true);
      
      // Might fail with very high threshold
      if (validation.score < 90) {
        expect(isValidationAcceptable(validation, 90)).toBe(false);
      }
    });

    test('returns false for null validation', () => {
      expect(isValidationAcceptable(null)).toBe(false);
    });

    test('returns false for undefined validation', () => {
      expect(isValidationAcceptable(undefined)).toBe(false);
    });
  });
});
