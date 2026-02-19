import React from 'react';
import { render, screen } from '@testing-library/react';
import MenuList from './MenuList';
import * as menuFavorites from '../utils/menuFavorites';

// Mock getUserMenuFavorites to avoid async Firestore calls
jest.mock('../utils/menuFavorites', () => ({
  getUserMenuFavorites: jest.fn()
}));

beforeEach(() => {
  menuFavorites.getUserMenuFavorites.mockResolvedValue([]);
});

const currentUser = { id: 'user1' };

const makeMenu = (id, name, menuDate) => ({
  id,
  name,
  menuDate,
  recipeIds: [],
  isPrivate: false,
  authorId: 'user1'
});

describe('MenuList - date sorting', () => {
  test('renders menus sorted by date descending (newest first)', async () => {
    const menus = [
      makeMenu('1', 'Altes Menü', '2023-01-01'),
      makeMenu('2', 'Neues Menü', '2024-06-15'),
      makeMenu('3', 'Mittleres Menü', '2023-09-10'),
    ];

    render(
      <MenuList
        menus={menus}
        recipes={[]}
        onSelectMenu={() => {}}
        onAddMenu={() => {}}
        onToggleMenuFavorite={() => {}}
        currentUser={currentUser}
        allUsers={[]}
      />
    );

    const cards = await screen.findAllByRole('heading', { level: 3 });
    const names = cards.map(h => h.textContent);

    expect(names[0]).toBe('Neues Menü');
    expect(names[1]).toBe('Mittleres Menü');
    expect(names[2]).toBe('Altes Menü');
  });

  test('renders menus with createdAt fallback sorted descending', async () => {
    const menus = [
      { id: '1', name: 'Frühes Menü', recipeIds: [], isPrivate: false, authorId: 'user1', createdAt: new Date('2022-03-01') },
      { id: '2', name: 'Spätes Menü', recipeIds: [], isPrivate: false, authorId: 'user1', createdAt: new Date('2025-11-20') },
    ];

    render(
      <MenuList
        menus={menus}
        recipes={[]}
        onSelectMenu={() => {}}
        onAddMenu={() => {}}
        onToggleMenuFavorite={() => {}}
        currentUser={currentUser}
        allUsers={[]}
      />
    );

    const cards = await screen.findAllByRole('heading', { level: 3 });
    const names = cards.map(h => h.textContent);

    expect(names[0]).toBe('Spätes Menü');
    expect(names[1]).toBe('Frühes Menü');
  });

  test('menuDate takes precedence over createdAt for sorting', async () => {
    const menus = [
      {
        id: '1',
        name: 'Menü A',
        menuDate: '2020-01-01',
        recipeIds: [],
        isPrivate: false,
        authorId: 'user1',
        createdAt: new Date('2025-01-01') // newer createdAt but older menuDate
      },
      {
        id: '2',
        name: 'Menü B',
        menuDate: '2024-01-01',
        recipeIds: [],
        isPrivate: false,
        authorId: 'user1',
        createdAt: new Date('2019-01-01')
      },
    ];

    render(
      <MenuList
        menus={menus}
        recipes={[]}
        onSelectMenu={() => {}}
        onAddMenu={() => {}}
        onToggleMenuFavorite={() => {}}
        currentUser={currentUser}
        allUsers={[]}
      />
    );

    const cards = await screen.findAllByRole('heading', { level: 3 });
    const names = cards.map(h => h.textContent);

    expect(names[0]).toBe('Menü B'); // menuDate 2024 > menuDate 2020
    expect(names[1]).toBe('Menü A');
  });
});
