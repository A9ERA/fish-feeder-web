import { Typography, Box } from '@mui/material';
import '../styles/FeedControl.scss';

const FeedControl = () => {
  return (
    <Box className="feed-control-container" sx={{ p: 3 }}>
      <Typography variant="h4">Feed Control</Typography>
      <Typography>Hello World</Typography>
    </Box>
  );
};

export default FeedControl; 