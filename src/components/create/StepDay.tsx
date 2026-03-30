import './StepDay.css';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

interface StepDayProps {
  categories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

function StepDay({ categories, onCategoriesChange }: StepDayProps) {
  const toggleCategory = (value: string) => {
    if (categories.includes(value)) {
      onCategoriesChange(categories.filter((c) => c !== value));
    } else {
      onCategoriesChange([...categories, value]);
    }
  };

  return (
    <div className="step-day">
      <h2 className="step-title">Select all that apply</h2>
      <p className="step-subtitle">(Can be more than one)</p>

      <div className="day-list">
        {CATEGORIES.map((cat) => {
          const isSelected = categories.includes(cat);
          return (
            <button
              key={cat}
              className={`day-card ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleCategory(cat)}
            >
              <div className="day-radio">
                <div className={`day-radio-inner ${isSelected ? 'active' : ''}`} />
              </div>
              <span className="day-label">{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StepDay;
