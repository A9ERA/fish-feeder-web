import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FeedControl from './pages/FeedControl';
import FanHumidityControl from './pages/FanHumidityControl';
import MotorSettings from './pages/MotorSettings';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/feed-control" element={<FeedControl />} />
            <Route path="/fan-humidity" element={<FanHumidityControl />} />
            <Route path="/motor-settings" element={<MotorSettings />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
