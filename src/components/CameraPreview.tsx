import { useState } from 'react';
import { BsCamera } from 'react-icons/bs';
import { useApiEndpoint } from '../contexts/ApiEndpointContext';

interface CameraPreviewProps {
  className?: string;
  width?: string;
  height?: string;
}

const CameraPreview = ({ className = "", width = "w-full", height = "h-full" }: CameraPreviewProps) => {
  const { pi_server_endpoint } = useApiEndpoint();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoUrl = `${pi_server_endpoint}/api/camera/video_feed`;

  const handleImageError = () => {
    setIsImageLoaded(false);
    setImageError(true);
  };

  return (
    <div className={`bg-content1 rounded-lg shadow-small p-3 flex flex-col items-center justify-center border border-divider ${className}`}>
      {!isImageLoaded && !imageError && (
        <>
          <div className="text-blue-500 text-4xl mb-2">
            <BsCamera />
          </div>
          <h2 className="text-sm text-foreground font-semibold mb-1">Loading Camera Preview...</h2>
          <p className="text-xs text-default-500">Please wait while we connect to the camera</p>
        </>
      )}
      {imageError && (
        <>
          <div className="text-red-500 text-4xl mb-2">
            <BsCamera />
          </div>
          <h2 className="text-sm text-foreground font-semibold mb-1">Camera Preview Unavailable</h2>
          <p className="text-xs text-default-500">Unable to connect to camera feed</p>
        </>
      )}
      <img 
        src={videoUrl}
        alt="Camera" 
        className={`${width} ${height} object-contain ${!isImageLoaded ? 'hidden' : ''}`}
        onLoad={() => {
          setIsImageLoaded(true);
          setImageError(false);
        }}
        onError={handleImageError}
      />
    </div>
  );
};

export default CameraPreview; 