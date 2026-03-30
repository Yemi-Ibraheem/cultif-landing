import './StepTime.css';

interface StepTimeProps {
  prepTime: number; // in seconds
  cookTime: number; // in seconds
  onPrepTimeChange: (seconds: number) => void;
  onCookTimeChange: (seconds: number) => void;
}

function formatTimeValue(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (seconds: number) => void;
}) {
  const { hours, minutes, seconds } = formatTimeValue(value);

  const handleChange = (field: 'hours' | 'minutes' | 'seconds', val: string) => {
    const num = parseInt(val) || 0;
    const clamped = field === 'hours' ? Math.min(num, 99) : Math.min(num, 59);
    const newTime = { hours, minutes, seconds };
    newTime[field] = clamped;
    onChange(newTime.hours * 3600 + newTime.minutes * 60 + newTime.seconds);
  };

  return (
    <div className="time-input-group">
      <label className="time-label">{label}</label>
      <div className="time-picker-row">
        <div className="time-field">
          <input
            type="number"
            min="0"
            max="99"
            value={hours}
            onChange={(e) => handleChange('hours', e.target.value)}
            className="time-number-input"
          />
          <span className="time-unit">hrs</span>
        </div>
        <span className="time-separator">:</span>
        <div className="time-field">
          <input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => handleChange('minutes', e.target.value)}
            className="time-number-input"
          />
          <span className="time-unit">min</span>
        </div>
        <span className="time-separator">:</span>
        <div className="time-field">
          <input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => handleChange('seconds', e.target.value)}
            className="time-number-input"
          />
          <span className="time-unit">sec</span>
        </div>
      </div>
    </div>
  );
}

function StepTime({ prepTime, cookTime, onPrepTimeChange, onCookTimeChange }: StepTimeProps) {
  const hasPrepTime = prepTime > 0;
  const hasCookTime = cookTime > 0;
  const filledCount = [hasPrepTime, hasCookTime].filter(Boolean).length;

  return (
    <div className="step-time">
      <h2 className="step-title">Set Time</h2>
      <p className="step-subtitle">How long does it take to make this dish?</p>
      <span className={`step-time-counter${filledCount === 2 ? ' step-time-counter--met' : ''}`}>
        {filledCount}/2 required
      </span>

      <TimeInput label="Prep Time" value={prepTime} onChange={onPrepTimeChange} />
      <p className="time-description">
        Time spent preparing ingredients before cooking — washing, chopping, marinating, measuring.
      </p>

      <TimeInput label="Cook Time" value={cookTime} onChange={onCookTimeChange} />
      <p className="time-description">
        Time the dish actually spends on heat — on the stove, in the oven, or on the grill.
      </p>
    </div>
  );
}

export default StepTime;
