import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import ImageWithFallback from '../ImageWithFallback';
import './RecipeGridCard.css';

const imageFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e0e0e0'/%3E%3Ctext x='50' y='55' text-anchor='middle' font-size='30' fill='%23999'%3E%F0%9F%8D%BD%3C/text%3E%3C/svg%3E";

interface RecipeGridCardProps {
  recipe: {
    _id: Id<"recipes">;
    title: string;
    imageUrl: string;
  };
  selected?: boolean;
  onSelect?: () => void;
}

function RecipeGridCard({ recipe, selected, onSelect }: RecipeGridCardProps) {
  const isStorageId = recipe.imageUrl
    && !recipe.imageUrl.startsWith('http')
    && !recipe.imageUrl.startsWith('/')
    && !recipe.imageUrl.startsWith('data:')
    && recipe.imageUrl !== 'placeholder';

  const storageUrl = useQuery(
    api.recipes.getStorageUrl,
    isStorageId ? { storageId: recipe.imageUrl as Id<"_storage"> } : "skip"
  );

  const resolvedImage = isStorageId ? (storageUrl || imageFallback) : (recipe.imageUrl || imageFallback);

  return (
    <button
      className={`recipe-grid-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      title={recipe.title}
    >
      <ImageWithFallback
        src={resolvedImage}
        alt={recipe.title}
        className="recipe-grid-card-img"
      />
    </button>
  );
}

export default RecipeGridCard;
