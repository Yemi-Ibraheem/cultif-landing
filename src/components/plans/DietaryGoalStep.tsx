import './DietaryGoalStep.css';

const goals = [
  { id: 'Build muscle', label: 'Build muscle', desc: 'This is for building and high protein.' },
  { id: 'Gain weight', label: 'Gain weight', desc: 'This is for meals with high caloric and calorie plates.' },
  { id: 'Lose weight', label: 'Lose weight', desc: 'This is for diets with low calories and calorie plates.' },
  { id: 'Eat healthy', label: 'Eat healthy', desc: 'This is for meals with high vitamins and minerals, primarily whole-foods.' },
  { id: 'Cheat day', label: 'Cheat day', desc: 'This is for any meal to have cheat day friendly food or times of leisure.' },
  { id: 'Custom', label: 'Custom', desc: 'Make it whatever goal is in mind.' },
];

interface DietaryGoalStepProps {
  selected: string;
  onSelect: (goal: string) => void;
}

function DietaryGoalStep({ selected, onSelect }: DietaryGoalStepProps) {
  return (
    <div className="dietary-goal-step">
      <h2 className="dietary-goal-title">Whats your dietary goal</h2>
      <div className="dietary-goal-list">
        {goals.map((goal) => (
          <button
            key={goal.id}
            className={`dietary-goal-option ${selected === goal.id ? 'selected' : ''}`}
            onClick={() => onSelect(goal.id)}
          >
            <div className="dietary-goal-radio">
              {selected === goal.id && <div className="dietary-goal-radio-inner" />}
            </div>
            <div className="dietary-goal-text">
              <span className="dietary-goal-label">{goal.label}</span>
              <span className="dietary-goal-desc">{goal.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DietaryGoalStep;
