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
