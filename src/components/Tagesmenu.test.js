import React from 'react';
import { render, act } from '@testing-library/react';
import Tagesmenu from './Tagesmenu';

jest.mock('../utils/recipeSwipeFlags', () => ({
  setRecipeSwipeFlag: jest.fn(),
}));

beforeAll(() => {
  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = jest.fn();
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = jest.fn();
  }
});

const makeRecipe = (id, title) => ({ id, title, groupId: 'list1' });

const list = { id: 'list1', name: 'Test Liste', listKind: 'interactive', recipeIds: [] };
const currentUser = { id: 'user1' };

const recipes = [
  makeRecipe('r1', 'Rezept 1'),
  makeRecipe('r2', 'Rezept 2'),
  makeRecipe('r3', 'Rezept 3'),
];

function renderMenu(recipeList = recipes) {
  return render(
    <Tagesmenu
      interactiveLists={[list]}
      recipes={recipeList}
      allUsers={[]}
      onSelectRecipe={() => {}}
      currentUser={currentUser}
    />
  );
}

/**
 * Retrieve a React component's event props directly from the DOM node.
 * JSDOM's PointerEvent does not support clientX, so we bypass fireEvent
 * and call the handlers directly with plain mock event objects.
 */
function getReactProps(element) {
  const key = Object.keys(element).find((k) => k.startsWith('__reactProps$'));
  return key ? element[key] : null;
}

/** Simulate a full left-swipe gesture by calling the handlers directly. */
function swipeLeft(element) {
  const props = getReactProps(element);
  if (!props) throw new Error('No React props found on element');
  act(() => {
    props.onPointerDown({ clientX: 200, clientY: 300, pointerId: 1, currentTarget: element });
  });
  act(() => {
    // Move far enough to exceed DIRECTION_THRESHOLD (5 px) and SWIPE_THRESHOLD (50 px)
    props.onPointerMove({ clientX: 100, clientY: 300, pointerId: 1, currentTarget: element });
  });
  act(() => {
    props.onPointerUp({ clientX: 100, clientY: 300, pointerId: 1, currentTarget: element });
  });
}

describe('Tagesmenu – swipe card consistency', () => {
  test('initial render shows the first recipe as the top card', () => {
    renderMenu();

    const topCard = document.querySelector('.tagesmenu-card-top');
    expect(topCard).not.toBeNull();
    expect(topCard).toHaveTextContent('Rezept 1');

    // Second and third cards are also rendered in the stack
    const allCards = document.querySelectorAll('.tagesmenu-card');
    expect(allCards).toHaveLength(3);
  });

  test('after swiping, the card that was second becomes the new top card', () => {
    renderMenu();

    const topCard = document.querySelector('.tagesmenu-card-top');
    swipeLeft(topCard);

    // Trigger the CSS transition-end callback that advances the card index
    act(() => {
      const props = getReactProps(topCard);
      props.onTransitionEnd?.();
    });

    // Rezept 2 was behind Rezept 1 and must now be the top card
    expect(document.querySelector('.tagesmenu-card-top')).toHaveTextContent('Rezept 2');
  });

  test('background card transitions are suppressed immediately after a swipe (justSwiped)', () => {
    jest.useFakeTimers();
    try {
      renderMenu();

      const topCard = document.querySelector('.tagesmenu-card-top');
      swipeLeft(topCard);

      act(() => {
        const props = getReactProps(topCard);
        props.onTransitionEnd?.();
      });

      // Right after the swipe (before the RAF fires) background cards must have
      // transition: none so they do NOT animate back to their smaller stacked sizes.
      const backgroundCards = Array.from(
        document.querySelectorAll('.tagesmenu-card')
      ).filter((c) => !c.classList.contains('tagesmenu-card-top'));

      backgroundCards.forEach((card) => {
        expect(card.style.transition).toBe('none');
      });

      // After the requestAnimationFrame fires, transitions are restored
      act(() => { jest.runAllTimers(); });

      backgroundCards.forEach((card) => {
        expect(card.style.transition).toBe('transform 0.3s ease');
      });
    } finally {
      jest.useRealTimers();
    }
  });
});
