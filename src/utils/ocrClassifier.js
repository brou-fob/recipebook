/**
 * OCR Text Classifier
 * Automatically classifies OCR-recognized text into ingredients or preparation steps
 * 
 * This classifier uses pattern matching, keyword analysis, and heuristics to determine
 * whether a line of text should be classified as an ingredient or a preparation step.
 * 
 * Features:
 * - Smart ingredient detection (quantities, units, common ingredient names)
 * - Preparation step detection (action verbs, imperative sentences)
 * - Multilingual support (German and English)
 * - Context-aware classification
 */

/**
 * Classify a line of text as ingredient or step
 * @param {string} line - Single line of text
 * @param {string} lang - Language code ('de' or 'en')
 * @returns {Object} - Classification result {type: 'ingredient'|'step'|'unknown', confidence: 0-100}
 */
export function classifyLine(line, lang = 'de') {
  if (!line || typeof line !== 'string') {
    return { type: 'unknown', confidence: 0 };
  }

  const trimmed = line.trim();
  if (!trimmed) {
    return { type: 'unknown', confidence: 0 };
  }

  // Score for each type
  let ingredientScore = 0;
  let stepScore = 0;

  // Check for ingredient patterns
  if (hasQuantityPattern(trimmed)) {
    ingredientScore += 40;
  }

  if (hasUnitPattern(trimmed, lang)) {
    ingredientScore += 30;
  }

  if (hasIngredientKeywords(trimmed, lang)) {
    ingredientScore += 20;
  }

  // Check for step patterns
  if (hasActionVerb(trimmed, lang)) {
    stepScore += 35;
  }

  if (hasImperativeForm(trimmed, lang)) {
    stepScore += 30;
  }

  if (hasStepKeywords(trimmed, lang)) {
    stepScore += 25;
  }

  // Check length (ingredients are typically shorter)
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount <= 5) {
    ingredientScore += 10;
  } else if (wordCount > 8) {
    stepScore += 15;
  }

  // Determine classification
  const maxScore = Math.max(ingredientScore, stepScore);
  
  if (maxScore < 30) {
    return { type: 'unknown', confidence: 0 };
  }

  if (ingredientScore > stepScore) {
    return { type: 'ingredient', confidence: Math.min(100, ingredientScore) };
  } else if (stepScore > ingredientScore) {
    return { type: 'step', confidence: Math.min(100, stepScore) };
  } else {
    return { type: 'unknown', confidence: maxScore };
  }
}

/**
 * Classify multiple lines of text
 * @param {Array<string>} lines - Array of text lines
 * @param {string} lang - Language code ('de' or 'en')
 * @returns {Object} - {ingredients: [], steps: [], unclassified: []}
 */
export function classifyText(lines, lang = 'de') {
  if (!Array.isArray(lines)) {
    throw new Error('Lines must be an array');
  }

  const result = {
    ingredients: [],
    steps: [],
    unclassified: []
  };

  for (const line of lines) {
    const classification = classifyLine(line, lang);
    
    if (classification.type === 'ingredient' && classification.confidence >= 50) {
      result.ingredients.push(line);
    } else if (classification.type === 'step' && classification.confidence >= 50) {
      result.steps.push(line);
    } else {
      result.unclassified.push(line);
    }
  }

  return result;
}

/**
 * Check if text contains quantity pattern (numbers, fractions)
 * @param {string} text - Text to check
 * @returns {boolean}
 */
function hasQuantityPattern(text) {
  // Matches: "200", "1.5", "1/2", "1 1/2", "0.5"
  const quantityPatterns = [
    /^\d+/,                           // Starts with number
    /\d+\s*[.,]\s*\d+/,              // Decimal numbers
    /\d+\s*\/\s*\d+/,                // Fractions
    /\d+\s+\d+\s*\/\s*\d+/           // Mixed numbers
  ];

  return quantityPatterns.some(pattern => pattern.test(text));
}

/**
 * Check if text contains unit pattern
 * @param {string} text - Text to check
 * @param {string} lang - Language code
 * @returns {boolean}
 */
function hasUnitPattern(text, lang) {
  const units = {
    de: [
      'g', 'kg', 'mg',
      'ml', 'l', 'dl', 'cl',
      'EL', 'TL', 'Tasse', 'Tassen',
      'Prise', 'Prisen',
      'Stück', 'Stk',
      'Bund', 'Zehe', 'Zehen',
      'cm', 'mm'
    ],
    en: [
      'g', 'kg', 'mg', 'oz', 'lb', 'lbs',
      'ml', 'l', 'cup', 'cups',
      'tbsp', 'tsp', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons',
      'pinch', 'pinches',
      'piece', 'pieces', 'pcs',
      'bunch', 'clove', 'cloves',
      'inch', 'inches', 'cm', 'mm'
    ]
  };

  const langUnits = units[lang] || units.de;
  
  // Create pattern: word boundary + unit + word boundary or end
  const pattern = new RegExp(`\\b(${langUnits.join('|')})\\b`, 'i');
  
  return pattern.test(text);
}

/**
 * Check if text contains ingredient keywords
 * @param {string} text - Text to check
 * @param {string} lang - Language code
 * @returns {boolean}
 */
