import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import ImageWithFallback from './ImageWithFallback';
import type { Id } from "../../convex/_generated/dataModel";
import './CountryRecipeCard.css';

import imgJamaica from '../assets/Dishes/Carribean/caribbean_2000x1125.jpg';
import imgFrance from '../assets/Dishes/Old images/images (2).jpeg';
import imgMexico from '../assets/Dishes/Old images/pan-roasted-lobster-with-chive-beurre-blanc-FT-RECIPE1219-da9bf7e26d7d442cb1288027378ade04.jpg';
import imgItaly from '../assets/Dishes/Italian/chad-montano-MqT0asuoIcU-unsplash.jpg';

// Country → local dish image override (lowercase keys)
const countryImageOverrides: Record<string, string> = {
  jamaica: imgJamaica,
  france: imgFrance,
  mexico: imgMexico,
  italy: imgItaly,
};

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
}

interface CountryRecipeCardProps {
  recipe: Recipe;
}

// Load all flag SVGs
const flagModules = import.meta.glob('/src/assets/flags/Mini flags/*.svg', { eager: true, import: 'default' });

const flags: Record<string, string> = {};
for (const path in flagModules) {
  const filename = path.split('/').pop()?.replace('.svg', '') || '';
  if (filename) {
    flags[filename.toLowerCase()] = flagModules[path] as string;
  }
}

function CountryRecipeCard({ recipe }: CountryRecipeCardProps) {
  const navigate = useNavigate();

  // Resolve Convex storage URL if imageUrl looks like a storage ID
  const isStorageId = recipe.imageUrl && !recipe.imageUrl.startsWith('http') && !recipe.imageUrl.startsWith('/') && !recipe.imageUrl.startsWith('data:') && recipe.imageUrl !== 'placeholder';
  const storageUrl = useQuery(
    api.recipes.getStorageUrl,
    isStorageId ? { storageId: recipe.imageUrl as Id<"_storage"> } : "skip"
  );

  const handleCardClick = () => {
    navigate(`/recipe/${recipe._id}`);
  };

  const countryLower = recipe.country.toLowerCase();

  const countryMapping: Record<string, string> = {
    "usa": "america",
    "united states": "america",
    "morocco": "morroco",
    "ivory coast": "ivory coast",
  };

  const lookupKey = countryMapping[countryLower] || countryLower;
  const flagSrc = flags[lookupKey];

  // Priority: country override > resolved storage URL > raw imageUrl
  const resolvedImage = storageUrl || recipe.imageUrl;
  const imageUrl = countryImageOverrides[recipe.country.toLowerCase()] || resolvedImage;

  return (
    <div className="country-recipe-card" onClick={handleCardClick}>
      <div className="recipe-image-wrapper">
        <ImageWithFallback src={imageUrl} alt={recipe.title} className="recipe-image" />
      </div>
      <div className="country-info">
        {flagSrc ? (
          <img src={flagSrc} alt={recipe.country} className="country-flag-icon" />
        ) : (
          <span className="country-flag-emoji">{recipe.countryFlag}</span>
        )}
        <span className="country-name">{recipe.country}</span>
      </div>
    </div>
  );
}

export default CountryRecipeCard;
