import { useState } from 'react';
import './DietFilterScroller.css';

// Import icons from assets root
import halalIcon from '../assets/Halal.svg';
import veganIcon from '../assets/Vegan.svg';
import vegetarianIcon from '../assets/Vegetarian leaf.svg';
import bulkIcon from '../assets/Add weight.svg';
import weightGainIcon from '../assets/Weight scale.svg';
import proteinIcon from '../assets/exercise.svg';
import fattyIcon from '../assets/local_dining.svg';

interface FilterItem {
    id: string;
    label: string;
    icon: string; // URL or Emoji
    isEmoji?: boolean;
}

const FILTER_ITEMS: FilterItem[] = [
    { id: 'all', label: 'All Diets', icon: '✨', isEmoji: true },
    { id: 'halal', label: 'Halal', icon: halalIcon, isEmoji: false },
    { id: 'vegan', label: 'Vegan', icon: veganIcon, isEmoji: false },
    { id: 'vegetarian', label: 'Vegetarian', icon: vegetarianIcon, isEmoji: false },
    { id: 'bulking', label: 'Bulking', icon: bulkIcon, isEmoji: false },
    { id: 'weight_gain', label: 'Weight Gainer', icon: weightGainIcon, isEmoji: false },
    { id: 'protein', label: 'High Protein', icon: proteinIcon, isEmoji: false },
    { id: 'fatty', label: 'High Fat', icon: fattyIcon, isEmoji: false },
];

function DietFilterScroller() {
    const [activeId, setActiveId] = useState('all'); // Default active to 'All Diets'

    return (
        <div className="diet-filter-scroller">
            {FILTER_ITEMS.map((item) => (
                <button
                    key={item.id}
                    className={`diet-filter-chip ${activeId === item.id ? 'active' : ''}`}
                    onClick={() => setActiveId(item.id)}
                >
                    {item.isEmoji ? (
                        <span className="chip-icon-emoji">{item.icon}</span>
                    ) : (
                        <img src={item.icon} alt="" className="chip-icon-img" />
                    )}
                    <span className="chip-label">{item.label}</span>
                </button>
            ))}
        </div>
    );
}

export default DietFilterScroller;
