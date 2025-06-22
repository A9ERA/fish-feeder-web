import { useState, useEffect } from 'react';
import { Slider } from '@heroui/slider';
import { Switch } from '@heroui/switch';
import { Button } from '@heroui/button';
import { FaTemperatureHigh, FaFan, FaSave } from 'react-icons/fa';
import { HiStatusOnline } from 'react-icons/hi';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../config/firebase';
import { SensorsData } from '../types';
import { useApiEndpoint } from '../contexts/ApiEndpointContext';

// Define the SliderStepMark type based on HeroUI docs
type SliderStepMark = {
  value: number;
  label: string;
};

const FanTempControl = () => {
  const { pi_server_endpoint } = useApiEndpoint();
  
  // States for fan control
  const [currentTemperature, setCurrentTemperature] = useState<number | string>('N/A'); // Actual current temperature from Firebase
  const [temperatureThreshold, setTemperatureThreshold] = useState(30); // Fan activation threshold
  const [originalThreshold, setOriginalThreshold] = useState(30); // To track changes
  const [autoFanMode, setAutoFanMode] = useState(true);
  const [fanStatus, setFanStatus] = useState(false);
  const [sensorsData, setSensorsData] = useState<SensorsData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isManualFanLoading, setIsManualFanLoading] = useState(false);

  // Define slider marks
  const temperatureMarks: SliderStepMark[] = [
    { value: 20, label: '20°C' },
    { value: 25, label: '25°C' },
    { value: 30, label: '30°C' },
    { value: 35, label: '35°C' },
    { value: 40, label: '40°C' }
  ];

  // Helper function to get sensor value
  const getSensorValue = (sensors: SensorsData['sensors'], sensorName: keyof SensorsData['sensors'], valueType: string): number | string => {
    if (!sensors[sensorName]) return 'N/A';
    const value = sensors[sensorName].values.find(v => v.type === valueType);
    return value ? value.value : 'N/A';
  };

  // Firebase listeners for sensors data
  useEffect(() => {
    const sensorsRef = ref(database, 'sensors_data');
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorsData(data);
        // Get system temperature from DHT22_SYSTEM
        const systemTemp = getSensorValue(data.sensors, 'DHT22_SYSTEM', 'temperature');
        setCurrentTemperature(systemTemp);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase listener for fan activation threshold
  useEffect(() => {
    const thresholdRef = ref(database, 'system_status/fan_activation_threshold');
    const unsubscribe = onValue(thresholdRef, (snapshot) => {
      const threshold = snapshot.val();
      if (threshold !== null) {
        setTemperatureThreshold(threshold);
        setOriginalThreshold(threshold);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase listener for auto fan mode
  useEffect(() => {
    const autoModeRef = ref(database, 'system_status/is_auto_temp_control');
    const unsubscribe = onValue(autoModeRef, (snapshot) => {
      const autoMode = snapshot.val();
      if (autoMode !== null) {
        setAutoFanMode(autoMode);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase listener for fan status
  useEffect(() => {
    const fanStatusRef = ref(database, 'system_status/is_fan_on');
    const unsubscribe = onValue(fanStatusRef, (snapshot) => {
      const fanOn = snapshot.val();
      if (fanOn !== null) {
        setFanStatus(fanOn);
      }
    });
    return () => unsubscribe();
  }, []);

  // Effect to control fan based on temperature when in auto mode
  useEffect(() => {
    if (autoFanMode && typeof currentTemperature === 'number') {
      // If temperature is above threshold, turn on fan
      const shouldFanBeOn = currentTemperature >= temperatureThreshold;
      if (fanStatus !== shouldFanBeOn) {
        // Update Firebase when fan status should change in auto mode
        set(ref(database, 'system_status/is_fan_on'), shouldFanBeOn)
          .catch(error => console.error('Error updating fan status in Firebase:', error));
      }
    }
  }, [currentTemperature, temperatureThreshold, autoFanMode, fanStatus]);

  // Handle manual fan toggle
  const handleManualFanToggle = async () => {
    if (!autoFanMode && !isManualFanLoading) {
      setIsManualFanLoading(true);
      const newFanStatus = !fanStatus;
      
      try {
        const response = await fetch(`${pi_server_endpoint}/api/control/relay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device: 'fan',
            action: newFanStatus ? 'on' : 'off'
          }),
        });

        const result = await response.json();
        
        if (response.ok && result.status === 'success') {
          // Update Firebase when API call is successful
          await set(ref(database, 'system_status/is_fan_on'), newFanStatus);
        } else {
          console.error('Failed to control fan:', result.message || 'Unknown error');
          // Could add toast notification here
        }
      } catch (error) {
        console.error('Error controlling fan:', error);
        // Could add toast notification here
      } finally {
        setIsManualFanLoading(false);
      }
    }
  };

  // Handle auto fan mode toggle
  const handleAutoFanModeToggle = async () => {
    try {
      await set(ref(database, 'system_status/is_auto_temp_control'), !autoFanMode);
    } catch (error) {
      console.error('Error updating auto fan mode:', error);
    }
  };

  // Handle save threshold
  const handleSaveThreshold = async () => {
    setIsSaving(true);
    try {
      await set(ref(database, 'system_status/fan_activation_threshold'), temperatureThreshold);
      setOriginalThreshold(temperatureThreshold);
    } catch (error) {
      console.error('Error saving threshold:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if threshold has changed
  const hasThresholdChanged = temperatureThreshold !== originalThreshold;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Fan & Temperature Control</h1>

      {/* Temperature Display and Control Section */}
      <div className="space-y-6">
        <div className="bg-content1 rounded-lg shadow-sm p-5">
          <div className="flex items-center text-blue-500 mb-3">
            <FaTemperatureHigh className="mr-2 text-xl" />
            <span className="text-lg font-medium">Control Box Temperature</span>
          </div>
          
          <div className="flex justify-between mb-4">
            <div>
              <div className="text-xs text-default-500">Current Temperature</div>
              <div className="text-2xl font-bold text-foreground">
                {typeof currentTemperature === 'number' ? currentTemperature.toFixed(1) : currentTemperature}°C
              </div>
            </div>
            <div>
              <div className="text-xs text-default-500">Fan Activation Threshold</div>
              <div className="text-2xl font-bold text-blue-600">{temperatureThreshold}°C</div>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-sm">
              {typeof currentTemperature === 'number' && currentTemperature >= temperatureThreshold ? 
                `Temperature above threshold - Fan ${autoFanMode ? 'activated' : 'activation recommended'}` : 
                `Temperature below threshold - Fan ${autoFanMode ? 'deactivated' : 'not needed'}`}
            </div>
          </div>
          
          <div className="mt-6">
            <div className="mb-2 text-sm font-medium text-foreground">Adjust Fan Activation Threshold</div>
            <Slider
              aria-label="Temperature Threshold"
              value={temperatureThreshold}
              onChange={(value: number | number[]) => setTemperatureThreshold(Number(value))}
              step={1}
              minValue={20}
              maxValue={40}
              className="w-full text-default-500"
              color="primary"
              showTooltip
              marks={temperatureMarks}
              startContent={
                <div className="text-blue-500">
                  <FaTemperatureHigh />
                </div>
              }
            />
            <div className="mt-12 flex justify-end">
              <Button
                color="primary"
                variant="solid"
                size="sm"
                startContent={<FaSave />}
                onPress={handleSaveThreshold}
                isDisabled={!hasThresholdChanged}
                isLoading={isSaving}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Fan Control Section */}
      <div className="space-y-6">
        <div className="bg-content1 rounded-lg shadow-sm p-5">
          <div className="flex items-center text-blue-500 mb-4">
            <FaFan className="mr-2 text-xl" />
            <span className="text-lg font-medium">Fan Control</span>
          </div>

          <div className="space-y-6">
            {/* Auto Mode Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">Auto Fan Mode</div>
                <div className="text-xs text-default-500">
                  {autoFanMode ? 
                    'Fan will automatically turn on when temperature exceeds threshold' : 
                    'Fan can be manually controlled'}
                </div>
              </div>
              <Switch
                isSelected={autoFanMode}
                onChange={handleAutoFanModeToggle}
                color="primary"
              />
            </div>

            {/* Manual Fan Control Toggle (disabled in auto mode) */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">Manual Fan Control (Relay1)</div>
                <div className="text-xs text-default-500">
                  {autoFanMode ? 
                    'Disabled in auto mode' : 
                    isManualFanLoading ? 
                      'Controlling fan...' : 
                      'Toggle the fan on/off manually'}
                </div>
              </div>
              <Switch
                isSelected={fanStatus}
                onChange={handleManualFanToggle}
                color="primary"
                isDisabled={autoFanMode || isManualFanLoading}
              />
            </div>

            {/* Fan Status Display */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center">
                <div className="flex items-center mr-4">
                  <HiStatusOnline className={`mr-1 ${fanStatus ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm font-medium text-gray-800">Fan Status:</span>
                </div>
                <div className={`flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                  fanStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <FaFan className={`mr-1 ${fanStatus ? 'animate-spin' : ''}`} />
                  {fanStatus ? 'RUNNING' : 'STOPPED'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FanTempControl; 