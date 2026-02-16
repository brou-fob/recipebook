/**
 * OCR Validation Utility
 * Validates OCR-recognized text to check if recipe components are properly detected
 * 
 * This utility checks if the following information is recognized:
 * - Recipe title
 * - Cuisine type (Kulinarik)
 * - Number of servings (Portionen)
 * - Cooking time (Zubereitungsdauer/Kochdauer)
 * 
 * Returns validation results with confidence levels and suggestions for improvement.
 */

/**
 * Validate OCR result to check if key recipe components are detected
 * @param {Object} parsedRecipe - Parsed recipe object from parseOcrText
 * @returns {Object} - Validation result with detected fields and suggestions
 */
export function validateOcrResult(parsedRecipe) {
  if (!parsedRecipe || typeof parsedRecipe !== 'object') {
    throw new Error('Ungültiges Rezeptobjekt für Validierung');
  }

  const validation = {
    isValid: true,
    detected: {
      title: false,
      cuisine: false,
      servings: false,
      cookingTime: false,
      ingredients: false,
      steps: false
    },
    confidence: {
      title: 0,
      cuisine: 0,
      servings: 0,
      cookingTime: 0,
      ingredients: 0,
      steps: 0
    },
    warnings: [],
    suggestions: [],
    score: 0 // Overall quality score (0-100)
  };

  // Validate title
  if (parsedRecipe.title && parsedRecipe.title.trim()) {
    // Check if title is not a default/fallback value
    const isFallbackTitle = 
      parsedRecipe.title === 'OCR-Rezept' || 
      parsedRecipe.title === 'OCR Recipe';
    
    if (!isFallbackTitle) {
      validation.detected.title = true;
      // Higher confidence for longer, more descriptive titles
      const titleLength = parsedRecipe.title.length;
      validation.confidence.title = Math.min(100, 50 + titleLength * 2);
    } else {
      validation.warnings.push('Kein Rezepttitel gefunden');
      validation.suggestions.push('Stellen Sie sicher, dass der Rezepttitel am Anfang des Bildes sichtbar ist');
    }
  } else {
    validation.warnings.push('Kein Rezepttitel gefunden');
    validation.suggestions.push('Fügen Sie einen Rezepttitel am Anfang hinzu');
  }

  // Validate cuisine (Kulinarik)
  if (parsedRecipe.kulinarik && Array.isArray(parsedRecipe.kulinarik) && parsedRecipe.kulinarik.length > 0) {
    const hasValidCuisine = parsedRecipe.kulinarik.some(c => c && c.trim());
    if (hasValidCuisine) {
      validation.detected.cuisine = true;
      validation.confidence.cuisine = 90; // High confidence if explicitly detected
    }
  } else {
    validation.warnings.push('Kulinarik nicht erkannt');
    validation.suggestions.push('Fügen Sie eine Zeile hinzu wie "Kulinarik: Italienisch" oder "Cuisine: Italian"');
  }

  // Validate servings (Portionen)
  if (parsedRecipe.portionen && parsedRecipe.portionen !== 4) { // 4 is the default fallback
    validation.detected.servings = true;
    // Check if servings value is reasonable (1-50)
    if (parsedRecipe.portionen >= 1 && parsedRecipe.portionen <= 50) {
      validation.confidence.servings = 95;
    } else {
      validation.confidence.servings = 60;
      validation.warnings.push(`Ungewöhnliche Portionenanzahl: ${parsedRecipe.portionen}`);
    }
  } else {
    validation.warnings.push('Portionenanzahl nicht erkannt (Standard: 4 verwendet)');
    validation.suggestions.push('Fügen Sie eine Zeile hinzu wie "Portionen: 4" oder "für 4 Personen"');
  }

  // Validate cooking time (Kochdauer)
  if (parsedRecipe.kochdauer && parsedRecipe.kochdauer !== 30) { // 30 is the default fallback
    validation.detected.cookingTime = true;
    // Check if cooking time is reasonable (1-600 minutes = 10 hours)
    if (parsedRecipe.kochdauer >= 1 && parsedRecipe.kochdauer <= 600) {
      validation.confidence.cookingTime = 95;
    } else {
      validation.confidence.cookingTime = 60;
      validation.warnings.push(`Ungewöhnliche Kochdauer: ${parsedRecipe.kochdauer} Minuten`);
    }
  } else {
    validation.warnings.push('Zubereitungsdauer nicht erkannt (Standard: 30 Minuten verwendet)');
    validation.suggestions.push('Fügen Sie eine Zeile hinzu wie "Kochdauer: 45" oder "Zeit: 45 Minuten"');
  }

  // Validate ingredients
  if (parsedRecipe.ingredients && Array.isArray(parsedRecipe.ingredients) && parsedRecipe.ingredients.length > 0) {
    validation.detected.ingredients = true;
    // Confidence based on number of ingredients (reasonable range: 2-30)
    const count = parsedRecipe.ingredients.length;
    if (count >= 2 && count <= 30) {
      validation.confidence.ingredients = Math.min(100, 70 + count * 2);
    } else if (count === 1) {
      validation.confidence.ingredients = 50;
      validation.warnings.push('Nur eine Zutat erkannt - ist das korrekt?');
    } else if (count > 30) {
      validation.confidence.ingredients = 70;
      validation.warnings.push(`Sehr viele Zutaten erkannt (${count}) - prüfen Sie auf Duplikate`);
    }
  } else {
    validation.isValid = false;
    validation.warnings.push('Keine Zutaten erkannt');
    validation.suggestions.push('Stellen Sie sicher, dass der Abschnitt "Zutaten" oder "Ingredients" sichtbar ist');
  }

  // Validate preparation steps
  if (parsedRecipe.steps && Array.isArray(parsedRecipe.steps) && parsedRecipe.steps.length > 0) {
    validation.detected.steps = true;
    // Confidence based on number of steps (reasonable range: 1-20)
    const count = parsedRecipe.steps.length;
    if (count >= 1 && count <= 20) {
      validation.confidence.steps = Math.min(100, 70 + count * 3);
    } else if (count > 20) {
      validation.confidence.steps = 70;
      validation.warnings.push(`Sehr viele Zubereitungsschritte erkannt (${count}) - prüfen Sie auf korrekte Zusammenführung`);
    }
  } else {
    validation.isValid = false;
    validation.warnings.push('Keine Zubereitungsschritte erkannt');
    validation.suggestions.push('Stellen Sie sicher, dass der Abschnitt "Zubereitung" oder "Instructions" sichtbar ist');
  }

  // Calculate overall quality score (0-100)
  const weights = {
    title: 20,
    cuisine: 10,
    servings: 10,
    cookingTime: 10,
    ingredients: 25,
    steps: 25
  };

  let totalScore = 0;
  let maxScore = 0;

  for (const field in weights) {
    maxScore += weights[field];
    if (validation.detected[field]) {
      totalScore += (weights[field] * validation.confidence[field]) / 100;
    }
  }

  validation.score = Math.round((totalScore / maxScore) * 100);

  // Add overall quality suggestion
  if (validation.score < 50) {
    validation.suggestions.unshift('Die Erkennungsqualität ist niedrig. Versuchen Sie, das Bild erneut zu scannen mit besserer Beleuchtung und höherer Auflösung.');
  } else if (validation.score < 70) {
    validation.suggestions.unshift('Die Erkennungsqualität ist mittelmäßig. Einige Informationen fehlen oder sind unvollständig.');
  }

  return validation;
}

