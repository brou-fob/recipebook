/**
 * Utility functions for device detection
 */

/**
 * Detects if the current device is a desktop device.
 * A desktop device is defined as:
 * - Not a touch-primary device (has a mouse/keyboard as primary input)
 * - Not a mobile or tablet user agent
 * - Has a reasonable screen width (>768px)
 * 
 * @returns {boolean} True if the device is a desktop
 */
export function isDesktopDevice() {
  // Check if running in a browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Check user agent for mobile/tablet indicators
  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i;
  
  if (mobileRegex.test(userAgent)) {
    return false;
  }

  // Check for touch as primary input method
  // Desktop devices may have touch screens, but they're not the primary input
  const isTouchPrimary = (
    'ontouchstart' in window &&
    navigator.maxTouchPoints > 0 &&
    !window.matchMedia('(pointer: fine)').matches
  );

  if (isTouchPrimary) {
    return false;
  }

  // Check screen width - tablets and mobiles typically have smaller screens
  // Using 768px as the threshold (common tablet breakpoint)
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  
  if (screenWidth < 768) {
    return false;
  }

  // All checks passed - this is a desktop device
  return true;
}
