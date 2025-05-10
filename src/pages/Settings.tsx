import { Typography, Box } from '@mui/material';
import '../styles/Settings.scss';

const Settings = () => {
  return (
    <Box className="settings-container" sx={{ p: 3 }}>
      <Typography variant="h4">Settings</Typography>
      <Typography>Hello World</Typography>
    </Box>
  );
};

export default Settings; 