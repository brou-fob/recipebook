import React from 'react';
import './RecipeDetail.css';

function RecipeDetail({ recipe, onBack, onEdit, onDelete }) {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
      onDelete(recipe.id);
    }
  };

  return (
    <div className="recipe-detail-container">
      <div className="recipe-detail-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="action-buttons">
          <button className="edit-button" onClick={() => onEdit(recipe)}>
            ✏️ Edit
          </button>
          <button className="delete-button" onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="recipe-detail-content">
        {recipe.image && (
          <div className="recipe-detail-image">
            <img src={recipe.image} alt={recipe.title} />
          </div>
        )}

        <h1 className="recipe-title">{recipe.title}</h1>

        <section className="recipe-section">
          <h2>🥘 Ingredients ({recipe.ingredients?.length || 0})</h2>
          <ul className="ingredients-list">
            {recipe.ingredients?.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            )) || <li>No ingredients listed</li>}
          </ul>
        </section>

        <section className="recipe-section">
          <h2>📝 Preparation Steps</h2>
          <ol className="steps-list">
            {recipe.steps?.map((step, index) => (
              <li key={index}>{step}</li>
            )) || <li>No preparation steps listed</li>}
          </ol>
        </section>
      </div>
    </div>
  );
}

export default RecipeDetail;
