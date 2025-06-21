import { useState, useEffect } from 'react';
import { BsCamera, BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { useApiEndpoint } from '../contexts/ApiEndpointContext';

interface CameraPreviewProps {
  className?: string;
  width?: string;
  height?: string;
  isEnabled?: boolean | null;
  onToggle?: () => void;
}

const CameraPreview = ({ 
  className = "", 
  width = "w-full", 
  height = "h-full", 
  isEnabled = true, 
  onToggle 
}: CameraPreviewProps) => {
  const { pi_server_endpoint } = useApiEndpoint();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>('');
  
  const videoUrl = `${pi_server_endpoint}/api/camera/video_feed`;

  const handleImageError = () => {
    setIsImageLoaded(false);
    setImageError(true);
  };

  // Reset states when camera is disabled/enabled
  const handleToggle = () => {
    setIsImageLoaded(false);
    setImageError(false);
    onToggle?.();
  };

  // Control img src based on isEnabled state
  useEffect(() => {
    if (isEnabled === true) {
      // Add timestamp to prevent caching and force new request
      setImgSrc(`${videoUrl}?t=${Date.now()}`);
    } else if (isEnabled === false) {
      // Completely remove src to stop streaming
      setImgSrc('');
      setIsImageLoaded(false);
      setImageError(false);
    }
    // Do nothing if isEnabled is null (loading state)
  }, [isEnabled, videoUrl]);

  return (
    <div className={`bg-content1 rounded-lg shadow-small p-3 flex flex-col items-center justify-center border border-divider relative ${className}`}>
      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={handleToggle}
          className={`absolute top-2 right-2 z-10 p-2 rounded-lg transition-colors ${
            isEnabled 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isEnabled ? 'ปิดกล้อง' : 'เปิดกล้อง'}
        >
          {isEnabled ? <BsCameraVideo className="text-lg" /> : <BsCameraVideoOff className="text-lg" />}
        </button>
      )}

      {isEnabled === null && (
        <>
          <div className="text-blue-500 text-4xl mb-2">
            <BsCamera />
          </div>
          <h2 className="text-sm text-foreground font-semibold mb-1">Loading Camera Status...</h2>
          <p className="text-xs text-default-500">Please wait while we check camera settings</p>
        </>
      )}

      {isEnabled === false && (
        <>
          <div className="text-gray-500 text-4xl mb-2">
            <BsCameraVideoOff />
          </div>
          <h2 className="text-sm text-foreground font-semibold mb-1">Camera Off</h2>
          <p className="text-xs text-default-500">Click the button to turn on camera</p>
        </>
      )}

      {isEnabled === true && !isImageLoaded && !imageError && (
        <>
          <div className="text-blue-500 text-4xl mb-2">
            <BsCamera />
          </div>
          <h2 className="text-sm text-foreground font-semibold mb-1">Loading Camera Preview...</h2>
          <p className="text-xs text-default-500">Please wait while we connect to the camera</p>
        </>
      )}

      {isEnabled === true && imageError && (
        <>
          <div className="text-red-500 text-4xl mb-2">
            <BsCamera />
          </div>
          <h2 className="text-sm text-foreground font-semibold mb-1">Camera Preview Unavailable</h2>
          <p className="text-xs text-default-500">Unable to connect to camera feed</p>
        </>
      )}

      {/* Always render img but control src - empty src means no requests */}
      <img 
        src={imgSrc}
        alt="Camera" 
        className={`${width} ${height} object-contain ${!isImageLoaded || isEnabled !== true ? 'hidden' : ''}`}
        onLoad={() => {
          if (isEnabled === true && imgSrc) {
            setIsImageLoaded(true);
            setImageError(false);
          }
        }}
        onError={() => {
          if (isEnabled === true && imgSrc) {
            handleImageError();
          }
        }}
      />
    </div>
  );
};

export default CameraPreview; 