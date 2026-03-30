import './WizardNav.css';

interface WizardNavProps {
  onNext: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  skipLabel?: string;
  showSkip?: boolean;
  disabled?: boolean;
}

function WizardNav({
  onNext,
  onSkip,
  nextLabel = 'Next →',
  skipLabel = 'Skip for now',
  showSkip = true,
  disabled = false,
}: WizardNavProps) {
  return (
    <div className="wizard-nav">
      <button
        className="wizard-nav-next"
        onClick={onNext}
        disabled={disabled}
      >
        {nextLabel}
      </button>
      {showSkip && onSkip && (
        <button className="wizard-nav-skip" onClick={onSkip}>
          {skipLabel}
        </button>
      )}
    </div>
  );
}

export default WizardNav;
