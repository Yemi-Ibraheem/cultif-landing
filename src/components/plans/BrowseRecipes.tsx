import { useState } from 'react';
import { useQuery, usePaginatedQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import RecipeGridCard from './RecipeGridCard';
import './BrowseRecipes.css';

interface BrowseRecipesProps {
  mealType: string;
  onSelect: (recipeId: Id<"recipes">, recipeTitle: string) => void;
  onBack: () => void;
}

function BrowseRecipes({ mealType, onSelect, onBack }: BrowseRecipesProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<Id<"recipes"> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Format meal type for display (e.g. "meal-1" → "Meal 1")
  const category = mealType.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  const categoryRecipes = useQuery(api.recipes.getRecipesByCategory, { category }) || [];
  const { results: allRecipes } = usePaginatedQuery(api.recipes.getAllRecipes, {}, { initialNumItems: 20 });

  // Use category recipes if available, otherwise show all
  const baseRecipes = categoryRecipes.length > 0 ? categoryRecipes : allRecipes;

  // Apply search filter
  const recipes = searchQuery
    ? baseRecipes.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : baseRecipes;

  const selectedRecipe = recipes.find((r) => r._id === selectedRecipeId);

  const handleConfirm = () => {
    if (selectedRecipeId && selectedRecipe) {
      onSelect(selectedRecipeId, selectedRecipe.title);
    }
  };

  return (
    <div className="browse-recipes-overlay">
      {/* Header */}
      <div className="browse-recipes-header">
        <button className="browse-recipes-back" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="browse-recipes-title">{category}</h2>
        <button className="browse-recipes-search-toggle" onClick={() => setShowSearch(!showSearch)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="browse-recipes-search">
          <input
            type="text"
            className="browse-recipes-search-input"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* Recipe grid */}
      <div className="browse-recipes-grid">
        {recipes.map((recipe) => (
          <RecipeGridCard
            key={recipe._id}
            recipe={recipe}
            selected={recipe._id === selectedRecipeId}
            onSelect={() => setSelectedRecipeId(recipe._id)}
          />
        ))}
        {recipes.length === 0 && (
          <p className="browse-recipes-empty">No recipes found</p>
        )}
      </div>

      {/* Confirm FAB */}
      {selectedRecipeId && (
        <button className="browse-recipes-fab" onClick={handleConfirm}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default BrowseRecipes;
