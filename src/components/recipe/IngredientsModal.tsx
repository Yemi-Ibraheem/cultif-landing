import { Link } from 'react-router-dom';
import './IngredientsModal.css';

interface Ingredient {
  name: string;
  amount: string;
}

interface IngredientsModalProps {
  ingredients: Ingredient[];
  isSubscribed: boolean;
  recipeId: string;
  onClose: () => void;
}

function IngredientsModal({ ingredients, isSubscribed, recipeId, onClose }: IngredientsModalProps) {
  return (
    <div className="ingredients-modal-backdrop" onClick={onClose}>
      <div className="ingredients-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ingredients-modal-header">
          <button className="ingredients-modal-close" onClick={onClose}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2>Ingredients</h2>
        </div>

        <div className="ingredients-modal-list">
          {ingredients.map((ing, idx) => {
            const isLocked = !isSubscribed && idx >= 3;
            return (
              <div key={idx} className={`ingredients-modal-row ${isLocked ? 'locked' : ''}`}>
                <span className="ingredients-modal-name">
                  {isLocked ? '••••••' : ing.name}
                </span>
                <span className="ingredients-modal-amount">
                  {isLocked ? '•••' : ing.amount}
                </span>
              </div>
            );
          })}
        </div>

        {!isSubscribed && (
          <Link className="ingredients-modal-lock-notice" to={`/recipe/${recipeId}/paywall`}>
            <span className="lock-icon">🔒</span>
            <span>Subscribe to see all ingredients</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export default IngredientsModal;
