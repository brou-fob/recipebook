import { isDesktopDevice } from './deviceUtils';

// Mock window and navigator
const mockWindow = (props = {}) => {
  const defaults = {
    innerWidth: 1024,
    matchMedia: jest.fn(),
    ontouchstart: undefined,
  };
  
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: props.innerWidth !== undefined ? props.innerWidth : defaults.innerWidth,
  });

  if (props.ontouchstart !== undefined) {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: props.ontouchstart,
    });
  } else {
    delete window.ontouchstart;
  }

  window.matchMedia = props.matchMedia || jest.fn().mockReturnValue({ matches: true });
};

const mockNavigator = (props = {}) => {
  const defaults = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    maxTouchPoints: 0,
  };

  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    configurable: true,
    value: props.userAgent !== undefined ? props.userAgent : defaults.userAgent,
  });

  Object.defineProperty(navigator, 'maxTouchPoints', {
    writable: true,
    configurable: true,
    value: props.maxTouchPoints !== undefined ? props.maxTouchPoints : defaults.maxTouchPoints,
  });
};

describe('deviceUtils', () => {
  describe('isDesktopDevice', () => {
    beforeEach(() => {
      // Reset to default desktop configuration
      mockWindow({ innerWidth: 1024 });
      mockNavigator({ 
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        maxTouchPoints: 0 
      });
    });

    it('should return true for desktop devices', () => {
      expect(isDesktopDevice()).toBe(true);
    });

    it('should return false for mobile user agents (iPhone)', () => {
      mockNavigator({ 
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        maxTouchPoints: 5
      });
      expect(isDesktopDevice()).toBe(false);
    });

    it('should return false for mobile user agents (Android)', () => {
      mockNavigator({ 
        userAgent: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
        maxTouchPoints: 5
      });
      expect(isDesktopDevice()).toBe(false);
    });

    it('should return false for tablet user agents (iPad)', () => {
      mockNavigator({ 
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        maxTouchPoints: 5
      });
      expect(isDesktopDevice()).toBe(false);
    });

    it('should return false for small screen widths', () => {
      mockWindow({ innerWidth: 500 });
      expect(isDesktopDevice()).toBe(false);
    });

    it('should return false for screen width below tablet threshold', () => {
      mockWindow({ innerWidth: 767 });
      expect(isDesktopDevice()).toBe(false);
    });

    it('should return true for screen width at or above tablet threshold', () => {
      mockWindow({ innerWidth: 768 });
      expect(isDesktopDevice()).toBe(true);
    });

    it('should return false when touch is the primary input method', () => {
      mockWindow({ 
        innerWidth: 1024,
        ontouchstart: {},
        matchMedia: jest.fn().mockReturnValue({ matches: false }) // coarse pointer
      });
      mockNavigator({ maxTouchPoints: 5 });
      expect(isDesktopDevice()).toBe(false);
    });

    it('should return true for desktop with touch screen but fine pointer', () => {
      mockWindow({ 
        innerWidth: 1024,
        ontouchstart: {},
        matchMedia: jest.fn().mockReturnValue({ matches: true }) // fine pointer (mouse)
      });
      mockNavigator({ maxTouchPoints: 10 }); // touchscreen present
      expect(isDesktopDevice()).toBe(true);
    });

    it('should handle missing matchMedia gracefully', () => {
      mockWindow({ 
        innerWidth: 1024,
        matchMedia: undefined
      });
      // Should still work without matchMedia
      expect(isDesktopDevice()).toBe(true);
    });
  });
});
