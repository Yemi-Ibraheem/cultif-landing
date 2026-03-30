import type { Id } from '../../../convex/_generated/dataModel';
import './PlanCard.css';

interface PlanMeal {
  type: string;
  recipeId?: Id<"recipes">;
  recipe?: {
    _id: Id<"recipes">;
    title: string;
    imageUrl: string;
  } | null;
}

interface PlanCardProps {
  plan: {
    _id: Id<"mealPlans">;
    name: string;
    date: string;
    dietaryGoal?: string;
    mealsPerDay?: number;
    meals: PlanMeal[];
    creator?: { name?: string; avatar?: string } | null;
  };
  onPress?: () => void;
}

function PlanCard({ plan, onPress }: PlanCardProps) {
  const filledMeals = plan.meals.filter((m) => m.recipeId);
  const mealTypeIcons: Record<string, string> = {
    breakfast: '🍳',
    lunch: '🥗',
    dinner: '🍽',
    snack: '🍪',
  };

  const formattedDate = (() => {
    const d = new Date(plan.date + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  })();

  return (
    <button className="plan-card" onClick={onPress}>
      <div className="plan-card-header">
        <h3 className="plan-card-name">{plan.name}</h3>
        <span className="plan-card-date">{formattedDate}</span>
      </div>
      <div className="plan-card-meals">
        {plan.meals.map((meal, i) => (
          <span
            key={i}
            className={`plan-card-meal-badge ${meal.recipeId ? 'filled' : ''}`}
          >
            {mealTypeIcons[meal.type.toLowerCase()] || '🍴'} {meal.type.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
          </span>
        ))}
      </div>
      <div className="plan-card-footer">
        {plan.dietaryGoal && (
          <span className="plan-card-goal">{plan.dietaryGoal}</span>
        )}
        <span className="plan-card-count">
          {filledMeals.length}/{plan.meals.length} meals
        </span>
        {plan.creator && (
          <span className="plan-card-creator">by {plan.creator.name || 'Chef'}</span>
        )}
      </div>
    </button>
  );
}

export default PlanCard;
