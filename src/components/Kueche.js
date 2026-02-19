import React, { useState, useEffect } from 'react';
import './Kueche.css';
import RecipeTimeline from './RecipeTimeline';
import { getTimelineBubbleIcon, getTimelineMenuBubbleIcon, getTimelineMenuDefaultImage } from '../utils/customLists';
import { getCategoryImages } from '../utils/categoryImages';

function Kueche({ recipes, menus = [], onSelectRecipe, onSelectMenu, allUsers, currentUser }) {
  const [timelineBubbleIcon, setTimelineBubbleIcon] = useState(null);
  const [timelineMenuBubbleIcon, setTimelineMenuBubbleIcon] = useState(null);
  const [categoryImages, setCategoryImages] = useState([]);
  const [timelineMenuDefaultImage, setTimelineMenuDefaultImage] = useState(null);

  useEffect(() => {
    Promise.all([
      getTimelineBubbleIcon(),
      getTimelineMenuBubbleIcon(),
      getCategoryImages(),
      getTimelineMenuDefaultImage(),
    ]).then(([icon, menuIcon, catImages, menuImg]) => {
      setTimelineBubbleIcon(icon);
      setTimelineMenuBubbleIcon(menuIcon);
      setCategoryImages(catImages);
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
        categoryImages={categoryImages}
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
