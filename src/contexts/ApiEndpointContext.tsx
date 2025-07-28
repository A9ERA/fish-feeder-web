import { createContext, useContext, useState, ReactNode } from 'react';

type ApiEndpointContextType = {
  pi_server_endpoint: string;
  setEndpoint: (endpoint: string) => void;
  isLocal: boolean;
  switchToLocal: () => void;
  switchToRemote: () => void;
};

const ApiEndpointContext = createContext<ApiEndpointContextType | undefined>(undefined);

const LOCAL_ENDPOINT = 'http://localhost:5000';
const REMOTE_ENDPOINT = 'https://a9era.pagekite.me';
const STORAGE_KEY = 'pi_server_local_mode';

// Function to get initial endpoint from localStorage
const getInitialEndpoint = (): string => {
  if (typeof window !== 'undefined') {
    const isLocalMode = localStorage.getItem(STORAGE_KEY);
    // Default to remote mode for new users
    return isLocalMode === 'true' ? LOCAL_ENDPOINT : REMOTE_ENDPOINT;
  }
  return REMOTE_ENDPOINT; // Default to remote
};

export const ApiEndpointProvider = ({ children }: { children: ReactNode }) => {
  const [pi_server_endpoint, setPiServerEndpoint] = useState<string>(getInitialEndpoint);
  
  const setEndpoint = (endpoint: string) => {
    setPiServerEndpoint(endpoint);
  };
  
  const isLocal = pi_server_endpoint === LOCAL_ENDPOINT;
  
  const switchToLocal = () => {
    setPiServerEndpoint(LOCAL_ENDPOINT);
    localStorage.setItem(STORAGE_KEY, 'true');
  };
  
  const switchToRemote = () => {
    setPiServerEndpoint(REMOTE_ENDPOINT);
    localStorage.setItem(STORAGE_KEY, 'false');
  };
  
  const value: ApiEndpointContextType = {
    pi_server_endpoint,
    setEndpoint,
    isLocal,
    switchToLocal,
    switchToRemote,
  };
  
  return (
    <ApiEndpointContext.Provider value={value}>
      {children}
    </ApiEndpointContext.Provider>
  );
};

export const useApiEndpoint = () => {
  const context = useContext(ApiEndpointContext);
  if (context === undefined) {
    throw new Error('useApiEndpoint must be used within an ApiEndpointProvider');
  }
  return context;
};

export { LOCAL_ENDPOINT, REMOTE_ENDPOINT }; 