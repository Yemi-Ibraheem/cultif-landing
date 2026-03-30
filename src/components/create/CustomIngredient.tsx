import { useState, useRef } from 'react';
import './CustomIngredient.css';

interface CustomIngredientProps {
  onAdd: (ingredient: { name: string; amount: string }) => void;
  onClose?: () => void;
  inline?: boolean;
}

function CustomIngredient({ onAdd, onClose, inline = false }: CustomIngredientProps) {
  const [name, setName] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [sodium, setSodium] = useState('');
  const [sugars, setSugars] = useState('');
  const [energy, setEnergy] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!name.trim()) return;
    const nutritionSummary = [
      protein && `${protein}g protein`,
      carbs && `${carbs}g carbs`,
      fat && `${fat}g fat`,
    ]
      .filter(Boolean)
      .join(', ');

    onAdd({
      name: name.trim(),
      amount: nutritionSummary || 'Custom ingredient',
    });
    if (onClose) onClose();
  };

  const modal = (
    <div className={inline ? 'custom-ingredient-modal custom-ingredient-modal--inline' : 'custom-ingredient-modal'}>
      <div className="custom-ingredient-header">
        {!inline && onClose && (
          <button className="custom-ingredient-back" onClick={onClose}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <h2 className="custom-ingredient-title">Name of custom ingredient ✏️</h2>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ingredient name"
        className="custom-ingredient-name-input"
      />

      <div
        className="custom-ingredient-photo"
        onClick={() => fileInputRef.current?.click()}
      >
        <span>📷 Upload photo</span>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} />
      </div>

      <div className="nutrition-fields">
        <div className="nutrition-row">
          <label>Protein</label>
          <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="Number" />
          <span className="nutrition-unit">g ▾</span>
        </div>
        <div className="nutrition-row">
          <label>Carbohydrate</label>
          <input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="Number" />
          <span className="nutrition-unit">g ▾</span>
        </div>
        <div className="nutrition-row">
          <label>Fat</label>
          <input type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="Number" />
          <span className="nutrition-unit">g ▾</span>
        </div>
        <div className="nutrition-row">
          <label>Sodium</label>
          <input type="number" value={sodium} onChange={(e) => setSodium(e.target.value)} placeholder="Number" />
          <span className="nutrition-unit">g ▾</span>
        </div>
        <div className="nutrition-row">
          <label>Sugars</label>
          <input type="number" value={sugars} onChange={(e) => setSugars(e.target.value)} placeholder="Number" />
          <span className="nutrition-unit">g ▾</span>
        </div>
        <div className="nutrition-row">
          <label>Energy</label>
          <input type="number" value={energy} onChange={(e) => setEnergy(e.target.value)} placeholder="Number" />
          <span className="nutrition-unit">Kcal ▾</span>
        </div>
      </div>

      <button className="custom-ingredient-submit" onClick={handleSubmit} disabled={!name.trim()}>
        Enter ingredient
      </button>
      <p className="custom-ingredient-note">
        💡 Your new ingredient will be reviewed once live
      </p>
    </div>
  );

  if (inline) return modal;

  return (
    <div className="custom-ingredient-overlay">
      {modal}
    </div>
  );
}

export default CustomIngredient;
