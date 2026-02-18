/**
 * Firestore Utility Functions
 * Shared utilities for working with Firestore
 */

/**
 * Remove undefined fields and Promise objects from an object
 * Firestore does not accept undefined values or Promise objects, so we need to filter them out.
 * 
 * Note: This function only handles shallow objects. If your data contains
 * nested objects with undefined values, consider implementing a recursive version.
 * However, for typical recipe and menu data structures (which use arrays of strings
 * rather than nested objects), this shallow implementation is sufficient.
 * 
 * @param {Object} obj - Object to filter
 * @returns {Object} Object with undefined fields and Promise objects removed
 */
export const removeUndefinedFields = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => {
      // Filter out undefined values
      if (value === undefined) return false;
      // Filter out Promise objects (check for thenable objects)
      if (value && typeof value === 'object' && typeof value.then === 'function') {
        console.warn('Attempted to store a Promise object in Firestore. This has been filtered out.');
        return false;
      }
      return true;
    })
  );
};
