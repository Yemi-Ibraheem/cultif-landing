import { useNavigate, useLocation } from 'react-router-dom';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface RequireAuthProps {
  children: React.ReactNode;
  /** If true, redirect to /role-select when authenticated but hasCompletedOnboarding is false. Set false for /role-select and /onboarding. */
  redirectToOnboardingIfNeeded?: boolean;
}

function RequireAuth({ children, redirectToOnboardingIfNeeded = true }: RequireAuthProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/auth', { replace: true, state: { from: location.pathname } });
    return null;
  }

  if (redirectToOnboardingIfNeeded && user && user.hasCompletedOnboarding === false) {
    const path = location.pathname;
    if (path !== '/role-select' && path !== '/onboarding') {
      navigate('/role-select', { replace: true });
      return null;
    }
  }

  return <>{children}</>;
}

export default RequireAuth;
