import { useState } from 'react';
import { Slider } from '@heroui/slider';
import { Button } from '@heroui/button';
import { FaSlidersH, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { HiCog } from 'react-icons/hi';
import { RiBlazeFill } from 'react-icons/ri';

// Define the SliderStepMark type based on HeroUI docs
type SliderStepMark = {
  value: number;
  label: string;
};

const MotorPWM = () => {
  // PWM control states
  const [augerPWM, setAugerPWM] = useState(50);
  const [blowerPWM, setBlowerPWM] = useState(70);
  
  // Actuator control states
  const [actuatorMoving, setActuatorMoving] = useState<'up' | 'down' | null>(null);
  
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
  
  // Handle actuator button press
  const handleActuatorButtonDown = (direction: 'up' | 'down') => {
    setActuatorMoving(direction);
    
    // In a real application, this would trigger an API call to start moving the actuator
    console.log(`Actuator moving ${direction}`);
  };
  
  // Handle actuator button release
  const handleActuatorButtonUp = () => {
    setActuatorMoving(null);
    
    // In a real application, this would trigger an API call to stop the actuator
    console.log('Actuator stopped');
  };
  
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Motor & PWM Settings</h1>
      
      {/* PWM Controls Section */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
          <div className="flex items-center text-blue-500 mb-4">
            <FaSlidersH className="mr-2 text-xl" />
            <span className="text-lg font-medium">PWM Controls</span>
          </div>
          
          <div className="space-y-8">
            {/* Auger Motor PWM Control */}
            <div className="space-y-2">
              <div className="flex items-center mb-2">
                <HiCog className="text-gray-700 mr-2 text-lg" />
                <span className="text-gray-800 font-medium">PWM1 → Auger Motor</span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-500 text-sm">Current Setting</div>
                <div className="text-lg font-bold text-blue-600">{augerPWM}%</div>
              </div>
              
              <Slider
                aria-label="Auger Motor PWM"
                value={augerPWM}
                onChange={(value: number | number[]) => setAugerPWM(Number(value))}
                step={1}
                minValue={0}
                maxValue={100}
                className="w-full text-gray-800"
                color="primary"
                showTooltip
                marks={pwmMarks}
              />
            </div>
            
            {/* Blower Fan PWM Control */}
            <div className="space-y-2 pt-4 mb-4">
              <div className="flex items-center mb-2">
                <RiBlazeFill className="text-gray-700 mr-2 text-lg" />
                <span className="text-gray-800 font-medium">PWM2 → Blower Fan</span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-500 text-sm">Current Setting</div>
                <div className="text-lg font-bold text-blue-600">{blowerPWM}%</div>
              </div>
              
              <Slider
                aria-label="Blower Fan PWM"
                value={blowerPWM}
                onChange={(value: number | number[]) => setBlowerPWM(Number(value))}
                step={1}
                minValue={0}
                maxValue={100}
                className="w-full text-gray-800"
                color="primary"
                showTooltip
                marks={pwmMarks}
              />
              <br />
              <br />
            </div>
          </div>
        </div>
      </div>
      
      {/* Actuator Control Section */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
          <div className="flex items-center text-blue-500 mb-4">
            <HiCog className="mr-2 text-xl animate-spin animate-[spin_3s_linear_infinite]" />
            <span className="text-lg font-medium">Manual Actuator Control</span>
          </div>
          
          <div className="text-sm text-gray-500 mb-4">
            Press and hold buttons to move the actuator. Release to stop.
          </div>
          
          <div className="flex justify-center gap-6">
            {/* Up Button */}
            <Button
              color="primary"
              className="h-24 w-24 rounded-full flex flex-col items-center justify-center"
              onMouseDown={() => handleActuatorButtonDown('up')}
              onMouseUp={handleActuatorButtonUp}
              onMouseLeave={handleActuatorButtonUp}
              onTouchStart={() => handleActuatorButtonDown('up')}
              onTouchEnd={handleActuatorButtonUp}
            >
              <FaArrowUp className="text-xl mb-1" />
              <span>UP</span>
              <div className={`mt-1 h-2 w-2 rounded-full ${actuatorMoving === 'up' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </Button>
            
            {/* Down Button */}
            <Button
              color="primary"
              className="h-24 w-24 rounded-full flex flex-col items-center justify-center"
              onMouseDown={() => handleActuatorButtonDown('down')}
              onMouseUp={handleActuatorButtonUp}
              onMouseLeave={handleActuatorButtonUp}
              onTouchStart={() => handleActuatorButtonDown('down')}
              onTouchEnd={handleActuatorButtonUp}
            >
              <FaArrowDown className="text-xl mb-1" />
              <span>DOWN</span>
              <div className={`mt-1 h-2 w-2 rounded-full ${actuatorMoving === 'down' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <div className="text-sm font-medium text-gray-700">Actuator Status</div>
            <div className="text-md mt-1">
              {actuatorMoving ? (
                <span className="text-green-600 font-medium">Moving {actuatorMoving.toUpperCase()}</span>
              ) : (
                <span className="text-gray-600">Stopped</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorPWM; 