/**
 * Get a summary text describing the validation results
 * @param {Object} validationResult - Result from validateOcrResult
 * @param {string} lang - Language code ('de' or 'en')
 * @returns {string} - Human-readable summary
 */
export function getValidationSummary(validationResult, lang = 'de') {
  if (!validationResult) return '';

  const messages = {
    de: {
      detected: 'Erkannt',
      notDetected: 'Nicht erkannt',
      quality: 'Erkennungsqualität',
      excellent: 'Ausgezeichnet',
      good: 'Gut',
      moderate: 'Mittelmäßig',
      poor: 'Schlecht'
    },
    en: {
      detected: 'Detected',
      notDetected: 'Not detected',
      quality: 'Recognition Quality',
      excellent: 'Excellent',
      good: 'Good',
      moderate: 'Moderate',
      poor: 'Poor'
    }
  };

  const msg = messages[lang] || messages.de;
  
  let summary = `${msg.quality}: ${validationResult.score}% (`;
  
  if (validationResult.score >= 85) {
    summary += msg.excellent;
  } else if (validationResult.score >= 70) {
    summary += msg.good;
  } else if (validationResult.score >= 50) {
    summary += msg.moderate;
  } else {
    summary += msg.poor;
  }
  
  summary += ')\n\n';

  // List detected components
  const detectedItems = [];
  const notDetectedItems = [];

  const fieldNames = {
    de: {
      title: 'Rezepttitel',
      cuisine: 'Kulinarik',
      servings: 'Portionen',
      cookingTime: 'Zubereitungsdauer',
      ingredients: 'Zutaten',
      steps: 'Zubereitungsschritte'
    },
    en: {
      title: 'Recipe Title',
      cuisine: 'Cuisine',
      servings: 'Servings',
      cookingTime: 'Cooking Time',
      ingredients: 'Ingredients',
      steps: 'Preparation Steps'
    }
  };

  const names = fieldNames[lang] || fieldNames.de;

  for (const [field, detected] of Object.entries(validationResult.detected)) {
    if (detected) {
      detectedItems.push(`✓ ${names[field]}`);
    } else {
      notDetectedItems.push(`✗ ${names[field]}`);
    }
  }

  if (detectedItems.length > 0) {
    summary += `${msg.detected}:\n${detectedItems.join('\n')}\n\n`;
  }

  if (notDetectedItems.length > 0) {
    summary += `${msg.notDetected}:\n${notDetectedItems.join('\n')}\n`;
  }

  return summary;
}

/**
 * Check if validation result is acceptable for import
 * @param {Object} validationResult - Result from validateOcrResult
 * @param {number} minScore - Minimum acceptable score (default: 40)
 * @returns {boolean} - True if result is acceptable
 */
export function isValidationAcceptable(validationResult, minScore = 40) {
  if (!validationResult) return false;
  
  // Must have ingredients and steps
  if (!validationResult.detected.ingredients || !validationResult.detected.steps) {
    return false;
  }
  
  // Must meet minimum quality score
  return validationResult.score >= minScore;
}
