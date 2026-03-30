import './StepGoal.css';

const GOALS = [
  { value: 'Build muscle', description: 'This is for dishes with high protein.' },
  { value: 'Gain weight', description: 'This is for dishes with high calories and carbohydrates.' },
  { value: 'Lose weight', description: 'This is for dishes with low calories and carbohydrates.' },
  { value: 'Eat healthy', description: 'This is for dishes with high vitamins and nutrients, primarily health focuses.' },
  { value: 'Cheat day', description: 'This is for dishes that have no health focus, mostly taste driven, could be high in sugars/saturated fats.' },
];

interface StepGoalProps {
  weightGoals: string[];
  onWeightGoalsChange: (goals: string[]) => void;
}

function StepGoal({ weightGoals, onWeightGoalsChange }: StepGoalProps) {
  const toggleGoal = (value: string) => {
    if (weightGoals.includes(value)) {
      onWeightGoalsChange(weightGoals.filter((g) => g !== value));
    } else {
      onWeightGoalsChange([...weightGoals, value]);
    }
  };

  return (
    <div className="step-goal">
      <h2 className="step-title">Select all that apply</h2>

      <div className="goal-list">
        {GOALS.map((goal) => {
          const isSelected = weightGoals.includes(goal.value);
          return (
            <button
              key={goal.value}
              className={`goal-card ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleGoal(goal.value)}
            >
              <div className="goal-radio">
                <div className={`goal-radio-inner ${isSelected ? 'active' : ''}`} />
              </div>
              <div className="goal-text">
                <span className="goal-label">{goal.value}</span>
                <span className="goal-description">*{goal.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StepGoal;
