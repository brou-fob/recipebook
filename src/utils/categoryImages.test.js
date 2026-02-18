import {
  getCategoryImages,
  saveCategoryImages,
  addCategoryImage,
  updateCategoryImage,
  removeCategoryImage,
  getImageForCategory,
  getImageForCategories,
  isCategoryAssigned,
  getAlreadyAssignedCategories,
  _resetMigrationFlag
} from './categoryImages';

// Mock Firebase
jest.mock('../firebase', () => ({
  db: {}
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({})),
  getDoc: jest.fn(),
  updateDoc: jest.fn()
}));

import { doc, getDoc, updateDoc } from 'firebase/firestore';

describe('categoryImages', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    _resetMigrationFlag();
    
    // Default mock: return empty settings document
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ categoryImages: [] })
    });
  });

  describe('getCategoryImages', () => {
    test('returns empty array when no images stored in Firestore', async () => {
      expect(await getCategoryImages()).toEqual([]);
    });

    test('returns stored images from Firestore', async () => {
      const images = [
        { id: '1', image: 'data:image/png;base64,abc', categories: ['Appetizer'] }
      ];
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ categoryImages: images })
      });
      expect(await getCategoryImages()).toEqual(images);
    });

    test('migrates from localStorage when Firestore is empty', async () => {
      const images = [
        { id: '1', image: 'data:image/png;base64,abc', categories: ['Appetizer'] }
      ];
      localStorage.setItem('categoryImages', JSON.stringify(images));
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ categoryImages: [] })
      });
      
      const result = await getCategoryImages();
      expect(result).toEqual(images);
      expect(updateDoc).toHaveBeenCalled();
      expect(localStorage.getItem('categoryImages')).toBeNull();
    });

    test('falls back to localStorage on Firestore error', async () => {
      const images = [
        { id: '1', image: 'data:image/png;base64,abc', categories: ['Appetizer'] }
      ];
      localStorage.setItem('categoryImages', JSON.stringify(images));
      
      getDoc.mockRejectedValue(new Error('Firestore error'));
      
      expect(await getCategoryImages()).toEqual(images);
    });

    test('handles corrupted localStorage data gracefully', async () => {
      localStorage.setItem('categoryImages', 'invalid json');
      getDoc.mockRejectedValue(new Error('Firestore error'));
      expect(await getCategoryImages()).toEqual([]);
    });
  });

  describe('saveCategoryImages', () => {
    test('saves images to Firestore', async () => {
      const images = [
        { id: '1', image: 'data:image/png;base64,abc', categories: ['Appetizer'] }
      ];
      const mockDocRef = { id: 'app' };
      doc.mockReturnValue(mockDocRef);
      
      await saveCategoryImages(images);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { categoryImages: images });
    });

    test('throws German error message on resource-exhausted error', async () => {
      const error = new Error('Resource exhausted');
      error.code = 'resource-exhausted';
      updateDoc.mockRejectedValue(error);

      const images = [
        { id: '1', image: 'data:image/png;base64,abc', categories: ['Appetizer'] }
      ];

      await expect(saveCategoryImages(images)).rejects.toThrow(
        'Speicherplatz voll. Bitte entfernen Sie einige Kategoriebilder oder verwenden Sie kleinere Bilder.'
      );
    });

    test('re-throws other storage errors', async () => {
      const testError = new Error('Some other error');
      updateDoc.mockRejectedValue(testError);

      const images = [
        { id: '1', image: 'data:image/png;base64,abc', categories: ['Appetizer'] }
      ];

      await expect(saveCategoryImages(images)).rejects.toThrow('Some other error');
    });
  });

  describe('addCategoryImage', () => {
    test('adds new image with categories', async () => {
      const image = await addCategoryImage('data:image/png;base64,abc', ['Appetizer', 'Dessert']);
      
      expect(image).toMatchObject({
        image: 'data:image/png;base64,abc',
        categories: ['Appetizer', 'Dessert']
      });
      expect(image.id).toBeDefined();
      
      expect(updateDoc).toHaveBeenCalled();
    });

    test('adds image with no categories', async () => {
      const image = await addCategoryImage('data:image/png;base64,xyz');
      
      expect(image.categories).toEqual([]);
    });
  });

  describe('updateCategoryImage', () => {
    test('updates existing image', async () => {
      const image = await addCategoryImage('data:image/png;base64,abc', ['Appetizer']);
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ categoryImages: [image] })
      });
      
      const result = await updateCategoryImage(image.id, { 
        categories: ['Main Course', 'Dessert'] 
      });
      
      expect(result).toBe(true);
      expect(updateDoc).toHaveBeenCalled();
    });

    test('returns false for non-existent image', async () => {
      const result = await updateCategoryImage('non-existent', { categories: [] });
      expect(result).toBe(false);
    });
  });

  describe('removeCategoryImage', () => {
    test('removes existing image', async () => {
      const image1 = await addCategoryImage('data:image/png;base64,abc', ['Appetizer']);
      const image2 = await addCategoryImage('data:image/png;base64,def', ['Dessert']);
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ categoryImages: [image1, image2] })
      });
      
      const result = await removeCategoryImage(image1.id);
      
      expect(result).toBe(true);
      expect(updateDoc).toHaveBeenCalled();
    });

    test('returns false for non-existent image', async () => {
      const result = await removeCategoryImage('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('getImageForCategory', () => {
    test('returns image for assigned category', async () => {
      const images = [
        { id: '1', image: 'data:image/png;base64,abc', categories: ['Appetizer', 'Salad'] },
        { id: '2', image: 'data:image/png;base64,def', categories: ['Dessert'] }
      ];
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ categoryImages: images })
      });
      
      expect(await getImageForCategory('Appetizer')).toBe('data:image/png;base64,abc');
      expect(await getImageForCategory('Salad')).toBe('data:image/png;base64,abc');
      expect(await getImageForCategory('Dessert')).toBe('data:image/png;base64,def');
    });

    test('returns null for unassigned category', async () => {
      const images = [
        { id: '1', image: 'data:image/png;base64,abc', categories: ['Appetizer'] }
      ];
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ categoryImages: images })
      });
      
      expect(await getImageForCategory('Main Course')).toBeNull();
    });
  });

  describe('getImageForCategories', () => {
    test('returns first matching image for categories', async () => {
      const images = [
        { id: '1', image: 'data:image/png;base64,abc', categories: ['Appetizer'] },
        { id: '2', image: 'data:image/png;base64,def', categories: ['Main Course'] },
        { id: '3', image: 'data:image/png;base64,ghi', categories: ['Dessert'] }
      ];
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ categoryImages: images })
      });
      
      expect(await getImageForCategories(['Main Course', 'Dessert'])).toBe('data:image/png;base64,def');
      expect(await getImageForCategories(['Dessert', 'Main Course'])).toBe('data:image/png;base64,ghi');
    });

    test('returns null when no categories match', async () => {
      const images = [
        { id: '1', image: 'data:image/png;base64,abc', categories: ['Appetizer'] }
      ];
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ categoryImages: images })
      });
      
      expect(await getImageForCategories(['Main Course', 'Dessert'])).toBeNull();
    });

    test('returns null for empty categories array', async () => {
      expect(await getImageForCategories([])).toBeNull();
    });
  });

  describe('isCategoryAssigned', () => {
    test('returns true if category is assigned', async () => {
      const images = [
        { id: '1', image: 'data:image/png;base64,abc', categories: ['Appetizer', 'Salad'] }
      ];
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ categoryImages: images })
      });
      
      expect(await isCategoryAssigned('Appetizer')).toBe(true);
      expect(await isCategoryAssigned('Salad')).toBe(true);
    });

    test('returns false if category is not assigned', async () => {
      const images = [
        { id: '1', image: 'data:image/png;base64,abc', categories: ['Appetizer'] }
      ];
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ categoryImages: images })
      });
      
      expect(await isCategoryAssigned('Main Course')).toBe(false);
    });

    test('excludes specified image from check', async () => {
      const images = [
        { id: 'test-id', image: 'data:image/png;base64,abc', categories: ['Appetizer'] }
      ];
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ categoryImages: images })
      });
      
      expect(await isCategoryAssigned('Appetizer', 'test-id')).toBe(false);
    });
  });

  describe('getAlreadyAssignedCategories', () => {
    test('returns categories already assigned to other images', async () => {
      const images = [
        { id: 'image1', image: 'data:image/png;base64,abc', categories: ['Appetizer', 'Salad'] },
        { id: 'image2', image: 'data:image/png;base64,def', categories: ['Main Course'] }
      ];
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ categoryImages: images })
      });
      
      const assigned = await getAlreadyAssignedCategories(
        ['Appetizer', 'Dessert', 'Main Course'], 
        'image1'
      );
      
      expect(assigned).toEqual(['Main Course']);
    });

    test('returns empty array when no categories are assigned', async () => {
      const images = [
        { id: '1', image: 'data:image/png;base64,abc', categories: ['Appetizer'] }
      ];
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ categoryImages: images })
      });
      
      const assigned = await getAlreadyAssignedCategories(['Dessert', 'Main Course']);
      
      expect(assigned).toEqual([]);
    });

    test('excludes own image when checking assignments', async () => {
      const images = [
        { id: 'test-id', image: 'data:image/png;base64,abc', categories: ['Appetizer', 'Salad'] }
      ];
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ categoryImages: images })
      });
      
      const assigned = await getAlreadyAssignedCategories(['Appetizer', 'Salad'], 'test-id');
      
      expect(assigned).toEqual([]);
    });
  });
});
