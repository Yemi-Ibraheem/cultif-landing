import { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { Link } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import ImageWithFallback from './ImageWithFallback';
import './CategoryStoryViewer.css';

const avatarFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2320b2aa'/%3E%3Ctext x='50' y='55' text-anchor='middle' dy='.1em' font-size='40' fill='white' font-family='sans-serif'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";
const imgFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'%3E%3Crect width='200' height='250' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='48'%3E%F0%9F%8D%BD%3C/text%3E%3C/svg%3E";

interface StoryRecipe {
  _id: Id<'recipes'>;
  title: string;
  imageUrl: string;
  chef: {
    id: Id<'users'>;
    name: string;
    avatar?: string;
  } | null;
}

function StorySlide({ recipe }: { recipe: StoryRecipe }) {
  const isStorageId =
    recipe.imageUrl &&
    !recipe.imageUrl.startsWith('http') &&
    !recipe.imageUrl.startsWith('/') &&
    !recipe.imageUrl.startsWith('data:') &&
    recipe.imageUrl !== 'placeholder';
  const storageUrl = useQuery(
    api.recipes.getStorageUrl,
    isStorageId ? { storageId: recipe.imageUrl as Id<'_storage'> } : 'skip'
  );

  const chefAvatarRaw = recipe.chef?.avatar || '';
  const isChefAvatarStorageId =
    chefAvatarRaw &&
    !chefAvatarRaw.startsWith('http') &&
    !chefAvatarRaw.startsWith('/') &&
    !chefAvatarRaw.startsWith('data:') &&
    chefAvatarRaw !== 'placeholder';
  const chefAvatarStorageUrl = useQuery(
    api.recipes.getStorageUrl,
    isChefAvatarStorageId ? { storageId: chefAvatarRaw as Id<'_storage'> } : 'skip'
  );

  const imgSrc = isStorageId ? storageUrl || imgFallback : recipe.imageUrl || imgFallback;
  const chefAvatarSrc = isChefAvatarStorageId
    ? chefAvatarStorageUrl || avatarFallback
    : chefAvatarRaw || avatarFallback;

  return (
    <div className="category-story-slide">
      <ImageWithFallback
        src={imgSrc}
        alt={recipe.title}
        className="category-story-image"
      />
      {recipe.chef && (
        <Link
          to={`/chef/${recipe.chef.id}`}
          className="category-story-chef-link"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={chefAvatarSrc}
            alt={recipe.chef.name}
            className="category-story-chef-avatar"
          />
          <span className="category-story-chef-name">{recipe.chef.name}</span>
        </Link>
      )}
    </div>
  );
}

interface CategoryStoryViewerProps {
  categories: string[];
  startCategory: string;
  onClose: () => void;
}

function CategoryStoryViewer({ categories, startCategory, onClose }: CategoryStoryViewerProps) {
  const breakfastData = useQuery(
    api.recipes.getRecipesByCategory,
    categories.includes('Breakfast') ? { category: 'Breakfast' } : 'skip'
  );
  const dinnerData = useQuery(
    api.recipes.getRecipesByCategory,
    categories.includes('Dinner') ? { category: 'Dinner' } : 'skip'
  );
  const dessertsData = useQuery(
    api.recipes.getRecipesByCategory,
    categories.includes('Desserts') ? { category: 'Desserts' } : 'skip'
  );

  const queriesLoaded =
    breakfastData !== undefined &&
    dinnerData !== undefined &&
    dessertsData !== undefined;

  const breakfastRecipes = breakfastData ?? [];
  const dinnerRecipes = dinnerData ?? [];
  const dessertsRecipes = dessertsData ?? [];

  const categoryToRecipes: Record<string, StoryRecipe[]> = useMemo(() => ({
    Breakfast: breakfastRecipes as StoryRecipe[],
    Dinner: dinnerRecipes as StoryRecipe[],
    Desserts: dessertsRecipes as StoryRecipe[],
  }), [breakfastRecipes, dinnerRecipes, dessertsRecipes]);

  const orderedCategories = useMemo(() => {
    const startIdx = categories.indexOf(startCategory);
    if (startIdx === -1) return categories;
    return [...categories.slice(startIdx), ...categories.slice(0, startIdx)];
  }, [categories, startCategory]);

  const [categoryIndex, setCategoryIndex] = useState(0);
  const [recipeIndex, setRecipeIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentCategory = orderedCategories[categoryIndex];
  const currentRecipes = (currentCategory ? categoryToRecipes[currentCategory] : []) ?? [];
  const currentRecipe = currentRecipes[recipeIndex] ?? null;

  useEffect(() => {
    if (!queriesLoaded) return;

    if (currentRecipes.length === 0 && categoryIndex >= orderedCategories.length - 1) {
      onClose();
      return;
    }
    if (currentRecipes.length === 0) {
      setCategoryIndex((i) => i + 1);
      setRecipeIndex(0);
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((p) => Math.min(5, p + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [queriesLoaded, categoryIndex, recipeIndex, currentRecipes.length, orderedCategories.length, onClose]);

  useEffect(() => {
    if (progress < 5 || !currentRecipe) return;
    if (recipeIndex < currentRecipes.length - 1) {
      setRecipeIndex((r) => r + 1);
      setProgress(0);
    } else if (categoryIndex < orderedCategories.length - 1) {
      setCategoryIndex((c) => c + 1);
      setRecipeIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [progress, recipeIndex, categoryIndex, currentRecipes.length, orderedCategories.length, currentRecipe, onClose]);

  const handleBack = () => {
    if (recipeIndex > 0) {
      setRecipeIndex((r) => r - 1);
      setProgress(0);
    } else if (categoryIndex > 0) {
      const prevCategory = orderedCategories[categoryIndex - 1];
      const prevRecipes = categoryToRecipes[prevCategory] ?? [];
      setCategoryIndex((c) => c - 1);
      setRecipeIndex(prevRecipes.length - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (recipeIndex < currentRecipes.length - 1) {
      setRecipeIndex((r) => r + 1);
      setProgress(0);
    } else if (categoryIndex < orderedCategories.length - 1) {
      setCategoryIndex((c) => c + 1);
      setRecipeIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  if (!currentRecipe) {
    return (
      <div className="category-story-viewer" aria-label="Stories" onClick={onClose}>
        <div className="category-story-inner" onClick={(e) => e.stopPropagation()}>
          <div className="category-story-loading">
            {queriesLoaded ? 'No recipes in this category' : 'Loading…'}
          </div>
          <button type="button" className="category-story-close" onClick={onClose} aria-label="Close">×</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="category-story-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="Category stories"
      onClick={onClose}
    >
      <button
        type="button"
        className="category-story-nav-btn category-story-nav-prev"
        onClick={(e) => { e.stopPropagation(); handleBack(); }}
        aria-label="Previous"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>

      <div className="category-story-inner" onClick={(e) => e.stopPropagation()}>
        <div className="category-story-progress-track">
          {currentRecipes.map((_, i) => (
            <div key={i} className="category-story-progress-segment">
              <div
                className="category-story-progress-fill"
                style={{
                  width: i < recipeIndex ? '100%' : i === recipeIndex ? `${(progress / 5) * 100}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        <div className="category-story-header">
          <span className="category-story-category-pill">{currentCategory}</span>
          <button
            type="button"
            className="category-story-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div
          className="category-story-tap-zone category-story-tap-left"
          onClick={handleBack}
          aria-hidden
        />
        <div
          className="category-story-tap-zone category-story-tap-right"
          onClick={handleNext}
          aria-hidden
        />

        <StorySlide recipe={currentRecipe} />
      </div>

      <button
        type="button"
        className="category-story-nav-btn category-story-nav-next"
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        aria-label="Next"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  );
}

export default CategoryStoryViewer;
