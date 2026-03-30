import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getCountryFlagUrl } from '../utils/countryFlagUrl';
import CancelIcon from '../assets/Cancel.svg';
import './FilterModal.css';

export interface DiscoverFilters {
  country: string | null;
  dietary: string[];
  category: string | null;
  maxDuration: number | null;
}

const DIETARY_OPTIONS = ['Halal', 'Vegan', 'Vegetarian', 'Kosher'];
const CATEGORY_OPTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DURATION_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Under 15 min', value: 15 * 60 },
  { label: '15–30 min', value: 30 * 60 },
  { label: '30–60 min', value: 60 * 60 },
  { label: '60+ min', value: null },
];

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DiscoverFilters;
  onApplyFilters: (filters: DiscoverFilters) => void;
}

const emptyFilters: DiscoverFilters = {
  country: null,
  dietary: [],
  category: null,
  maxDuration: null,
};

function FilterModal({ isOpen, onClose, filters, onApplyFilters }: FilterModalProps) {
  const [countrySearch, setCountrySearch] = useState('');
  const countries = useQuery(api.countries.getAllCountries) ?? [];

  if (!isOpen) return null;

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const setCountry = (country: string | null) => {
    onApplyFilters({ ...filters, country });
  };

  const toggleDietary = (tag: string) => {
    const next = filters.dietary.includes(tag)
      ? filters.dietary.filter((t) => t !== tag)
      : [...filters.dietary, tag];
    onApplyFilters({ ...filters, dietary: next });
  };

  const setCategory = (category: string | null) => {
    onApplyFilters({ ...filters, category });
  };

  const setMaxDuration = (maxDuration: number | null) => {
    onApplyFilters({ ...filters, maxDuration });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    onApplyFilters(emptyFilters);
  };

  return (
    <div className="filter-modal-backdrop" onClick={onClose}>
      <div className="filter-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="filter-modal-handle" />
        <div className="filter-modal-header">
          <h2 className="filter-modal-title">Filters</h2>
          <button type="button" className="filter-modal-close" onClick={onClose} aria-label="Close">
            <img src={CancelIcon} alt="" width={24} height={24} />
          </button>
        </div>

        <section className="filter-modal-section">
          <h3 className="filter-modal-section-title">Country</h3>
          <input
            type="text"
            placeholder="Search country..."
            value={countrySearch}
            onChange={(e) => setCountrySearch(e.target.value)}
            className="filter-modal-country-search"
          />
          <div className="filter-modal-country-list">
            <button
              type="button"
              className={`filter-modal-chip ${filters.country === null ? 'selected' : ''}`}
              onClick={() => setCountry(null)}
            >
              All countries
            </button>
            {filteredCountries.map((c) => (
              <button
                type="button"
                key={c._id}
                className={`filter-modal-chip filter-modal-country-chip ${filters.country === c.name ? 'selected' : ''}`}
                onClick={() => setCountry(c.name)}
              >
                <img
                  src={getCountryFlagUrl(c.code, '32x24')}
                  alt=""
                  className="filter-modal-country-flag"
                  width={32}
                  height={24}
                  loading="lazy"
                />
                {c.name}
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <p className="filter-modal-no-results">No countries found</p>
            )}
          </div>
        </section>

        <section className="filter-modal-section">
          <h3 className="filter-modal-section-title">Dietary</h3>
          <div className="filter-modal-chips">
            {DIETARY_OPTIONS.map((tag) => (
              <button
                type="button"
                key={tag}
                className={`filter-modal-chip ${filters.dietary.includes(tag) ? 'selected' : ''}`}
                onClick={() => toggleDietary(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-modal-section">
          <h3 className="filter-modal-section-title">Time of day</h3>
          <div className="filter-modal-chips">
            <button
              type="button"
              className={`filter-modal-chip ${filters.category === null ? 'selected' : ''}`}
              onClick={() => setCategory(null)}
            >
              Any
            </button>
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`filter-modal-chip ${filters.category === cat ? 'selected' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-modal-section">
          <h3 className="filter-modal-section-title">Cooking duration</h3>
          <div className="filter-modal-chips">
            <button
              type="button"
              className={`filter-modal-chip ${filters.maxDuration === null ? 'selected' : ''}`}
              onClick={() => setMaxDuration(null)}
            >
              Any
            </button>
            {DURATION_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.label}
                className={`filter-modal-chip ${filters.maxDuration === opt.value ? 'selected' : ''}`}
                onClick={() => setMaxDuration(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <div className="filter-modal-actions">
          <button type="button" className="filter-modal-reset" onClick={handleReset}>
            Reset
          </button>
          <button type="button" className="filter-modal-apply" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
export { emptyFilters, DURATION_OPTIONS };
