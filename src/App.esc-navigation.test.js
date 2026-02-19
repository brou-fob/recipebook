import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import * as deviceUtils from './utils/deviceUtils';

// Simple mock component to test ESC key behavior
const TestComponent = ({ onEscape, isDesktop = true }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!isDesktop) return;

    const handleEscapeKey = (event) => {
      if (event.key !== 'Escape') return;

      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      )) {
        return;
      }

      event.preventDefault();
      onEscape();
      setCount(prev => prev + 1);
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [onEscape, isDesktop]);

  return (
    <div>
      <div data-testid="count">{count}</div>
      <input data-testid="input" type="text" />
    </div>
  );
};

describe('ESC key navigation behavior', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Desktop device behavior', () => {
    beforeEach(() => {
      jest.spyOn(deviceUtils, 'isDesktopDevice').mockReturnValue(true);
    });

    test('ESC key triggers callback on desktop', async () => {
      const mockCallback = jest.fn();
      render(<TestComponent onEscape={mockCallback} isDesktop={true} />);
      
      // Press ESC key
      fireEvent.keyDown(window, { key: 'Escape' });
      
      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledTimes(1);
      });
    });

    test('ESC key does not trigger when focused on input field', async () => {
      const mockCallback = jest.fn();
      const { getByTestId } = render(<TestComponent onEscape={mockCallback} isDesktop={true} />);
      
      const input = getByTestId('input');
      input.focus();
      
      // Press ESC key while focused on input
      fireEvent.keyDown(input, { key: 'Escape' });
      
      // Wait a bit to ensure callback wasn't called
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('ESC key works when not focused on input', async () => {
      const mockCallback = jest.fn();
      const { getByTestId } = render(<TestComponent onEscape={mockCallback} isDesktop={true} />);
      
      const input = getByTestId('input');
      input.focus();
      input.blur(); // Blur the input
      
      // Press ESC key
      fireEvent.keyDown(window, { key: 'Escape' });
      
      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledTimes(1);
      });
    });

    test('other keys do not trigger callback', async () => {
      const mockCallback = jest.fn();
      render(<TestComponent onEscape={mockCallback} isDesktop={true} />);
      
      // Press other keys
      fireEvent.keyDown(window, { key: 'Enter' });
      fireEvent.keyDown(window, { key: 'a' });
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Mobile device behavior', () => {
    beforeEach(() => {
      jest.spyOn(deviceUtils, 'isDesktopDevice').mockReturnValue(false);
    });

    test('ESC key does not trigger callback on mobile', async () => {
      const mockCallback = jest.fn();
      render(<TestComponent onEscape={mockCallback} isDesktop={false} />);
      
      // Press ESC key
      fireEvent.keyDown(window, { key: 'Escape' });
      
      // Wait a bit to ensure callback wasn't called
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Device detection integration', () => {
    test('isDesktopDevice determines ESC key behavior', async () => {
      const mockCallback = jest.fn();
      
      // Start with desktop
      jest.spyOn(deviceUtils, 'isDesktopDevice').mockReturnValue(true);
      const { rerender } = render(<TestComponent onEscape={mockCallback} isDesktop={deviceUtils.isDesktopDevice()} />);
      
      fireEvent.keyDown(window, { key: 'Escape' });
      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledTimes(1);
      });
      
      // Switch to mobile
      jest.spyOn(deviceUtils, 'isDesktopDevice').mockReturnValue(false);
      rerender(<TestComponent onEscape={mockCallback} isDesktop={deviceUtils.isDesktopDevice()} />);
      
      fireEvent.keyDown(window, { key: 'Escape' });
      
      // Wait a bit - should still be 1 call (not 2)
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });
});

