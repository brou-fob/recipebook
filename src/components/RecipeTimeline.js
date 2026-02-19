import React, { useMemo } from 'react';
import './RecipeTimeline.css';

function RecipeTimeline({ recipes, onSelectRecipe, allUsers = [] }) {
  // Sort recipes by createdAt in reverse chronological order (newest first)
  const sortedRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return dateB - dateA; // Reverse chronological order
    });
  }, [recipes]);

  // Helper function to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unbekannt';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unbekannt';
    }
  };

  // Helper function to get author name
  const getAuthorName = (authorId) => {
    if (!authorId) return null;
    const author = allUsers.find(u => u.id === authorId);
    if (!author) return null;
    return `${author.vorname} ${author.nachname}`;
  };

  return (
    <div className="recipe-timeline-container">
      <div className="timeline-line"></div>
      {sortedRecipes.map((recipe, index) => (
        <div
          key={recipe.id}
          className="timeline-item"
          onClick={() => onSelectRecipe(recipe)}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            <div className="timeline-date">{formatDate(recipe.createdAt)}</div>
            <div className="timeline-card">
              {recipe.image && (
                <div className="timeline-image">
                  <img src={recipe.image} alt={recipe.title} />
                </div>
              )}
              <div className="timeline-info">
                <h3 className="timeline-title">{recipe.title}</h3>
                <div className="timeline-meta">
                  <span>{recipe.ingredients?.length || 0} Zutaten</span>
                  <span>{recipe.steps?.length || 0} Schritte</span>
                </div>
                {getAuthorName(recipe.authorId) && (
                  <div className="timeline-author">{getAuthorName(recipe.authorId)}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      {sortedRecipes.length === 0 && (
        <div className="timeline-empty">
          <p>Keine Rezepte vorhanden</p>
        </div>
      )}
    </div>
  );
}

export default RecipeTimeline;
