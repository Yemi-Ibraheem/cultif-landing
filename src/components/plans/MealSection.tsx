import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import ImageWithFallback from '../ImageWithFallback';
import './MealSection.css';

const imageFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e0e0e0'/%3E%3Ctext x='50' y='55' text-anchor='middle' font-size='30' fill='%23999'%3E%F0%9F%8D%BD%3C/text%3E%3C/svg%3E";

const mealDescriptions: Record<string, string> = {
  Breakfast: 'Schedule what you eat for breakfast.',
  Lunch: 'Schedule what you eat everyday.',
  Snack: 'Schedule what you eat for snacks.',
  Dinner: 'Schedule what you eat everyday.',
};

interface MealSectionRecipe {
  _id: Id<"recipes">;
  title: string;
  imageUrl: string;
}

interface MealSectionProps {
  mealType: string;
  recipes: MealSectionRecipe[];
  onExplore?: () => void;
  onSwap?: () => void;
}

function MealThumbnail({ recipe }: { recipe: MealSectionRecipe }) {
  const isStorageId = recipe.imageUrl
    && !recipe.imageUrl.startsWith('http')
    && !recipe.imageUrl.startsWith('/')
    && !recipe.imageUrl.startsWith('data:')
    && recipe.imageUrl !== 'placeholder';

  const storageUrl = useQuery(
    api.recipes.getStorageUrl,
    isStorageId ? { storageId: recipe.imageUrl as Id<"_storage"> } : "skip"
  );

  const resolved = isStorageId ? (storageUrl || imageFallback) : (recipe.imageUrl || imageFallback);

  return (
    <div className="meal-section-thumb">
      <ImageWithFallback src={resolved} alt={recipe.title} className="meal-section-thumb-img" />
    </div>
  );
}

function MealSection({ mealType, recipes, onExplore, onSwap }: MealSectionProps) {
  const description = mealDescriptions[mealType] || 'Plan your meals.';

  return (
    <div className="meal-section">
      <div className="meal-section-info">
        <h3 className="meal-section-title">{mealType}</h3>
        <p className="meal-section-desc">{description}</p>
        <div className="meal-section-actions">
          {onExplore && (
            <button className="meal-section-pill" onClick={onExplore}>Explore plans</button>
          )}
          {onSwap && (
            <button className="meal-section-pill meal-section-pill--swap" onClick={onSwap}>Swap plans</button>
          )}
        </div>
      </div>
      <div className="meal-section-thumbs">
        {recipes.slice(0, 3).map((recipe) => (
          <MealThumbnail key={recipe._id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

export default MealSection;
