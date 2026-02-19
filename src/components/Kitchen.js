import React, { useState, useEffect, useMemo } from 'react';
import './Kitchen.css';
import RecipeTimeline from './RecipeTimeline';
import { getUsers } from '../utils/userManagement';
import { groupRecipesByParent, sortRecipeVersions } from '../utils/recipeVersioning';
import { getUserFavorites } from '../utils/userFavorites';

function Kitchen({ recipes, onSelectRecipe, currentUser, categoryFilter, searchTerm }) {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  
  // Load all users once on mount
  useEffect(() => {
    const loadUsers = async () => {
      const users = await getUsers();
      setAllUsers(users);
    };
    loadUsers();
  }, []);

  // Load favorite IDs when user changes or recipes change
  useEffect(() => {
    const loadFavorites = async () => {
      if (currentUser?.id) {
        const favorites = await getUserFavorites(currentUser.id);
        setFavoriteIds(favorites);
      } else {
        setFavoriteIds([]);
      }
    };
    loadFavorites();
  }, [currentUser?.id]);

  // Group recipes by parent first
  const allRecipeGroups = groupRecipesByParent(recipes);

  // Filter and sort recipe groups with memoization for performance
  const recipeGroups = useMemo(() => {
    // Filter groups based on favorites if enabled
    let filteredGroups = showFavoritesOnly
      ? allRecipeGroups.filter(group => group.allRecipes.some(r => favoriteIds.includes(r.id)))
      : allRecipeGroups;

    // Filter by search term
    if (searchTerm && searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredGroups = filteredGroups.filter(group => {
        // Search in any recipe title within the group
        return group.allRecipes.some(recipe => 
          recipe.title?.toLowerCase().includes(lowerSearchTerm)
        );
      });
    }

    // Sort groups alphabetically by the primary recipe's title
    return filteredGroups.sort((a, b) => {
      const titleA = a.primaryRecipe?.title?.toLowerCase() || '';
      const titleB = b.primaryRecipe?.title?.toLowerCase() || '';
      return titleA.localeCompare(titleB);
    });
  }, [allRecipeGroups, showFavoritesOnly, favoriteIds, searchTerm]);

  const handleRecipeClick = (recipe) => {
    // Find the group for this recipe and select the top version
    const group = recipeGroups.find(g => g.allRecipes.some(r => r.id === recipe.id));
    if (group) {
      const sortedVersions = sortRecipeVersions(group.allRecipes, currentUser?.id, (userId, recipeId) => favoriteIds.includes(recipeId), recipes);
      const topRecipe = sortedVersions[0] || group.primaryRecipe;
      onSelectRecipe(topRecipe);
    }
  };

  // Generate dynamic heading based on filters
  const getHeading = () => {
    const prefix = showFavoritesOnly ? 'Meine ' : '';
    return `${prefix}Küche`;
  };

  return (
    <div className="kitchen-container">
      <div className="kitchen-header">
        <h2>{getHeading()}</h2>
        <div className="kitchen-actions">
          <button 
            className={`favorites-filter-button ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            title={showFavoritesOnly ? 'Alle Rezepte anzeigen' : 'Nur Favoriten anzeigen'}
          >
            ★ Favoriten
          </button>
        </div>
      </div>
      
      {recipeGroups.length === 0 ? (
        <div className="empty-state">
          <p>{showFavoritesOnly ? 'Keine favorisierten Rezepte!' : 'Noch keine Rezepte!'}</p>
          <p className="empty-hint">
            {showFavoritesOnly 
              ? 'Markieren Sie Rezepte als Favoriten, um sie hier zu sehen' 
              : 'Fügen Sie Rezepte hinzu, um sie hier im Zeitstrahl zu sehen'}
          </p>
        </div>
      ) : (
        <RecipeTimeline 
          recipes={recipeGroups.map(group => {
            const sortedVersions = sortRecipeVersions(group.allRecipes, currentUser?.id, (userId, recipeId) => favoriteIds.includes(recipeId), recipes);
            return sortedVersions[0] || group.primaryRecipe;
          })}
          onSelectRecipe={handleRecipeClick}
          allUsers={allUsers}
        />
      )}
    </div>
  );
}

export default Kitchen;
