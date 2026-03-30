import './StepDietary.css';

const DIETARY_OPTIONS = [
  { value: 'Halal', description: "*Doesn't contain pork or alcohol." },
  { value: 'Vegan', description: "*Doesn't contain meats, fish or eggs." },
  { value: 'Vegetarian', description: "*Doesn't contain meat." },
  { value: 'Kosher', description: "*Doesn't contain cow." },
];

interface StepDietaryProps {
  dietaryTags: string[];
  onDietaryTagsChange: (tags: string[]) => void;
}

function StepDietary({
  dietaryTags,
  onDietaryTagsChange,
}: StepDietaryProps) {

  const toggleTag = (tag: string) => {
    if (dietaryTags.includes(tag)) {
      onDietaryTagsChange(dietaryTags.filter((t) => t !== tag));
    } else {
      onDietaryTagsChange([...dietaryTags, tag]);
    }
  };

  return (
    <div className="step-dietary">
      <h2 className="step-title">Select all that apply</h2>

      <div className="dietary-list">
        {DIETARY_OPTIONS.map((option) => {
          const isSelected = dietaryTags.includes(option.value);
          return (
            <button
              key={option.value}
              className={`dietary-card ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleTag(option.value)}
            >
              <div className="dietary-radio">
                <div className={`dietary-radio-inner ${isSelected ? 'active' : ''}`} />
              </div>
              <div className="dietary-text">
                <span className="dietary-label">{option.value}</span>
                <span className="dietary-description">{option.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StepDietary;
