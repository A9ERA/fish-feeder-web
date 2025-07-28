import { createContext, useContext, useState, ReactNode } from 'react';

type PinAuthContextType = {
  isAuthenticated: boolean;
  isPageAuthenticated: (pagePath: string) => boolean;
  authenticate: () => void;
  clearAuthentication: () => void;
};

const PinAuthContext = createContext<PinAuthContextType | undefined>(undefined);

export const PinAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const isPageAuthenticated = (pagePath: string): boolean => {
    // Dashboard doesn't require authentication
    if (pagePath === '/dashboard') {
      return true;
    }
    // All other pages require global authentication
    return isAuthenticated;
  };

  const authenticate = (): void => {
    setIsAuthenticated(true);
  };

  const clearAuthentication = (): void => {
    setIsAuthenticated(false);
  };

  const value: PinAuthContextType = {
    isAuthenticated,
    isPageAuthenticated,
    authenticate,
    clearAuthentication,
  };

  return (
    <PinAuthContext.Provider value={value}>
      {children}
    </PinAuthContext.Provider>
  );
};

export const usePinAuth = () => {
  const context = useContext(PinAuthContext);
  if (context === undefined) {
    throw new Error('usePinAuth must be used within a PinAuthProvider');
  }
  return context;
}; 