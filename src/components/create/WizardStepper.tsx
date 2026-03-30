import './WizardStepper.css';

const STEP_LABELS = [
  'Basics',
  'Ingredients',
  'Country',
  'Time',
  'Goal',
  'Day',
  'Dietary',
  'Video',
];

interface WizardStepperProps {
  currentStep: number;
}

function WizardStepper({ currentStep }: WizardStepperProps) {
  return (
    <div className="wizard-stepper">
      {STEP_LABELS.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={label} className="wizard-stepper-item">
            <div className="wizard-stepper-circle-row">
              {index > 0 && (
                <div className={`wizard-stepper-line ${isCompleted ? 'completed' : ''}`} />
              )}
              <div
                className={`wizard-stepper-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              {index < STEP_LABELS.length - 1 && (
                <div className={`wizard-stepper-line ${isCompleted ? 'completed' : ''}`} />
              )}
            </div>
            <span className={`wizard-stepper-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default WizardStepper;
