import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import SplashScreen from '@/pages/SplashScreen';
import Dashboard from '@/pages/Dashboard';
import FeedControl from '@/pages/FeedControl';  
import FanTempControl from '@/pages/FanTempControl';
import MotorPWM from '@/pages/MotorPWM';
import Settings from '@/pages/Settings';

function App() {
  return (
    <Routes>
      {/* Splash screen as landing page */}
      <Route path="/" element={<SplashScreen />} />
      
      {/* Main application routes - all protected */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="/feed-control" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<FeedControl />} />
      </Route>
      <Route path="/fan-temp-control" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<FanTempControl />} />
      </Route>
      <Route path="/motor-pwm" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<MotorPWM />} />
      </Route>
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
