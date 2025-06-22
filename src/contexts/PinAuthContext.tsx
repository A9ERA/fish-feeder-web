import { createContext, useContext, useState, ReactNode } from 'react';

type PinAuthContextType = {
  authenticatedPages: Set<string>;
  isPageAuthenticated: (pagePath: string) => boolean;
  authenticatePage: (pagePath: string) => void;
  clearAuthentication: () => void;
};

const PinAuthContext = createContext<PinAuthContextType | undefined>(undefined);

export const PinAuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticatedPages, setAuthenticatedPages] = useState<Set<string>>(new Set());

  const isPageAuthenticated = (pagePath: string): boolean => {
    return authenticatedPages.has(pagePath);
  };

  const authenticatePage = (pagePath: string): void => {
    setAuthenticatedPages(prev => new Set(prev).add(pagePath));
  };

  const clearAuthentication = (): void => {
    setAuthenticatedPages(new Set());
  };

  const value: PinAuthContextType = {
    authenticatedPages,
    isPageAuthenticated,
    authenticatePage,
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