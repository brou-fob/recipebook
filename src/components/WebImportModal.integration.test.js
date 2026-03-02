import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecipeForm from './RecipeForm';

// Mock all utility modules
jest.mock('../utils/emojiUtils', () => ({
  removeEmojis: (text) => text,
  containsEmojis: () => false,
}));

jest.mock('../utils/imageUtils', () => ({
  fileToBase64: jest.fn(),
  isBase64Image: jest.fn(() => false),
}));

jest.mock('../utils/customLists', () => ({
  getCustomLists: () => Promise.resolve({
    cuisineTypes: ['Italian', 'Thai', 'Chinese'],
    mealCategories: ['Appetizer', 'Main Course', 'Dessert'],
    units: [],
    portionUnits: [
      { id: 'portion', singular: 'Portion', plural: 'Portionen' }
    ]
  }),
  getButtonIcons: () => Promise.resolve({
    cookingMode: '👨‍🍳',
    importRecipe: '📥',
    scanImage: '📷',
    webImport: '🌐'
  }),
}));

jest.mock('../utils/userManagement', () => ({
  getUsers: () => Promise.resolve([
    { id: 'admin-1', vorname: 'Admin', nachname: 'User', email: 'admin@example.com', isAdmin: true, role: 'admin' },
  ]),
  isCurrentUserAdmin: jest.fn(() => false),
  getUserAiOcrScanCount: jest.fn(() => Promise.resolve(0)),
  ROLES: {
    ADMIN: 'admin',
    EDIT: 'edit',
    COMMENT: 'comment',
    READ: 'read',
    GUEST: 'guest'
  }
}));

jest.mock('../utils/categoryImages', () => ({
  getImageForCategories: jest.fn(),
}));

jest.mock('../utils/ingredientUtils', () => ({
  formatIngredients: (ingredients) => ingredients,
  formatIngredientSpacing: (text) => text,
}));

jest.mock('../utils/storageUtils', () => ({
  uploadRecipeImage: jest.fn(),
  deleteRecipeImage: jest.fn(),
}));

jest.mock('../utils/recipeLinks', () => ({
  encodeRecipeLink: jest.fn((id, title) => `#${id}-${title}`),
  startsWithHash: (text) => text.startsWith('#'),
}));

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }) => <div>{children}</div>,
  closestCenter: jest.fn(),
  PointerSensor: jest.fn(),
  TouchSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => <div>{children}</div>,
  arrayMove: jest.fn((array, oldIndex, newIndex) => {
    const newArray = [...array];
    const [item] = newArray.splice(oldIndex, 1);
    newArray.splice(newIndex, 0, item);
    return newArray;
  }),
  sortableKeyboardCoordinates: jest.fn(),
  verticalListSortingStrategy: jest.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: jest.fn(() => '') } },
}));

// Mock WebImportModal component
jest.mock('./WebImportModal', () => {
  return function MockWebImportModal({ onImport, onCancel, initialUrl }) {
    return (
      <div data-testid="web-import-modal">
        <h2>Rezept von Website importieren</h2>
        {initialUrl && <span data-testid="initial-url">{initialUrl}</span>}
        <button
          onClick={() => {
            // Simulate the import with test data
            onImport({
              title: 'Test Web Recipe',
              ingredients: ['100g flour', '2 eggs'],
              steps: ['Mix ingredients', 'Bake at 180°C'],
              portionen: 4,
              kochdauer: 30,
              kulinarik: ['Italian'],
              schwierigkeit: 3,
              speisekategorie: ['Main Course'],
            });
          }}
        >
          Übernehmen
        </button>
        <button onClick={onCancel}>Abbrechen</button>
      </div>
    );
  };
});

