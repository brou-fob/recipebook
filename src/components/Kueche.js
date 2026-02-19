import React, { useState, useEffect } from 'react';
import './Kueche.css';
import RecipeTimeline from './RecipeTimeline';
import { getTimelineBubbleIcon, getTimelineMenuBubbleIcon, getTimelineRecipeDefaultImage, getTimelineMenuDefaultImage } from '../utils/customLists';

function Kueche({ recipes, menus = [], onSelectRecipe, onSelectMenu, allUsers, currentUser }) {
  const [timelineBubbleIcon, setTimelineBubbleIcon] = useState(null);
  const [timelineMenuBubbleIcon, setTimelineMenuBubbleIcon] = useState(null);
  const [timelineRecipeDefaultImage, setTimelineRecipeDefaultImage] = useState(null);
  const [timelineMenuDefaultImage, setTimelineMenuDefaultImage] = useState(null);

  useEffect(() => {
    Promise.all([
      getTimelineBubbleIcon(),
      getTimelineMenuBubbleIcon(),
      getTimelineRecipeDefaultImage(),
      getTimelineMenuDefaultImage(),
    ]).then(([icon, menuIcon, recipeImg, menuImg]) => {
      setTimelineBubbleIcon(icon);
      setTimelineMenuBubbleIcon(menuIcon);
      setTimelineRecipeDefaultImage(recipeImg);
      setTimelineMenuDefaultImage(menuImg);
    }).catch(() => {});
  }, []);

  const filteredRecipes = currentUser
    ? recipes.filter(r => r.authorId === currentUser.id)
    : recipes;

  const filteredMenus = currentUser
    ? menus.filter(m => (m.authorId || m.createdBy) === currentUser.id)
    : menus;

  // Transform menus into the shape expected by RecipeTimeline
  const menuTimelineItems = filteredMenus.map(menu => ({
    id: menu.id,
    title: menu.name,
    createdAt: menu.createdAt,
    ingredients: menu.recipeIds || [],
    steps: [],
    authorId: menu.authorId || menu.createdBy,
  }));

  const handleSelectMenuItem = (item) => {
    const menu = filteredMenus.find(m => m.id === item.id);
    if (menu && onSelectMenu) onSelectMenu(menu);
  };

  return (
    <div className="kueche-container">
      <div className="kueche-header">
        <h2>Küche</h2>
      </div>
      <RecipeTimeline
        recipes={filteredRecipes}
        onSelectRecipe={onSelectRecipe}
        allUsers={allUsers}
        timelineBubbleIcon={timelineBubbleIcon}
        defaultImage={timelineRecipeDefaultImage}
      />
      {menuTimelineItems.length > 0 && (
        <>
          <div className="kueche-section-title">
            <h3>Menüs</h3>
          </div>
          <RecipeTimeline
            recipes={menuTimelineItems}
            onSelectRecipe={handleSelectMenuItem}
            allUsers={allUsers}
            timelineBubbleIcon={timelineMenuBubbleIcon}
            defaultImage={timelineMenuDefaultImage}
            itemType="menu"
          />
        </>
      )}
    </div>
  );
}

export default Kueche;
