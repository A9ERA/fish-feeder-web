import { Typography, Box } from '@mui/material';
import '../styles/FanHumidityControl.scss';

const FanHumidityControl = () => {
  return (
    <Box className="fan-humidity-container" sx={{ p: 3 }}>
      <Typography variant="h4">Fan & Humidity Control</Typography>
      <Typography>Hello World</Typography>
    </Box>
  );
};

export default FanHumidityControl; 