import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getCountryFlagUrl } from '../utils/countryFlagUrl';
import './SuggestedCreators.css';

export default function SuggestedCreators() {
  const navigate = useNavigate();
  const suggestedChefs = useQuery(api.users.getSuggestedChefs) || [];
  const allCountries = useQuery(api.countries.getAllCountries) || [];

  if (suggestedChefs.length === 0) return null;

  return (
    <div className="suggested-creators-container">
      <div className="suggested-header">
        <h2>Suggested for you</h2>
      </div>
      <div className="suggested-list">
        {suggestedChefs.map((chef) => {
          // Create the synopsis from countries and diet tags
          const parts = [];
          const countryName = chef.countries && chef.countries.length > 0 ? chef.countries[0] : null;
          if (countryName) {
            parts.push(countryName);
          }
          if (chef.dietaryTags && chef.dietaryTags.length > 0) {
            parts.push(chef.dietaryTags[0]);
          }
          const synopsis = parts.join(' • ') || 'Chef';

          // Get the flag for the first country
          const countryCode = countryName ? allCountries.find((c: any) => c.name === countryName)?.code : null;
          const flagUrl = countryCode ? getCountryFlagUrl(countryCode, '24x18') : null;

          return (
            <div key={chef._id} className="suggested-card" onClick={() => navigate(`/chef/${chef._id}`)}>
              <div className="suggested-avatar-wrapper">
                <div className="suggested-avatar">
                  {chef.avatar ? (
                    <img src={chef.avatar} alt={chef.name} />
                  ) : (
                    <div className="avatar-placeholder">{chef.name.charAt(0)}</div>
                  )}
                </div>
                {flagUrl && (
                  <img src={flagUrl} alt="" className="suggested-avatar-flag" />
                )}
              </div>
              <div className="suggested-info">
                <span className="suggested-name">{chef.name}</span>
                <span className="suggested-synopsis">{synopsis}</span>
              </div>
              <button
                className="suggested-follow-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  // For now, navigate to profile or show a toast
                  navigate(`/chef/${chef._id}`);
                }}
              >
                Follow
              </button>
            </div>
          );
        })}
      </div>
      <div className="suggested-footer">
        © 2026 Cultif
      </div>
    </div>
  );
}
