import './StepIngredients.css';
import CancelIcon from '../../assets/Cancel.svg';
import { useState } from 'react';
import { parseIngredientLine } from '../../utils/ingredientParser';

const UNITS = [
  'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cups',
  'pieces', 'pinch', 'bunch', 'cloves', 'slices',
  'oz', 'lb', 'cans',
];

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface StepIngredientsProps {
  ingredients: Ingredient[];
  onIngredientsChange: (ingredients: Ingredient[]) => void;
  onOpenCustomIngredient: () => void;
}

function StepIngredients({
  ingredients,
  onIngredientsChange,
  onOpenCustomIngredient,
}: StepIngredientsProps) {
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const handleAdd = () => {
    onIngredientsChange([...ingredients, { name: '', amount: '', unit: 'g' }]);
  };

  const handleBulkPaste = () => {
    const lines = bulkText.split('\n').filter(line => line.trim() !== '');
    const newIngredients = lines.map(line => parseIngredientLine(line));
    
    // Convert ParsedIngredient to the format expected by the component
    const formattedIngredients = newIngredients.map(ing => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit || 'g' // Default to 'g' if no unit found, matching current default
    }));

    // If the base ingredient is empty (initial state), replace it
    let updatedIngredients = [...ingredients];
    if (updatedIngredients.length === 1 && updatedIngredients[0].name === '' && updatedIngredients[0].amount === '') {
      updatedIngredients = formattedIngredients;
    } else {
      updatedIngredients = [...updatedIngredients, ...formattedIngredients];
    }

    onIngredientsChange(updatedIngredients);
    setBulkText('');
    setShowBulkPaste(false);
  };

  const handleRemove = (index: number) => {
    onIngredientsChange(ingredients.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof Ingredient, value: string) => {
    const updated = ingredients.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing
    );
    onIngredientsChange(updated);
  };

  const validCount = ingredients.filter(ing => ing.name.trim() !== '').length;
  const minRequired = 3;

  return (
    <div className="step-ingredients">
      <h2 className="step-title">Enter Ingredients</h2>
      <span className={`step-ingredient-counter${validCount >= minRequired ? ' step-ingredient-counter--met' : ''}`}>
        {validCount}/{minRequired} minimum ingredients
      </span>

      <div className="ingredients-bulk-control">
        <button 
          className="bulk-paste-toggle"
          onClick={() => setShowBulkPaste(!showBulkPaste)}
        >
          {showBulkPaste ? '− Hide Bulk Paste' : '+ Bulk Paste Ingredients'}
        </button>
      </div>

      {showBulkPaste && (
        <div className="bulk-paste-area">
          <textarea
            placeholder={"Paste your ingredient list here...\nExample:\n2 cups flour\n1 tsp salt\n3 eggs"}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="bulk-paste-textarea"
          />
          <button 
            className="bulk-paste-confirm"
            onClick={handleBulkPaste}
            disabled={!bulkText.trim()}
          >
            Auto-fill ingredients
          </button>
        </div>
      )}

      <div className="ingredients-list">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="ingredient-row">
            <input
              type="text"
              value={ingredient.name}
              onChange={(e) => handleChange(index, 'name', e.target.value)}
              placeholder="Ingredient name"
              className="ingredient-name-input"
            />
            <input
              type="text"
              value={ingredient.amount}
              onChange={(e) => handleChange(index, 'amount', e.target.value)}
              placeholder="Qty"
              className="ingredient-amount-input"
            />
            <select
              value={ingredient.unit}
              onChange={(e) => handleChange(index, 'unit', e.target.value)}
              className="ingredient-unit-select"
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <button
              className="ingredient-remove"
              onClick={() => handleRemove(index)}
              aria-label="Remove ingredient"
            >
              <img src={CancelIcon} alt="Remove" width={20} height={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="ingredients-actions">
        <button className="ingredient-add-btn" onClick={handleAdd}>
          + Add Ingredient
        </button>
        <button className="ingredient-custom-btn" onClick={onOpenCustomIngredient}>
          + Custom Ingredient
        </button>
      </div>
    </div>
  );
}

export default StepIngredients;
