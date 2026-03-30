import React from 'react';
import Sidebar from '../components/Sidebar';
import BottomNavigation from '../components/BottomNavigation';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`main-layout ${className}`.trim()}>
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <div className="mobile-nav-wrapper">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default MainLayout;
