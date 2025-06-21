import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Switch } from '@heroui/switch';
import { FaLightbulb } from 'react-icons/fa';
import { useApiEndpoint } from '../contexts/ApiEndpointContext';
import { ref, set, onValue } from 'firebase/database';
import { database } from '../config/firebase';

const LedControl = () => {
  const { pi_server_endpoint } = useApiEndpoint();
  const [isLedOn, setIsLedOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load LED status from Firebase on component mount
  useEffect(() => {
    const systemStatusRef = ref(database, 'system_status/led_status');
    
    const unsubscribe = onValue(systemStatusRef, (snapshot) => {
      const ledStatus = snapshot.val();
      if (ledStatus !== null) {
        setIsLedOn(ledStatus);
        console.log('LED status loaded from Firebase:', ledStatus);
      }
    }, (error) => {
      console.error('Error loading LED status from Firebase:', error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Save LED status to Firebase
  const saveLedStatusToFirebase = async (status: boolean) => {
    try {
      const systemStatusRef = ref(database, 'system_status/led_status');
      await set(systemStatusRef, status);
      console.log('LED status saved to Firebase successfully:', status);
    } catch (error) {
      console.error('Error saving LED status to Firebase:', error);
    }
  };

  const handleLedToggle = async (enabled: boolean) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${pi_server_endpoint}/api/control/relay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device: 'led',
          action: enabled ? 'on' : 'off'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('LED control success:', result);
      setIsLedOn(enabled);
      
      // Save status to Firebase after successful API call
      await saveLedStatusToFirebase(enabled);
      
    } catch (error) {
      console.error('Error controlling LED:', error);
      // Reset switch to previous state on error
      setIsLedOn(!enabled);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLedOn = () => handleLedToggle(true);
  const handleLedOff = () => handleLedToggle(false);

  return (
    <div className="bg-content1 rounded-lg shadow-small p-5">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <FaLightbulb className={`text-2xl ${isLedOn ? 'text-yellow-500' : 'text-gray-400'}`} />
          <h3 className="text-lg font-semibold text-foreground">LED Light Control</h3>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">
            LED Status: <span className={`font-medium ${isLedOn ? 'text-green-600' : 'text-gray-500'}`}>
              {isLedOn ? 'On' : 'Off'}
            </span>
          </span>
          <Switch
            isSelected={isLedOn}
            onValueChange={handleLedToggle}
            isDisabled={isLoading}
            color="primary"
            size="lg"
          />
        </div>
        
        <div className="flex gap-3">
          <Button
            color="success"
            variant="flat"
            onClick={handleLedOn}
            isLoading={isLoading}
            isDisabled={isLoading || isLedOn}
            className="flex-1"
            startContent={<FaLightbulb />}
          >
            Turn On
          </Button>
          <Button
            color="danger"
            variant="flat"
            onClick={handleLedOff}
            isLoading={isLoading}
            isDisabled={isLoading || !isLedOn}
            className="flex-1"
            startContent={<FaLightbulb />}
          >
            Turn Off
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          Control the LED lighting system for your fish feeder
        </p>
      </div>
    </div>
  );
};

export default LedControl; 