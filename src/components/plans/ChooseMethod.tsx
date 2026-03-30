import './ChooseMethod.css';

interface ChooseMethodProps {
  selected: 'ai' | 'manual' | null;
  onSelect: (method: 'ai' | 'manual') => void;
}

function ChooseMethod({ selected, onSelect }: ChooseMethodProps) {
  return (
    <div className="choose-method">
      <h2 className="choose-method-title">Choose how to create your custom plan</h2>
      <div className="choose-method-options">
        {/* AI plan creation — hidden for now, future feature */}

        <button
          className={`choose-method-card ${selected === 'manual' ? 'selected' : ''}`}
          onClick={() => onSelect('manual')}
        >
          <div className="choose-method-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#20b2aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <p className="choose-method-label">Create your plan</p>
        </button>
      </div>
    </div>
  );
}

export default ChooseMethod;
