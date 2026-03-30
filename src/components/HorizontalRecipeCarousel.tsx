import type { Id } from "../../convex/_generated/dataModel";
import CountryRecipeCard from './CountryRecipeCard';
import './HorizontalRecipeCarousel.css';

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

interface HorizontalRecipeCarouselProps {
  recipes: Recipe[];
}

function HorizontalRecipeCarousel({ recipes }: HorizontalRecipeCarouselProps) {
  if (recipes.length === 0) {
    return (
      <div className="carousel-empty">
        <p>No recipes available</p>
      </div>
    );
  }

  return (
    <div className="recipe-carousel">
      <div className="recipe-carousel-content">
        {recipes.map((recipe) => (
          <CountryRecipeCard key={recipe._id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

export default HorizontalRecipeCarousel;
