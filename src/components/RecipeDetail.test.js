import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeDetail from './RecipeDetail';

// Mock the custom lists
jest.mock('../utils/customLists', () => ({
  getCustomLists: () => ({
    portionUnits: [
      { id: 'portion', singular: 'Portion', plural: 'Portionen' },
      { id: 'person', singular: 'Person', plural: 'Personen' }
    ]
  })
}));

describe('RecipeDetail - Portion Slider', () => {
  const mockRecipe = {
    id: 'recipe-1',
    title: 'Test Recipe',
    portionen: 4,
    portionUnitId: 'portion',
    schwierigkeit: 3,
    ingredients: ['200g flour', '2 eggs'],
    steps: ['Mix ingredients', 'Bake'],
    authorId: 'user-1'
  };

  const mockCurrentUser = {
    id: 'user-1',
    vorname: 'Test',
    nachname: 'User'
  };

  test('should increment servings by whole numbers only', () => {
    render(
      <RecipeDetail
        recipe={mockRecipe}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        currentUser={mockCurrentUser}
        allRecipes={[mockRecipe]}
        allUsers={[mockCurrentUser]}
      />
    );

    // Initial state should be 4 Portionen
    expect(screen.getByText('4 Portionen')).toBeInTheDocument();

    // Click the + button
    const plusButton = screen.getAllByRole('button').find(btn => btn.textContent === '+');
    fireEvent.click(plusButton);

    // Should now be 8 Portionen (4 * 2), not 6 (4 * 1.5)
    expect(screen.getByText('8 Portionen')).toBeInTheDocument();
  });

  test('should decrement servings by whole numbers only', () => {
    render(
      <RecipeDetail
        recipe={mockRecipe}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        currentUser={mockCurrentUser}
        allRecipes={[mockRecipe]}
        allUsers={[mockCurrentUser]}
      />
    );

    // Initial state should be 4 Portionen
    expect(screen.getByText('4 Portionen')).toBeInTheDocument();

    // Click the + button twice to get to 12
    const plusButton = screen.getAllByRole('button').find(btn => btn.textContent === '+');
    fireEvent.click(plusButton);
    fireEvent.click(plusButton);
    expect(screen.getByText('12 Portionen')).toBeInTheDocument();

    // Click the - button once
    const minusButton = screen.getAllByRole('button').find(btn => btn.textContent === '-');
    fireEvent.click(minusButton);

    // Should now be 8 Portionen (not 10)
    expect(screen.getByText('8 Portionen')).toBeInTheDocument();
  });

  test('should not allow servings below 1', () => {
    const singlePortionRecipe = {
      ...mockRecipe,
      portionen: 1
    };

    render(
      <RecipeDetail
        recipe={singlePortionRecipe}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        currentUser={mockCurrentUser}
        allRecipes={[singlePortionRecipe]}
        allUsers={[mockCurrentUser]}
      />
    );

    // Initial state should be 1 Portion
    expect(screen.getByText('1 Portion')).toBeInTheDocument();

    // The - button should be disabled
    const minusButton = screen.getAllByRole('button').find(btn => btn.textContent === '-');
    expect(minusButton).toBeDisabled();

    // Click the - button should not change anything
    fireEvent.click(minusButton);
    expect(screen.getByText('1 Portion')).toBeInTheDocument();
  });

  test('should use correct singular/plural forms for portions', () => {
    const singlePortionRecipe = {
      ...mockRecipe,
      portionen: 1
    };

    render(
      <RecipeDetail
        recipe={singlePortionRecipe}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        currentUser={mockCurrentUser}
        allRecipes={[singlePortionRecipe]}
        allUsers={[mockCurrentUser]}
      />
    );

    // Should show singular form
    expect(screen.getByText('1 Portion')).toBeInTheDocument();

    // Click + to go to 2
    const plusButton = screen.getAllByRole('button').find(btn => btn.textContent === '+');
    fireEvent.click(plusButton);

    // Should show plural form
    expect(screen.getByText('2 Portionen')).toBeInTheDocument();
  });
});

describe('RecipeDetail - Rating Stars Color', () => {
  const mockRecipe = {
    id: 'recipe-1',
    title: 'Test Recipe',
    portionen: 4,
    schwierigkeit: 3,
    ingredients: ['200g flour'],
    steps: ['Mix ingredients'],
    authorId: 'user-1'
  };

  const mockCurrentUser = {
    id: 'user-1',
    vorname: 'Test',
    nachname: 'User'
  };

  test('should display rating stars with correct styling class', () => {
    const { container } = render(
      <RecipeDetail
        recipe={mockRecipe}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        currentUser={mockCurrentUser}
        allRecipes={[mockRecipe]}
        allUsers={[mockCurrentUser]}
      />
    );

    // Check that the difficulty stars are rendered with the correct class
    const difficultyStars = container.querySelector('.difficulty-stars');
    expect(difficultyStars).toBeInTheDocument();
    expect(difficultyStars.textContent).toBe('⭐⭐⭐');
  });
});
