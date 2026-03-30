import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

import cultifLogoBlack from '../assets/Logo/Black.png';
import homeBlack from '../assets/Side bar/homeblack.svg';
import homeGreen from '../assets/Side bar/homegreen.svg';
import exploreBlack from '../assets/Side bar/exploreblack.svg';
import exploreGreen from '../assets/Side bar/exploregreen.svg';
import planBlack from '../assets/Side bar/planblack.svg';
import planGreen from '../assets/Side bar/plangreen.svg';
import profileBlack from '../assets/Side bar/profileblack.svg';
import profileGreen from '../assets/Side bar/profilegreen.svg';

const tabs = [
  { id: 'home',    path: '/discover', icon: homeBlack, activeIcon: homeGreen, label: 'Home' },
  { id: 'explore', path: '/explore',  icon: exploreBlack, activeIcon: exploreGreen, label: 'Explore' },
  { id: 'plan',    path: '/plans',    icon: planBlack, activeIcon: planGreen, label: 'Plans' },
  { id: 'create',  path: '/create',   icon: null, activeIcon: null, label: 'Create' },
  { id: 'you',     path: '/profile',  icon: profileBlack, activeIcon: profileGreen, label: 'Profile', hasNotification: true },
];

function Sidebar() {
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
    <nav className="sidebar">
      <div className="sidebar-logo">
        <img src={cultifLogoBlack} alt="Cultif" className="sidebar-logo-img" />
      </div>
      <div className="sidebar-menu">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`sidebar-item sidebar-item-${tab.id}${isActive ? ' active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <div className="sidebar-icon-wrapper">
                {tab.icon ? (
                  <img
                    src={isActive ? tab.activeIcon! : tab.icon}
                    alt=""
                    className="sidebar-icon-img"
                  />
                ) : (
                  <svg className="sidebar-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
                {tab.hasNotification && (
                  <span className="sidebar-notification-dot" />
                )}
              </div>
              <span className="sidebar-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default Sidebar;
