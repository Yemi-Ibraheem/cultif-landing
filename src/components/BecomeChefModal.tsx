import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import CancelIcon from '../assets/Cancel.svg';
import './BecomeChefModal.css';

const SPECIALTY_OPTIONS = [
  'Italian', 'Mexican', 'Japanese', 'Chinese', 'Indian',
  'French', 'Thai', 'Mediterranean', 'American', 'Korean',
  'Baking', 'Grilling', 'Vegan', 'Vegetarian', 'Street Food',
  'Desserts', 'Healthy Eating', 'Meal Prep', 'Seafood', 'Breakfast',
];

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

function BecomeChefModal({ onClose, onSuccess }: Props) {
  const becomeChef = useMutation(api.users.becomeChef);

  const [bio, setBio] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await becomeChef({
        bio: bio.trim() || undefined,
        specialties: selectedSpecialties,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="become-chef-backdrop" onClick={onClose}>
      <div className="become-chef-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="become-chef-handle" />

        <div className="become-chef-header">
          <h2 className="become-chef-title">Become a Chef</h2>
          <button className="become-chef-close" onClick={onClose} aria-label="Close">
            <img src={CancelIcon} alt="Close" width={24} height={24} />
          </button>
        </div>

        <p className="become-chef-subtitle">
          Share your passion with the world. Create recipes, build a following, and earn from your cooking.
        </p>

        <form className="become-chef-form" onSubmit={handleSubmit}>
          <label className="become-chef-label">
            Bio <span className="become-chef-optional">(optional)</span>
            <textarea
              className="become-chef-bio"
              placeholder="Tell people about yourself and your cooking style…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              rows={3}
            />
            <span className="become-chef-char-count">{bio.length}/300</span>
          </label>

          <div className="become-chef-specialties-section">
            <p className="become-chef-specialties-label">
              Specialties <span className="become-chef-optional">(pick any)</span>
            </p>
            <div className="become-chef-specialties-grid">
              {SPECIALTY_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`become-chef-specialty-chip${selectedSpecialties.includes(s) ? ' selected' : ''}`}
                  onClick={() => toggleSpecialty(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="become-chef-error">{error}</p>}

          <button
            type="submit"
            className="become-chef-submit"
            disabled={loading}
          >
            {loading ? 'Setting up…' : "Let's cook 👨‍🍳"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BecomeChefModal;
