import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import PinModal from './PinModal';
import { usePinAuth } from '../contexts/PinAuthContext';
import AlertModal from './AlertModal';

const Layout = () => {
  const location = useLocation();
  const { isPageAuthenticated, authenticate } = usePinAuth();
  const [showPinModal, setShowPinModal] = useState(false);
  const [currentPageName, setCurrentPageName] = useState('');

  // Define page names mapping
  const pageNames: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/feed-control': 'Feed Control',
    '/fan-temp-control': 'Fan & Temperature Control',
    '/motor-pwm': 'Motor & PWM Settings',
    '/settings': 'Settings'
  };

  // Check if current page needs PIN authentication
  useEffect(() => {
    const currentPath = location.pathname;
    const pageName = pageNames[currentPath] || 'Unknown Page';
    
    // Dashboard doesn't require PIN
    if (currentPath === '/dashboard') {
      setShowPinModal(false);
      return;
    }

    // Check if user is globally authenticated
    if (!isPageAuthenticated(currentPath)) {
      setCurrentPageName(pageName);
      setShowPinModal(true);
    } else {
      setShowPinModal(false);
    }
  }, [location.pathname, isPageAuthenticated]);

  const handlePinVerified = () => {
    authenticate();
    setShowPinModal(false);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 max-h-screen overflow-y-scroll md:pb-6 pb-24 md:mb-0 mb-[66px]">
        <Outlet />
      </main>
      
      {/* PIN Modal */}
      <PinModal
        isOpen={showPinModal}
        onPinVerified={handlePinVerified}
        pageName={currentPageName}
      />

      {/* Global Alerts Modal */}
      <AlertModal />
    </div>
  );
};

export default Layout; 