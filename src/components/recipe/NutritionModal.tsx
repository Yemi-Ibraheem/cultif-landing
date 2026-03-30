import './NutritionModal.css';

interface NutritionItem {
  label: string;
  value: string;
  percent: number;
  color: string;
}

interface NutritionModalProps {
  nutrition: NutritionItem[];
  onClose: () => void;
}

function NutritionModal({ nutrition, onClose }: NutritionModalProps) {
  return (
    <div className="nutrition-modal-backdrop" onClick={onClose}>
      <div className="nutrition-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nutrition-modal-header">
          <button className="nutrition-modal-close" onClick={onClose}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2>Nutrition facts</h2>
        </div>

        <div className="nutrition-modal-list">
          {nutrition.map((item) => (
            <div key={item.label} className="nutrition-modal-row">
              <div className="nutrition-modal-info">
                <span className="nutrition-modal-label">{item.label}</span>
                <span className="nutrition-modal-value">{item.value}</span>
              </div>
              <div className="nutrition-modal-bar-track">
                <div
                  className="nutrition-modal-bar-fill"
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <span className="nutrition-modal-percent">{item.percent}%</span>
            </div>
          ))}
        </div>

        <div className="nutrition-modal-disclaimer">
          *Percent Daily Values are based on a 2,000 calorie diet.
        </div>
      </div>
    </div>
  );
}

export default NutritionModal;
