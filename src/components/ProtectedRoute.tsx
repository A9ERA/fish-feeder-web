import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSplash } from '../contexts/SplashContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasVisitedSplash } = useSplash();

  useEffect(() => {
    // If user hasn't visited splash and is trying to access any other route
    if (!hasVisitedSplash && location.pathname !== '/') {
      // Redirect to splash screen
      navigate('/');
    }
  }, [hasVisitedSplash, navigate, location.pathname]);

  // Don't render children until user has visited splash
  if (!hasVisitedSplash && location.pathname !== '/') {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 