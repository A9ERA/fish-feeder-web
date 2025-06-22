import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/button';
import { FaFish } from 'react-icons/fa';
import { useSplash } from '../contexts/SplashContext';

const SplashScreen = () => {
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();
  const { markSplashAsVisited } = useSplash();

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          markSplashAsVisited();
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, markSplashAsVisited]);

  const handleContinue = () => {
    markSplashAsVisited();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-purple-900 flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-cyan-300 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-300 rounded-full blur-lg"></div>
      </div>

      {/* IEE Badge */}
      <div className="mb-8">
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
          <div className="bg-white text-red-600 font-bold px-2 py-1 rounded text-sm">IEE</div>
          <div className="text-sm">
            <div>วิศวกรรมไฟฟ้าอุตสาหกรรม</div>
            <div className="text-xs opacity-90">INDUSTRIAL ELECTRICAL</div>
          </div>
        </div>
      </div>

      {/* Main title */}
      <div className="text-center mb-8">
        <h1 className="text-lg text-white/90 mb-4">
          สำนักวิชาวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีสุรนารี
        </h1>
        <div className="bg-purple-600/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-purple-400/30 mb-8">
          <span className="text-yellow-300 font-medium">รหัสโปรเจค: B65IEE02</span>
        </div>
      </div>

      {/* Project title */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Stand-Alone Automatic
        </h1>
        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-300 to-teal-400 bg-clip-text text-transparent">
          Fish Feeder
        </h2>
        
        {/* Divider line */}
        <div className="flex items-center justify-center mb-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent w-32"></div>
          <span className="mx-4 text-white/70 text-lg">using IoT</span>
          <div className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent w-32"></div>
        </div>

        {/* Fish icon */}
        <div className="mb-8">
          <FaFish className="text-6xl text-cyan-400 mx-auto animate-pulse" />
        </div>
      </div>

      {/* Team members */}
      <div className="text-center mb-12">
        <h3 className="text-xl text-white/90 mb-6">รายชื่อคณะผู้จัดทำ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-white/70 text-sm mb-1">B6523442</div>
            <div className="text-white font-medium">นาย ภัทรพงษ์ พิศเพ็ง</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-white/70 text-sm mb-1">B6523497</div>
            <div className="text-white font-medium">นาย สุริวัชร์ แสนทวีสุข</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-white/70 text-sm mb-1">B6523404</div>
            <div className="text-white font-medium">นาย พีรวัฒน์ ทองล้วน</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-center text-sm text-white/70 mb-2">
          <span>{countdown} วินาที</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((10 - countdown) / 10) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Continue button */}
      <Button
        size="lg"
        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mb-16"
        onPress={handleContinue}
      >
        Continue →
      </Button>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm">
        <div>© 2024 Suranaree University of Technology</div>
        <div>Industrial Electrical Engineering</div>
      </div>
    </div>
  );
};

export default SplashScreen; 