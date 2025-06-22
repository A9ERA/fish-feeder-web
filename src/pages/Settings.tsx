import LocalModeSwitcher from '../components/LocalModeSwitcher';
import DurationSettings from '../components/DurationSettings';
import LedControl from '../components/LedControl';
import SensorControl from '../components/SensorControl';
import WeightCalibration from '../components/WeightCalibration';
import VersionInfo from '../components/VersionInfo';
import { FaCog } from 'react-icons/fa';

const Settings = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FaCog className="text-blue-500 text-2xl" />
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
      </div>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Connection Settings</h2>
          <LocalModeSwitcher />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Sync Duration Settings</h2>
          <DurationSettings />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">LED Control</h2>
          <LedControl />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Sensor Control</h2>
          <SensorControl />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Weight Calibration</h2>
          <WeightCalibration />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Application Information</h2>
          <VersionInfo />
        </div>
        
      </div>
    </div>
  );
};

export default Settings; 