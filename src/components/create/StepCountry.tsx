import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { getCountryFlagUrl } from '../../utils/countryFlagUrl';
import './StepCountry.css';

interface StepCountryProps {
  country: string;
  countryFlag: string;
  onCountryChange: (country: string, flag: string) => void;
}

function StepCountry({ country, onCountryChange }: StepCountryProps) {
  const [search, setSearch] = useState('');
  const countries = useQuery(api.countries.getAllCountries) ?? [];

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="step-country">
      <h2 className="step-title">Select Country</h2>
      <p className="step-subtitle">Where does this dish originate from?</p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search country..."
        className="country-search"
      />

      <div className="country-grid">
        {filtered.map((c) => (
          <button
            key={c._id}
            className={`country-card ${country === c.name ? 'selected' : ''}`}
            onClick={() => onCountryChange(c.name, c.flagEmoji)}
          >
            <img
              src={getCountryFlagUrl(c.code, '40x30')}
              alt=""
              className="country-flag-img"
              width={40}
              height={30}
              loading="lazy"
            />
            <span className="country-name">{c.name}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="country-no-results">No countries found</p>
        )}
      </div>
    </div>
  );
}

export default StepCountry;
