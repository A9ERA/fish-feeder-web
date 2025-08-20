import { useState } from 'react';
import { Slider } from '@heroui/slider';
import { Button } from '@heroui/button';
import { FaSlidersH, FaPlay, FaStop } from 'react-icons/fa';
import { HiCog } from 'react-icons/hi';
import { RiBlazeFill } from 'react-icons/ri';
import { useApiEndpoint } from '../contexts/ApiEndpointContext';

// Define the SliderStepMark type based on HeroUI docs
type SliderStepMark = {
  value: number;
  label: string;
};

const MotorPWM = () => {
  // Get API endpoint from context
  const { pi_server_endpoint } = useApiEndpoint();

  // PWM control states
  const [blowerPWM, setBlowerPWM] = useState(1);

  // Feeder motor control states
  const [feederMotorStatus, setFeederMotorStatus] = useState<'open' | 'close'>('close');

  // Manual control states
  const [blowerStatus, setBlowerStatus] = useState<'running' | 'stopped'>('stopped');

  // Refs for button press handling
  // const upButtonPressTimer = useRef<NodeJS.Timeout | null>(null);
  // const downButtonPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Define slider marks
  const pwmMarks: SliderStepMark[] = [
    { value: 0, label: '0%' },
    { value: 25, label: '25%' },
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 100, label: '100%' }
  ];

  // Function to map PWM percentage to blower API value
  const mapPWMToBlowerValue = (percentage: number): number => {
    if (percentage === 0) return 0;
    if (percentage === 1) return 230;
    // For 1-100%, map to 230-255
    return Math.round(230 + (percentage - 1) * (255 - 230) / (100 - 1));
  };



  // API call function for blower speed control
  const callBlowerSpeedAPI = async (percentage: number) => {
    const apiValue = mapPWMToBlowerValue(percentage);

    try {
      const response = await fetch(`${pi_server_endpoint}/api/control/blower`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: "speed", value: apiValue }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`Blower speed API call successful: ${percentage}% (value: ${apiValue})`);
    } catch (error) {
      console.error(`Error calling blower speed API for ${percentage}%:`, error);
    }
  };



  // API call function for feeder motor control
  const callFeederMotorAPI = async (action: 'open' | 'close') => {
    try {
      const response = await fetch(`${pi_server_endpoint}/api/control/feedermotor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`Feeder motor API call successful: ${action}`);
      
      // Update status based on action
      setFeederMotorStatus(action);
    } catch (error) {
      console.error(`Error calling feeder motor API for action "${action}":`, error);
    }
  };



  // API call function for manual blower control
  const callBlowerManualAPI = async (action: 'start' | 'stop') => {
    try {
      const response = await fetch(`${pi_server_endpoint}/api/control/blower`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`Blower manual control API call successful: ${action}`);
      
      // Update status based on action
      setBlowerStatus(action === 'start' ? 'running' : 'stopped');
    } catch (error) {
      console.error(`Error calling blower manual control API for action "${action}":`, error);
    }
  };



  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Motor & PWM Settings</h1>

      {/* PWM Controls Section */}
      <div className="space-y-6">
        <div className="bg-content1 rounded-lg shadow-small p-5">
          <div className="flex items-center text-blue-500 mb-4">
            <FaSlidersH className="mr-2 text-xl" />
            <span className="text-lg font-medium">PWM Controls</span>
          </div>

          <div className="space-y-8">
            {/* Blower Fan PWM Control */}
            <div className="space-y-2 pt-4 mb-4">
              <div className="flex items-center mb-2">
                <RiBlazeFill className="text-gray-700 mr-2 text-lg" />
                <span className="text-foreground font-medium">PWM2 → Blower Fan</span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="text-default-500 text-sm">Current Setting</div>
                <div className="text-lg font-bold text-blue-600">{blowerPWM}%</div>
              </div>

              <Slider
                aria-label="Blower Fan PWM"
                value={blowerPWM}
                onChange={(value: number | number[]) => {
                  setBlowerPWM(Number(value));
                }}
                onChangeEnd={(value: number | number[]) => {
                  callBlowerSpeedAPI(Number(value));
                }}
                step={1}
                minValue={0}
                maxValue={100}
                className="w-full text-default-500"
                color="primary"
                showTooltip={true}
                marks={pwmMarks}
              />
              <br />
              <br />
            </div>
          </div>
        </div>
      </div>

      {/* Manual API Test Controls Section */}
      <div className="space-y-10">
        <div className="bg-content1 rounded-lg shadow-small p-5">
          <div className="flex items-center text-green-500 mb-4">
            <FaPlay className="mr-2 text-xl" />
            <span className="text-lg font-medium">Manual Test Controls</span>
          </div>

          <div className="space-y-10">
            {/* Blower Manual Control */}
            <div className="space-y-4">
              <div className="flex items-center mb-3">
                <RiBlazeFill className="text-gray-700 mr-2 text-lg" />
                <span className="text-foreground font-medium">Blower Control</span>
              </div>

              <div className="text-center mb-3">
                <div className="text-sm font-medium text-default-800">Current Status</div>
                <div className={`text-md mt-1 font-bold ${
                  blowerStatus === 'running' ? 'text-green-600' : 'text-default-400'
                }`}>
                  {blowerStatus.toUpperCase()}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  color="success"
                  variant={blowerStatus === 'running' ? 'solid' : 'bordered'}
                  onClick={() => callBlowerManualAPI('start')}
                  className="flex-1"
                >
                  <FaPlay className="mr-1" />
                  Start
                </Button>
                <Button
                  color="danger"
                  variant={blowerStatus === 'stopped' ? 'solid' : 'bordered'}
                  onClick={() => callBlowerManualAPI('stop')}
                  className="flex-1"
                >
                  <FaStop className="mr-1" />
                  Stop
                </Button>
              </div>
            </div>

            {/* Feeder Motor Manual Control */}
            <div className="space-y-4">
              <div className="flex items-center mb-3">
                <HiCog className="text-gray-700 mr-2 text-lg" />
                <span className="text-foreground font-medium">Feeder Motor Control</span>
              </div>

              <div className="text-center mb-3">
                <div className="text-sm font-medium text-default-800">Current Status</div>
                <div className={`text-md mt-1 font-bold ${
                  feederMotorStatus === 'open' ? 'text-blue-600' : 
                  feederMotorStatus === 'close' ? 'text-orange-600' : 
                  'text-default-400'
                }`}>
                  {feederMotorStatus.toUpperCase()}
                </div>
              </div>

              <div className="flex justify-center gap-2">
                <Button
                  color="primary"
                  variant={feederMotorStatus === 'open' ? 'solid' : 'bordered'}
                  onClick={() => callFeederMotorAPI('open')}
                  className="flex-1"
                >
                  <FaPlay className="mr-1" />
                  Open
                </Button>
                <Button
                  color="warning"
                  variant={feederMotorStatus === 'close' ? 'solid' : 'bordered'}
                  onClick={() => callFeederMotorAPI('close')}
                  className="flex-1"
                >
                  <FaStop className="mr-1" />
                  Close
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Note:</strong> These buttons are for testing manual API control directly, separate from the PWM controls above.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorPWM; 