function hasIngredientKeywords(text, lang) {
  const keywords = {
    de: [
      'Mehl', 'Zucker', 'Salz', 'Pfeffer', 'Butter', 'Öl', 'Olivenöl',
      'Ei', 'Eier', 'Milch', 'Sahne', 'Käse',
      'Zwiebel', 'Zwiebeln', 'Knoblauch',
      'Tomate', 'Tomaten', 'Gurke', 'Gurken',
      'Fleisch', 'Hühnchen', 'Rindfleisch', 'Schweinefleisch',
      'Fisch', 'Lachs', 'Thunfisch',
      'Wasser', 'Brühe',
      'frisch', 'gehackt', 'gewürfelt', 'gerieben'
    ],
    en: [
      'flour', 'sugar', 'salt', 'pepper', 'butter', 'oil', 'olive oil',
      'egg', 'eggs', 'milk', 'cream', 'cheese',
      'onion', 'onions', 'garlic',
      'tomato', 'tomatoes', 'cucumber', 'cucumbers',
      'meat', 'chicken', 'beef', 'pork',
      'fish', 'salmon', 'tuna',
      'water', 'broth', 'stock',
      'fresh', 'chopped', 'diced', 'grated', 'minced'
    ]
  };

  const langKeywords = keywords[lang] || keywords.de;
  const lowerText = text.toLowerCase();
  
  return langKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Check if text contains action verbs (cooking actions)
 * @param {string} text - Text to check
 * @param {string} lang - Language code
 * @returns {boolean}
 */
function hasActionVerb(text, lang) {
  const verbs = {
    de: [
      'mischen', 'rühren', 'schlagen', 'verrühren', 'vermengen',
      'schneiden', 'hacken', 'würfeln', 'raspeln', 'reiben',
      'kochen', 'braten', 'backen', 'grillen', 'dünsten', 'garen',
      'erhitzen', 'aufkochen', 'köcheln',
      'hinzufügen', 'hinzugeben', 'dazugeben', 'unterrühren',
      'abschmecken', 'würzen', 'salzen', 'pfeffern',
      'servieren', 'anrichten', 'garnieren',
      'vorheizen', 'vorbereiten', 'waschen', 'schälen',
      'gießen', 'abgießen', 'abtropfen',
      'ziehen lassen', 'ruhen lassen', 'marinieren'
    ],
    en: [
      'mix', 'stir', 'beat', 'whisk', 'combine', 'blend',
      'cut', 'chop', 'dice', 'mince', 'slice', 'grate', 'shred',
      'cook', 'fry', 'bake', 'grill', 'roast', 'simmer', 'boil',
      'heat', 'preheat', 'warm',
      'add', 'pour', 'sprinkle', 'fold in',
      'season', 'salt', 'pepper', 'taste',
      'serve', 'garnish', 'plate',
      'prepare', 'wash', 'peel', 'clean',
      'drain', 'strain',
      'let rest', 'let stand', 'marinate', 'chill', 'cool'
    ]
  };

  const langVerbs = verbs[lang] || verbs.de;
  const lowerText = text.toLowerCase();
  
  return langVerbs.some(verb => lowerText.includes(verb.toLowerCase()));
}

/**
 * Check if text is in imperative form (command form)
 * Common for preparation steps
 * @param {string} text - Text to check
 * @param {string} lang - Language code
 * @returns {boolean}
 */
function hasImperativeForm(text, lang) {
  // German imperative indicators
  const dePatterns = [
    /^(den|die|das|einen|eine|ein)\s+\w+/i, // "Den Ofen vorheizen"
    /\s+(und|dann|anschließend|danach)\s+/i, // Temporal connectors
    /\s+(bei|für|ca\.|etwa)\s+\d+/i,         // "bei 180°C", "für 30 Minuten"
  ];

  // English imperative indicators
  const enPatterns = [
    /^(preheat|mix|add|combine|beat|whisk|stir|cut|chop|place|put|set)/i,
    /\s+(then|next|after|until|for|at)\s+/i,
    /\s+(for|at|about)\s+\d+/i,              // "for 30 minutes", "at 180°C"
  ];

  const patterns = lang === 'en' ? enPatterns : dePatterns;
  
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Check if text contains step-specific keywords
 * @param {string} text - Text to check
 * @param {string} lang - Language code
 * @returns {boolean}
 */
function hasStepKeywords(text, lang) {
  const keywords = {
    de: [
      'Schritt', 'Schüssel', 'Pfanne', 'Topf', 'Ofen', 'Backblech',
      'Minuten', 'Stunden', 'Grad', '°C',
      'bis', 'bis zu', 'ca.', 'etwa', 'circa',
      'goldbraun', 'gar', 'weich', 'fest',
      'vorsichtig', 'langsam', 'schnell',
      'gleichmäßig', 'kräftig', 'gut'
    ],
    en: [
      'step', 'bowl', 'pan', 'pot', 'oven', 'baking sheet', 'sheet',
      'minutes', 'hours', 'degrees', '°F', '°C',
      'until', 'about', 'approximately',
      'golden', 'brown', 'done', 'soft', 'firm', 'tender',
      'gently', 'slowly', 'quickly', 'carefully',
      'evenly', 'well', 'thoroughly'
    ]
  };

  const langKeywords = keywords[lang] || keywords.de;
  const lowerText = text.toLowerCase();
  
  return langKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Auto-classify unstructured text into ingredients and steps
 * Useful when section headers are not detected
 * @param {string} text - Full OCR text
 * @param {string} lang - Language code
 * @returns {Object} - {ingredients: [], steps: []}
 */
export function autoClassifyText(text, lang = 'de') {
  if (!text || typeof text !== 'string') {
    return { ingredients: [], steps: [] };
  }

  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const classified = classifyText(lines, lang);
  
  return {
    ingredients: classified.ingredients,
    steps: classified.steps
  };
}
