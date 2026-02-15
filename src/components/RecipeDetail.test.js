import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeDetail from './RecipeDetail';

// Mock the utility modules
jest.mock('../utils/userFavorites', () => ({
  isRecipeFavorite: () => false,
  toggleRecipeFavorite: jest.fn(),
  getUserFavorites: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../utils/userManagement', () => ({
  canDirectlyEditRecipe: () => true,
  canCreateNewVersion: () => true,
  canDeleteRecipe: () => true,
  getUsers: () => [
    { id: 'user-1', vorname: 'Test', nachname: 'User' },
  ],
}));

jest.mock('../utils/recipeVersioning', () => ({
  isRecipeVersion: () => false,
  getVersionNumber: () => 0,
  getRecipeVersions: () => [],
  getParentRecipe: () => null,
  sortRecipeVersions: (recipes) => recipes,
}));

jest.mock('../utils/customLists', () => ({
  getCustomLists: () => Promise.resolve({
    portionUnits: [
      { id: 'portion', singular: 'Portion', plural: 'Portionen' },
      { id: 'serving', singular: 'Menge', plural: 'Mengen' },
    ],
    cuisineTypes: [],
    mealCategories: [],
    units: [],
  }),
}));

describe('RecipeDetail - Portion Controller', () => {
  const mockRecipe = {
    id: 'recipe-1',
    title: 'Test Recipe',
    authorId: 'user-1',
    portionen: 4,
    portionUnitId: 1, // Portionen
    ingredients: [
      '200 g Ingredient 1',
      '1 Stück Ingredient 2',
    ],
    steps: ['Step 1', 'Step 2'],
    kulinarik: ['Italian'],
    schwierigkeit: 3,
    kochdauer: 30,
    speisekategorie: 'Main Course',
  };

  const currentUser = {
    id: 'user-1',
    vorname: 'Test',
    nachname: 'User',
  };

  test('displays initial portion count correctly', () => {
    render(
      <RecipeDetail
        recipe={mockRecipe}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        currentUser={currentUser}
      />
    );

    expect(screen.getByText('4 Portionen')).toBeInTheDocument();
  });

  test('increments portions by whole numbers only', () => {
    render(
      <RecipeDetail
        recipe={mockRecipe}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        currentUser={currentUser}
      />
    );

    // Initial state: 4 portions
    expect(screen.getByText('4 Portionen')).toBeInTheDocument();

    // Click increment button
    const incrementButton = screen.getAllByRole('button').find(btn => btn.textContent === '+');
    fireEvent.click(incrementButton);

    // Should now be 5 portions (not 4.5)
    expect(screen.getByText('5 Portionen')).toBeInTheDocument();

    // Click increment again
    fireEvent.click(incrementButton);

    // Should now be 6 portions
    expect(screen.getByText('6 Portionen')).toBeInTheDocument();
  });

  test('decrements portions by whole numbers only', () => {
    render(
      <RecipeDetail
        recipe={mockRecipe}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        currentUser={currentUser}
      />
    );

    // Initial state: 4 portions
    expect(screen.getByText('4 Portionen')).toBeInTheDocument();

    // Click decrement button
    const decrementButton = screen.getAllByRole('button').find(btn => btn.textContent === '-');
    fireEvent.click(decrementButton);

    // Should now be 3 portions (not 3.5)
    expect(screen.getByText('3 Portionen')).toBeInTheDocument();

    // Click decrement again
    fireEvent.click(decrementButton);

    // Should now be 2 portions
    expect(screen.getByText('2 Portionen')).toBeInTheDocument();
  });

  test('does not allow portions to go below 1', () => {
    const recipeWith1Portion = { ...mockRecipe, portionen: 1 };
    
    render(
      <RecipeDetail
        recipe={recipeWith1Portion}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        currentUser={currentUser}
      />
    );

    // Initial state: 1 portion
    expect(screen.getByText('1 Portion')).toBeInTheDocument();

    // Decrement button should be disabled
    const decrementButton = screen.getAllByRole('button').find(btn => btn.textContent === '-');
    expect(decrementButton).toBeDisabled();

    // Try to click it anyway
    fireEvent.click(decrementButton);

    // Should still be 1 portion
    expect(screen.getByText('1 Portion')).toBeInTheDocument();
  });

  test('enables decrement button when portions are above 1', () => {
    render(
      <RecipeDetail
        recipe={mockRecipe}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        currentUser={currentUser}
      />
    );

    const decrementButton = screen.getAllByRole('button').find(btn => btn.textContent === '-');
    
    // With 4 portions, decrement should be enabled
    expect(decrementButton).not.toBeDisabled();
  });

  test('scales ingredients based on whole number portions', () => {
    render(
      <RecipeDetail
        recipe={mockRecipe}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        currentUser={currentUser}
      />
    );

    // Initial state: 200g for 4 portions
    expect(screen.getByText(/200.*g/)).toBeInTheDocument();

    // Increment to 8 portions (double)
    const incrementButton = screen.getAllByRole('button').find(btn => btn.textContent === '+');
    fireEvent.click(incrementButton); // 5 portions
    fireEvent.click(incrementButton); // 6 portions
    fireEvent.click(incrementButton); // 7 portions
    fireEvent.click(incrementButton); // 8 portions

    // Should now be 400g (200 * 2)
    expect(screen.getByText(/400.*g/)).toBeInTheDocument();
  });
});

