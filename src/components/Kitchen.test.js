import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Kitchen from './Kitchen';
import * as userManagement from '../utils/userManagement';
import * as userFavorites from '../utils/userFavorites';
import * as recipeVersioning from '../utils/recipeVersioning';

// Mock the utility modules
jest.mock('../utils/userManagement');
jest.mock('../utils/userFavorites');
jest.mock('../utils/recipeVersioning');

// Mock RecipeTimeline component
jest.mock('./RecipeTimeline', () => {
  return function MockRecipeTimeline({ recipes, onSelectRecipe, allUsers }) {
    return (
      <div data-testid="recipe-timeline">
        {recipes.map((recipe) => (
          <div 
            key={recipe.id} 
            data-testid={`timeline-recipe-${recipe.id}`}
            onClick={() => onSelectRecipe(recipe)}
          >
            {recipe.title}
          </div>
        ))}
      </div>
    );
  };
});

describe('Kitchen', () => {
  const mockCurrentUser = {
    id: 'user-1',
    vorname: 'John',
    nachname: 'Doe',
    isAdmin: false
  };

  const mockRecipes = [
    {
      id: '1',
      title: 'Recipe 1',
      createdAt: { toDate: () => new Date('2024-01-15') },
      ingredients: ['ingredient1', 'ingredient2'],
      steps: ['step1', 'step2'],
      authorId: 'user-1'
    },
    {
      id: '2',
      title: 'Recipe 2',
      createdAt: { toDate: () => new Date('2024-01-20') },
      ingredients: ['ingredient1'],
      steps: ['step1'],
      authorId: 'user-2'
    }
  ];

  const mockUsers = [
    { id: 'user-1', vorname: 'John', nachname: 'Doe' },
    { id: 'user-2', vorname: 'Jane', nachname: 'Smith' }
  ];

  beforeEach(() => {
    // Setup default mocks
    userManagement.getUsers.mockResolvedValue(mockUsers);
    userFavorites.getUserFavorites.mockResolvedValue([]);
    recipeVersioning.groupRecipesByParent.mockReturnValue([
      {
        primaryRecipe: mockRecipes[0],
        allRecipes: [mockRecipes[0]],
        versionCount: 1
      },
      {
        primaryRecipe: mockRecipes[1],
        allRecipes: [mockRecipes[1]],
        versionCount: 1
      }
    ]);
    recipeVersioning.sortRecipeVersions.mockImplementation((recipes) => recipes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders kitchen page with heading', async () => {
    render(
      <Kitchen
        recipes={mockRecipes}
        onSelectRecipe={jest.fn()}
        currentUser={mockCurrentUser}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Küche')).toBeInTheDocument();
    });
  });

  test('renders timeline with recipes', async () => {
    render(
      <Kitchen
        recipes={mockRecipes}
        onSelectRecipe={jest.fn()}
        currentUser={mockCurrentUser}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('recipe-timeline')).toBeInTheDocument();
    });
  });

  test('displays favorites filter button', async () => {
    render(
      <Kitchen
        recipes={mockRecipes}
        onSelectRecipe={jest.fn()}
        currentUser={mockCurrentUser}
      />
    );

    await waitFor(() => {
      const favoritesButton = screen.getByTitle('Nur Favoriten anzeigen');
      expect(favoritesButton).toBeInTheDocument();
    });
  });

  test('toggles favorites filter', async () => {
    render(
      <Kitchen
        recipes={mockRecipes}
        onSelectRecipe={jest.fn()}
        currentUser={mockCurrentUser}
      />
    );

    await waitFor(() => {
      const favoritesButton = screen.getByTitle('Nur Favoriten anzeigen');
      expect(favoritesButton).toBeInTheDocument();
      
      // Click to activate
      fireEvent.click(favoritesButton);
      expect(favoritesButton).toHaveClass('active');
      expect(screen.getByText('Meine Küche')).toBeInTheDocument();
      
      // Click to deactivate
      fireEvent.click(favoritesButton);
      expect(favoritesButton).not.toHaveClass('active');
      expect(screen.getByText('Küche')).toBeInTheDocument();
    });
  });

  test('displays empty state when no recipes', async () => {
    recipeVersioning.groupRecipesByParent.mockReturnValue([]);
    
    render(
      <Kitchen
        recipes={[]}
        onSelectRecipe={jest.fn()}
        currentUser={mockCurrentUser}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Noch keine Rezepte!')).toBeInTheDocument();
    });
  });

  test('displays empty state when favorites filter is active and no favorites', async () => {
    userFavorites.getUserFavorites.mockResolvedValue([]);
    
    render(
      <Kitchen
        recipes={mockRecipes}
        onSelectRecipe={jest.fn()}
        currentUser={mockCurrentUser}
      />
    );

    await waitFor(() => {
      const favoritesButton = screen.getByTitle('Nur Favoriten anzeigen');
      fireEvent.click(favoritesButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Keine favorisierten Rezepte!')).toBeInTheDocument();
    });
  });

  test('calls onSelectRecipe when a recipe is clicked', async () => {
    const handleSelectRecipe = jest.fn();
    
    render(
      <Kitchen
        recipes={mockRecipes}
        onSelectRecipe={handleSelectRecipe}
        currentUser={mockCurrentUser}
      />
    );

    await waitFor(() => {
      const recipeElement = screen.getByTestId('timeline-recipe-1');
      fireEvent.click(recipeElement);
    });

    expect(handleSelectRecipe).toHaveBeenCalled();
  });

  test('filters recipes by search term', async () => {
    recipeVersioning.groupRecipesByParent.mockReturnValue([
      {
        primaryRecipe: mockRecipes[0],
        allRecipes: [mockRecipes[0]],
        versionCount: 1
      },
      {
        primaryRecipe: mockRecipes[1],
        allRecipes: [mockRecipes[1]],
        versionCount: 1
      }
    ]);

    const { rerender } = render(
      <Kitchen
        recipes={mockRecipes}
        onSelectRecipe={jest.fn()}
        currentUser={mockCurrentUser}
        searchTerm=""
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('timeline-recipe-1')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-recipe-2')).toBeInTheDocument();
    });

    // Rerender with search term
    rerender(
      <Kitchen
        recipes={mockRecipes}
        onSelectRecipe={jest.fn()}
        currentUser={mockCurrentUser}
        searchTerm="Recipe 1"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('timeline-recipe-1')).toBeInTheDocument();
      expect(screen.queryByTestId('timeline-recipe-2')).not.toBeInTheDocument();
    });
  });
});
