import React, { useState, useEffect } from 'react';
import './RecipeForm.css';

function RecipeForm({ recipe, onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title || '');
      setImage(recipe.image || '');
      setIngredients(recipe.ingredients?.length > 0 ? recipe.ingredients : ['']);
      setSteps(recipe.steps?.length > 0 ? recipe.steps : ['']);
    }
  }, [recipe]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleRemoveIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleRemoveStep = (index) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a recipe title');
      return;
    }

    const recipeData = {
      id: recipe?.id,
      title: title.trim(),
      image: image.trim(),
      ingredients: ingredients.filter(i => i.trim() !== ''),
      steps: steps.filter(s => s.trim() !== '')
    };

    onSave(recipeData);
  };

  return (
    <div className="recipe-form-container">
      <div className="recipe-form-header">
        <h2>{recipe ? 'Edit Recipe' : 'Add New Recipe'}</h2>
      </div>

      <form className="recipe-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Recipe Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Spaghetti Carbonara"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL (optional)</label>
          <input
            type="url"
            id="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          {image && (
            <div className="image-preview">
              <img src={image} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>🥘 Ingredients</h3>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="form-list-item">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => handleRemoveIngredient(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-item-button" onClick={handleAddIngredient}>
            + Add Ingredient
          </button>
        </div>

        <div className="form-section">
          <h3>📝 Preparation Steps</h3>
          {steps.map((step, index) => (
            <div key={index} className="form-list-item">
              <span className="step-number">{index + 1}.</span>
              <textarea
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                rows="2"
              />
              {steps.length > 1 && (
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => handleRemoveStep(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-item-button" onClick={handleAddStep}>
            + Add Step
          </button>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="save-button">
            {recipe ? 'Update Recipe' : 'Save Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecipeForm;
