/**
 * Default configuration values for customizable lists
 */
export const DEFAULT_CUISINE_TYPES = [
  'Italian',
  'Thai',
  'Chinese',
  'Japanese',
  'Indian',
  'Mexican',
  'French',
  'German',
  'American',
  'Mediterranean',
  'Vegetarian',
  'Vegan',
  'Other'
];

export const DEFAULT_MEAL_CATEGORIES = [
  'Appetizer',
  'Main Course',
  'Dessert',
  'Soup',
  'Salad',
  'Snack',
  'Beverage',
  'Side Dish'
];

export const DEFAULT_UNITS = [
  'g',
  'kg',
  'ml',
  'l',
  'tsp',
  'tbsp',
  'cup',
  'oz',
  'lb',
  'piece',
  'pinch'
];

export const DEFAULT_PORTION_UNITS = [
  { id: 'portion', singular: 'Portion', plural: 'Portionen' },
  { id: 'pizza', singular: 'Pizza', plural: 'Pizzen' },
  { id: 'drink', singular: 'Drink', plural: 'Drinks' },
  { id: 'serving', singular: 'Serving', plural: 'Servings' },
  { id: 'person', singular: 'Person', plural: 'Personen' }
];

export const DEFAULT_SLOGAN = 'Unsere Besten';

/**
 * Get customizable lists from localStorage or return defaults
 */
export function getCustomLists() {
  const stored = localStorage.getItem('customLists');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure portionUnits exists for backward compatibility
      if (!parsed.portionUnits) {
        parsed.portionUnits = DEFAULT_PORTION_UNITS;
      }
      return parsed;
    } catch (e) {
      console.error('Error parsing custom lists:', e);
    }
  }
  
  return {
    cuisineTypes: DEFAULT_CUISINE_TYPES,
    mealCategories: DEFAULT_MEAL_CATEGORIES,
    units: DEFAULT_UNITS,
    portionUnits: DEFAULT_PORTION_UNITS
  };
}

/**
 * Save customizable lists to localStorage
 */
export function saveCustomLists(lists) {
  localStorage.setItem('customLists', JSON.stringify(lists));
}

/**
 * Reset lists to defaults
 */
export function resetCustomLists() {
  const defaultLists = {
    cuisineTypes: DEFAULT_CUISINE_TYPES,
    mealCategories: DEFAULT_MEAL_CATEGORIES,
    units: DEFAULT_UNITS,
    portionUnits: DEFAULT_PORTION_UNITS
  };
  saveCustomLists(defaultLists);
  return defaultLists;
}

/**
 * Get the header slogan from localStorage or return default
 */
export function getHeaderSlogan() {
  const stored = localStorage.getItem('headerSlogan');
  return stored || DEFAULT_SLOGAN;
}

/**
 * Save the header slogan to localStorage
 */
export function saveHeaderSlogan(slogan) {
  localStorage.setItem('headerSlogan', slogan);
}
