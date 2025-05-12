import { Typography, Box, Paper } from '@mui/material';
import {
  Thermostat as TempIcon,
  WaterDrop as WaterIcon,
  Opacity as HumidityIcon,
  Scale as WeightIcon,
  Power as PowerIcon,
  BatteryFull as BatteryIcon,
  Videocam as CameraIcon,
  Timer as TimerIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import '../styles/Dashboard.scss';

interface SensorValueProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
}

const SensorValue = ({ icon, label, value, unit }: SensorValueProps) => (
  <Paper elevation={2} className="sensor-card">
    <Box className="sensor-header">
      {icon}
      <Typography variant="h6" className="sensor-icon">
        {label}
      </Typography>
    </Box>
    <Box className="sensor-value">
      <Typography variant="h4" component="div">
        {value}
        {unit && <Typography component="span" variant="h6" className="sensor-unit">{unit}</Typography>}
      </Typography>
    </Box>
  </Paper>
);

const Dashboard = () => {
  // TODO: Replace with actual data from API
  const sensorData = {
    foodTankTemp: 25.5,
    foodTankHumidity: 65,
    controlBoxTemp: 28.0,
    controlBoxHumidity: 60,
    waterTemp: 24.0,
    foodMoisture: 75,
    foodWeight: 2.5,
    systemVoltage: 12.5,
    systemCurrent: 1.2,
    solarVoltage: 13.8,
    solarCurrent: 2.5,
    batteryPercentage: 85,
    lastFeedTime: '2024-03-20 14:30',
    lastFeedAmount: '50g',
    relayStatus: true,
    fanStatus: false,
  };

  return (
    <Box className="dashboard-container">
      <Typography variant="h4">Dashboard</Typography>
      
      <Box className="dashboard-content">
        {/* Camera Preview Section - Left Side */}
        <Box className="camera-section">
          <Paper elevation={2} className="camera-preview">
            <Box className="camera-content">
              <CameraIcon className="camera-icon" color="primary" />
              <Typography variant="h6">Camera Preview</Typography>
              <Typography variant="body2" color="text.secondary">Live feed coming soon</Typography>
            </Box>
          </Paper>
        </Box>

        {/* Sensor Data Sections - Right Side */}
        <Box className="sensor-section">
          {/* Temperature & Humidity Section */}
          <Box>
            <Typography variant="h6" className="section-title">Temperature & Humidity</Typography>
            <Box className="sensor-grid">
              <Box className="sensor-item">
                <SensorValue
                  icon={<TempIcon color="primary" />}
                  label="Temperature"
                  value={`${sensorData.foodTankTemp}°C`}
                />
              </Box>
              <Box className="sensor-item">
                <SensorValue
                  icon={<HumidityIcon color="primary" />}
                  label="Humidity"
                  value={`${sensorData.foodTankHumidity}%`}
                />
              </Box>
            </Box>
          </Box>

          {/* Water & Food Section */}
          <Box>
            <Typography variant="h6" className="section-title">Water & Food</Typography>
            <Box className="sensor-grid">
              <Box className="sensor-item">
                <SensorValue
                  icon={<WaterIcon color="primary" />}
                  label="Water Temperature"
                  value={`${sensorData.waterTemp}°C`}
                />
              </Box>
              <Box className="sensor-item">
                <SensorValue
                  icon={<HumidityIcon color="primary" />}
                  label="Food Moisture"
                  value={`${sensorData.foodMoisture}%`}
                />
              </Box>
              <Box className="sensor-item">
                <SensorValue
                  icon={<WeightIcon color="primary" />}
                  label="Food Weight"
                  value={`${sensorData.foodWeight}kg`}
                />
              </Box>
            </Box>
          </Box>

          {/* Power Section */}
          <Box>
            <Typography variant="h6" className="section-title">Power solar</Typography>
            <Box className="sensor-grid">
              <Box className="sensor-item">
                <SensorValue
                  icon={<PowerIcon color="primary" />}
                  label="Voltage"
                  value={`${sensorData.solarVoltage}V`}
                />
              </Box>
              <Box className="sensor-item">
                <SensorValue
                  icon={<PowerIcon color="primary" />}
                  label="Current"
                  value={`${sensorData.solarCurrent}A`}
                />
              </Box>
            </Box>
          </Box>

          {/* Power System Section */}
          <Box>
            <Typography variant="h6" className="section-title">Power system</Typography>
            <Box className="sensor-grid">
              <Box className="sensor-item">
                <SensorValue
                  icon={<PowerIcon color="primary" />}
                  label="Voltage"
                  value={`${sensorData.systemVoltage}V`}
                />
              </Box>
              <Box className="sensor-item">
                <SensorValue
                  icon={<PowerIcon color="primary" />}
                  label="Current"
                  value={`${sensorData.systemCurrent}A`}
                />
              </Box>
              <Box className="sensor-item">
                <SensorValue
                  icon={<BatteryIcon color="primary" />}
                  label="Battery"
                  value={`${sensorData.batteryPercentage}%`}
                />
              </Box>
            </Box>
          </Box>

          {/* Status Section */}
          <Box>
            <Typography variant="h6" className="section-title">Status</Typography>
            <Box className="sensor-grid">
              <Box className="sensor-item">
                <Paper elevation={2} className="status-card">
                  <Box className="status-header">
                    <TimerIcon color="primary" className="status-icon" />
                    <Typography variant="subtitle1">Last Feed</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Time: {sensorData.lastFeedTime}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Amount: {sensorData.lastFeedAmount}
                  </Typography>
                </Paper>
              </Box>
              <Box className="sensor-item">
                <Paper elevation={2} className="status-card">
                  <Box className="status-header">
                    <SettingsIcon color="primary" className="status-icon" />
                    <Typography variant="subtitle1">System Status</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Relay: {sensorData.relayStatus ? 'ON' : 'OFF'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fan: {sensorData.fanStatus ? 'ON' : 'OFF'}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 