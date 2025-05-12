import { Typography, Box, Paper, Grid, Slider, TextField, Divider, List, ListItem, ListItemText, ListItemIcon, Button, Chip } from '@mui/material';
import { useState } from 'react';
import { 
  Save as SaveIcon,
  Opacity as HumidityIcon,
  Wifi as WifiIcon,
  Storage as DatabaseIcon,
  Memory as ProcessorIcon,
  SdStorage as StorageIcon,
  Thermostat as TemperatureIcon,
  Speed as SpeedIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Memory
} from '@mui/icons-material';
import '../styles/Settings.scss';

// Mock Firebase config data
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "fish-feeder-app.firebaseapp.com",
  databaseURL: "https://fish-feeder-app.firebaseio.com",
  projectId: "fish-feeder-app",
  storageBucket: "fish-feeder-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Mock system status data
const systemStatus = {
  wifi: {
    connected: true,
    ssid: "MyHomeNetwork",
    signalStrength: 72,
    ipAddress: "192.168.1.105"
  },
  hardware: {
    cpuTemp: 42.3,
    cpuUsage: 15,
    memoryUsage: 22.5,
    storageUsage: 48.2,
    uptime: "3 days, 7 hours"
  }
};

const Settings = () => {
  // State for humidity thresholds
  const [humidityThresholds, setHumidityThresholds] = useState({
    controlBoxMin: 40,
    controlBoxMax: 60,
    foodTankMin: 30,
    foodTankMax: 50
  });

  // State for system status
  const [status, setStatus] = useState(systemStatus);
  const [loading, setLoading] = useState(false);

  const handleHumidityChange = (type: keyof typeof humidityThresholds) => (_event: Event, value: number | number[]) => {
    setHumidityThresholds({
      ...humidityThresholds,
      [type]: value as number
    });
  };

  const handleSaveThresholds = () => {
    // In a real app, this would send the thresholds to the backend
    console.log('Saving thresholds:', humidityThresholds);
    // Show a success message or notification
  };

  const refreshSystemStatus = () => {
    // In a real app, this would fetch the latest status from the Raspberry Pi
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Add some random variation to simulate changing values
      const newStatus = {
        ...status,
        hardware: {
          ...status.hardware,
          cpuTemp: Math.round((status.hardware.cpuTemp + (Math.random() * 2 - 1)) * 10) / 10,
          cpuUsage: Math.min(100, Math.max(0, status.hardware.cpuUsage + Math.floor(Math.random() * 10 - 5))),
          memoryUsage: Math.min(100, Math.max(0, status.hardware.memoryUsage + Math.floor(Math.random() * 6 - 3)))
        }
      };
      
      setStatus(newStatus);
      setLoading(false);
    }, 1500);
  };

  const formatFirebaseConfig = (config: typeof firebaseConfig) => {
    // Partially hide API key for security
    const maskedConfig = {
      ...config,
      apiKey: config.apiKey.substring(0, 8) + "..." + config.apiKey.substring(config.apiKey.length - 4)
    };
    
    return JSON.stringify(maskedConfig, null, 2);
  };

  return (
    <Box className="settings-container" sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Settings</Typography>
      
      {/* Humidity Thresholds Section */}
      <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <HumidityIcon sx={{ mr: 1 }} />
        Humidity Thresholds
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className="humidity-slider-section">
              <Typography variant="h6" gutterBottom>Control Box Humidity</Typography>
              
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Minimum Threshold</Typography>
                  <Typography color="primary">{humidityThresholds.controlBoxMin}%</Typography>
                </Box>
                <Slider
                  value={humidityThresholds.controlBoxMin}
                  onChange={handleHumidityChange('controlBoxMin')}
                  min={0}
                  max={100}
                  step={1}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 50, label: '50%' },
                    { value: 100, label: '100%' }
                  ]}
                />
                <Typography variant="body2" color="text.secondary">
                  Fans will turn ON if humidity drops below this value
                </Typography>
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Maximum Threshold</Typography>
                  <Typography color="error">{humidityThresholds.controlBoxMax}%</Typography>
                </Box>
                <Slider
                  value={humidityThresholds.controlBoxMax}
                  onChange={handleHumidityChange('controlBoxMax')}
                  min={0}
                  max={100}
                  step={1}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 50, label: '50%' },
                    { value: 100, label: '100%' }
                  ]}
                />
                <Typography variant="body2" color="text.secondary">
                  Fans will turn ON if humidity rises above this value
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className="humidity-slider-section">
              <Typography variant="h6" gutterBottom>Food Tank Humidity</Typography>
              
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Minimum Threshold</Typography>
                  <Typography color="primary">{humidityThresholds.foodTankMin}%</Typography>
                </Box>
                <Slider
                  value={humidityThresholds.foodTankMin}
                  onChange={handleHumidityChange('foodTankMin')}
                  min={0}
                  max={100}
                  step={1}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 50, label: '50%' },
                    { value: 100, label: '100%' }
                  ]}
                />
                <Typography variant="body2" color="text.secondary">
                  Alert when humidity drops below this value
                </Typography>
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Maximum Threshold</Typography>
                  <Typography color="error">{humidityThresholds.foodTankMax}%</Typography>
                </Box>
                <Slider
                  value={humidityThresholds.foodTankMax}
                  onChange={handleHumidityChange('foodTankMax')}
                  min={0}
                  max={100}
                  step={1}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 50, label: '50%' },
                    { value: 100, label: '100%' }
                  ]}
                />
                <Typography variant="body2" color="text.secondary">
                  Alert when humidity rises above this value
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
            onClick={handleSaveThresholds}
          >
            Save Thresholds
          </Button>
        </Box>
      </Paper>
      
      {/* Firebase Config Section */}
      <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <DatabaseIcon sx={{ mr: 1 }} />
        Firebase Configuration
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          View the current Firebase configuration for your application. For security reasons, some values are partially hidden.
        </Typography>
        <Box className="firebase-config">
          <pre>{formatFirebaseConfig(firebaseConfig)}</pre>
        </Box>
      </Paper>
      
      {/* System Status Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 1 }} />
          System Status
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={refreshSystemStatus}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Status'}
        </Button>
      </Box>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Wi-Fi Status */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <WifiIcon sx={{ mr: 1 }} />
              Wi-Fi Status
            </Typography>
            <List dense className="system-status-list">
              <ListItem>
                <ListItemText 
                  primary="Connection Status" 
                  secondary={
                    <Chip 
                      size="small" 
                      icon={status.wifi.connected ? <CheckIcon /> : <ErrorIcon />} 
                      label={status.wifi.connected ? 'Connected' : 'Disconnected'} 
                      color={status.wifi.connected ? 'success' : 'error'} 
                      variant="outlined"
                      className={`status-chip ${status.wifi.connected ? 'connected' : 'disconnected'}`}
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Network Name (SSID)" secondary={status.wifi.ssid} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Signal Strength" secondary={`${status.wifi.signalStrength}%`} />
              </ListItem>
              <ListItem>
                <ListItemText primary="IP Address" secondary={status.wifi.ipAddress} />
              </ListItem>
            </List>
          </Grid>
          
          {/* Hardware Status */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ProcessorIcon sx={{ mr: 1 }} />
              Hardware Status
            </Typography>
            <List dense className="system-status-list">
              <ListItem>
                <ListItemIcon>
                  <TemperatureIcon color={status.hardware.cpuTemp > 50 ? 'error' : 'primary'} />
                </ListItemIcon>
                <ListItemText 
                  primary="CPU Temperature" 
                  secondary={`${status.hardware.cpuTemp}°C`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SpeedIcon color={status.hardware.cpuUsage > 80 ? 'error' : 'primary'} />
                </ListItemIcon>
                <ListItemText 
                  primary="CPU Usage" 
                  secondary={`${status.hardware.cpuUsage}%`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Memory color={status.hardware.memoryUsage > 80 ? 'error' : 'primary'} />
                </ListItemIcon>
                <ListItemText 
                  primary="Memory Usage" 
                  secondary={`${status.hardware.memoryUsage}%`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <StorageIcon color={status.hardware.storageUsage > 80 ? 'error' : 'primary'} />
                </ListItemIcon>
                <ListItemText 
                  primary="Storage Usage" 
                  secondary={`${status.hardware.storageUsage}%`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="System Uptime" 
                  secondary={status.hardware.uptime} 
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Settings; 