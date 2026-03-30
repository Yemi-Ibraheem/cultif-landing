import { usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback';
import './CategoryStatusScroller.css';
import cultifLogoBlack from '../assets/Logo/Black.png';
import dessertImage from '../assets/Dishes/Old images/dessert6.jpeg';
import breakfastImage from '../assets/Dishes/Old images/The-Best-French-Toast_EXPS_TOHFM21_256104_E09_24_9b.jpg';
import dinnerImage from '../assets/Dishes/Old images/short-ribs-with-creamy-polenta-1594658365.jpg';

const categoryImageOverrides: Record<string, string> = {
  Breakfast: breakfastImage,
  Dinner: dinnerImage,
  Desserts: dessertImage,
};

function getCurrentTimeCategory(): string {
  const hour = new Date().getHours();
  return hour < 11 ? "Breakfast" : hour < 14 ? "Lunch" : hour < 17 ? "Snack" : "Dinner";
}

interface CategoryStatusScrollerProps {
  categories: string[];
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string | null;
}

function CategoryStatusScroller({ categories, onSelectCategory, selectedCategory }: CategoryStatusScrollerProps) {
  const navigate = useNavigate();
  const { results: allRecipes } = usePaginatedQuery(api.recipes.getAllRecipes, {}, { initialNumItems: 20 });
  const currentTimeCategory = getCurrentTimeCategory();

  const handleCategorySelect = (category: string) => {
    onSelectCategory?.(category);
  };

  return (
    <div className="category-scroller">
      <div className="category-scroller-content">
        <div className="logo-container">
          <img src={cultifLogoBlack} alt="Cultif" className="cultif-logo" />
        </div>

        {categories.map((category) => {
          const categoryRecipes = allRecipes.filter((r) => r.category === category);
          // Use local dish images from assets so we never pass storage IDs to the img (which would show fallback).
          // Only use recipe imageUrl if it looks like a real URL (http/data path), not a Convex storage ID.
          const recipeImg = categoryRecipes[0]?.imageUrl;
          const isRecipeUrl =
            recipeImg &&
            (recipeImg.startsWith('http') || recipeImg.startsWith('/') || recipeImg.startsWith('data:'));
          const imageUrl =
            categoryImageOverrides[category] ||
            (isRecipeUrl ? recipeImg! : null) ||
            '/placeholder-food.jpg';
          const isRelevant = category === currentTimeCategory;
          const isSelected = selectedCategory === category;

          return (
            <div
              key={category}
              className={`category-item ${isRelevant ? 'category-item--relevant' : ''} ${isSelected ? 'category-item--selected' : ''}`}
              onClick={() => handleCategorySelect(category)}
            >
              <div className="category-image-wrapper">
                <ImageWithFallback src={imageUrl} alt={category} className="category-image" />
              </div>
              <span className="category-label">{category}</span>
            </div>
          );
        })}
        <div className="category-item create-meal-plan" onClick={() => navigate('/plans/create')}>
          <div className="category-image-wrapper">
            <div className="create-icon">+</div>
          </div>
          <span className="category-label">Create meal plan</span>
        </div>
      </div>
    </div>
  );
}

export default CategoryStatusScroller;
