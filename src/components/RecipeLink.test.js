import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeForm from './RecipeForm';
import RecipeDetail from './RecipeDetail';

describe('Recipe Linking Feature', () => {
  const mockRecipes = [
    { id: '1', title: 'Pasta Sauce', ingredients: ['tomatoes', 'garlic'], steps: ['cook'] },
    { id: '2', title: 'Pizza Dough', ingredients: ['flour', 'water'], steps: ['mix'] },
    { id: '3', title: 'Chocolate Cake', ingredients: ['chocolate', 'flour'], steps: ['bake'] },
  ];

  const mockUser = { uid: 'user123', displayName: 'Test User' };

  describe('RecipeForm - Recipe Search and Selection', () => {
    it('should show recipe suggestions when typing @ in ingredient field', () => {
      const mockSave = jest.fn();
      const mockCancel = jest.fn();

      render(
        <RecipeForm
          recipe={null}
          onSave={mockSave}
          onCancel={mockCancel}
          currentUser={mockUser}
          allRecipes={mockRecipes}
        />
      );

      // Find the first ingredient input
      const ingredientInput = screen.getByPlaceholderText(/Zutat 1 \(oder @ für Rezeptsuche\)/i);
      
      // Type @ followed by search term
      fireEvent.change(ingredientInput, { target: { value: '@pasta' } });

      // Check if suggestions appear
      expect(screen.getByText(/Pasta Sauce/i)).toBeInTheDocument();
    });

    it('should filter recipe suggestions based on search term', () => {
      const mockSave = jest.fn();
      const mockCancel = jest.fn();

      render(
        <RecipeForm
          recipe={null}
          onSave={mockSave}
          onCancel={mockCancel}
          currentUser={mockUser}
          allRecipes={mockRecipes}
        />
      );

      const ingredientInput = screen.getByPlaceholderText(/Zutat 1 \(oder @ für Rezeptsuche\)/i);
      
      // Search for "choco" should only show Chocolate Cake
      fireEvent.change(ingredientInput, { target: { value: '@choco' } });

      expect(screen.getByText(/Chocolate Cake/i)).toBeInTheDocument();
      expect(screen.queryByText(/Pasta Sauce/i)).not.toBeInTheDocument();
    });

    it('should add recipe link when suggestion is clicked', () => {
      const mockSave = jest.fn();
      const mockCancel = jest.fn();

      render(
        <RecipeForm
          recipe={null}
          onSave={mockSave}
          onCancel={mockCancel}
          currentUser={mockUser}
          allRecipes={mockRecipes}
        />
      );

      const ingredientInput = screen.getByPlaceholderText(/Zutat 1 \(oder @ für Rezeptsuche\)/i);
      
      // Type search term
      fireEvent.change(ingredientInput, { target: { value: '@pasta' } });

      // Click on the suggestion
      const suggestion = screen.getByText(/Pasta Sauce/i);
      fireEvent.click(suggestion);

      // The input should now show the recipe title and be disabled (recipe link mode)
      expect(ingredientInput).toHaveValue('Pasta Sauce');
      expect(ingredientInput).toBeDisabled();
    });

    it('should display recipe-linked ingredients with visual distinction', () => {
      const mockSave = jest.fn();
      const mockCancel = jest.fn();

      const recipeWithLink = {
        id: '4',
        title: 'Pizza',
        ingredients: ['RECIPE_LINK:1:Pasta Sauce', '200g cheese'],
        steps: ['assemble', 'bake'],
      };

      render(
        <RecipeForm
          recipe={recipeWithLink}
          onSave={mockSave}
          onCancel={mockCancel}
          currentUser={mockUser}
          allRecipes={mockRecipes}
        />
      );

      // Find the recipe-linked ingredient input
      const linkedInput = screen.getByDisplayValue('Pasta Sauce');
      
      // It should have special styling
      expect(linkedInput).toHaveStyle({
        fontWeight: 'bold',
        color: '#2196F3'
      });
      
      // It should be disabled (read-only)
      expect(linkedInput).toBeDisabled();
    });
  });

  describe('RecipeDetail - Recipe Link Display and Navigation', () => {
    it('should render recipe-linked ingredients as clickable links', () => {
      const recipeWithLink = {
        id: '4',
        title: 'Pizza',
        portionen: 4,
        ingredients: ['RECIPE_LINK:1:Pasta Sauce', '200g cheese'],
        steps: ['assemble', 'bake'],
      };

      const mockOnBack = jest.fn();
      const mockOnEdit = jest.fn();

      render(
        <RecipeDetail
          recipe={recipeWithLink}
          onBack={mockOnBack}
          onEdit={mockOnEdit}
          onDelete={jest.fn()}
          onToggleFavorite={jest.fn()}
          onCreateVersion={jest.fn()}
          currentUser={mockUser}
          allRecipes={mockRecipes}
          allUsers={[]}
        />
      );

      // Check that the recipe link is rendered with link icon
      expect(screen.getByText(/🔗 Pasta Sauce/i)).toBeInTheDocument();
      
      // Check that regular ingredient is also shown
      expect(screen.getByText(/200g cheese/i)).toBeInTheDocument();
    });

    it('should navigate to linked recipe when clicked', () => {
      const recipeWithLink = {
        id: '4',
        title: 'Pizza',
        portionen: 4,
        ingredients: ['RECIPE_LINK:1:Pasta Sauce', '200g cheese'],
        steps: ['assemble', 'bake'],
      };

      const mockOnBack = jest.fn();

      const { rerender } = render(
        <RecipeDetail
          recipe={recipeWithLink}
          onBack={mockOnBack}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          onToggleFavorite={jest.fn()}
          onCreateVersion={jest.fn()}
          currentUser={mockUser}
          allRecipes={mockRecipes}
          allUsers={[]}
        />
      );

      // Click on the recipe link
      const recipeLink = screen.getByText(/🔗 Pasta Sauce/i);
      fireEvent.click(recipeLink);

      // The component should now show the linked recipe
      // We need to wait for the state update and check the new title
      expect(screen.getByText('Pasta Sauce')).toBeInTheDocument();
    });

    it('should not scale recipe-linked ingredients when adjusting servings', () => {
      const recipeWithLink = {
        id: '4',
        title: 'Pizza',
        portionen: 4,
        ingredients: ['RECIPE_LINK:1:Pasta Sauce', '200g cheese'],
        steps: ['assemble', 'bake'],
      };

      render(
        <RecipeDetail
          recipe={recipeWithLink}
          onBack={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          onToggleFavorite={jest.fn()}
          onCreateVersion={jest.fn()}
          currentUser={mockUser}
          allRecipes={mockRecipes}
          allUsers={[]}
        />
      );

      // The recipe link should remain unchanged
      expect(screen.getByText(/🔗 Pasta Sauce/i)).toBeInTheDocument();
      
      // Find and click the increase serving button
      const increaseButton = screen.getAllByRole('button').find(
        btn => btn.textContent.includes('+') && btn.className.includes('serving-btn')
      );
      
      if (increaseButton) {
        fireEvent.click(increaseButton);
        
        // Recipe link should still be the same (not scaled)
        expect(screen.getByText(/🔗 Pasta Sauce/i)).toBeInTheDocument();
        
        // Regular ingredient should be scaled from 200g to 250g (4 to 5 portions = 1.25x)
        expect(screen.getByText(/250 g cheese/i)).toBeInTheDocument();
      }
    });
  });

  describe('Backward Compatibility', () => {
    it('should handle recipes with regular (non-linked) ingredients correctly', () => {
      const regularRecipe = {
        id: '5',
        title: 'Simple Salad',
        portionen: 2,
        ingredients: ['lettuce', 'tomato', '100g cucumber'],
        steps: ['mix all'],
      };

      render(
        <RecipeDetail
          recipe={regularRecipe}
          onBack={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          onToggleFavorite={jest.fn()}
          onCreateVersion={jest.fn()}
          currentUser={mockUser}
          allRecipes={mockRecipes}
          allUsers={[]}
        />
      );

      // All ingredients should be shown as regular text
      expect(screen.getByText(/lettuce/i)).toBeInTheDocument();
      expect(screen.getByText(/tomato/i)).toBeInTheDocument();
      expect(screen.getByText(/100g cucumber/i)).toBeInTheDocument();
      
      // No recipe links should be present
      expect(screen.queryByText(/🔗/)).not.toBeInTheDocument();
    });
  });
});
