import { Typography, Box, Button, TextField, Switch, FormControlLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Grid } from '@mui/material';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import '../styles/FeedControl.scss';

interface FeedLog {
  timestamp: string;
  amount: number;
  duration: number;
}

interface FeedSchedule {
  id: string;
  time: string;
  amount: number;
}

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${day} ${month} ${year} - ${hours}:${minutes}:${seconds}`;
};

const FeedControl = () => {
  const [foodAmount, setFoodAmount] = useState<number>(0);
  const [autoFeed, setAutoFeed] = useState<boolean>(false);
  const [feedLogs, setFeedLogs] = useState<FeedLog[]>([
    {
      timestamp: formatDate(new Date(Date.now() - 1000 * 60 * 5)), // 5 minutes ago
      amount: 50,
      duration: 15
    },
    {
      timestamp: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 2)), // 2 hours ago
      amount: 100,
      duration: 25
    },
    {
      timestamp: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 5)), // 5 hours ago
      amount: 75,
      duration: 20
    },
    {
      timestamp: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 12)), // 12 hours ago
      amount: 150,
      duration: 35
    },
    {
      timestamp: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24)), // 24 hours ago
      amount: 200,
      duration: 45
    }
  ]);
  const [feedSchedules, setFeedSchedules] = useState<FeedSchedule[]>([]);

  const handleFeedNow = async () => {
    try {
      // TODO: Implement actual API calls for each step
      // 1. Open actuator
      // 2. Run auger
      // 3. Blow food
      // 4. Close actuator

      // Add to feed log
      const newLog: FeedLog = {
        timestamp: formatDate(new Date()),
        amount: foodAmount,
        duration: 30, // TODO: Implement actual duration tracking
      };
      setFeedLogs([newLog, ...feedLogs]);
    } catch (error) {
      console.error('Error during feeding:', error);
    }
  };

  const handleAddSchedule = () => {
    const newSchedule: FeedSchedule = {
      id: Date.now().toString(),
      time: '12:00',
      amount: 100,
    };
    setFeedSchedules([...feedSchedules, newSchedule]);
  };

  const handleDeleteSchedule = (id: string) => {
    setFeedSchedules(feedSchedules.filter(schedule => schedule.id !== id));
  };

  const handleScheduleChange = (id: string, field: keyof FeedSchedule, value: string | number) => {
    setFeedSchedules(feedSchedules.map(schedule => 
      schedule.id === id ? { ...schedule, [field]: value } : schedule
    ));
  };

  return (
    <Box className="feed-control-container" sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Feed Control</Typography>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          label="Food Amount (g)"
          type="number"
          value={foodAmount}
          onChange={(e) => setFoodAmount(Number(e.target.value))}
          sx={{ mr: 2 }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleFeedNow}
          sx={{ mr: 2 }}
        >
          Feed Now
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={autoFeed}
              onChange={(e) => setAutoFeed(e.target.checked)}
            />
          }
          label="Automatic Feeding Schedule"
        />
      </Box>

      {autoFeed && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Feed Schedule</Typography>
          <Paper sx={{ p: 2 }}>
            {feedSchedules.map((schedule) => (
              <Box key={schedule.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <Box sx={{ flex: '0 0 40%' }}>
                  <TextField
                    label="Time"
                    type="time"
                    value={schedule.time}
                    onChange={(e) => handleScheduleChange(schedule.id, 'time', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Box>
                <Box sx={{ flex: '0 0 40%' }}>
                  <TextField
                    label="Amount (g)"
                    type="number"
                    value={schedule.amount}
                    onChange={(e) => handleScheduleChange(schedule.id, 'amount', Number(e.target.value))}
                    fullWidth
                  />
                </Box>
                <Box sx={{ flex: '0 0 20%' }}>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteSchedule(schedule.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddSchedule}
              variant="outlined"
            >
              Add Schedule
            </Button>
          </Paper>
        </Box>
      )}

      <Typography variant="h6" sx={{ mb: 2 }}>Feed Log</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell align="right">Amount (g)</TableCell>
              <TableCell align="right">Duration (s)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedLogs.map((log, index) => (
              <TableRow key={index}>
                <TableCell>{log.timestamp}</TableCell>
                <TableCell align="right">{log.amount}</TableCell>
                <TableCell align="right">{log.duration}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FeedControl; 