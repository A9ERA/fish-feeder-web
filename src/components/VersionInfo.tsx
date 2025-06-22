import { BsInfoCircle, BsCodeSlash, BsCalendar } from 'react-icons/bs';

const VersionInfo = () => {
  // Get version from Vite injected variables
  const appVersion = __APP_VERSION__;
  
  return (
    <div className="bg-content1 rounded-lg shadow-small p-6">
      <div className="flex items-center gap-3 mb-4">
        <BsInfoCircle className="text-primary text-xl" />
        <h3 className="text-lg font-semibold">Application Information</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-default-100 rounded-lg">
          <div className="flex items-center gap-2">
            <BsCodeSlash className="text-default-600" />
            <span className="text-sm font-medium text-default-600">Version</span>
          </div>
          <span className="text-sm font-semibold text-primary">
            v{appVersion}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-default-100 rounded-lg">
          <div className="flex items-center gap-2">
            <BsCalendar className="text-default-600" />
            <span className="text-sm font-medium text-default-600">Last Accessed</span>
          </div>
          <span className="text-sm font-semibold text-default-700">
            {new Date().toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VersionInfo; 