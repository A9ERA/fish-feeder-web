import { Typography, Box, Paper, Switch, FormControlLabel, Grid, Slider } from '@mui/material';
import { useState, useEffect } from 'react';
import { 
  Opacity as HumidityIcon,
  Air as FanIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import '../styles/FanHumidityControl.scss';

interface FanStatus {
  fanIn: boolean;
  fanOut: boolean;
  autoMode: boolean;
}

const FanHumidityControl = () => {
  // Mock data - would be replaced with actual API calls
  const [controlBoxHumidity, setControlBoxHumidity] = useState<number>(65);
  const [humidityThreshold, setHumidityThreshold] = useState<number>(50);
  const [fanStatus, setFanStatus] = useState<FanStatus>({
    fanIn: false,
    fanOut: false,
    autoMode: true
  });

  // Simulate auto mode behavior - this would typically be handled by the backend
  useEffect(() => {
    if (fanStatus.autoMode) {
      const shouldFanBeOn = controlBoxHumidity > humidityThreshold;
      
      // In a real app, this would send commands to the backend
      setFanStatus(prev => ({
        ...prev,
        fanIn: shouldFanBeOn,
        fanOut: shouldFanBeOn
      }));
    }
  }, [controlBoxHumidity, humidityThreshold, fanStatus.autoMode]);

  const handleAutoModeChange = (checked: boolean) => {
    // In a real implementation, this would call an API to enable/disable auto mode
    setFanStatus({
      ...fanStatus,
      autoMode: checked,
      // When auto mode is enabled, manual controls are disabled
      fanIn: checked ? (controlBoxHumidity > humidityThreshold) : fanStatus.fanIn,
      fanOut: checked ? (controlBoxHumidity > humidityThreshold) : fanStatus.fanOut
    });
  };

  const handleFanInChange = (checked: boolean) => {
    // In a real implementation, this would call an API to turn fan in on/off
    if (!fanStatus.autoMode) {
      setFanStatus({
        ...fanStatus,
        fanIn: checked
      });
    }
  };

  const handleFanOutChange = (checked: boolean) => {
    // In a real implementation, this would call an API to turn fan out on/off
    if (!fanStatus.autoMode) {
      setFanStatus({
        ...fanStatus,
        fanOut: checked
      });
    }
  };

  const handleThresholdChange = (_event: Event, value: number | number[]) => {
    setHumidityThreshold(value as number);
  };

  // For demonstration purposes - in a real app, would be from sensor
  const handleSimulateHumidityChange = (_event: Event, value: number | number[]) => {
    setControlBoxHumidity(value as number);
  };

  return (
    <Box className="fan-humidity-container" sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Fan & Humidity Control</Typography>

      {/* Fan Status Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>Current Fan Status</Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 2 }}>Mode:</Typography>
              <Typography variant="body1" fontWeight="bold" color={fanStatus.autoMode ? "primary" : "text.primary"}>
                {fanStatus.autoMode ? "AUTO" : "MANUAL"}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 2 }}>Fan In:</Typography>
              <Typography 
                variant="body1" 
                fontWeight="bold"
                color={fanStatus.fanIn ? "success.main" : "error.main"}
              >
                {fanStatus.fanIn ? "ON" : "OFF"}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 2 }}>Fan Out:</Typography>
              <Typography 
                variant="body1" 
                fontWeight="bold"
                color={fanStatus.fanOut ? "success.main" : "error.main"}
              >
                {fanStatus.fanOut ? "ON" : "OFF"}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Fan Control Section */}
      <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>Fan Control</Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={fanStatus.autoMode}
                onChange={(e) => handleAutoModeChange(e.target.checked)}
                color="primary"
              />
            }
            label="Auto Fan Mode"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            When enabled, fans will automatically turn on when humidity exceeds {humidityThreshold}%
          </Typography>
        </Box>
        
        <Typography variant="h6" sx={{ mb: 2 }}>Manual Control</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                backgroundColor: fanStatus.autoMode ? 'rgba(0,0,0,0.05)' : 'white',
                opacity: fanStatus.autoMode ? 0.7 : 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FanIcon sx={{ mr: 1 }} />
                <Typography>Fan In (Relay1)</Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={fanStatus.fanIn}
                    onChange={(e) => handleFanInChange(e.target.checked)}
                    disabled={fanStatus.autoMode}
                    color="primary"
                  />
                }
                label={fanStatus.fanIn ? "ON" : "OFF"}
              />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                backgroundColor: fanStatus.autoMode ? 'rgba(0,0,0,0.05)' : 'white',
                opacity: fanStatus.autoMode ? 0.7 : 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FanIcon sx={{ mr: 1 }} />
                <Typography>Fan Out (Relay2)</Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={fanStatus.fanOut}
                    onChange={(e) => handleFanOutChange(e.target.checked)}
                    disabled={fanStatus.autoMode}
                    color="primary"
                  />
                }
                label={fanStatus.fanOut ? "ON" : "OFF"}
              />
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Humidity Display Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HumidityIcon color="primary" sx={{ fontSize: 30, mr: 1 }} />
              <Typography variant="h6">Control Box Humidity</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Typography 
                variant="h2" 
                color={controlBoxHumidity > humidityThreshold ? "error.main" : "primary"}
              >
                {controlBoxHumidity}%
              </Typography>
            </Box>
            
            {/* For demo purposes only - to simulate changing humidity */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Simulate humidity change (demo only)
              </Typography>
              <Slider
                value={controlBoxHumidity}
                onChange={handleSimulateHumidityChange}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                aria-labelledby="humidity-simulator-slider"
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SettingsIcon color="primary" sx={{ fontSize: 30, mr: 1 }} />
              <Typography variant="h6">Humidity Threshold</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Typography variant="h2" color="text.secondary">
                {humidityThreshold}%
              </Typography>
            </Box>
            
            <Box>
              <Typography gutterBottom>
                Set threshold value (fans turn ON when humidity exceeds this value)
              </Typography>
              <Slider
                value={humidityThreshold}
                onChange={handleThresholdChange}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                aria-labelledby="humidity-threshold-slider"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
    </Box>
  );
};

export default FanHumidityControl; 