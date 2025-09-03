import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface SensorValue {
  type: string;
  unit: string;
  value: number | string;
}

export interface Sensor {
  description: string;
  last_updated: string;
  values: SensorValue[];
}

export interface SensorsData {
  last_updated: string;
  sensors: {
    DHT22_FEEDER: Sensor;
    DHT22_SYSTEM: Sensor;
    HX711_FEEDER: Sensor;
    POWER_MONITOR: Sensor;
    SOIL_MOISTURE: Sensor;
  };
  sync_timestamp: string;
}

export type AlertLevel = 'normal' | 'warning' | 'critical';

export interface AlertThresholds {
  warning: number;
  critical: number;
}

export interface AlertActiveItem {
  sensorKey: string; // 'dht22_feeder_humidity' | 'soil_moisture'
  level: AlertLevel;
  value: number;
  thresholds: AlertThresholds;
  alert_id: string | null;
  acknowledged: boolean;
  timestamp_first_seen?: string;
  last_updated?: string;
  message?: string;
  last_normal_at?: string;
}

export interface AlertSettings {
  dht22_feeder_humidity: AlertThresholds;
  soil_moisture: AlertThresholds;
}

export interface AlertLogItem {
  id?: string;
  sensorKey: string;
  level: AlertLevel;
  value: number;
  thresholds: AlertThresholds;
  alert_id: string;
  timestamp: string;
  action?: 'trigger' | 'escalate' | 'resolve';
}
