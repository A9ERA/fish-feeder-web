import { Typography, Box } from '@mui/material';
import '../styles/MotorSettings.scss';

const MotorSettings = () => {
  return (
    <Box className="motor-settings-container" sx={{ p: 3 }}>
      <Typography variant="h4">Motor & PWM Settings</Typography>
      <Typography>Hello World</Typography>
    </Box>
  );
};

export default MotorSettings; 