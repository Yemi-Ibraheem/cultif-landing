import './MealsPerDayStep.css';

const options = [1, 2, 3, 4, 5, 6, 7];

interface MealsPerDayStepProps {
  selected: number;
  onSelect: (count: number) => void;
}

function MealsPerDayStep({ selected, onSelect }: MealsPerDayStepProps) {
  return (
    <div className="meals-per-day-step">
      <h2 className="meals-per-day-title">How many times do you eat a day</h2>
      <div className="meals-per-day-list">
        {options.map((n) => (
          <button
            key={n}
            className={`meals-per-day-option ${selected === n ? 'selected' : ''}`}
            onClick={() => onSelect(n)}
          >
            <div className="meals-per-day-radio">
              {selected === n && <div className="meals-per-day-radio-inner" />}
            </div>
            <span className="meals-per-day-label">{n === 7 ? '7+' : n}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MealsPerDayStep;
