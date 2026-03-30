import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNavigation.css';

import HomeLight from '../assets/Bottom bar/Home light.svg';
import ExploreLight from '../assets/Bottom bar/Explore light.svg';
import PlanLight from '../assets/Bottom bar/Plan light.svg';
import YouLight from '../assets/Bottom bar/You light.svg';

const tabs = [
  { id: 'home',    path: '/discover', icon: HomeLight },
  { id: 'explore', path: '/explore',  icon: ExploreLight },
  { id: 'plan',    path: '/plans',    icon: PlanLight },
  { id: 'you',     path: '/profile',  icon: YouLight, hasNotification: true },
];

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname.startsWith('/profile')) return 'you';
    if (location.pathname.startsWith('/plans')) return 'plan';
    if (location.pathname.startsWith('/explore')) return 'explore';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="bottom-navigation">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-item nav-item-${tab.id}${isActive ? ' active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <div className="nav-icon-wrapper">
              <div 
                className="nav-icon"
                style={{ 
                  WebkitMaskImage: `url("${tab.icon}")`,
                  maskImage: `url("${tab.icon}")`
                }}
              />
              {tab.hasNotification && (
                <span className="notification-dot" />
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNavigation;
