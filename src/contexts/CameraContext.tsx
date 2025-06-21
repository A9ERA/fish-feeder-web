import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../config/firebase';

interface CameraContextType {
  isCameraEnabled: boolean | null;
  toggleCamera: () => Promise<void>;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const useCameraContext = () => {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error('useCameraContext must be used within a CameraProvider');
  }
  return context;
};

interface CameraProviderProps {
  children: ReactNode;
}

export const CameraProvider = ({ children }: CameraProviderProps) => {
  const [isCameraEnabled, setIsCameraEnabled] = useState<boolean | null>(null);

  // Load Camera status from Firebase
  useEffect(() => {
    const cameraStatusRef = ref(database, 'system_status/live_cam_on');
    
    const unsubscribe = onValue(cameraStatusRef, (snapshot) => {
      const cameraStatus = snapshot.val();
      // Default to true if no value exists
      setIsCameraEnabled(cameraStatus !== null ? cameraStatus : true);
    }, (error) => {
      console.error('Error loading camera status from Firebase:', error);
      // Default to true on error
      setIsCameraEnabled(true);
    });

    return () => unsubscribe();
  }, []);

  const toggleCamera = async () => {
    if (isCameraEnabled !== null) {
      const newStatus = !isCameraEnabled;
      try {
        // Save to Firebase first
        const cameraStatusRef = ref(database, 'system_status/live_cam_on');
        await set(cameraStatusRef, newStatus);
        // Local state will be updated automatically by the onValue listener
        console.log('Camera status saved to Firebase:', newStatus);
      } catch (error) {
        console.error('Error saving camera status to Firebase:', error);
        // Still update local state if Firebase fails
        setIsCameraEnabled(newStatus);
      }
    }
  };

  return (
    <CameraContext.Provider value={{ isCameraEnabled, toggleCamera }}>
      {children}
    </CameraContext.Provider>
  );
}; 