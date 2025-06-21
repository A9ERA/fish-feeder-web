import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { BsPlay, BsStop, BsClock, BsGear, BsArrowRepeat } from 'react-icons/bs';
import { useApiEndpoint } from '../contexts/ApiEndpointContext';

const SensorControl = () => {
  const { pi_server_endpoint } = useApiEndpoint();
  const [isRunning, setIsRunning] = useState(false);
  const [interval, setInterval] = useState('1000');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState('');
  const [message, setMessage] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastStatusCheck, setLastStatusCheck] = useState<Date | null>(null);
  const [sensorStatus, setSensorStatus] = useState<{
    sensor_status?: string;
    is_running?: boolean;
    interval?: number;
    raw_responses?: string[];
  }>({});

  const sendSensorCommand = async (action: string, intervalValue?: number) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const payload: any = { action };
      if (intervalValue !== undefined) {
        payload.interval = intervalValue;
      }

      const response = await fetch(`${pi_server_endpoint}/api/control/sensor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        setMessage(result.message);
        setLastAction(action);
        
        // Handle different action types
        if (action === 'start') {
          setIsRunning(true);
        } else if (action === 'stop') {
          setIsRunning(false);
        } else if (action === 'status') {
          // Update sensor status information
          setSensorStatus({
            sensor_status: result.sensor_status,
            is_running: result.is_running,
            interval: result.interval,
            raw_responses: result.raw_responses
          });
          
          // Update running state based on actual status
          setIsRunning(result.is_running || false);
          
          // Update interval display if available
          if (result.interval) {
            setInterval(result.interval.toString());
          }
        }
      } else {
        setMessage(`Error: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending sensor command:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSensors = () => {
    sendSensorCommand('start');
  };

  const handleStopSensors = () => {
    sendSensorCommand('stop');
  };

  const handleSetInterval = () => {
    const intervalValue = parseInt(interval);
    if (isNaN(intervalValue) || intervalValue <= 0) {
      setMessage('Error: Interval must be a positive number');
      return;
    }
    sendSensorCommand('interval', intervalValue);
  };

  const handleGetStatus = () => {
    sendSensorCommand('status');
    setLastStatusCheck(new Date());
  };

  // Auto-refresh status every 5 seconds when enabled
  useEffect(() => {
    let intervalId: number;
    
    if (autoRefresh) {
      intervalId = window.setInterval(() => {
        sendSensorCommand('status');
        setLastStatusCheck(new Date());
      }, 5000);
    }
    
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [autoRefresh]);

  return (
    <div className="bg-content1 rounded-lg shadow-small p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BsGear className="text-primary text-xl" />
        <h3 className="text-lg font-semibold">Sensor Control</h3>
      </div>

      {/* Status Display */}
      <div className="bg-default-100 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-default-600">Status:</span>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-success' : 'bg-default-400'}`}></div>
            <span className={`text-sm font-medium ${isRunning ? 'text-success' : 'text-default-500'}`}>
              {sensorStatus.sensor_status || (isRunning ? 'Running' : 'Stopped')}
            </span>
          </div>
        </div>
        
        {/* Detailed Status Info */}
        {sensorStatus.interval && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-default-500">Current Interval:</span>
            <span className="text-xs font-medium text-default-700">
              {sensorStatus.interval}ms
            </span>
          </div>
        )}
        
        {message && (
          <div className={`text-sm p-2 rounded ${
            message.startsWith('Error') 
              ? 'bg-danger-50 text-danger-600 border border-danger-200' 
              : 'bg-success-50 text-success-600 border border-success-200'
          }`}>
            {message}
          </div>
        )}
        
        {/* Raw Arduino Responses (for debugging) */}
        {sensorStatus.raw_responses && sensorStatus.raw_responses.length > 0 && (
          <details className="mt-2">
            <summary className="text-xs text-default-500 cursor-pointer hover:text-default-700">
              Arduino Response Details
            </summary>
            <div className="mt-1 p-2 bg-default-50 rounded text-xs font-mono">
              {sensorStatus.raw_responses.map((response, index) => (
                <div key={index} className="text-default-600">
                  {response}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Control Buttons */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-default-700 mb-3">Sensor Operations</h4>
          <div className="flex gap-3">
            <Button
              color="success"
              variant={isRunning ? "solid" : "bordered"}
              onClick={handleStartSensors}
              isLoading={isLoading && lastAction === 'start'}
              startContent={<BsPlay />}
              className="flex-1"
            >
              Start Sensors
            </Button>
            
            <Button
              color="danger"
              variant={!isRunning ? "solid" : "bordered"}
              onClick={handleStopSensors}
              isLoading={isLoading && lastAction === 'stop'}
              startContent={<BsStop />}
              className="flex-1"
            >
              Stop Sensors
            </Button>
          </div>
        </div>

        {/* Interval Setting */}
        <div>
          <h4 className="text-sm font-medium text-default-700 mb-3">Update Interval</h4>
          
          {/* Preset Intervals */}
          <div className="grid grid-cols-5 gap-2 mb-3">
            {[1000, 2000, 5000, 10000, 30000].map((presetInterval) => (
              <Button
                key={presetInterval}
                size="sm"
                variant={interval === presetInterval.toString() ? "solid" : "bordered"}
                color={interval === presetInterval.toString() ? "primary" : "default"}
                onClick={() => setInterval(presetInterval.toString())}
                className="text-xs"
              >
                {presetInterval / 1000}s
              </Button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Input
              type="number"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              placeholder="1000"
              min="1"
              endContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">ms</span>
                </div>
              }
              className="flex-1"
            />
            <Button
              color="primary"
              onClick={handleSetInterval}
              isLoading={isLoading && lastAction === 'interval'}
              startContent={<BsClock />}
            >
              Set Interval
            </Button>
          </div>
          <p className="text-xs text-default-500 mt-1">
            Set how often sensors send data (in milliseconds)
          </p>
        </div>

        {/* Status Check */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-default-700">Status Check</h4>
            <div className="flex items-center gap-2">
              <Switch
                size="sm"
                isSelected={autoRefresh}
                onValueChange={setAutoRefresh}
              >
                <span className="text-xs text-default-600">Auto-refresh</span>
              </Switch>
            </div>
          </div>
          
          <Button
            variant="bordered"
            onClick={handleGetStatus}
            isLoading={isLoading && lastAction === 'status'}
            startContent={<BsArrowRepeat />}
            className="w-full"
          >
            Get Sensor Status
          </Button>
          
          {lastStatusCheck && (
            <p className="text-xs text-default-500 mt-2 text-center">
              Last checked: {lastStatusCheck.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="bg-default-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-default-700 mb-2">Information</h4>
        <ul className="text-xs text-default-600 space-y-1">
          <li>• Start/Stop controls sensor data collection</li>
          <li>• Interval controls how frequently sensors report data</li>
          <li>• Lower intervals = more frequent updates (higher data volume)</li>
          <li>• Recommended interval: 1000ms (1 second) for normal operation</li>
        </ul>
      </div>
    </div>
  );
};

export default SensorControl; 