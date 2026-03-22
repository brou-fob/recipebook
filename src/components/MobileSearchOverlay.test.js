import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MobileSearchOverlay from './MobileSearchOverlay';

jest.mock('../utils/userFavorites', () => ({
  getUserFavorites: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../utils/customLists', () => ({
  expandCuisineSelection: jest.fn((selected) => selected),
}));

const mockRecipes = [
  { id: '1', title: 'Sushi', kulinarik: ['Japanische Küche'] },
  { id: '2', title: 'Pad Thai', kulinarik: ['Thailändische Küche'] },
  { id: '3', title: 'Pizza', kulinarik: ['Italienische Küche'] },
];

const mockCuisineTypes = ['Japanische Küche', 'Thailändische Küche', 'Italienische Küche'];

const mockCuisineGroups = [
  { name: 'Asiatische Küche', children: ['Japanische Küche', 'Thailändische Küche'] },
  { name: 'Europäische Küche', children: ['Italienische Küche'] },
];

function renderOverlay(props = {}) {
  return render(
    <MobileSearchOverlay
      isOpen={true}
      onClose={jest.fn()}
      recipes={mockRecipes}
      onSelectRecipe={jest.fn()}
      onSearch={jest.fn()}
      currentUser={null}
      cuisineTypes={mockCuisineTypes}
      cuisineGroups={mockCuisineGroups}
      onCuisineFilterChange={jest.fn()}
      {...props}
    />
  );
}

describe('MobileSearchOverlay – cuisine group children in search', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('shows cuisine group pills when search matches group name', async () => {
    renderOverlay();
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'Asia' } });

    await waitFor(() => {
      expect(screen.getByText('Asiatische Küche')).toBeInTheDocument();
    });
  });

  test('also shows child cuisine types when parent group matches the search', async () => {
    renderOverlay();
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'Asia' } });

    await waitFor(() => {
      expect(screen.getByText('Asiatische Küche')).toBeInTheDocument();
      expect(screen.getByText('Japanische Küche')).toBeInTheDocument();
      expect(screen.getByText('Thailändische Küche')).toBeInTheDocument();
    });
  });

  test('does not show unrelated group children when another group matches', async () => {
    renderOverlay();
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'Asia' } });

    await waitFor(() => {
      expect(screen.queryByText('Europäische Küche')).not.toBeInTheDocument();
      expect(screen.queryByText('Italienische Küche')).not.toBeInTheDocument();
    });
  });

  test('shows all group pills without filtering when search term is empty', () => {
    renderOverlay();
    // With no search term, all group names should be visible
    expect(screen.getByText('Asiatische Küche')).toBeInTheDocument();
    expect(screen.getByText('Europäische Küche')).toBeInTheDocument();
  });
});
