# Test Assets for OCR

This directory contains test images for OCR (Optical Character Recognition) testing.

## Recipe Sample Images

### recipe-sample.txt
Text content representing a German recipe (Spaghetti Carbonara). This can be used as reference for what the OCR should recognize.

### Creating Test Images

To create test images for OCR testing, you can:

1. **Use an online tool**: Create a simple recipe card in a word processor or design tool and export as PNG/JPG
2. **Take a photo**: Photograph a recipe from a cookbook (ensure you have rights to use it)
3. **Use public domain recipes**: Search for public domain or CC0-licensed recipe images

### License-Free Image Resources

For testing OCR functionality, you can use:
- Public domain cookbook images from archive.org
- Creative Commons Zero (CC0) images from Unsplash or Pexels
- Your own handwritten or typed recipes

### Example Recipe Format

The OCR parser expects recipes in this format:

```
Recipe Title

Portionen: 4
Kochdauer: 30

Zutaten

400g Ingredient 1
200g Ingredient 2
4 Ingredient 3

Zubereitung

1. Step one
2. Step two
3. Step three
```
