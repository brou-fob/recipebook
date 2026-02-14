/**
 * Update the browser's favicon
 * @param {string|null} imageBase64 - Base64 encoded image or null to use default
 */
export function updateFavicon(imageBase64) {
  // Find or create the favicon link element
  let link = document.querySelector("link[rel*='icon']");
  
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  
  if (imageBase64) {
    link.href = imageBase64;
  } else {
    // Reset to default favicon
    link.href = `${process.env.PUBLIC_URL}/favicon.ico`;
  }
}

/**
 * Update the page title with the favicon text
 * @param {string} text - Text to display in the title
 */
export function updatePageTitle(text) {
  if (text) {
    document.title = `${text} - Unsere Besten`;
  } else {
    document.title = 'DishBook - Unsere Besten';
  }
}

/**
 * Apply favicon settings from localStorage
 */
export function applyFaviconSettings() {
  const faviconImage = localStorage.getItem('faviconImage');
  const faviconText = localStorage.getItem('faviconText');
  
  if (faviconImage) {
    updateFavicon(faviconImage);
  }
  
  if (faviconText) {
    updatePageTitle(faviconText);
  }
}
