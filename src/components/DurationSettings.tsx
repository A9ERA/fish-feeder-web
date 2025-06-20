import React, { useState, useEffect } from 'react';
import { Slider } from '@heroui/slider';
import { ref, set, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { FaClock, FaSave } from 'react-icons/fa';

interface DurationData {
  syncSensors: number;
  syncSchedule: number;
  syncFeedPreset: number;
}

const DurationSettings: React.FC = () => {
  const [durations, setDurations] = useState<DurationData>({
    syncSensors: 10,
    syncSchedule: 10,
    syncFeedPreset: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load data from Firebase on component mount
  useEffect(() => {
    const durationRef = ref(database, 'app_setting/duration');
    
    const unsubscribe = onValue(durationRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setDurations({
          syncSensors: data.syncSensors || 10,
          syncSchedule: data.syncSchedule || 10,
          syncFeedPreset: data.syncFeedPreset || 10,
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save data to Firebase
  const saveDuration = async () => {
    setIsSaving(true);
    try {
      const durationRef = ref(database, 'app_setting/duration');
      await set(durationRef, durations);
      console.log('Duration settings saved successfully');
    } catch (error) {
      console.error('Error saving duration settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSliderChange = (key: keyof DurationData, value: number) => {
    setDurations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-content1 rounded-lg shadow-small p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-content1 rounded-lg shadow-small p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaClock className="text-orange-500 text-xl" />
        <h3 className="text-lg font-semibold text-foreground">Sync Duration Settings</h3>
      </div>
      
      <div className="space-y-6">
        {/* Sensors Sync Interval */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground">
              Sensors Sync Interval
            </label>
            <span className="text-sm text-foreground-500">
              {durations.syncSensors} seconds
            </span>
          </div>
          <Slider
            size="sm"
            step={1}
            minValue={1}
            maxValue={60}
            value={durations.syncSensors}
            onChange={(value) => handleSliderChange('syncSensors', value as number)}
            className="w-full"
            color="primary"
            showTooltip={true}
          />
        </div>

        {/* Schedule Sync Interval */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground">
              Schedule Sync Interval
            </label>
            <span className="text-sm text-foreground-500">
              {durations.syncSchedule} seconds
            </span>
          </div>
          <Slider
            size="sm"
            step={1}
            minValue={1}
            maxValue={60}
            value={durations.syncSchedule}
            onChange={(value) => handleSliderChange('syncSchedule', value as number)}
            className="w-full"
            color="secondary"
            showTooltip={true}
          />
        </div>

        {/* Feed Preset Sync Interval */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground">
              Feed Preset Sync Interval
            </label>
            <span className="text-sm text-foreground-500">
              {durations.syncFeedPreset} seconds
            </span>
          </div>
          <Slider
            size="sm"
            step={1}
            minValue={1}
            maxValue={60}
            value={durations.syncFeedPreset}
            onChange={(value) => handleSliderChange('syncFeedPreset', value as number)}
            className="w-full"
            color="success"
            showTooltip={true}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-divider">
          <button
            onClick={saveDuration}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaSave className={`text-sm ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DurationSettings; 