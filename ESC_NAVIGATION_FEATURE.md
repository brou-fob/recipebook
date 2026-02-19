# ESC Key Navigation Feature

## Overview
This feature enables desktop users to navigate back using the ESC key, improving the ergonomics and navigation experience.

## Feature Description
- **Platform**: Desktop browsers only (not mobile/tablet)
- **Functionality**: Press ESC key to navigate back or close current view
- **Trigger**: Only works when not typing in input fields

## Device Detection
The feature automatically detects if the user is on a desktop device using multiple criteria:
- User agent (excludes mobile/tablet browsers)
- Touch capability (excludes touch-primary devices)
- Screen width (minimum 768px)
- Pointer precision (fine pointer = mouse/trackpad)

## Navigation Priority
When ESC is pressed, the following views are closed in priority order:

1. **Settings** → Closes settings and returns to previous view
2. **Recipe Detail** → Returns to recipe list or menu detail
3. **Recipe Form** → Cancels form and returns to recipe list
4. **Menu Form** → Cancels form and returns to menu list
5. **Menu Detail** → Returns to menu list

## Smart Input Detection
The ESC key will NOT trigger navigation when:
- User is typing in an input field
- User is typing in a textarea
- User is editing contentEditable elements

This prevents accidental navigation while the user is entering data.

## Testing
The feature includes comprehensive tests:
- `deviceUtils.test.js` - 10 tests for device detection
- `App.esc-navigation.test.js` - 6 tests for ESC key behavior

All tests pass successfully.

## Technical Implementation
- **File**: `src/utils/deviceUtils.js` - Device detection utility
- **File**: `src/App.js` - ESC key event handler (lines 425-496)
- **Dependencies**: None (uses standard browser APIs)

## Browser Compatibility
Works in all modern browsers that support:
- `window.matchMedia()` for media queries
- `navigator.userAgent` for device detection
- `addEventListener('keydown')` for keyboard events
