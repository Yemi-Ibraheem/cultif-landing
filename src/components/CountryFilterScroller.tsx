import { useRef, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getCountryFlagUrl } from '../utils/countryFlagUrl';
import './CountryFilterScroller.css';

const INITIAL_COUNT = 20;
const LOAD_MORE_COUNT = 20;

/** Fisher–Yates shuffle; returns new array so we can depend on identity in useMemo. */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface CountryFilterScrollerProps {
  selectedCountry: string | null;
  onSelectCountry: (country: string | null) => void;
}

function CountryFilterScroller({ selectedCountry, onSelectCountry }: CountryFilterScrollerProps) {
  const rawCountries = useQuery(api.countries.getAllCountries) ?? [];
  const countryKey = rawCountries.map((c) => c._id).join(',');
  const shuffled = useMemo(() => shuffle(rawCountries), [countryKey]);
  const [displayCount, setDisplayCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const displayed = shuffled.slice(0, displayCount);
  const hasMore = displayCount < shuffled.length;

  useEffect(() => {
    if (!hasMore || !sentinelRef.current || !scrollerRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setDisplayCount((prev) => Math.min(prev + LOAD_MORE_COUNT, shuffled.length));
      },
      { root: scrollerRef.current, rootMargin: '100px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, shuffled.length]);

  return (
    <div ref={scrollerRef} className="country-filter-scroller">
      <button
        type="button"
        className={`country-filter-chip ${selectedCountry === null ? 'active' : ''}`}
        onClick={() => onSelectCountry(null)}
      >
        <span className="country-chip-all-icon" aria-hidden>🌍</span>
        <span>All</span>
      </button>

      {displayed.map((country) => (
        <button
          type="button"
          key={country._id}
          className={`country-filter-chip ${selectedCountry === country.name ? 'active' : ''}`}
          onClick={() => onSelectCountry(country.name)}
        >
          <img
              src={getCountryFlagUrl(country.code, '24x18')}
              alt=""
              className="country-chip-flag"
              width={24}
              height={18}
              loading="lazy"
            />
          <span>{country.name}</span>
        </button>
      ))}
      {hasMore && <div ref={sentinelRef} className="country-filter-sentinel" aria-hidden />}
    </div>
  );
}

export default CountryFilterScroller;
