import { Switch } from '@heroui/switch';
import { useApiEndpoint } from '../contexts/ApiEndpointContext';
import { FaServer, FaHome } from 'react-icons/fa';

const LocalModeSwitcher = () => {
  const { isLocal, switchToLocal, switchToRemote } = useApiEndpoint();

  const handleLocalModeChange = (isSelected: boolean) => {
    if (isSelected) {
      switchToLocal();
    } else {
      switchToRemote();
    }
  };

  return (
    <div className="bg-content1 rounded-lg shadow-small p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isLocal ? (
              <FaHome className="text-blue-500 text-xl" />
            ) : (
              <FaServer className="text-green-500 text-xl" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-foreground">Local Mode</h3>
              <p className="text-sm text-gray-500">
                {isLocal 
                  ? "Using local development server (localhost:5000)" 
                  : "Using remote server (a9era.pagekite.me)"
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${isLocal ? 'text-blue-600' : 'text-gray-500'}`}>
            {isLocal ? 'ON' : 'OFF'}
          </span>
          <Switch
            isSelected={isLocal}
            onValueChange={handleLocalModeChange}
            color="primary"
            size="md"
          />
        </div>
      </div>
      
      <div className="mt-3 p-3 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> Local mode connects to your development server. 
          Turn off to use the remote server accessible from anywhere.
        </p>
      </div>
    </div>
  );
};

export default LocalModeSwitcher; 