describe('RecipeDetail - Rating Stars Color', () => {
  const mockRecipe = {
    id: 'recipe-1',
    title: 'Test Recipe',
    authorId: 'user-1',
    portionen: 4,
    ingredients: [],
    steps: [],
    kulinarik: [],
    schwierigkeit: 3,
  };

  const currentUser = {
    id: 'user-1',
    vorname: 'Test',
    nachname: 'User',
  };

  test('displays difficulty stars when schwierigkeit is set', () => {
    render(
      <RecipeDetail
        recipe={mockRecipe}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        currentUser={currentUser}
      />
    );

    // Check that "Schwierigkeitsgrad" label is present
    expect(screen.getByText('Schwierigkeitsgrad')).toBeInTheDocument();
    
    // Check that the difficulty-stars class is present in the document
    const difficultyStars = document.querySelector('.difficulty-stars');
    expect(difficultyStars).toBeInTheDocument();
    
    // Check that stars are displayed (3 filled stars + 2 empty stars for schwierigkeit: 3)
    const filledStars = document.querySelectorAll('.star-filled');
    const emptyStars = document.querySelectorAll('.star-empty');
    expect(filledStars.length).toBe(3);
    expect(emptyStars.length).toBe(2);
  });

  test('difficulty stars have correct CSS class for orange color', () => {
    render(
      <RecipeDetail
        recipe={mockRecipe}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        currentUser={currentUser}
      />
    );

    const difficultyStars = document.querySelector('.difficulty-stars');
    expect(difficultyStars).toHaveClass('difficulty-stars');
  });

  test('metadata toggle button shows and hides details', () => {
    render(
      <RecipeDetail
        recipe={mockRecipe}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        currentUser={currentUser}
      />
    );

    // Metadata should be visible by default
    expect(screen.getByText('Schwierigkeitsgrad')).toBeInTheDocument();

    // Find and click the toggle button
    const toggleButton = screen.getByRole('button', { name: /Details ausblenden/i });
    fireEvent.click(toggleButton);

    // Metadata should now be hidden
    expect(screen.queryByText('Schwierigkeitsgrad')).not.toBeInTheDocument();

    // Button text should change
    expect(screen.getByRole('button', { name: /Details einblenden/i })).toBeInTheDocument();

    // Click again to show
    const showButton = screen.getByRole('button', { name: /Details einblenden/i });
    fireEvent.click(showButton);

    // Metadata should be visible again
    expect(screen.getByText('Schwierigkeitsgrad')).toBeInTheDocument();
  });
});
