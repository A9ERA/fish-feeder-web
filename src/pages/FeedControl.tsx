import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { BsTrash, BsPlay, BsGear, BsPencil, BsClock, BsChevronDown, BsChevronUp, BsCameraVideo, BsX } from 'react-icons/bs';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from '@heroui/table';
import { DateRangePicker } from '@heroui/date-picker';
import { CalendarDate } from '@internationalized/date';
import CameraPreview from '../components/CameraPreview';
import { database } from '../config/firebase';
import { ref, set, get } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { useApiEndpoint } from '../contexts/ApiEndpointContext';
import { useCameraContext } from '../contexts/CameraContext';

// Helper function to convert CalendarDate to JavaScript Date
const toJSDate = (calendarDate: CalendarDate): Date => {
  return new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day);
};

// Helper function to format dates
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${day} ${month} ${year} - ${hours}:${minutes}:${seconds}`;
};

// Default feed presets
const defaultFeedPresets = [
  {
    id: 'small',
    label: 'small (50g)',
    amount: '50',
    timing: { blowerDuration: '5' }
  },
  {
    id: 'medium',
    label: 'medium (100g)',
    amount: '100',
    timing: { blowerDuration: '10' }
  },
  {
    id: 'large',
    label: 'large (200g)',
    amount: '200',
    timing: { blowerDuration: '15' }
  },
  {
    id: 'xl',
    label: 'xl (1.0kg)',
    amount: '1000',
    timing: { blowerDuration: '20' }
  }
];

// Firebase functions for presets
const saveFeedPresets = async (presets: any[]) => {
  try {
    const presetsRef = ref(database, 'feed_preset');
    await set(presetsRef, presets);
    console.log('Presets saved to Firebase successfully');
  } catch (error) {
    console.error('Error saving presets to Firebase:', error);
    // Fallback to localStorage if Firebase fails
    localStorage.setItem('feedPresets', JSON.stringify(presets));
  }
};

const loadFeedPresets = async () => {
  try {
    const presetsRef = ref(database, 'feed_preset');
    const snapshot = await get(presetsRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log('No presets found in Firebase, using defaults');
      // If no saved presets, save and return defaults
      await saveFeedPresets(defaultFeedPresets);
      return defaultFeedPresets;
    }
  } catch (error) {
    console.error('Error loading presets from Firebase:', error);
    // Fallback to localStorage if Firebase fails
    const saved = localStorage.getItem('feedPresets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved presets from localStorage:', e);
      }
    }
    // If all fails, save and return defaults
    localStorage.setItem('feedPresets', JSON.stringify(defaultFeedPresets));
    return defaultFeedPresets;
  }
};

// Schedule Firebase functions
const saveSchedules = async (schedules: any[]) => {
  try {
    const schedulesRef = ref(database, 'schedule_data');
    await set(schedulesRef, schedules);
    console.log('Schedules saved to Firebase successfully');
  } catch (error) {
    console.error('Error saving schedules to Firebase:', error);
    // Fallback to localStorage if Firebase fails
    localStorage.setItem('feedSchedules', JSON.stringify(schedules));
  }
};

const loadSchedules = async () => {
  try {
    const schedulesRef = ref(database, 'schedule_data');
    const snapshot = await get(schedulesRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log('No schedules found in Firebase');
      return [];
    }
  } catch (error) {
    console.error('Error loading schedules from Firebase:', error);
    // Fallback to localStorage if Firebase fails
    const saved = localStorage.getItem('feedSchedules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved schedules from localStorage:', e);
      }
    }
    return [];
  }
};

const FeedControl = () => {
  const { pi_server_endpoint } = useApiEndpoint();
  const { isCameraEnabled, toggleCamera } = useCameraContext();
  const [foodAmount, setFoodAmount] = useState('50'); // Initialize with small preset amount
  const [selectedFeedType, setSelectedFeedType] = useState('small');
  const [customAmount, setCustomAmount] = useState('50');
  // Device timing controls
  const [blowerDuration, setBlowerDuration] = useState('5');
  const [isFeeding, setIsFeeding] = useState(false);

  // Feed presets management
  const [feedPresets, setFeedPresets] = useState<any[]>([]);
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [editingPreset, setEditingPreset] = useState<any>(null);
  const [presetForm, setPresetForm] = useState({
    id: '',
    label: '',
    amount: '',
    timing: { blowerDuration: '' }
  });

  // Automatic feeding schedules
  const [schedules, setSchedules] = useState<any[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [scheduleForm, setScheduleForm] = useState({
    time: '',
    presetId: 'small',
    enabled: true
  });

  const [filterDateRange, setFilterDateRange] = useState({
    start: new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate() - 7),
    end: new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
  });

  // Feed log data state
  const [allFeedLogs, setAllFeedLogs] = useState<any[]>([]);
  const [isLoadingFeedLogs, setIsLoadingFeedLogs] = useState(false);

  const [filteredFeedLogs, setFilteredFeedLogs] = useState<any[]>([]);
  
  // Video modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoFile, setCurrentVideoFile] = useState<string>('');

  // Function to load feed history from API
  const loadFeedHistoryFromAPI = async () => {
    setIsLoadingFeedLogs(true);
    try {
      // Get available dates first
      const datesResponse = await fetch(`${pi_server_endpoint}/api/feed-history/available-dates`);
      const datesData = await datesResponse.json();
      
      if (datesData.status === 'success' && datesData.dates.length > 0) {
        // Load data for all available dates
        const allLogs: any[] = [];
        
        for (const dateStr of datesData.dates) {
          try {
            const response = await fetch(`${pi_server_endpoint}/api/feed-history/${dateStr}`);
            const data = await response.json();
            
            if (data.status === 'success' && data.data) {
              // Transform API data to match our component format
              const transformedLogs = data.data.map((log: any, index: number) => {
                const timestamp = new Date(log.timestamp);
                return {
                  id: `${dateStr}-${index}`,
                  time: formatDate(timestamp),
                  amount: log.amount,
                  blowerDuration: log.blower_duration,
                  video_file: log.video_file || '',
                  date: timestamp
                };
              });
              
              allLogs.push(...transformedLogs);
            }
          } catch (error) {
            console.error(`Error loading feed history for ${dateStr}:`, error);
          }
        }
        
        // Sort all logs by date (newest first)
        allLogs.sort((a, b) => b.date.getTime() - a.date.getTime());
        setAllFeedLogs(allLogs);
      } else {
        // No data available, use empty array
        setAllFeedLogs([]);
      }
    } catch (error) {
      console.error('Error loading feed history:', error);
      setAllFeedLogs([]);
    } finally {
      setIsLoadingFeedLogs(false);
    }
  };

  // Table columns
  const columns = [
    { key: "time", label: "Time" },
    { key: "amount", label: "Amount (g)" },
    { key: "blowerDuration", label: "Blower (s)" },
    { key: "actions", label: "Actions" }
  ];

  // Load presets and schedules from Firebase when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load presets
        const loadedPresets = await loadFeedPresets();
        setFeedPresets(loadedPresets);
        
        // Load schedules
        const loadedSchedules = await loadSchedules();
        setSchedules(loadedSchedules);
        
        // Load feed history from API
        await loadFeedHistoryFromAPI();
      } catch (error) {
        console.error('Error loading initial data:', error);
        setFeedPresets(defaultFeedPresets);
        setSchedules([]);
      }
    };
    
    loadInitialData();
  }, [pi_server_endpoint]);

  // Initialize timing controls with selected preset values when presets are loaded
  useEffect(() => {
    if (feedPresets.length > 0 && selectedFeedType !== 'custom') {
      const selectedPreset = feedPresets.find((preset: any) => preset.id === selectedFeedType);
      if (selectedPreset) {
        setBlowerDuration(selectedPreset.timing.blowerDuration);
        setFoodAmount(selectedPreset.amount);
      }
    }
  }, [feedPresets, selectedFeedType]);

  // Filter feed logs when date range changes or allFeedLogs updates
  useEffect(() => {
    if (!filterDateRange.start && !filterDateRange.end) {
      setFilteredFeedLogs(allFeedLogs.sort((a, b) => b.date.getTime() - a.date.getTime()));
      return;
    }

    const filtered = allFeedLogs.filter(log => {
      const logDate = new Date(log.date.getFullYear(), log.date.getMonth(), log.date.getDate());

      if (filterDateRange.start && filterDateRange.end) {
        const start = toJSDate(filterDateRange.start);
        const end = toJSDate(filterDateRange.end);
        return logDate >= start && logDate <= end;
      } else if (filterDateRange.start) {
        const start = toJSDate(filterDateRange.start);
        return logDate >= start;
      } else if (filterDateRange.end) {
        const end = toJSDate(filterDateRange.end);
        return logDate <= end;
      }
      return true;
    });

    // Sort filtered results by date (newest first)
    setFilteredFeedLogs(filtered.sort((a, b) => b.date.getTime() - a.date.getTime()));
  }, [filterDateRange, allFeedLogs]);

  // Get current feed presets including custom option
  const getCurrentPresets = () => {
    return [
      ...feedPresets,
      {
        id: 'custom',
        label: 'Custom',
        amount: customAmount,
        timing: { blowerDuration: blowerDuration }
      }
    ];
  };

  // Preset management functions
  const handleAddPreset = async () => {
    if (presetForm.label && presetForm.amount && presetForm.timing.blowerDuration) {
      const newId = uuidv4();
      const newPreset = {
        ...presetForm,
        id: newId
      };
      const updatedPresets = [...feedPresets, newPreset];
      setFeedPresets(updatedPresets);
      await saveFeedPresets(updatedPresets);
      resetPresetForm();
    }
  };

  const handleEditPreset = (preset: any) => {
    setEditingPreset(preset);
    setPresetForm({
      id: preset.id,
      label: preset.label,
      amount: preset.amount,
      timing: { blowerDuration: preset.timing.blowerDuration }
    });
  };

  const handleUpdatePreset = async () => {
    if (editingPreset && presetForm.label && presetForm.amount && presetForm.timing.blowerDuration) {
      const updatedPresets = feedPresets.map((p: any) =>
        p.id === editingPreset.id ? { ...presetForm, id: editingPreset.id } : p
      );
      setFeedPresets(updatedPresets);
      await saveFeedPresets(updatedPresets);
      setEditingPreset(null);
      resetPresetForm();
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    const updatedPresets = feedPresets.filter((p: any) => p.id !== presetId);
    setFeedPresets(updatedPresets);
    await saveFeedPresets(updatedPresets);
    // If deleted preset was selected, switch to first available preset
    if (selectedFeedType === presetId && updatedPresets.length > 0) {
      handleFeedTypeSelect(updatedPresets[0].id);
    }
  };

  const resetPresetForm = () => {
    setPresetForm({
      id: '',
      label: '',
      amount: '',
      timing: { blowerDuration: '' }
    });
  };

  // Schedule management functions
  const handleAddSchedule = async () => {
    if (scheduleForm.time && scheduleForm.presetId) {
      const newSchedule = {
        id: uuidv4(),
        ...scheduleForm
      };
      const updatedSchedules = [...schedules, newSchedule];
      setSchedules(updatedSchedules);
      await saveSchedules(updatedSchedules);
      resetScheduleForm();
    }
  };

  const handleEditSchedule = (schedule: any) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      time: schedule.time,
      presetId: schedule.presetId,
      enabled: schedule.enabled
    });
  };

  const handleUpdateSchedule = async () => {
    if (editingSchedule && scheduleForm.time && scheduleForm.presetId) {
      const updatedSchedules = schedules.map((s: any) =>
        s.id === editingSchedule.id ? { ...scheduleForm, id: editingSchedule.id } : s
      );
      setSchedules(updatedSchedules);
      await saveSchedules(updatedSchedules);
      setEditingSchedule(null);
      resetScheduleForm();
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    const updatedSchedules = schedules.filter((s: any) => s.id !== scheduleId);
    setSchedules(updatedSchedules);
    await saveSchedules(updatedSchedules);
  };

  const handleToggleSchedule = async (scheduleId: string) => {
    const updatedSchedules = schedules.map((s: any) =>
      s.id === scheduleId ? { ...s, enabled: !s.enabled } : s
    );
    setSchedules(updatedSchedules);
    await saveSchedules(updatedSchedules);
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      time: '',
      presetId: 'small',
      enabled: true
    });
  };

  const handleFeedTypeSelect = (feedType: string) => {
    setSelectedFeedType(feedType);
    const currentPresets = getCurrentPresets();
    const selectedType = currentPresets.find((type: any) => type.id === feedType);
    if (selectedType && feedType !== 'custom') {
      setFoodAmount(selectedType.amount);
      // Update timing values for preset
      setBlowerDuration(selectedType.timing.blowerDuration);
    } else if (feedType === 'custom') {
      setFoodAmount(customAmount);
      // Keep current timing values for custom
    }
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (selectedFeedType === 'custom') {
      setFoodAmount(value);
    }
  };

  const handleFeedNow = async () => {
    let amount;
    if (selectedFeedType === 'custom') {
      amount = customAmount;
    } else {
      const currentPresets = getCurrentPresets();
      const selectedPreset = currentPresets.find((type: any) => type.id === selectedFeedType);
      amount = selectedPreset ? selectedPreset.amount : foodAmount;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    
    setIsFeeding(true);
    
    try {
      const response = await fetch(`${pi_server_endpoint}/api/feeder/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedSize: parseFloat(amount),
          blowerDuration: parseFloat(blowerDuration)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Feed started successfully:', result);
      
      // Reload feed history after successful feed
      setTimeout(() => {
        loadFeedHistoryFromAPI();
      }, 2000); // Wait 2 seconds for the feed operation to complete and be logged
      
    } catch (error) {
      console.error('Error starting feed:', error);
      // Optional: Add error notification here
    } finally {
      setIsFeeding(false);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      const response = await fetch(`${pi_server_endpoint}/api/feeder/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Emergency stop successful:', result);
      
      // Immediately set feeding state to false
      setIsFeeding(false);
      
    } catch (error) {
      console.error('Error sending emergency stop:', error);
      // Even if the request fails, stop the feeding state
      setIsFeeding(false);
    }
  };


  const handleDateRangeReset = () => {
    setFilterDateRange({
      start: new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate() - 7),
      end: new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
    });
  };

  const handleViewVideo = (videoFile: string) => {
    if (videoFile && videoFile.trim() !== '') {
      setCurrentVideoFile(videoFile);
      setIsVideoModalOpen(true);
    }
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentVideoFile('');
  };

  // Render cell content, handling date objects
  const renderCellContent = (item: any, columnKey: React.Key) => {
    if (columnKey === 'date') {
      return formatDate(item.date);
    }
    if (columnKey === 'actions') {
      return (
        <div className="flex items-center gap-2">
          {item.video_file && item.video_file.trim() !== '' ? (
            <Button
              size="sm"
              variant="ghost"
              color="primary"
              onClick={() => handleViewVideo(item.video_file)}
              startContent={<BsCameraVideo />}
            >
              View Video
            </Button>
          ) : (
            <span className="text-default-400 text-sm">No video</span>
          )}
        </div>
      );
    }
    return item[columnKey as keyof typeof item];
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Feed Control</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-content1 rounded-lg shadow-small p-5">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Manual Feed</h2>

            <div className="space-y-4">
              <h3 className="text-md font-medium">Select a preset below or enter a custom amount</h3>

              <div className="grid grid-cols-2 gap-3">
                {getCurrentPresets().map((type) => (
                  <Button
                    key={type.id}
                    variant={selectedFeedType === type.id ? "solid" : "bordered"}
                    color={selectedFeedType === type.id ? "primary" : "default"}
                    onClick={() => handleFeedTypeSelect(type.id)}
                    className="h-10 text-sm"
                  >
                    {type.label} ({type.amount}g)
                  </Button>
                ))}
              </div>

              {selectedFeedType === 'custom' && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Amount (grams)</h4>
                  <div className="w-full max-w-xs">
                    <Input
                      type="number"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      min="1"
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              <div className="border-2 border-warning rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <BsGear className="text-warning text-lg" />
                  <h4 className="text-base font-semibold text-warning">Device Timing Controls</h4>
                </div>

                              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Blower Duration (s)</label>
                  <Input
                    type="number"
                    value={blowerDuration}
                    onChange={(e) => setBlowerDuration(e.target.value)}
                    min="0"
                    step="0.1"
                    className="w-full"
                    size="sm"
                  />
                </div>
              </div>
              </div>

              <div className="space-y-2">
                <Button
                  color="primary"
                  onClick={handleFeedNow}
                  className="w-full h-10 text-sm font-semibold"
                  startContent={<BsPlay className="text-lg" />}
                  isLoading={isFeeding}
                  isDisabled={(() => {
                    let amount;
                    if (selectedFeedType === 'custom') {
                      amount = customAmount;
                    } else {
                      const currentPresets = getCurrentPresets();
                      const selectedPreset = currentPresets.find(type => type.id === selectedFeedType);
                      amount = selectedPreset ? selectedPreset.amount : '0';
                    }
                    return isFeeding || !amount || amount === '0' || parseFloat(amount) <= 0;
                  })()}
                >
                  {isFeeding ? 'FEEDING...' : `FEED NOW (${(() => {
                    if (selectedFeedType === 'custom') {
                      return customAmount;
                    } else {
                      const currentPresets = getCurrentPresets();
                      const selectedPreset = currentPresets.find(type => type.id === selectedFeedType);
                      return selectedPreset ? selectedPreset.amount : '0';
                    }
                  })()}g)`}
                </Button>

                {isFeeding && (
                  <Button
                    color="danger"
                    onClick={handleEmergencyStop}
                    className="w-full h-10 text-sm font-semibold"
                    startContent={<BsX className="text-lg" />}
                  >
                    EMERGENCY STOP
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-default-500 bg-default-100 rounded-md p-2">
                <BsGear className="text-sm" />
                <span>solenoid valve 5s open / 10s close (fixed), blower {blowerDuration}s</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-content1 rounded-lg shadow-small p-5">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Live Camera & System Status</h2>
            <CameraPreview 
              className="aspect-video" 
              isEnabled={isCameraEnabled} 
              onToggle={toggleCamera}
            />
            
            <div className="border border-default-200 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <BsGear className="text-primary" />
                System Status
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-600">Solenoid Valve:</span>
                  <span className="text-sm font-medium text-blue-600">5s open/10s close (fixed)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-600">Blower:</span>
                  <span className="text-sm font-medium text-default-400">Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-600">System:</span>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
              </div>
            </div>

            <div className="border border-default-200 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <BsClock className="text-primary" />
                Recent Feeds
              </h3>
              <div className="space-y-2">
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const tomorrow = new Date(today);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  
                  const todayFeeds = allFeedLogs
                    .filter(log => log.date >= today && log.date < tomorrow)
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .slice(0, 3);
                  
                  return todayFeeds.map(feed => (
                    <div key={feed.id} className="flex items-center justify-between text-sm">
                      <span className="text-default-600">
                        {feed.date.getHours().toString().padStart(2, '0')}:
                        {feed.date.getMinutes().toString().padStart(2, '0')} Today
                      </span>
                      <span className="font-medium">{feed.amount}g</span>
                    </div>
                  ));
                })()}
              </div>
              <div className="pt-2 border-t border-default-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-default-600">Today Total:</span>
                  <span className="font-medium text-primary">
                    {(() => {
                      // Calculate today's total
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const tomorrow = new Date(today);
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      
                      const todayTotal = allFeedLogs
                        .filter(log => log.date >= today && log.date < tomorrow)
                        .reduce((total, feed) => total + feed.amount, 0);
                      
                      return `${todayTotal}g`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div className="bg-content1 rounded-lg shadow-small p-5">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Automatic Feed</h2>

          {/* Schedule Form */}
          <div className="border border-default-200 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <BsClock />
              {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <Input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Feed Preset</label>
                <div className="relative">
                  <select
                    value={scheduleForm.presetId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, presetId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-default-200 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {feedPresets.map((preset: any) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                color="primary"
                onClick={editingSchedule ? handleUpdateSchedule : handleAddSchedule}
                size="sm"
              >
                {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
              </Button>
              {editingSchedule && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditingSchedule(null);
                    resetScheduleForm();
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Schedules List */}
          {schedules.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Active Schedules</h3>
              {schedules.map((schedule: any) => {
                const preset = feedPresets.find((p: any) => p.id === schedule.presetId);
                return (
                  <div key={schedule.id} className={`flex items-center justify-between p-3 border rounded-lg ${schedule.enabled ? 'border-primary bg-primary/5' : 'border-default-200 bg-default-50'}`}>
                    <div className="flex items-center gap-3">
                      <Switch
                        isSelected={schedule.enabled}
                        onChange={() => handleToggleSchedule(schedule.id)}
                        size="sm"
                        color="primary"
                      />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <BsClock className="text-sm" />
                          {schedule.time}
                        </div>
                        <div className="text-sm text-default-500">
                          {preset ? `${preset.label} (${preset.amount}g)` : 'Unknown preset'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSchedule(schedule)}
                      >
                        <BsPencil />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        color="danger"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <BsTrash />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Schedule Summary */}
          {schedules.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-default-500 bg-default-100 rounded-md p-2">
              <BsClock className="text-sm" />
              <span>{schedules.filter((s: any) => s.enabled).length} active schedule(s) out of {schedules.length} total</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-content1 rounded-lg shadow-small p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Feed Presets</h2>
            <p className="text-sm text-default-500">{feedPresets.length} presets configured</p>
          </div>
          <Button
            variant="bordered"
            onClick={() => setShowPresetManager(!showPresetManager)}
            className="flex items-center gap-2"
          >
            {showPresetManager ? <BsChevronUp /> : <BsChevronDown />}
            Manage Presets
          </Button>
        </div>
        {/* Preset Manager Panel */}
        {showPresetManager && (
          <div className="pt-8 space-y-4">
            {/* Add/Edit Preset Form */}
            <div className="border border-default-200 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium">
                {editingPreset ? 'Edit Preset' : 'Add New Preset'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Preset Name</label>
                  <Input
                    value={presetForm.label}
                    onChange={(e) => setPresetForm({ ...presetForm, label: e.target.value })}
                    placeholder="e.g., Extra Small (25g)"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (g)</label>
                  <Input
                    type="number"
                    value={presetForm.amount}
                    onChange={(e) => setPresetForm({ ...presetForm, amount: e.target.value })}
                    placeholder="25"
                    min="1"
                    size="sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Blower Duration (s)</label>
                  <Input
                    type="number"
                    value={presetForm.timing.blowerDuration}
                    onChange={(e) => setPresetForm({
                      ...presetForm,
                      timing: { ...presetForm.timing, blowerDuration: e.target.value }
                    })}
                    min="0"
                    step="0.1"
                    size="sm"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  color="primary"
                  onClick={editingPreset ? handleUpdatePreset : handleAddPreset}
                  size="sm"
                >
                  {editingPreset ? 'Update Preset' : 'Add Preset'}
                </Button>
                {editingPreset && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingPreset(null);
                      resetPresetForm();
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            {/* Existing Presets List */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Existing Presets</h3>
              {feedPresets.map((preset: any) => (
                <div key={preset.id} className="flex items-center justify-between p-3 border border-default-200 rounded-lg">
                  <div>
                    <div className="font-medium">{preset.label}</div>
                    <div className="text-sm text-default-500">
                      {preset.amount}g | Blower: {preset.timing.blowerDuration}s | Solenoid Valve: 5s open/10s close (fixed)
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditPreset(preset)}
                    >
                      <BsPencil />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      color="danger"
                      onClick={() => handleDeletePreset(preset.id)}
                    >
                      <BsTrash />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Feed Statistics */}
      <div className="bg-content1 rounded-lg shadow-small p-5">
        <h2 className="text-xl font-bold mb-4">Feed Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            const monthAgo = new Date(today);
            monthAgo.setDate(monthAgo.getDate() - 30);

            // Calculate statistics
            const todayFeeds = allFeedLogs.filter(log => log.date >= today);
            const yesterdayFeeds = allFeedLogs.filter(log => log.date >= yesterday && log.date < today);
            const weekFeeds = allFeedLogs.filter(log => log.date >= weekAgo);
            const monthFeeds = allFeedLogs.filter(log => log.date >= monthAgo);

            const todayTotal = todayFeeds.reduce((sum, feed) => sum + feed.amount, 0);
            const yesterdayTotal = yesterdayFeeds.reduce((sum, feed) => sum + feed.amount, 0);
            const weekTotal = weekFeeds.reduce((sum, feed) => sum + feed.amount, 0);
            const monthTotal = monthFeeds.reduce((sum, feed) => sum + feed.amount, 0);

            const weekAverage = Math.round(weekTotal / 7);
            const monthAverage = Math.round(monthTotal / 30);

            return (
              <>
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{todayTotal}g</div>
                  <div className="text-sm text-default-600">Today</div>
                  <div className="text-xs text-default-500">{todayFeeds.length} feeds</div>
                </div>
                <div className="text-center p-3 bg-default-100 rounded-lg">
                  <div className="text-2xl font-bold text-default-700">{yesterdayTotal}g</div>
                  <div className="text-sm text-default-600">Yesterday</div>
                  <div className="text-xs text-default-500">{yesterdayFeeds.length} feeds</div>
                </div>
                <div className="text-center p-3 bg-secondary/10 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{weekAverage}g</div>
                  <div className="text-sm text-default-600">7-day Avg</div>
                  <div className="text-xs text-default-500">{weekFeeds.length} total feeds</div>
                </div>
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">{monthAverage}g</div>
                  <div className="text-sm text-default-600">30-day Avg</div>
                  <div className="text-xs text-default-500">{monthFeeds.length} total feeds</div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Feed Log Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Feed Log</h2>

          {/* Date Range Filter */}
          <div className="flex items-center gap-3">
            <DateRangePicker
              className="max-w-xs"
              label="Filter by date range"
              value={filterDateRange}
              onChange={(value) => {
                if (value) {
                  setFilterDateRange({ start: value.start, end: value.end });
                }
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDateRangeReset}
              className="mb-0.5"
            >
              Reset
            </Button>
          </div>
        </div>

        <Table aria-label="Feed log table">
          <TableHeader columns={columns}>
            {(column: { key: string; label: string }) => (
              <TableColumn
                key={column.key}
                align={column.key === "time" ? "start" : column.key === "actions" ? "center" : "center"}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody 
            items={filteredFeedLogs} 
            emptyContent={isLoadingFeedLogs ? "Loading feed logs..." : "No feed logs found for the selected date range"}
            isLoading={isLoadingFeedLogs}
            loadingContent="Loading feed logs..."
          >
            {(item: { id: string; time: string; amount: number; augerDuration: number; blowerDuration: number; date: Date }) => (
              <TableRow key={item.id}>
                {(columnKey: React.Key) => (
                  <TableCell>
                    {renderCellContent(item, columnKey)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={handleCloseVideoModal}>
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] m-4" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Feed Video</h3>
              <button
                onClick={handleCloseVideoModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <BsX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-4">
              {currentVideoFile && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    key={currentVideoFile}
                    controls
                    className="w-full h-full object-contain"
                    poster="/placeholder-video.png"
                  >
                    <source 
                      src={`${pi_server_endpoint}/api/feed-video/${currentVideoFile}`} 
                      type="video/mp4" 
                    />
                    <p className="text-white p-4">
                      Your browser does not support the video tag.
                      <br />
                      <a 
                        href={`${pi_server_endpoint}/api/feed-video/${currentVideoFile}`}
                        className="text-blue-400 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download video file
                      </a>
                    </p>
                  </video>
                </div>
              )}
              
              {/* Video Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>File:</strong> {currentVideoFile}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This video was recorded during the feeding process.
                </p>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button
                variant="ghost"
                onClick={handleCloseVideoModal}
              >
                Close
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  window.open(`${pi_server_endpoint}/api/feed-video/${currentVideoFile}`, '_blank');
                }}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedControl; 