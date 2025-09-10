import { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/config/firebase';
import { Slider } from '@heroui/slider';
import { Button } from '@heroui/button';
import { FaFish } from 'react-icons/fa';

// Structure: app_setting/feeder: { weight_tolerance: number } (grams)
const DEFAULT_TOLERANCE_G = 5;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const FeederSettings = () => {
  const [weightTolerance, setWeightTolerance] = useState<number>(DEFAULT_TOLERANCE_G);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedMsg, setSavedMsg] = useState<string>('');

  useEffect(() => {
    const feederRef = ref(database, 'app_setting/feeder');
    const unsub = onValue(feederRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === 'object') {
        const tol = Number(data.weight_tolerance);
        if (!Number.isNaN(tol)) {
          setWeightTolerance(clamp(tol, 0, 200));
        }
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSavedMsg('');
    try {
      await update(ref(database, 'app_setting'), {
        feeder: { weight_tolerance: clamp(weightTolerance, 0, 200) }
      });
      setSavedMsg('บันทึกค่า Feeder settings สำเร็จ');
    } catch (e) {
      console.error(e);
      setSavedMsg('บันทึกล้มเหลว');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSavedMsg(''), 2500);
    }
  };

  return (
    <div className="bg-content1 rounded-lg shadow-small p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FaFish className="text-sky-600 text-xl" />
        <h3 className="text-lg font-semibold">Feeder settings</h3>
      </div>

      {isLoading ? (
        <div className="text-sm text-default-500">กำลังโหลด...</div>
      ) : (
        <>
          <div>
            <label className="text-xs text-default-500">Weight tolerance (g) - ค่าความคลาดเคลื่อนน้ำหนัก</label>
            <Slider
              size="sm"
              minValue={0}
              maxValue={200}
              step={1}
              value={weightTolerance}
              onChange={(val) => typeof val === 'number' && setWeightTolerance(val)}
              className="mt-1"
              color="primary"
              showTooltip
            />
            <div className="text-xs text-default-600 mt-1">{weightTolerance} g</div>
          </div>

          <div className="flex items-center gap-3">
            <Button color="primary" onClick={handleSave} isLoading={isSaving}>บันทึก</Button>
            {savedMsg && (<span className="text-xs text-default-500">{savedMsg}</span>)}
          </div>
        </>
      )}
    </div>
  );
};

export default FeederSettings;


