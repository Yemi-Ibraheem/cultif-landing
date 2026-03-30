import { useNavigate } from 'react-router-dom';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from "../../convex/_generated/dataModel";
import ImageWithFallback from './ImageWithFallback';
import './FeaturedRecipeCard.css';

import veganIcon from '/src/assets/Dietaryicons/Vegan.svg';
import proteinIcon from '/src/assets/Dietaryicons/Protein.svg';
import halalIcon from '/src/assets/Dietaryicons/Halal (1).svg';
import vegetarianIcon from '/src/assets/Dietaryicons/Vegetarian.svg';

const DIETARY_ICON_MAP: Record<string, string> = {
  Halal: halalIcon,
  Vegan: veganIcon,
  Vegetarian: vegetarianIcon,
  Protein: proteinIcon,
};

// Load all flag SVGs
const flagModules = import.meta.glob('/src/assets/flags/Mini flags/*.svg', { eager: true, import: 'default' });
const flags: Record<string, string> = {};
for (const path in flagModules) {
  const filename = path.split('/').pop()?.replace('.svg', '') || '';
  if (filename) {
    flags[filename.toLowerCase()] = flagModules[path] as string;
  }
}

interface Recipe {
  _id: Id<"recipes">;
  title: string;
  imageUrl: string;
  country: string;
  countryFlag: string;
  chef: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  tags: string[];
  rating: number;
  reviewCount?: number;
  prepTime?: number;
}

function formatReviewCount(count: number): string {
  if (count >= 10000) return `${Math.floor(count / 1000)}k+`;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return count.toString();
}

interface FeaturedRecipeCardProps {
  recipe: Recipe;
}

function FeaturedRecipeCard({ recipe }: FeaturedRecipeCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();

  // Resolve Convex storage URL if imageUrl looks like a storage ID
  const isStorageId = recipe.imageUrl && !recipe.imageUrl.startsWith('http') && !recipe.imageUrl.startsWith('/') && !recipe.imageUrl.startsWith('data:') && recipe.imageUrl !== 'placeholder';
  const storageUrl = useQuery(
    api.recipes.getStorageUrl,
    isStorageId ? { storageId: recipe.imageUrl as Id<"_storage"> } : "skip"
  );

  // Resolve chef avatar storage ID to URL
  const chefAvatarRaw = recipe.chef?.avatar || '';
  const isChefAvatarStorageId = chefAvatarRaw && !chefAvatarRaw.startsWith('http') && !chefAvatarRaw.startsWith('/') && !chefAvatarRaw.startsWith('data:') && chefAvatarRaw !== 'placeholder';
  const chefAvatarStorageUrl = useQuery(
    api.recipes.getStorageUrl,
    isChefAvatarStorageId ? { storageId: chefAvatarRaw as Id<"_storage"> } : "skip"
  );
  const chefAvatarFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2320b2aa'/%3E%3Ctext x='50' y='55' text-anchor='middle' dy='.1em' font-size='40' fill='white' font-family='sans-serif'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";
  const chefAvatarSrc = isChefAvatarStorageId ? (chefAvatarStorageUrl || chefAvatarFallback) : (chefAvatarRaw || chefAvatarFallback);

  const handleCardClick = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    navigate(`/recipe/${recipe._id}`);
  };

  const resolvedImage = storageUrl || recipe.imageUrl;

  // Resolve flag SVG
  const countryLower = recipe.country.toLowerCase();
  const countryMapping: Record<string, string> = {
    "usa": "america",
    "united states": "america",
    "morocco": "morroco",
    "uk": "england",
    "united kingdom": "england",
    "great britain": "england",
    "ivory coast": "ivory coast",
    "côte d'ivoire": "ivory coast",
  };
  const flagKey = countryMapping[countryLower] || countryLower;
  const flagSvg: string | undefined = flags[flagKey];
  // countryFlag field is a Unicode emoji — only usable as text, not img src
  const flagEmoji = recipe.countryFlag || '';

  return (
    <div className="featured-recipe-box" onClick={handleCardClick}>

      {/* 1. TOP SECTION: Title left, Country right */}
      <div className="box-header">
        <h2 className="box-title">{recipe.title}</h2>
        <div className="box-country">
          {flagSvg
            ? <img src={flagSvg} alt={recipe.country} className="country-flag-icon" />
            : flagEmoji
              ? <span className="country-flag-emoji" aria-label={recipe.country}>{flagEmoji}</span>
              : null
          }
          <span className="country-name">{recipe.country}</span>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: Dish Image */}
      <div className="box-image-container">
        <ImageWithFallback src={resolvedImage} alt={recipe.title} className="box-image" />
        {recipe.chef && (
          <div
            className="box-chef-overlay"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/chef/${recipe.chef!.id}`);
            }}
          >
            <img
              src={chefAvatarSrc}
              alt={recipe.chef.name}
              className="box-chef-overlay-avatar"
            />
            <span className="box-chef-overlay-name">{recipe.chef.name}</span>
          </div>
        )}
      </div>

      {/* 3. BOTTOM SECTION: Dietary tags from recipe, Ratings right */}
      <div className="box-footer">
        <div className="box-icons">
          {(recipe.tags ?? []).filter((tag) => DIETARY_ICON_MAP[tag]).map((tag) => (
            <img
              key={tag}
              src={DIETARY_ICON_MAP[tag]}
              alt={tag}
              className={`box-diet-icon ${tag === 'Protein' ? 'box-diet-icon--large' : ''}`}
              title={tag}
            />
          ))}
        </div>

        <div className="box-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-score">{recipe.rating.toFixed(1)}</span>
          <span className="rating-count">
            {recipe.reviewCount != null ? `(${formatReviewCount(recipe.reviewCount)})` : ''}
          </span>
        </div>
      </div>

    </div>
  );
}

export default FeaturedRecipeCard;
