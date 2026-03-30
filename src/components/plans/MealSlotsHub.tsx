import type { Id } from '../../../convex/_generated/dataModel';
import './MealSlotsHub.css';

interface MealSlotsHubProps {
  mealsPerDay: number;
  slots: Record<string, Id<"recipes"> | null>;
  recipeNames: Record<string, string>;
  onChooseMeal: (mealType: string) => void;
}

function buildMealTypes(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    key: `meal-${i + 1}`,
    label: `Choose meal ${i + 1}`,
  }));
}

function MealSlotsHub({ mealsPerDay, slots, recipeNames, onChooseMeal }: MealSlotsHubProps) {
  const mealTypes = buildMealTypes(mealsPerDay);

  return (
    <div className="meal-slots-hub">
      <h2 className="meal-slots-title">Get started</h2>
      <div className="meal-slots-list">
        {mealTypes.map(({ key, label }) => {
          const filled = slots[key] !== null && slots[key] !== undefined;
          const recipeName = filled ? recipeNames[key] : null;
          return (
            <button
              key={key}
              className={`meal-slot-row ${filled ? 'filled' : ''}`}
              onClick={() => onChooseMeal(key)}
            >
              <span className="meal-slot-label">
                {filled ? recipeName || label : label}
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={filled ? '#20b2aa' : '#ccc'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MealSlotsHub;
