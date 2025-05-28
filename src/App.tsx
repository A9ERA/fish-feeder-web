import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import FeedControl from '@/pages/FeedControl';  
import FanTempControl from '@/pages/FanTempControl';
import MotorPWM from '@/pages/MotorPWM';
import Settings from '@/pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="feed-control" element={<FeedControl />} />
        <Route path="fan-temp-control" element={<FanTempControl />} />
        <Route path="motor-pwm" element={<MotorPWM />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
