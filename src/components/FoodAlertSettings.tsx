import { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/config/firebase';
import { Slider } from '@heroui/slider';
import { Button } from '@heroui/button';
import { FaWeight } from 'react-icons/fa';

type FoodWeightThresholds = {
  warning: number; // kg
  critical: number; // kg
};

const defaultThresholds: FoodWeightThresholds = {
  warning: 3.0,
  critical: 2.0,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const FoodAlertSettings = () => {
  const [thresholds, setThresholds] = useState<FoodWeightThresholds>(defaultThresholds);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedMsg, setSavedMsg] = useState<string>('');

  useEffect(() => {
    const settingRef = ref(database, 'app_setting/alert/food_weight');
    const unsub = onValue(settingRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === 'object') {
        setThresholds({
          warning: Number(data?.warning ?? defaultThresholds.warning),
          critical: Number(data?.critical ?? defaultThresholds.critical),
        });
      }
    });
    return () => unsub();
  }, []);

  const handleChange = (key: 'warning' | 'critical', value: number) => {
    setThresholds((prev) => {
      const next = { ...prev };
      if (key === 'warning') {
        next.warning = clamp(value, 0, 50);
        // Ensure critical <= warning to reflect LOW-level alerts? No, here we ensure logical order: warning >= critical
        if (next.warning < next.critical) {
          next.critical = clamp(next.warning, 0, 50);
        }
      } else {
        next.critical = clamp(value, 0, 50);
        if (next.warning < next.critical) {
          next.warning = clamp(next.critical, 0, 50);
        }
      }
      return next;
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSavedMsg('');
    try {
      // Partial update only the food_weight node to avoid overwriting other alert settings
      await update(ref(database, 'app_setting/alert'), { food_weight: thresholds });
      setSavedMsg('บันทึกค่า Food Alert สำเร็จ');
    } catch (e) {
      console.error(e);
      setSavedMsg('บันทึกล้มเหลว');
    } finally {
      setIsLoading(false);
      setTimeout(() => setSavedMsg(''), 2500);
    }
  };

  return (
    <div className="bg-content1 rounded-lg shadow-small p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FaWeight className="text-amber-500 text-xl" />
        <h3 className="text-lg font-semibold">Food Alert settings</h3>
      </div>

      <div className="text-xs text-default-600">ตั้งค่าน้ำหนักขั้นต่ำของถังกักเก็บอาหาร (กิโลกรัม). ระบบจะแจ้งเตือนเมื่อค่าน้ำหนักต่ำกว่าค่าที่กำหนด</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-default-500">Warning threshold (kg) - แจ้งเตือนเริ่มต้น</label>
          <Slider
            size="sm"
            minValue={0}
            maxValue={50}
            step={0.1}
            value={thresholds.warning}
            onChange={(val) => typeof val === 'number' && handleChange('warning', val)}
            className="mt-1"
            color="warning"
          />
          <div className="text-xs text-default-600 mt-1">{thresholds.warning.toFixed(1)} kg</div>
        </div>
        <div>
          <label className="text-xs text-default-500">Critical threshold (kg) - ต่ำมาก แจ้งเตือนทันที</label>
          <Slider
            size="sm"
            minValue={0}
            maxValue={50}
            step={0.1}
            value={thresholds.critical}
            onChange={(val) => typeof val === 'number' && handleChange('critical', val)}
            className="mt-1"
            color="danger"
          />
          <div className="text-xs text-default-600 mt-1">{thresholds.critical.toFixed(1)} kg</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button color="primary" onClick={handleSave} isLoading={isLoading}>บันทึก</Button>
        {savedMsg && (<span className="text-xs text-default-500">{savedMsg}</span>)}
      </div>

      <div className="text-xs text-default-500">
        ตัวอย่าง: ตั้ง Critical = 2.0 kg หมายถึง ถ้าน้ำหนักถัง ≤ 2.0 kg ให้แจ้งเตือนทันที
      </div>
    </div>
  );
};

export default FoodAlertSettings;


