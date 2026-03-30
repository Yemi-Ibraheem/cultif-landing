
export interface ParsedIngredient {
  name: string;
  amount: string;
  unit: string;
}

const UNIT_MAPPINGS: Record<string, string> = {
  'cup': 'cups',
  'cups': 'cups',
  'tsp': 'tsp',
  'tsps': 'tsp',
  'teaspoon': 'tsp',
  'teaspoons': 'tsp',
  'tbsp': 'tbsp',
  'tbsps': 'tbsp',
  'tablespoon': 'tbsp',
  'tablespoons': 'tbsp',
  'g': 'g',
  'gram': 'g',
  'grams': 'g',
  'kg': 'kg',
  'kilogram': 'kg',
  'kilograms': 'kg',
  'ml': 'ml',
  'millilitre': 'ml',
  'millilitres': 'ml',
  'l': 'l',
  'litre': 'l',
  'litres': 'l',
  'oz': 'oz',
  'ounce': 'oz',
  'ounces': 'oz',
  'lb': 'lb',
  'lbs': 'lb',
  'pound': 'lb',
  'pounds': 'lb',
  'piece': 'pieces',
  'pieces': 'pieces',
  'pinch': 'pinch',
  'pinches': 'pinch',
  'bunch': 'bunch',
  'bunches': 'bunch',
  'clove': 'cloves',
  'cloves': 'cloves',
  'slice': 'slices',
  'slices': 'slices',
  'can': 'cans',
  'cans': 'cans',
};

const FRACTION_REGEX = /[\u00BC-\u00BE\u2150-\u215E]/;

export function parseIngredientLine(line: string): ParsedIngredient {
  let text = line.trim();
  
  // 1. Trim bullet points and numbering
  // Matches: -, *, •, 1., 2), etc.
  text = text.replace(/^([\-\*\u2022]|\d+[\.\)])\s+/, '');

  // 2. Extract Quantity
  // Matches: 
  // - Integers and decimals: 1, 1.5, 0.5
  // - Fractions: 1/2, 1 1/2
  // - Unicode fractions: ½, 1½
  // - Ranges: 2-3, 2 to 3, 2 - 3
  
  // Let's simplify and use a more robust approach:
  // Split by space, check if first part(s) are numeric/fractional.
  const parts = text.split(/\s+/);
  let amount = '';
  let unit = '';
  let name = '';
  let currentIndex = 0;

  // Check if first part is numeric or fraction
  const isNumeric = (s: string) => /^(\d+[\.\/]?\d*)$/.test(s) || FRACTION_REGEX.test(s);
  
  if (parts.length > 0 && (isNumeric(parts[0]) || parts[0].includes('-') || parts[0].includes('\u2013'))) {
    amount = parts[0];
    currentIndex = 1;

    // Check for ranges like "2 - 3" or "2 to 3"
    if (parts.length > 2 && (parts[1] === '-' || parts[1] === 'to' || parts[1] === '\u2013')) {
      amount += ` ${parts[1]} ${parts[2]}`;
      currentIndex = 3;
    } else if (parts.length > 1 && isNumeric(parts[1])) {
       // Check for "1 1/2" style
       amount += ` ${parts[1]}`;
       currentIndex = 2;
    }
  }

  // 3. Extract Unit
  if (currentIndex < parts.length) {
    const potentialUnit = parts[currentIndex].toLowerCase().replace(/[\(\)]/g, '');
    if (UNIT_MAPPINGS[potentialUnit]) {
      unit = UNIT_MAPPINGS[potentialUnit];
      currentIndex++;
    }
  }

  // 4. Remaining is name
  name = parts.slice(currentIndex).join(' ').trim();

  // Handle case where no quantity/unit was found (Salt to taste)
  if (!amount && !unit) {
    return {
      amount: '',
      unit: '',
      name: text
    };
  }

  return { amount, unit, name };
}
