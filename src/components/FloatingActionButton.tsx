import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import CreateButtonSvg from '../assets/CTAs/Create button.svg';
import './FloatingActionButton.css';

function FloatingActionButton() {
  const navigate = useNavigate();
  const user = useQuery(api.users.currentUser);

  const handleClick = () => {
    if (user === undefined) return;
    if (user?.isChef) {
      navigate('/create');
    } else {
      navigate('/chef-onboarding');
    }
  };

  return (
    <button
      className="fab"
      onClick={handleClick}
      disabled={user === undefined}
      aria-label="Create recipe or meal plan"
    >
      <img src={CreateButtonSvg} alt="" className="fab-icon" />
    </button>
  );
}

export default FloatingActionButton;
