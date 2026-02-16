/**
 * OCR Classifier Tests
 */

import {
  classifyLine,
  classifyText,
  autoClassifyText
} from './ocrClassifier';

describe('ocrClassifier', () => {
  describe('classifyLine', () => {
    describe('ingredient detection', () => {
      test('classifies simple ingredient with quantity and unit', () => {
        const line = '200g Mehl';
        const result = classifyLine(line, 'de');
        
        expect(result.type).toBe('ingredient');
        expect(result.confidence).toBeGreaterThan(50);
      });

      test('classifies ingredient with German units', () => {
        const ingredients = [
          '2 EL Öl',
          '1 TL Salz',
          '500ml Milch',
          '1 Prise Pfeffer'
        ];

        for (const ing of ingredients) {
          const result = classifyLine(ing, 'de');
          expect(result.type).toBe('ingredient');
          expect(result.confidence).toBeGreaterThan(50);
        }
      });

      test('classifies ingredient with English units', () => {
        const ingredients = [
          '2 cups flour',
          '1 tbsp oil',
          '1 tsp salt',
          '500ml milk',
          '1 pinch pepper'
        ];

        for (const ing of ingredients) {
          const result = classifyLine(ing, 'en');
          expect(result.type).toBe('ingredient');
          expect(result.confidence).toBeGreaterThan(50);
        }
      });

      test('classifies ingredient with fraction', () => {
        const result = classifyLine('1/2 cup sugar', 'en');
        expect(result.type).toBe('ingredient');
        expect(result.confidence).toBeGreaterThan(50);
      });

      test('classifies ingredient with mixed number', () => {
        const result = classifyLine('1 1/2 cups flour', 'en');
        expect(result.type).toBe('ingredient');
        expect(result.confidence).toBeGreaterThan(50);
      });

      test('classifies ingredient with decimal', () => {
        const result = classifyLine('2.5 kg Kartoffeln', 'de');
        expect(result.type).toBe('ingredient');
        expect(result.confidence).toBeGreaterThan(50);
      });

      test('classifies ingredient with common food keywords', () => {
        const ingredients = [
          '2 Zwiebeln',
          '3 Eier',
          'Salz und Pfeffer',
          '1 Knoblauchzehe'
        ];

        for (const ing of ingredients) {
          const result = classifyLine(ing, 'de');
          expect(result.type).toBe('ingredient');
        }
      });

      test('classifies short lines as more likely ingredients', () => {
        const short = '200g Mehl';
        const long = 'Den Backofen auf 180 Grad vorheizen und ein Backblech mit Backpapier auslegen';

        const shortResult = classifyLine(short, 'de');
        const longResult = classifyLine(long, 'de');

        // Short line should favor ingredients
        expect(shortResult.type).toBe('ingredient');
        // Long line should favor steps
        expect(longResult.type).toBe('step');
      });
    });

    describe('step detection', () => {
      test('classifies preparation step with action verb', () => {
        const steps = [
          'Mehl und Zucker mischen',
          'Zwiebeln in Würfel schneiden',
          'Im Ofen backen'
        ];

        for (const step of steps) {
          const result = classifyLine(step, 'de');
          expect(result.type).toBe('step');
          expect(result.confidence).toBeGreaterThan(50);
        }
      });

      test('classifies English preparation steps', () => {
        const steps = [
          'Mix flour and sugar',
          'Chop the onions',
          'Bake in the oven',
          'Stir until combined'
        ];

        for (const step of steps) {
          const result = classifyLine(step, 'en');
          expect(result.type).toBe('step');
          expect(result.confidence).toBeGreaterThan(50);
        }
      });

      test('classifies imperative form as step', () => {
        const steps = [
          'Den Ofen auf 180°C vorheizen',
          'Die Butter schmelzen',
          'Preheat oven to 375°F',
          'Beat the eggs'
        ];

        const deSteps = steps.slice(0, 2);
        const enSteps = steps.slice(2);

        for (const step of deSteps) {
          const result = classifyLine(step, 'de');
          expect(result.type).toBe('step');
        }

        for (const step of enSteps) {
          const result = classifyLine(step, 'en');
          expect(result.type).toBe('step');
        }
      });

      test('classifies step with time/temperature indicators', () => {
        const steps = [
          'Bei 180°C für 30 Minuten backen',
          'Bake at 375°F for 20 minutes',
          'Etwa 10 Minuten köcheln lassen'
        ];

        for (const step of steps) {
          const lang = step.includes('°C') || step.includes('Minuten') ? 'de' : 'en';
          const result = classifyLine(step, lang);
          expect(result.type).toBe('step');
        }
      });

      test('classifies step with cooking equipment keywords', () => {
        const steps = [
          'In einer großen Schüssel vermengen',
          'In die Pfanne geben',
          'In a large bowl combine',
          'Place in the pan'
        ];

        for (const step of steps) {
          const lang = step.includes('Schüssel') || step.includes('Pfanne') ? 'de' : 'en';
          const result = classifyLine(step, lang);
          expect(result.type).toBe('step');
        }
      });
    });

    describe('edge cases', () => {
      test('returns unknown for empty string', () => {
        const result = classifyLine('', 'de');
        expect(result.type).toBe('unknown');
        expect(result.confidence).toBe(0);
      });

      test('returns unknown for whitespace only', () => {
        const result = classifyLine('   ', 'de');
        expect(result.type).toBe('unknown');
        expect(result.confidence).toBe(0);
      });

      test('returns unknown for null input', () => {
        const result = classifyLine(null, 'de');
        expect(result.type).toBe('unknown');
        expect(result.confidence).toBe(0);
      });

      test('returns unknown for undefined input', () => {
        const result = classifyLine(undefined, 'de');
        expect(result.type).toBe('unknown');
        expect(result.confidence).toBe(0);
      });

      test('returns unknown for ambiguous text', () => {
        const result = classifyLine('Test', 'de');
        expect(result.type).toBe('unknown');
        expect(result.confidence).toBe(0);
      });

      test('handles non-string input gracefully', () => {
        const result = classifyLine(123, 'de');
        expect(result.type).toBe('unknown');
        expect(result.confidence).toBe(0);
      });

      test('defaults to German when language not specified', () => {
        const result = classifyLine('200g Mehl');
        expect(result.type).toBe('ingredient');
      });

      test('handles unknown language by defaulting to German', () => {
        const result = classifyLine('200g Mehl', 'fr');
        expect(result.type).toBe('ingredient');
      });
    });

    describe('multilingual support', () => {
      test('correctly classifies German ingredients', () => {
        const ingredients = [
          '250g Butter',
          '3 Eier',
          '1 kg Mehl',
          'Salz nach Geschmack'
        ];

        for (const ing of ingredients) {
          const result = classifyLine(ing, 'de');
          expect(result.type).toBe('ingredient');
        }
      });

      test('correctly classifies English ingredients', () => {
        const ingredients = [
          '1 cup butter',
          '3 eggs',
          '2 lbs flour',
          'Salt to taste'
        ];

        for (const ing of ingredients) {
          const result = classifyLine(ing, 'en');
          expect(result.type).toBe('ingredient');
        }
      });

      test('correctly classifies German steps', () => {
        const steps = [
          'Mehl sieben',
          'Eier schlagen',
          'Alles gut verrühren',
          'Im vorgeheizten Ofen backen'
        ];

        for (const step of steps) {
          const result = classifyLine(step, 'de');
          expect(result.type).toBe('step');
        }
      });

      test('correctly classifies English steps', () => {
        const steps = [
          'Sift the flour',
          'Beat the eggs',
          'Mix everything well',
          'Bake in preheated oven'
        ];

        for (const step of steps) {
          const result = classifyLine(step, 'en');
          expect(result.type).toBe('step');
        }
      });
    });
  });

  describe('classifyText', () => {
    test('classifies array of mixed lines', () => {
      const lines = [
        '200g Mehl',
        '2 Eier',
        'Mehl und Eier vermengen',
        '100ml Milch',
        'Teig 30 Minuten ruhen lassen'
      ];

      const result = classifyText(lines, 'de');

      expect(result.ingredients.length).toBeGreaterThan(0);
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.ingredients).toContain('200g Mehl');
      expect(result.ingredients).toContain('2 Eier');
      expect(result.steps).toContain('Mehl und Eier vermengen');
    });

    test('classifies only high-confidence results', () => {
      const lines = [
        '200g flour',  // High confidence ingredient
        'Mix well',    // High confidence step
        'Test',        // Low confidence - should be unclassified
        ''             // Empty - should be ignored
      ];

      const result = classifyText(lines, 'en');

      expect(result.ingredients).toContain('200g flour');
      expect(result.steps).toContain('Mix well');
      expect(result.unclassified).toContain('Test');
    });

    test('handles empty array', () => {
      const result = classifyText([], 'de');

      expect(result.ingredients).toEqual([]);
      expect(result.steps).toEqual([]);
      expect(result.unclassified).toEqual([]);
    });

    test('throws error for non-array input', () => {
      expect(() => classifyText('not an array', 'de')).toThrow('Lines must be an array');
      expect(() => classifyText(null, 'de')).toThrow('Lines must be an array');
      expect(() => classifyText(123, 'de')).toThrow('Lines must be an array');
    });

    test('separates ingredients and steps correctly', () => {
      const lines = [
        '400g Spaghetti',
        '200g Pancetta',
        '4 Eier',
        'Nudeln in Salzwasser kochen',
        'Pancetta anbraten',
        'Eier unterrühren'
      ];

      const result = classifyText(lines, 'de');

      expect(result.ingredients).toHaveLength(3);
      expect(result.steps).toHaveLength(3);
    });

    test('handles all ingredients', () => {
      const lines = [
        '200g flour',
        '100g sugar',
        '2 eggs',
        '1 tsp salt'
      ];

      const result = classifyText(lines, 'en');

      expect(result.ingredients).toHaveLength(4);
      expect(result.steps).toHaveLength(0);
    });

    test('handles all steps', () => {
      const lines = [
        'Mix the dry ingredients',
        'Beat the eggs',
        'Combine everything',
        'Bake for 30 minutes'
      ];

      const result = classifyText(lines, 'en');

      expect(result.ingredients).toHaveLength(0);
      expect(result.steps).toHaveLength(4);
    });
  });

  describe('autoClassifyText', () => {
    test('auto-classifies full recipe text', () => {
      const text = `Spaghetti Carbonara
      
200g Spaghetti
100g Pancetta
2 Eier

Nudeln kochen
Pancetta braten
Eier unterrühren`;

      const result = autoClassifyText(text, 'de');

      expect(result.ingredients.length).toBeGreaterThan(0);
      expect(result.steps.length).toBeGreaterThan(0);
    });

    test('handles text with only newlines', () => {
      const text = '\n\n\n';
      const result = autoClassifyText(text, 'de');

      expect(result.ingredients).toEqual([]);
      expect(result.steps).toEqual([]);
    });

    test('handles empty string', () => {
      const result = autoClassifyText('', 'de');

      expect(result.ingredients).toEqual([]);
      expect(result.steps).toEqual([]);
    });

    test('handles null input', () => {
      const result = autoClassifyText(null, 'de');

      expect(result.ingredients).toEqual([]);
      expect(result.steps).toEqual([]);
    });

    test('handles undefined input', () => {
      const result = autoClassifyText(undefined, 'de');

      expect(result.ingredients).toEqual([]);
      expect(result.steps).toEqual([]);
    });

    test('filters out empty lines', () => {
      const text = `200g flour

Mix well

`;

      const result = autoClassifyText(text, 'en');

      expect(result.ingredients).toHaveLength(1);
      expect(result.steps).toHaveLength(1);
    });

    test('works with English text', () => {
      const text = `Chocolate Cookies

2 cups flour
1 cup sugar
1 tsp salt

Mix dry ingredients
Add wet ingredients
Bake for 20 minutes`;

      const result = autoClassifyText(text, 'en');

      expect(result.ingredients).toContain('2 cups flour');
      expect(result.ingredients).toContain('1 cup sugar');
      expect(result.steps.length).toBeGreaterThan(0);
    });

    test('works with German text', () => {
      const text = `Schokoladenkuchen

250g Mehl
200g Zucker
3 Eier

Mehl sieben
Zucker und Eier schlagen
20 Minuten backen`;

      const result = autoClassifyText(text, 'de');

      expect(result.ingredients).toContain('250g Mehl');
      expect(result.ingredients).toContain('200g Zucker');
      expect(result.steps.length).toBeGreaterThan(0);
    });
  });

  describe('real-world scenarios', () => {
    test('classifies complex German recipe', () => {
      const lines = [
        '500g Rindfleisch, gewürfelt',
        '2 große Zwiebeln, gehackt',
        '3 EL Tomatenmark',
        '1 TL Paprikapulver',
        'Salz und Pfeffer nach Geschmack',
        'Das Fleisch in heißem Öl anbraten',
        'Zwiebeln hinzufügen und glasig dünsten',
        'Tomatenmark unterrühren und kurz anrösten',
        'Mit Brühe ablöschen und etwa 90 Minuten schmoren lassen',
        'Mit Salz, Pfeffer und Paprika abschmecken'
      ];

      const result = classifyText(lines, 'de');

      // First 5 should be ingredients
      expect(result.ingredients).toContain('500g Rindfleisch, gewürfelt');
      expect(result.ingredients).toContain('2 große Zwiebeln, gehackt');
      
      // Last 5 should be steps
      expect(result.steps).toContain('Das Fleisch in heißem Öl anbraten');
      expect(result.steps.length).toBeGreaterThan(0);
    });

    test('classifies complex English recipe', () => {
      const lines = [
        '2 lbs chicken breast, diced',
        '1 large onion, chopped',
        '3 cloves garlic, minced',
        '1 cup heavy cream',
        '2 tbsp olive oil',
        'Heat oil in a large pan over medium-high heat',
        'Add chicken and cook until golden brown',
        'Add onion and garlic, sauté until fragrant',
        'Pour in cream and simmer for 10 minutes',
        'Season with salt and pepper to taste'
      ];

      const result = classifyText(lines, 'en');

      // First 5 should be ingredients
      expect(result.ingredients).toContain('2 lbs chicken breast, diced');
      expect(result.ingredients).toContain('1 cup heavy cream');
      
      // Last 5 should be steps
      expect(result.steps).toContain('Heat oil in a large pan over medium-high heat');
      expect(result.steps.length).toBeGreaterThan(0);
    });

    test('handles ingredients with detailed descriptions', () => {
      const lines = [
        '400g Spaghetti, al dente gekocht',
        '200g Pancetta, in kleine Würfel geschnitten',
        '4 frische Eier, Zimmertemperatur',
        '100g Parmesan, frisch gerieben'
      ];

      const result = classifyText(lines, 'de');

      expect(result.ingredients).toHaveLength(4);
      result.ingredients.forEach(ing => {
        expect(ing).toMatch(/\d+g/);
      });
    });

    test('handles steps with specific instructions', () => {
      const lines = [
        'Den Backofen auf 180°C Ober-/Unterhitze vorheizen',
        'Ein Backblech mit Backpapier auslegen',
        'In einer großen Schüssel Mehl, Zucker und Backpulver vermischen',
        'Die weiche Butter und die Eier hinzufügen',
        'Alles mit dem Handrührgerät zu einem glatten Teig verarbeiten',
        'Den Teig etwa 30 Minuten im Kühlschrank ruhen lassen'
      ];

      const result = classifyText(lines, 'de');

      expect(result.steps).toHaveLength(6);
      expect(result.ingredients).toHaveLength(0);
    });
  });
});
