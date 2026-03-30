import { useQuery } from 'convex/react';
import { Link } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import './CategoryRecipesModal.css';

const avatarFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2320b2aa'/%3E%3Ctext x='50' y='55' text-anchor='middle' dy='.1em' font-size='40' fill='white' font-family='sans-serif'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";
const imgFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'%3E%3Crect width='200' height='250' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='48'%3E%F0%9F%8D%BD%3C/text%3E%3C/svg%3E";

interface CategoryRecipe {
  _id: Id<'recipes'>;
  title: string;
  imageUrl: string;
  chef: {
    id: Id<'users'>;
    name: string;
    avatar?: string;
  } | null;
}

function CategoryModalRecipeCard({ recipe }: { recipe: CategoryRecipe }) {
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
    <div className="category-modal-card">
      <img src={imgSrc} alt={recipe.title} className="category-modal-card-image" />
      <h3 className="category-modal-card-title">{recipe.title}</h3>
      <div className="category-modal-card-actions">
        {recipe.chef && (
          <Link
            to={`/chef/${recipe.chef.id}`}
            className="category-modal-link"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={chefAvatarSrc}
              alt={recipe.chef.name}
              className="category-modal-avatar"
            />
            See creator
          </Link>
        )}
        <Link
          to={`/recipe/${recipe._id}`}
          className="category-modal-link category-modal-link--recipe"
          onClick={(e) => e.stopPropagation()}
        >
          See recipe
        </Link>
      </div>
    </div>
  );
}

interface CategoryRecipesModalProps {
  category: string;
  onClose: () => void;
}

function CategoryRecipesModal({ category, onClose }: CategoryRecipesModalProps) {
  const recipes = useQuery(
    api.recipes.getRecipesByCategory,
    category ? { category } : 'skip'
  ) ?? [];

  return (
    <div
      className="category-modal-backdrop"
      onClick={onClose}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      aria-label="Close modal"
    >
      <div
        className="category-modal-card-wrap"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
      >
        <div className="category-modal-header">
          <h2 id="category-modal-title" className="category-modal-title">
            {category}
          </h2>
          <button
            type="button"
            className="category-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="category-modal-body">
          {recipes.length === 0 ? (
            <p className="category-modal-empty">No {category} recipes yet.</p>
          ) : (
            <ul className="category-modal-list">
              {recipes.map((recipe: any) => (
                <li key={recipe._id}>
                  <CategoryModalRecipeCard recipe={recipe as CategoryRecipe} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryRecipesModal;
