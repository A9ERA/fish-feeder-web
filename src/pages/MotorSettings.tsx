import { Typography, Box, Paper, Slider, Button, Grid } from '@mui/material';
import { useState } from 'react';
import { 
  Speed as SpeedIcon,
  AirOutlined as FanIcon,
  ArrowUpward as ExtendIcon,
  ArrowDownward as RetractIcon
} from '@mui/icons-material';
import '../styles/MotorSettings.scss';

const MotorSettings = () => {
  // State for PWM values
  const [pwmValues, setPwmValues] = useState({
    augerMotor: 50,
    blowerFan: 50
  });

  // State for actuator operation
  const [actuatorOperating, setActuatorOperating] = useState({
    extending: false,
    retracting: false
  });

  const handlePwmChange = (motor: 'augerMotor' | 'blowerFan') => (_event: Event, value: number | number[]) => {
    setPwmValues({
      ...pwmValues,
      [motor]: value as number
    });
    // In a real app, this would send a command to the backend to update PWM
  };

  const handleActuatorExtend = () => {
    // In a real implementation, this would send an API command to extend the actuator
    setActuatorOperating({
      extending: true,
      retracting: false
    });
    
    // Simulate operation completion after 2 seconds
    setTimeout(() => {
      setActuatorOperating({
        extending: false,
        retracting: false
      });
    }, 2000);
  };

  const handleActuatorRetract = () => {
    // In a real implementation, this would send an API command to retract the actuator
    setActuatorOperating({
      extending: false,
      retracting: true
    });
    
    // Simulate operation completion after 2 seconds
    setTimeout(() => {
      setActuatorOperating({
        extending: false,
        retracting: false
      });
    }, 2000);
  };

  return (
    <Box className="motor-settings-container" sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Motor & PWM Settings</Typography>
      
      {/* PWM Settings Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>PWM Control</Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Auger Motor PWM */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className="pwm-control-item">
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon color="primary" sx={{ fontSize: 30, mr: 1 }} />
                <Typography variant="h6">PWM1 → Auger Motor</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Typography variant="h3" color="primary">
                  {pwmValues.augerMotor}%
                </Typography>
              </Box>
              
              <Slider
                value={pwmValues.augerMotor}
                onChange={handlePwmChange('augerMotor')}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                aria-labelledby="auger-motor-pwm-slider"
                color="primary"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Controls the speed of the auger motor that dispenses food
              </Typography>
            </Box>
          </Grid>
          
          {/* Blower Fan PWM */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className="pwm-control-item">
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FanIcon color="primary" sx={{ fontSize: 30, mr: 1 }} />
                <Typography variant="h6">PWM2 → Blower Fan</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Typography variant="h3" color="primary">
                  {pwmValues.blowerFan}%
                </Typography>
              </Box>
              
              <Slider
                value={pwmValues.blowerFan}
                onChange={handlePwmChange('blowerFan')}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                aria-labelledby="blower-fan-pwm-slider"
                color="primary"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Controls the speed of the blower fan that distributes food
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Actuator Control Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>Actuator Control</Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Manually control the food dispenser actuator position
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ExtendIcon />}
            onClick={handleActuatorExtend}
            disabled={actuatorOperating.extending || actuatorOperating.retracting}
            sx={{ py: 2, px: 4 }}
            className={`actuator-button ${actuatorOperating.extending ? 'operating' : ''}`}
          >
            {actuatorOperating.extending ? 'Extending...' : 'Open (Extend)'}
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<RetractIcon />}
            onClick={handleActuatorRetract}
            disabled={actuatorOperating.extending || actuatorOperating.retracting}
            sx={{ py: 2, px: 4 }}
            className={`actuator-button ${actuatorOperating.retracting ? 'operating' : ''}`}
          >
            {actuatorOperating.retracting ? 'Retracting...' : 'Close (Retract)'}
          </Button>
        </Box>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            color={
              actuatorOperating.extending ? 'primary.main' : 
              actuatorOperating.retracting ? 'secondary.main' : 
              'text.secondary'
            }
          >
            {actuatorOperating.extending ? 'Actuator is extending...' : 
             actuatorOperating.retracting ? 'Actuator is retracting...' : 
             'Actuator is idle'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default MotorSettings; 