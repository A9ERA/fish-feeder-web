import { useEffect, useMemo, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/config/firebase';
import { Slider } from '@heroui/slider';
import { Button } from '@heroui/button';
import { WiHumidity } from 'react-icons/wi';
import { MdOutlineWaterDrop } from 'react-icons/md';
import type { AlertSettings as AlertSettingsType } from '@/types';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const defaultSettings: AlertSettingsType = {
  dht22_feeder_humidity: { warning: 70, critical: 85 },
  soil_moisture: { warning: 60, critical: 80 },
};

const AlertSettings = () => {
  const [settings, setSettings] = useState<AlertSettingsType>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedMsg, setSavedMsg] = useState<string>('');

  useEffect(() => {
    const settingRef = ref(database, 'app_setting/alert');
    const unsub = onValue(settingRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === 'object') {
        setSettings({
          dht22_feeder_humidity: {
            warning: Number(data?.dht22_feeder_humidity?.warning ?? defaultSettings.dht22_feeder_humidity.warning),
            critical: Number(data?.dht22_feeder_humidity?.critical ?? defaultSettings.dht22_feeder_humidity.critical),
          },
          soil_moisture: {
            warning: Number(data?.soil_moisture?.warning ?? defaultSettings.soil_moisture.warning),
            critical: Number(data?.soil_moisture?.critical ?? defaultSettings.soil_moisture.critical),
          },
        });
      }
    });
    return () => unsub();
  }, []);

  const handleChange = (key: keyof AlertSettingsType, type: 'warning' | 'critical', value: number) => {
    setSettings((prev) => {
      const current = { ...prev[key] };
      if (type === 'warning') {
        current.warning = clamp(value, 0, 100);
        // Ensure warning <= critical - 1
        if (current.warning >= current.critical) {
          current.critical = clamp(current.warning + 1, 0, 100);
        }
      } else {
        current.critical = clamp(value, 0, 100);
        // Ensure warning <= critical - 1
        if (current.warning >= current.critical) {
          current.warning = clamp(current.critical - 1, 0, 100);
        }
      }
      return { ...prev, [key]: current };
    });
  };

  const previewBadges = useMemo(() => {
    const render = (warning: number, critical: number) => (
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-0.5 rounded bg-success-100 text-success-700 border border-success-200">Normal ≤ {warning - 1}%</span>
        <span className="px-2 py-0.5 rounded bg-warning-100 text-warning-700 border border-warning-200">Warning {warning}% - {critical - 1}%</span>
        <span className="px-2 py-0.5 rounded bg-danger-100 text-danger-700 border border-danger-200">Critical ≥ {critical}%</span>
      </div>
    );
    return {
      feeder: render(settings.dht22_feeder_humidity.warning, settings.dht22_feeder_humidity.critical),
      soil: render(settings.soil_moisture.warning, settings.soil_moisture.critical),
    };
  }, [settings]);

  const handleSave = async () => {
    setIsLoading(true);
    setSavedMsg('');
    try {
      // Partial update only specific keys to avoid overwriting other alert sections (e.g., food_weight)
      await update(ref(database, 'app_setting/alert'), {
        dht22_feeder_humidity: settings.dht22_feeder_humidity,
        soil_moisture: settings.soil_moisture,
      });
      setSavedMsg('บันทึกการตั้งค่าแล้ว');
    } catch (e) {
      setSavedMsg('บันทึกล้มเหลว');
      console.error(e);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSavedMsg(''), 2500);
    }
  };

  return (
    <div className="bg-content1 rounded-lg shadow-small p-6 space-y-6">
      <div className="flex items-center gap-3">
        <WiHumidity className="text-indigo-500 text-xl" />
        <h3 className="text-lg font-semibold">Alert Settings</h3>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <WiHumidity className="text-indigo-500" />
            <h4 className="text-sm font-medium text-default-700">Feeder Humidity (DHT22)</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-default-500">Warning Threshold</label>
              <Slider
                size="sm"
                minValue={0}
                maxValue={100}
                value={settings.dht22_feeder_humidity.warning}
                onChange={(val) => typeof val === 'number' && handleChange('dht22_feeder_humidity', 'warning', val)}
                className="mt-1"
                color="warning"
              />
              <div className="text-xs text-default-600 mt-1">{settings.dht22_feeder_humidity.warning}%</div>
            </div>
            <div>
              <label className="text-xs text-default-500">Critical Threshold</label>
              <Slider
                size="sm"
                minValue={0}
                maxValue={100}
                value={settings.dht22_feeder_humidity.critical}
                onChange={(val) => typeof val === 'number' && handleChange('dht22_feeder_humidity', 'critical', val)}
                className="mt-1"
                color="danger"
              />
              <div className="text-xs text-default-600 mt-1">{settings.dht22_feeder_humidity.critical}%</div>
            </div>
          </div>
          <div className="mt-2">{previewBadges.feeder}</div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <MdOutlineWaterDrop className="text-emerald-500" />
            <h4 className="text-sm font-medium text-default-700">Food Moisture (Soil Sensor)</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-default-500">Warning Threshold</label>
              <Slider
                size="sm"
                minValue={0}
                maxValue={100}
                value={settings.soil_moisture.warning}
                onChange={(val) => typeof val === 'number' && handleChange('soil_moisture', 'warning', val)}
                className="mt-1"
                color="warning"
              />
              <div className="text-xs text-default-600 mt-1">{settings.soil_moisture.warning}%</div>
            </div>
            <div>
              <label className="text-xs text-default-500">Critical Threshold</label>
              <Slider
                size="sm"
                minValue={0}
                maxValue={100}
                value={settings.soil_moisture.critical}
                onChange={(val) => typeof val === 'number' && handleChange('soil_moisture', 'critical', val)}
                className="mt-1"
                color="danger"
              />
              <div className="text-xs text-default-600 mt-1">{settings.soil_moisture.critical}%</div>
            </div>
          </div>
          <div className="mt-2">{previewBadges.soil}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button color="primary" onClick={handleSave} isLoading={isLoading}>save</Button>
        {savedMsg && (<span className="text-xs text-default-500">{savedMsg}</span>)}
      </div>
    </div>
  );
};

export default AlertSettings;


