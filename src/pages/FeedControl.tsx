import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { BsTrash, BsPlay, BsGear, BsPencil, BsClock, BsChevronDown, BsChevronUp } from 'react-icons/bs';
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
    timing: { actuatorUp: '2', actuatorDown: '1', augerDuration: '10', blowerDuration: '5' }
  },
  {
    id: 'medium',
    label: 'medium (100g)',
    amount: '100',
    timing: { actuatorUp: '3', actuatorDown: '2', augerDuration: '15', blowerDuration: '10' }
  },
  {
    id: 'large',
    label: 'large (200g)',
    amount: '200',
    timing: { actuatorUp: '4', actuatorDown: '2', augerDuration: '20', blowerDuration: '15' }
  },
  {
    id: 'xl',
    label: 'xl (1.0kg)',
    amount: '1000',
    timing: { actuatorUp: '5', actuatorDown: '3', augerDuration: '30', blowerDuration: '20' }
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
  const [foodAmount, setFoodAmount] = useState('100');
  const [selectedFeedType, setSelectedFeedType] = useState('small');
  const [customAmount, setCustomAmount] = useState('50');
  // Device timing controls - initialized to 'small' preset values
  const [actuatorUp, setActuatorUp] = useState('2');
  const [actuatorDown, setActuatorDown] = useState('1');
  const [augerDuration, setAugerDuration] = useState('10');
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
    timing: { actuatorUp: '', actuatorDown: '', augerDuration: '', blowerDuration: '' }
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

  // Mock feed log data with actual Date objects
  const allFeedLogs = [
    { id: 1, time: '12 MAY 2025 - 17:41:30', amount: 50, duration: 15, date: new Date(2025, 4, 12, 17, 41, 30) },
    { id: 2, time: '12 MAY 2025 - 15:46:30', amount: 100, duration: 25, date: new Date(2025, 4, 12, 15, 46, 30) },
    { id: 3, time: '12 MAY 2025 - 12:46:30', amount: 75, duration: 20, date: new Date(2025, 4, 12, 12, 46, 30) },
    { id: 4, time: '12 MAY 2025 - 05:46:30', amount: 150, duration: 35, date: new Date(2025, 4, 12, 5, 46, 30) },
    { id: 5, time: '11 MAY 2025 - 17:46:30', amount: 200, duration: 45, date: new Date(2025, 4, 11, 17, 46, 30) },
  ];

  const [filteredFeedLogs, setFilteredFeedLogs] = useState(allFeedLogs);

  // Table columns
  const columns = [
    { key: "time", label: "Time" },
    { key: "amount", label: "Amount (g)" },
    { key: "duration", label: "Duration (s)" }
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
      } catch (error) {
        console.error('Error loading initial data:', error);
        setFeedPresets(defaultFeedPresets);
        setSchedules([]);
      }
    };
    
    loadInitialData();
  }, []);

  // Filter feed logs when date range changes
  useEffect(() => {
    if (!filterDateRange.start && !filterDateRange.end) {
      setFilteredFeedLogs(allFeedLogs);
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

    setFilteredFeedLogs(filtered);
  }, [filterDateRange]);

  // Get current feed presets including custom option
  const getCurrentPresets = () => {
    return [
      ...feedPresets,
      {
        id: 'custom',
        label: 'Custom',
        amount: customAmount,
        timing: { actuatorUp: actuatorUp, actuatorDown: actuatorDown, augerDuration: augerDuration, blowerDuration: blowerDuration }
      }
    ];
  };

  // Preset management functions
  const handleAddPreset = async () => {
    if (presetForm.label && presetForm.amount && presetForm.timing.actuatorUp && presetForm.timing.actuatorDown && presetForm.timing.augerDuration && presetForm.timing.blowerDuration) {
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
      timing: { ...preset.timing }
    });
  };

  const handleUpdatePreset = async () => {
    if (editingPreset && presetForm.label && presetForm.amount && presetForm.timing.actuatorUp) {
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
      timing: { actuatorUp: '', actuatorDown: '', augerDuration: '', blowerDuration: '' }
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
      setActuatorUp(selectedType.timing.actuatorUp);
      setActuatorDown(selectedType.timing.actuatorDown);
      setAugerDuration(selectedType.timing.augerDuration);
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
    const amount = selectedFeedType === 'custom' ? customAmount : foodAmount;
    
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
          actuatorUp: parseFloat(actuatorUp),
          actuatorDown: parseFloat(actuatorDown),
          augerDuration: parseFloat(augerDuration),
          blowerDuration: parseFloat(blowerDuration)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Feed started successfully:', result);
      
      // Optional: Add success notification here
      
    } catch (error) {
      console.error('Error starting feed:', error);
      // Optional: Add error notification here
    } finally {
      setIsFeeding(false);
    }
  };


  const handleDateRangeReset = () => {
    setFilterDateRange({
      start: new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate() - 7),
      end: new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
    });
  };

  // Render cell content, handling date objects
  const renderCellContent = (item: any, columnKey: React.Key) => {
    if (columnKey === 'date') {
      return formatDate(item.date);
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

              {/* Device Timing Controls */}
              <div className="border-2 border-warning rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <BsGear className="text-warning text-lg" />
                  <h4 className="text-base font-semibold text-warning">Device Timing Controls</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Actuator Up (s)</label>
                    <Input
                      type="number"
                      value={actuatorUp}
                      onChange={(e) => setActuatorUp(e.target.value)}
                      min="0"
                      step="0.1"
                      className="w-full"
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Actuator Down (s)</label>
                    <Input
                      type="number"
                      value={actuatorDown}
                      onChange={(e) => setActuatorDown(e.target.value)}
                      min="0"
                      step="0.1"
                      className="w-full"
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Auger Duration (s)</label>
                    <Input
                      type="number"
                      value={augerDuration}
                      onChange={(e) => setAugerDuration(e.target.value)}
                      min="0"
                      step="0.1"
                      className="w-full"
                      size="sm"
                    />
                  </div>
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

              <Button
                color="primary"
                onClick={handleFeedNow}
                className="w-full h-10 text-sm font-semibold"
                startContent={<BsPlay className="text-lg" />}
                isLoading={isFeeding}
                isDisabled={(() => {
                  const amount = selectedFeedType === 'custom' ? customAmount : (getCurrentPresets().find(type => type.id === selectedFeedType)?.amount || '0');
                  return isFeeding || !amount || amount === '0' || parseFloat(amount) <= 0;
                })()}
              >
                {isFeeding ? 'FEEDING...' : `FEED NOW (${selectedFeedType === 'custom' ? customAmount : (getCurrentPresets().find(type => type.id === selectedFeedType)?.amount || '0')}g)`}
              </Button>

              {/* Device Timing Summary */}
              <div className="flex items-center gap-2 text-sm text-default-500 bg-default-100 rounded-md p-2">
                <BsGear className="text-sm" />
                <span>actuator {actuatorUp}s↑ / {actuatorDown}s↓, auger {augerDuration}s, blower {blowerDuration}s</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-content1 rounded-lg shadow-small p-5">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Live Camera & System Status</h2>
            <CameraPreview className="aspect-video" />
            
            {/* Feed Status */}
            <div className="border border-default-200 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <BsGear className="text-primary" />
                System Status
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-600">Actuator:</span>
                  <span className="text-sm font-medium text-default-400">Stopped</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-600">Auger:</span>
                  <span className="text-sm font-medium text-default-400">Ready</span>
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

            {/* Recent Feed History */}
            <div className="border border-default-200 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <BsClock className="text-primary" />
                Recent Feeds
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-default-600">17:41 Today</span>
                  <span className="font-medium">50g</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-default-600">15:46 Today</span>
                  <span className="font-medium">100g</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-default-600">12:46 Today</span>
                  <span className="font-medium">75g</span>
                </div>
              </div>
              <div className="pt-2 border-t border-default-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-default-600">Today Total:</span>
                  <span className="font-medium text-primary">225g</span>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Actuator Up (s)</label>
                  <Input
                    type="number"
                    value={presetForm.timing.actuatorUp}
                    onChange={(e) => setPresetForm({
                      ...presetForm,
                      timing: { ...presetForm.timing, actuatorUp: e.target.value }
                    })}
                    min="0"
                    step="0.1"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Actuator Down (s)</label>
                  <Input
                    type="number"
                    value={presetForm.timing.actuatorDown}
                    onChange={(e) => setPresetForm({
                      ...presetForm,
                      timing: { ...presetForm.timing, actuatorDown: e.target.value }
                    })}
                    min="0"
                    step="0.1"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Auger Duration (s)</label>
                  <Input
                    type="number"
                    value={presetForm.timing.augerDuration}
                    onChange={(e) => setPresetForm({
                      ...presetForm,
                      timing: { ...presetForm.timing, augerDuration: e.target.value }
                    })}
                    min="0"
                    step="0.1"
                    size="sm"
                  />
                </div>
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
                      {preset.amount}g | Act: {preset.timing.actuatorUp}s↑/{preset.timing.actuatorDown}s↓ | Auger: {preset.timing.augerDuration}s | Blower: {preset.timing.blowerDuration}s
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
                align={column.key !== "time" ? "end" : "start"}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={filteredFeedLogs} emptyContent="No feed logs found for the selected date range">
            {(item: { id: number; time: string; amount: number; duration: number; date: Date }) => (
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
    </div>
  );
};

export default FeedControl; 