import { createContext, useContext, useState, ReactNode } from 'react';

type SplashContextType = {
  hasVisitedSplash: boolean;
  markSplashAsVisited: () => void;
};

const SplashContext = createContext<SplashContextType | undefined>(undefined);

export const SplashProvider = ({ children }: { children: ReactNode }) => {
  const [hasVisitedSplash, setHasVisitedSplash] = useState(false);

  const markSplashAsVisited = () => {
    setHasVisitedSplash(true);
  };

  const value: SplashContextType = {
    hasVisitedSplash,
    markSplashAsVisited,
  };

  return (
    <SplashContext.Provider value={value}>
      {children}
    </SplashContext.Provider>
  );
};

export const useSplash = () => {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
}; 