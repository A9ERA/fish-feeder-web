import { useState } from 'react';
import { Button } from '@heroui/button';
import { FaWeight, FaCog } from 'react-icons/fa';
import { useApiEndpoint } from '../contexts/ApiEndpointContext';

const WeightCalibration = () => {
  const { pi_server_endpoint } = useApiEndpoint();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastCalibration, setLastCalibration] = useState<Date | null>(null);

  const handleWeightCalibration = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${pi_server_endpoint}/api/control/weight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'calibrate' }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setMessage('Weight calibration started successfully');
        setLastCalibration(new Date());
      } else {
        setMessage(`Error: ${result.message || 'Failed to start weight calibration'}`);
      }
    } catch (error) {
      console.error('Error starting weight calibration:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-content1 rounded-lg shadow-small p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FaWeight className="text-primary text-xl" />
        <h3 className="text-lg font-semibold">Weight Sensor Calibration</h3>
      </div>

      {/* Info Section */}
      <div className="bg-default-100 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <FaCog className="text-default-600 text-sm" />
          <span className="text-sm font-medium text-default-600">Calibration Info</span>
        </div>
        <p className="text-xs text-default-500 mb-3">
          Start the weight sensor calibration process. This helps ensure accurate weight measurements.
          <span className="font-medium text-warning-700"> Make sure to remove all food from the feeder container first.</span>
          Follow the instructions on the Arduino serial monitor during calibration.
        </p>
        
        {lastCalibration && (
          <div className="text-xs text-default-500">
            Last calibration: {lastCalibration.toLocaleString()}
          </div>
        )}
      </div>

      {/* Status Message */}
      {message && (
        <div className={`text-sm p-3 rounded-lg ${
          message.startsWith('Error')
            ? 'bg-danger-50 text-danger-600 border border-danger-200'
            : 'bg-success-50 text-success-600 border border-success-200'
        }`}>
          {message}
        </div>
      )}

      {/* Calibration Button */}
      <div className="space-y-3">
        <Button
          color="primary"
          variant="solid"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          onPress={handleWeightCalibration}
          startContent={!isLoading && <FaWeight />}
        >
          {isLoading ? 'Starting Calibration...' : 'Start Weight Calibration'}
        </Button>
        
        <div className="text-xs text-default-500 text-center space-y-1">
          <div>⚠️ Make sure the weight sensor is properly connected before calibration</div>
          <div className="text-warning-600 font-medium">🍽️ Remove all food from feeder container before starting</div>
        </div>
      </div>

      {/* Instructions */}
      <details className="bg-default-50 rounded-lg p-3">
        <summary className="text-sm font-medium text-default-700 cursor-pointer hover:text-default-900">
          Calibration Instructions
        </summary>
        <div className="mt-2 space-y-2 text-xs text-default-600">
          <p className="text-warning-700 font-medium">🍽️ Remove all food from the feeder container completely</p>
          <p>1. Ensure the weight sensor platform is empty and stable</p>
          <p>2. Verify no food pellets remain in the system</p>
          <p>3. Click "Start Weight Calibration" button</p>
          <p>4. Follow the prompts on the Arduino serial monitor</p>
          <p>5. Place known weights when instructed</p>
          <p>6. Wait for calibration to complete</p>
          <p className="text-warning-600">⚠️ Do not disturb the sensor during calibration</p>
          <p className="text-danger-600">⚠️ Empty feeder is required for accurate calibration</p>
        </div>
      </details>
    </div>
  );
};

export default WeightCalibration; 