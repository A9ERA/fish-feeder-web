import { useEffect, useMemo, useState } from 'react';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';
import { Button } from '@heroui/button';
import { ref, onValue, set, update } from 'firebase/database';
import { database } from '@/config/firebase';
import type { AlertLevel } from '@/types';

type ActiveAlert = {
  sensorKey: string;
  level: AlertLevel;
  value: number;
  thresholds: { warning: number; critical: number };
  alert_id: string;
  acknowledged: boolean;
  timestamp_first_seen?: string;
  last_updated?: string;
};

const levelMap: Record<AlertLevel, { title: string; color: string; badge: string }> = {
  normal: { title: 'สถานะปกติ', color: 'text-success', badge: 'bg-success-100 text-success-700 border-success-200' },
  warning: { title: 'คำเตือน', color: 'text-warning', badge: 'bg-warning-100 text-warning-700 border-warning-200' },
  critical: { title: 'ผิดปกติ', color: 'text-danger', badge: 'bg-danger-100 text-danger-700 border-danger-200' },
};

const labelMap: Record<string, string> = {
  dht22_feeder_humidity: 'ความชื้นในถังอาหาร (DHT22)',
  soil_moisture: 'ความชื้นเม็ดอาหาร (Soil Sensor)',
};

const getAlertDescription = (sensorKey: string, level: AlertLevel): string | null => {
  if (level === 'normal') return null;

  switch (sensorKey) {
    case 'dht22_feeder_humidity':
      if (level === 'warning') return 'ความชื้นอากาศสูงกว่าปกติ';
      if (level === 'critical') return 'วิกฤตความชื้นอากาศ เปลี่ยน Silica gel';
      return null;
    case 'soil_moisture':
      if (level === 'warning') return 'เม็ดอาหารเริ่มชื้น';
      if (level === 'critical') return 'วิกฤตความชื้นเม็ดอาหาร';
      return null;
    case 'food_weight':
      if (level === 'warning') return 'น้ำหนักอาหารต่ำกว่าปกติ';
      if (level === 'critical') return 'วิกฤตน้ำหนักอาหาร';
      return null;
    default:
      return null;
  }
};

const AlertModal = () => {
  const [active, setActive] = useState<Record<string, ActiveAlert>>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const activeRef = ref(database, 'alerts/active');
    const unsub = onValue(activeRef, (snapshot) => {
      const data = snapshot.val() || {};
      setActive(data);
    });
    return () => unsub();
  }, []);

  // If any non-normal alert exists and not acknowledged -> show modal
  const visibleAlerts = useMemo(() => {
    const items = Object.values(active || {}).filter((a: any) => a && a.level !== 'normal' && a.acknowledged !== true);
    return items as ActiveAlert[];
  }, [active]);

  useEffect(() => {
    // Note 2: If sensor returns to normal, entry is removed by backend; modal should hide.
    setOpen(visibleAlerts.length > 0);
  }, [visibleAlerts.length]);

  const acknowledge = async (sensorKey: string, alertId: string) => {
    try {
      // Mark acknowledge on Firebase
      await update(ref(database, `alerts/active/${sensorKey}`), { acknowledged: true });
      await set(ref(database, `alerts/acknowledged/${sensorKey}`), {
        alert_id: alertId,
        acknowledged: true,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.error('ack error', e);
    }
  };

  const highestLevel = useMemo<AlertLevel>(() => {
    if (visibleAlerts.some(a => a.level === 'critical')) return 'critical';
    if (visibleAlerts.some(a => a.level === 'warning')) return 'warning';
    return 'normal';
  }, [visibleAlerts]);

  if (!open) return null;

  const style = levelMap[highestLevel];

  return (
    <Modal isOpen={open} onOpenChange={setOpen} hideCloseButton placement="top-center">
      <ModalContent>
        <ModalHeader className={`flex flex-col gap-1 ${style.color}`}>{style.title}</ModalHeader>
        <ModalBody>
          <div className="space-y-3">
            {visibleAlerts.map((a) => (
              <div key={a.sensorKey} className="border border-divider rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{labelMap[a.sensorKey] || a.sensorKey}</div>
                  <span className={`text-xs px-2 py-0.5 rounded border ${style.badge}`}>{a.level.toUpperCase()}</span>
                </div>
                {/* <div className="text-xs text-default-500 mt-1">ค่าที่วัดได้: {a.value}% | Warning: {a.thresholds.warning}% | Critical: {a.thresholds.critical}%</div> */}
                {getAlertDescription(a.sensorKey, a.level) && (
                  <div className="text-xs text-default-700 mt-1">
                    {getAlertDescription(a.sensorKey, a.level)}
                  </div>
                )}
                {a.acknowledged ? (
                  <div className="text-xs text-default-500 mt-1">ผู้ใช้รับทราบแล้ว</div>
                ) : (
                  <div className="mt-2">
                    <Button size="sm" color="primary" onClick={() => acknowledge(a.sensorKey, a.alert_id)}>รับทราบ (OK)</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onClick={() => setOpen(false)}>ปิด</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AlertModal;


