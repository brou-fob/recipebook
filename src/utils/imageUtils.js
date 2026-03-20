/**
 * Convert a file to base64 string
 * @param {File} file - The image file to convert
 * @returns {Promise<string>} - Base64 encoded string
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      reject(new Error('Image file size must be less than 5MB'));
      return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      reject(new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Check if a string is a base64 data URL
 * @param {string} imageStr - The image string to check
 * @returns {boolean} - True if it's a base64 data URL
 */
export function isBase64Image(imageStr) {
  return imageStr && imageStr.startsWith('data:image/');
}

/**
 * Validate if a string is a valid image URL or base64 data
 * @param {string} imageStr - The image URL or base64 string
 * @returns {boolean} - True if valid
 */
export function isValidImageSource(imageStr) {
  if (!imageStr) return false;
  
  // Check if it's a base64 data URL
  if (isBase64Image(imageStr)) {
    return true;
  }
  
  // Check if it's a valid URL
  try {
    new URL(imageStr);
    return true;
  } catch {
    return false;
  }
}

/**
 * Compress an image using canvas
 * @param {string} base64 - Base64 encoded image string
 * @param {number} maxWidth - Maximum width (default: 800)
 * @param {number} maxHeight - Maximum height (default: 600)
 * @param {number} quality - JPEG quality 0-1 (default: 0.7)
 * @param {boolean} preserveTransparency - If true, outputs PNG to preserve transparency (default: false)
 * @returns {Promise<string>} - Compressed base64 image
 */
export function compressImage(base64, maxWidth = 800, maxHeight = 600, quality = 0.7, preserveTransparency = false) {
  return new Promise((resolve, reject) => {
    if (!base64 || !isBase64Image(base64)) {
      reject(new Error('Invalid base64 image'));
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          // Determine which dimension is the constraint
          if (width / maxWidth > height / maxHeight) {
            // Width is the limiting factor
            width = maxWidth;
            height = Math.round(width / aspectRatio);
          } else {
            // Height is the limiting factor
            height = maxHeight;
            width = Math.round(height * aspectRatio);
          }
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Determine output format based on transparency preservation
        let compressedBase64;
        // Note: PNG inputs automatically preserve transparency regardless of preserveTransparency parameter
        // to avoid accidental quality loss. Set preserveTransparency=true to force PNG output for any input.
        if (preserveTransparency || base64.startsWith('data:image/png')) {
          // Use PNG to preserve transparency
          compressedBase64 = canvas.toDataURL('image/png');
        } else {
          // Convert to JPEG with specified quality
          compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        }
        
        resolve(compressedBase64);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = base64;
  });
}

/**
 * Analyze the brightness of the top-left and top-right corners of an image.
 * Returns a single `isBright` flag that is true when either corner exceeds the
 * brightness threshold (luminance > 180).  This result can be stored as
 * metadata alongside the image so that repeated analysis at display time is
 * unnecessary.
 *
 * @param {string} imageSrc - A base64 data-URL or any image URL accessible to
 *   the browser.  For non-base64 URLs the Image is loaded with
 *   `crossOrigin = "anonymous"`.
 * @returns {Promise<{ isBright: boolean }>}
 */
export function analyzeImageBrightness(imageSrc) {
  return new Promise((resolve) => {
    if (!imageSrc) {
      resolve({ isBright: false });
      return;
    }

    const img = new Image();
    if (!isBase64Image(imageSrc)) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        const CANVAS_SIZE = 100;
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

        const sampleSize = Math.max(1, Math.floor(CANVAS_SIZE * 0.2));
        const BRIGHTNESS_THRESHOLD = 180;

        // Top-left corner
        const leftData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
        let leftBrightness = 0;
        for (let i = 0; i < leftData.length; i += 4) {
          leftBrightness += leftData[i] * 0.299 + leftData[i + 1] * 0.587 + leftData[i + 2] * 0.114;
        }
        leftBrightness /= leftData.length / 4;

        // Top-right corner
        const rightData = ctx.getImageData(CANVAS_SIZE - sampleSize, 0, sampleSize, sampleSize).data;
        let rightBrightness = 0;
        for (let i = 0; i < rightData.length; i += 4) {
          rightBrightness += rightData[i] * 0.299 + rightData[i + 1] * 0.587 + rightData[i + 2] * 0.114;
        }
        rightBrightness /= rightData.length / 4;

        resolve({ isBright: leftBrightness > BRIGHTNESS_THRESHOLD || rightBrightness > BRIGHTNESS_THRESHOLD });
      } catch (_e) {
        // Canvas is tainted (CORS) or another error – fall back to not-bright
        resolve({ isBright: false });
      }
    };

    img.onerror = () => resolve({ isBright: false });
    img.src = imageSrc;
  });
}

/**
 * Resize an image to a specific size (for PWA icons)
 * @param {string} base64 - Base64 encoded image string
 * @param {number} size - Target size in pixels (width and height)
 * @returns {Promise<string>} - Resized base64 PNG image
 */
export function resizeImageToSize(base64, size) {
  return new Promise((resolve, reject) => {
    if (!base64 || !isBase64Image(base64)) {
      reject(new Error('Invalid base64 image'));
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      try {
        // Create canvas with exact size
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        
        // Draw image centered and scaled to fit
        const scale = Math.min(size / img.width, size / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (size - scaledWidth) / 2;
        const y = (size - scaledHeight) / 2;
        
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Output as PNG to preserve transparency
        const resizedBase64 = canvas.toDataURL('image/png');
        resolve(resizedBase64);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = base64;
  });
}
