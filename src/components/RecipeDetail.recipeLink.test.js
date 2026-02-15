import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeDetail from './RecipeDetail';
import { createRecipeIngredient } from '../utils/ingredientUtils';

// Mock the userFavorites module
jest.mock('../utils/userFavorites', () => ({
  getUserFavorites: jest.fn().mockResolvedValue([])
}));

// Mock the customLists module
jest.mock('../utils/customLists', () => ({
  getCustomLists: () => Promise.resolve({
    portionUnits: [
      { id: 'portion', singular: 'Portion', plural: 'Portionen' }
    ],
    cuisineTypes: [],
    mealCategories: [],
    units: []
  })
}));

// Mock the utility modules
jest.mock('../utils/userManagement', () => ({
  canDirectlyEditRecipe: () => true,
  canCreateNewVersion: () => true,
  canDeleteRecipe: () => true,
}));

jest.mock('../utils/recipeVersioning', () => ({
  isRecipeVersion: () => false,
  getVersionNumber: () => 0,
  getRecipeVersions: () => [],
  getParentRecipe: () => null,
  sortRecipeVersions: (recipes) => recipes,
}));

describe('RecipeDetail - Recipe Linking', () => {
  const mockRecipe1 = {
    id: 'recipe-1',
    title: 'Pizza',
    authorId: 'user-1',
    portionen: 4,
    portionUnitId: 'portion',
    ingredients: [
      '400g flour',
      '200ml water',
      createRecipeIngredient('recipe-2', 'Tomato Sauce')
    ],
    steps: ['Make dough', 'Add sauce', 'Bake'],
    kulinarik: ['Italian'],
    speisekategorie: ['Main Course'],
    schwierigkeit: 3
  };

  const mockRecipe2 = {
    id: 'recipe-2',
    title: 'Tomato Sauce',
    authorId: 'user-1',
    portionen: 2,
    portionUnitId: 'portion',
    ingredients: ['500g tomatoes', '2 cloves garlic'],
    steps: ['Cook tomatoes', 'Add garlic'],
    kulinarik: ['Italian'],
    speisekategorie: ['Sauce'],
    schwierigkeit: 2
  };

  const mockCurrentUser = {
    id: 'user-1',
    vorname: 'Test',
    nachname: 'User',
    email: 'test@example.com',
    isAdmin: false
  };

  const mockAllUsers = [mockCurrentUser];
  const mockAllRecipes = [mockRecipe1, mockRecipe2];

  it('should render recipe link in ingredients', () => {
    const mockOnBack = jest.fn();
    const mockOnSelectRecipe = jest.fn();

    render(
      <RecipeDetail
        recipe={mockRecipe1}
        onBack={mockOnBack}
        onSelectRecipe={mockOnSelectRecipe}
        currentUser={mockCurrentUser}
        allRecipes={mockAllRecipes}
        allUsers={mockAllUsers}
      />
    );

    // Check that the recipe link is rendered
    const recipeLink = screen.getByRole('button', { name: /📖 Tomato Sauce/i });
    expect(recipeLink).toBeInTheDocument();
  });

  it('should call onSelectRecipe when recipe link is clicked', () => {
    const mockOnBack = jest.fn();
    const mockOnSelectRecipe = jest.fn();

    render(
      <RecipeDetail
        recipe={mockRecipe1}
        onBack={mockOnBack}
        onSelectRecipe={mockOnSelectRecipe}
        currentUser={mockCurrentUser}
        allRecipes={mockAllRecipes}
        allUsers={mockAllUsers}
      />
    );

    // Click the recipe link
    const recipeLink = screen.getByRole('button', { name: /📖 Tomato Sauce/i });
    fireEvent.click(recipeLink);

    // Check that onSelectRecipe was called with the linked recipe
    expect(mockOnSelectRecipe).toHaveBeenCalledWith(mockRecipe2, true);
  });

  it('should render text ingredients normally', () => {
    const mockOnBack = jest.fn();

    render(
      <RecipeDetail
        recipe={mockRecipe1}
        onBack={mockOnBack}
        currentUser={mockCurrentUser}
        allRecipes={mockAllRecipes}
        allUsers={mockAllUsers}
      />
    );

    // Check that text ingredients are rendered
    expect(screen.getByText('400g flour')).toBeInTheDocument();
    expect(screen.getByText('200ml water')).toBeInTheDocument();
  });

  it('should handle missing linked recipe gracefully', () => {
    const recipeWithBrokenLink = {
      ...mockRecipe1,
      ingredients: [
        '400g flour',
        createRecipeIngredient('recipe-999', 'Missing Recipe')
      ]
    };

    const mockOnBack = jest.fn();

    render(
      <RecipeDetail
        recipe={recipeWithBrokenLink}
        onBack={mockOnBack}
        currentUser={mockCurrentUser}
        allRecipes={mockAllRecipes}
        allUsers={mockAllUsers}
      />
    );

    // Check that the stored name is shown when recipe is not found
    expect(screen.getByText(/Missing Recipe/i)).toBeInTheDocument();
  });
});
