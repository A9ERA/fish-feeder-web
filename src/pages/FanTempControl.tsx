import { useState, useEffect } from 'react';
import { Slider } from '@heroui/slider';
import { Switch } from '@heroui/switch';
import { FaTemperatureHigh, FaFan } from 'react-icons/fa';
import { HiStatusOnline } from 'react-icons/hi';

// Define the SliderStepMark type based on HeroUI docs
type SliderStepMark = {
  value: number;
  label: string;
};

const FanTempControl = () => {
  // States for fan control
  const [currentTemperature, setCurrentTemperature] = useState(25); // Actual current temperature
  const [temperatureThreshold, setTemperatureThreshold] = useState(30); // Fan activation threshold
  const [autoFanMode, setAutoFanMode] = useState(true);
  const [fanStatus, setFanStatus] = useState(false);

  // Define slider marks
  const temperatureMarks: SliderStepMark[] = [
    { value: 20, label: '20°C' },
    { value: 25, label: '25°C' },
    { value: 30, label: '30°C' },
    { value: 35, label: '35°C' },
    { value: 40, label: '40°C' }
  ];

  // Effect to control fan based on temperature when in auto mode
  useEffect(() => {
    if (autoFanMode) {
      // If temperature is above threshold, turn on fan
      setFanStatus(currentTemperature >= temperatureThreshold);
    }
  }, [currentTemperature, temperatureThreshold, autoFanMode]);

  // Handle manual fan toggle
  const handleManualFanToggle = () => {
    if (!autoFanMode) {
      setFanStatus(!fanStatus);
    }
  };

  // Simulate temperature changes (in a real app, this would come from a sensor)
  useEffect(() => {
    // This is just a simulation - in reality you would get this from an API or sensor
    const timer = setInterval(() => {
      // Random small fluctuation in temperature to simulate sensor readings
      setCurrentTemperature(prev => {
        const fluctuation = (Math.random() - 0.5) * 0.5;
        return Math.round((prev + fluctuation) * 10) / 10;
      });
    }, 3000);
    
    return () => clearInterval(timer);
  }, []);

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
              <div className="text-xs">Current Temperature</div>
              <div className="text-2xl font-bold text-gray-800">{currentTemperature.toFixed(1)}°C</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Fan Activation Threshold</div>
              <div className="text-2xl font-bold text-blue-600">{temperatureThreshold}°C</div>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-sm">
              {currentTemperature >= temperatureThreshold ? 
                `Temperature above threshold - Fan ${autoFanMode ? 'activated' : 'activation recommended'}` : 
                `Temperature below threshold - Fan ${autoFanMode ? 'deactivated' : 'not needed'}`}
            </div>
          </div>
          
          <div className="mt-6">
            <div className="mb-2 text-sm font-medium text-gray-700">Adjust Fan Activation Threshold</div>
            <Slider
              aria-label="Temperature Threshold"
              value={temperatureThreshold}
              onChange={(value: number | number[]) => setTemperatureThreshold(Number(value))}
              step={1}
              minValue={20}
              maxValue={40}
              className="w-full text-gray-800"
              color="primary"
              showTooltip
              marks={temperatureMarks}
              startContent={
                <div className="text-blue-500">
                  <FaTemperatureHigh />
                </div>
              }
            />
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
                <div className="font-medium text-gray-800">Auto Fan Mode</div>
                <div className="text-xs text-gray-500">
                  {autoFanMode ? 
                    'Fan will automatically turn on when temperature exceeds threshold' : 
                    'Fan can be manually controlled'}
                </div>
              </div>
              <Switch
                isSelected={autoFanMode}
                onChange={() => setAutoFanMode(!autoFanMode)}
                color="primary"
              />
            </div>

            {/* Manual Fan Control Toggle (disabled in auto mode) */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Manual Fan Control (Relay1)</div>
                <div className="text-xs text-gray-500">
                  {autoFanMode ? 
                    'Disabled in auto mode' : 
                    'Toggle the fan on/off manually'}
                </div>
              </div>
              <Switch
                isSelected={fanStatus}
                onChange={handleManualFanToggle}
                color="primary"
                isDisabled={autoFanMode}
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