describe('WebImportModal Integration - Dialog Close on Apply', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('WebImportModal closes when "Übernehmen" button is clicked', async () => {
    const userWithWebImport = {
      id: 'admin-1',
      vorname: 'Admin',
      nachname: 'User',
      email: 'admin@example.com',
      isAdmin: true,
      role: 'admin',
      webimport: true, // Enable webimport feature
    };

    render(
      <RecipeForm
        recipe={null}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        currentUser={userWithWebImport}
      />
    );

    // Wait for the component to fully render
    await waitFor(() => {
      expect(screen.getByLabelText('Rezepttitel *')).toBeInTheDocument();
    });

    // Click the web import button to open the modal
    const webImportButton = screen.getByTitle('Rezept von Website importieren');
    fireEvent.click(webImportButton);

    // Verify modal is opened
    await waitFor(() => {
      expect(screen.getByTestId('web-import-modal')).toBeInTheDocument();
    });

    // Click the "Übernehmen" button in the modal
    const uebernehmenButton = screen.getByText('Übernehmen');
    fireEvent.click(uebernehmenButton);

    // Verify the modal is closed (should not be in the document anymore)
    await waitFor(() => {
      expect(screen.queryByTestId('web-import-modal')).not.toBeInTheDocument();
    });

    // Verify the form was populated with the imported data
    expect(screen.getByDisplayValue('Test Web Recipe')).toBeInTheDocument();
  });

  test('WebImportModal closes when "Abbrechen" button is clicked', async () => {
    const userWithWebImport = {
      id: 'admin-1',
      vorname: 'Admin',
      nachname: 'User',
      email: 'admin@example.com',
      isAdmin: true,
      role: 'admin',
      webimport: true,
    };

    render(
      <RecipeForm
        recipe={null}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        currentUser={userWithWebImport}
      />
    );

    // Wait for the component to fully render
    await waitFor(() => {
      expect(screen.getByLabelText('Rezepttitel *')).toBeInTheDocument();
    });

    // Click the web import button to open the modal
    const webImportButton = screen.getByTitle('Rezept von Website importieren');
    fireEvent.click(webImportButton);

    // Verify modal is opened
    await waitFor(() => {
      expect(screen.getByTestId('web-import-modal')).toBeInTheDocument();
    });

    // Click the "Abbrechen" button in the modal (there are multiple buttons with this text)
    const modal = screen.getByTestId('web-import-modal');
    const abbrechenButton = modal.querySelector('button:last-child');
    fireEvent.click(abbrechenButton);

    // Verify the modal is closed
    await waitFor(() => {
      expect(screen.queryByTestId('web-import-modal')).not.toBeInTheDocument();
    });
  });
});

describe('WebImportModal Integration - initialWebImportUrl deeplink', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  const userWithWebImport = {
    id: 'admin-1',
    vorname: 'Admin',
    nachname: 'User',
    email: 'admin@example.com',
    isAdmin: true,
    role: 'admin',
    webimport: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('WebImportModal opens automatically when initialWebImportUrl is provided', async () => {
    render(
      <RecipeForm
        recipe={null}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        currentUser={userWithWebImport}
        initialWebImportUrl="https://www.chefkoch.de/rezepte/123"
      />
    );

    // The modal should be opened automatically
    await waitFor(() => {
      expect(screen.getByTestId('web-import-modal')).toBeInTheDocument();
    });
  });

  test('WebImportModal receives initialUrl prop when opened via initialWebImportUrl', async () => {
    const testUrl = 'https://www.chefkoch.de/rezepte/123';

    render(
      <RecipeForm
        recipe={null}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        currentUser={userWithWebImport}
        initialWebImportUrl={testUrl}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('web-import-modal')).toBeInTheDocument();
    });

    // The initialUrl should be passed through to the modal
    expect(screen.getByTestId('initial-url')).toHaveTextContent(testUrl);
  });

  test('WebImportModal does not open automatically when recipe is being edited', async () => {
    const existingRecipe = { id: 'recipe-1', title: 'Existing Recipe' };

    render(
      <RecipeForm
        recipe={existingRecipe}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        currentUser={userWithWebImport}
        initialWebImportUrl="https://www.chefkoch.de/rezepte/123"
      />
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByLabelText('Rezepttitel *')).toBeInTheDocument();
    });

    // Modal should NOT be opened when editing an existing recipe
    expect(screen.queryByTestId('web-import-modal')).not.toBeInTheDocument();
  });

  test('WebImportModal does not open automatically when initialWebImportUrl is empty', async () => {
    render(
      <RecipeForm
        recipe={null}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        currentUser={userWithWebImport}
        initialWebImportUrl=""
      />
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByLabelText('Rezepttitel *')).toBeInTheDocument();
    });

    // Modal should NOT be opened when no URL is provided
    expect(screen.queryByTestId('web-import-modal')).not.toBeInTheDocument();
  });
});
