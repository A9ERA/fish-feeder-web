import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { useCameraContext } from '../contexts/CameraContext';
import { useApiEndpoint } from '../contexts/ApiEndpointContext';
import { SensorsData } from '../types';
import { FaTemperatureHigh, FaWeight } from 'react-icons/fa';
import { WiHumidity } from 'react-icons/wi';
import { MdOutlineWaterDrop } from 'react-icons/md';
import { BiBattery } from 'react-icons/bi';
import { BsLightningCharge } from 'react-icons/bs';
import { TbArrowsCross } from 'react-icons/tb';
import { IoSettingsOutline } from 'react-icons/io5';
import { FaSolarPanel } from 'react-icons/fa';
import { MdPower } from 'react-icons/md';
import { SiWeightsandbiases } from "react-icons/si";
import CameraPreview from '../components/CameraPreview';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DatePicker } from "@heroui/date-picker";
import { CalendarDate } from "@internationalized/date";

// Types for chart data
interface PowerFlowData {
  time: string;
  solarGeneration: number;
  feederConsumption: number;
}

interface BatteryData {
  time: string;
  batteryLevel: number;
}

const Dashboard = () => {
  const { isCameraEnabled, toggleCamera } = useCameraContext();
  const { pi_server_endpoint } = useApiEndpoint();
  const [sensorsData, setSensorsData] = useState<SensorsData | null>(null);
  const [isLedOn, setIsLedOn] = useState<boolean | null>(null);
  const [alertLogs, setAlertLogs] = useState<Array<{
    id: string;
    sensorKey: string;
    level: string;
    value: number;
    thresholds: { warning: number; critical: number };
    timestamp: string;
    action?: string;
  }>>([]);
  
  // Date states for charts
  const today = new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
  const [powerFlowDate, setPowerFlowDate] = useState<CalendarDate>(today);
  const [batteryDate, setBatteryDate] = useState<CalendarDate>(today);
  
  // Chart data states
  const [powerFlowData, setPowerFlowData] = useState<PowerFlowData[]>([]);
  const [batteryData, setBatteryData] = useState<BatteryData[]>([]);
  const [isLoadingPowerFlow, setIsLoadingPowerFlow] = useState<boolean>(false);
  const [isLoadingBattery, setIsLoadingBattery] = useState<boolean>(false);
  // Generic metric chart states
  const [metricDate, setMetricDate] = useState<CalendarDate>(today);
  const [selectedMetric, setSelectedMetric] = useState<string>('feederTemp');
  const [metricData, setMetricData] = useState<Array<{ time: string; value: number }>>([]);
  const [isLoadingMetric, setIsLoadingMetric] = useState<boolean>(false);

  useEffect(() => {
    const sensorsRef = ref(database, 'sensors_data');
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorsData(data);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load LED status from Firebase
  useEffect(() => {
    const systemStatusRef = ref(database, 'system_status/led_status');
    
    const unsubscribe = onValue(systemStatusRef, (snapshot) => {
      const ledStatus = snapshot.val();
      setIsLedOn(ledStatus);
    }, (error) => {
      console.error('Error loading LED status from Firebase:', error);
    });

    return () => unsubscribe();
  }, []);

  // Listen alert logs (last 20 entries)
  useEffect(() => {
    const logsRef = ref(database, 'alerts/logs');
    const unsubscribe = onValue(logsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries<any>(data).map(([id, item]) => ({ id, ...(item || {}) }));
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAlertLogs(list.slice(0, 20));
    });
    return () => unsubscribe();
  }, []);



  // Helper functions to get sensor values
  const getSensorValue = (sensorName: keyof SensorsData['sensors'], valueType: string): number | string => {
    if (!sensorsData?.sensors || !sensorsData.sensors[sensorName]) return 'N/A';
    const value = sensorsData.sensors[sensorName].values.find(v => v.type === valueType);
    return value ? value.value : 'N/A';
  };

  const formatValue = (value: number | string, unit: string, decimals: number = 1): string => {
    if (value === 'N/A') return 'N/A';
    if (typeof value === 'number') {
      return `${value.toFixed(decimals)}${unit}`;
    }
    return `${value}${unit}`;
  };

  // Get specific sensor values
  const feederTemp = getSensorValue('DHT22_FEEDER', 'temperature');
  const feederHumidity = getSensorValue('DHT22_FEEDER', 'humidity');
  const systemTemp = getSensorValue('DHT22_SYSTEM', 'temperature');
  const systemHumidity = getSensorValue('DHT22_SYSTEM', 'humidity');
  const foodWeight = getSensorValue('HX711_FEEDER', 'weight');
  const soilMoisture = getSensorValue('SOIL_MOISTURE', 'soil_moisture');
  const loadVoltage = getSensorValue('POWER_MONITOR', 'loadVoltage');
  const loadCurrent = getSensorValue('POWER_MONITOR', 'loadCurrent');
  const batteryPercentage = getSensorValue('POWER_MONITOR', 'batteryPercentage');
  const solarVoltage = getSensorValue('POWER_MONITOR', 'solarVoltage');
  const solarCurrent = getSensorValue('POWER_MONITOR', 'solarCurrent');

  // Function to fetch power flow data from API
  const fetchPowerFlowData = async (date: CalendarDate) => {
    setIsLoadingPowerFlow(true);
    try {
      const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
      const response = await fetch(`${pi_server_endpoint}/api/charts/power-flow/${dateStr}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setPowerFlowData(result.data);
      } else {
        console.error('Failed to fetch power flow data:', result.message);
        setPowerFlowData([]);
      }
    } catch (error) {
      console.error('Error fetching power flow data:', error);
      setPowerFlowData([]);
    } finally {
      setIsLoadingPowerFlow(false);
    }
  };

  // Function to fetch battery data from API
  const fetchBatteryData = async (date: CalendarDate) => {
    setIsLoadingBattery(true);
    try {
      const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
      const response = await fetch(`${pi_server_endpoint}/api/charts/battery/${dateStr}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setBatteryData(result.data);
      } else {
        console.error('Failed to fetch battery data:', result.message);
        setBatteryData([]);
      }
    } catch (error) {
      console.error('Error fetching battery data:', error);
      setBatteryData([]);
    } finally {
      setIsLoadingBattery(false);
    }
  };

  // Effect to fetch power flow data when date changes
  useEffect(() => {
    fetchPowerFlowData(powerFlowDate);
  }, [powerFlowDate, pi_server_endpoint]);

  // Effect to fetch battery data when date changes
  useEffect(() => {
    fetchBatteryData(batteryDate);
  }, [batteryDate, pi_server_endpoint]);

  // Function to fetch generic metric data from API
  const fetchMetricData = async (date: CalendarDate, metricKey: string) => {
    setIsLoadingMetric(true);
    try {
      const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
      const response = await fetch(`${pi_server_endpoint}/api/charts/metrics/${metricKey}/${dateStr}` as string, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.status === 'success') {
        setMetricData(result.data);
      } else {
        console.error('Failed to fetch metric data:', result.message);
        setMetricData([]);
      }
    } catch (error) {
      console.error('Error fetching metric data:', error);
      setMetricData([]);
    } finally {
      setIsLoadingMetric(false);
    }
  };

  // Fetch metric data when metric/date changes
  useEffect(() => {
    fetchMetricData(metricDate, selectedMetric);
  }, [metricDate, selectedMetric, pi_server_endpoint]);

  // Metric UI helpers
  const metricDisplayMap: Record<string, { label: string; unit: string; color: string }> = {
    feederTemp: { label: 'Feeder Temp', unit: '°C', color: '#3B82F6' },
    foodWeight: { label: 'Food Weight', unit: 'kg', color: '#F59E0B' },
    systemTemp: { label: 'System Temp', unit: '°C', color: '#06B6D4' },
    systemHumi: { label: 'System Humi', unit: '%', color: '#8B5CF6' },
    foodMoisture: { label: 'Food Moisture', unit: '%', color: '#10B981' },
    systemVoltage: { label: 'System Voltage', unit: 'V', color: '#60A5FA' },
    systemCurrent: { label: 'System Current', unit: 'A', color: '#60A5FA' },
    battery: { label: 'Battery', unit: '%', color: '#10B981' },
    solarVoltage: { label: 'Solar Voltage', unit: 'V', color: '#F59E0B' },
    solarCurrent: { label: 'Solar Current', unit: 'A', color: '#F59E0B' },
  };


  return (
    <div className="p-2 max-h-screen">
      <div className="grid grid-cols-12 gap-3">

        {/* Camera Preview */}
        <CameraPreview 
          className="col-span-12 md:col-span-5 xl:col-span-4 md:row-span-2 xl:row-span-3 aspect-square" 
          isEnabled={isCameraEnabled} 
          onToggle={toggleCamera}
        />

        {/* Temperature & Humidity Section */}
        <div className="col-span-12 md:col-span-7 xl:col-span-8">
          <h2 className="text-sm font-semibold mb-2 flex items-center text-foreground">
            <FaTemperatureHigh className="mr-1 text-blue-500" />
            Temperature & Humidity
          </h2>
          <div className="grid grid-cols-12 gap-3">
            {/* Feeder Temperature */}
            <div className="col-span-6 xl:col-span-3 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-blue-500 mb-1">
                <FaTemperatureHigh className="mr-1" />
                <span className="text-xs font-medium">Feeder Temp</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatValue(feederTemp, '°C')}
              </div>
            </div>

            {/* Feeder Humidity */}
            <div className="col-span-6 xl:col-span-3 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-indigo-500 mb-1">
                <WiHumidity className="mr-1 text-lg" />
                <span className="text-xs font-medium">Feeder Humi</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatValue(feederHumidity, '%')}
              </div>
            </div>

            {/* System Temperature */}
            <div className="col-span-6 xl:col-span-3 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-cyan-500 mb-1">
                <FaTemperatureHigh className="mr-1" />
                <span className="text-xs font-medium">System Temp</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatValue(systemTemp, '°C')}
              </div>
            </div>

            {/* System Humidity */}
            <div className="col-span-6 xl:col-span-3 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-purple-500 mb-1">
                <WiHumidity className="mr-1 text-lg" />
                <span className="text-xs font-medium">System Humi</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatValue(systemHumidity, '%')}
              </div>
            </div>
          </div>
        </div>

        {/* Food Section */}
        <div className="col-span-12 md:col-span-7 xl:col-span-8">
          <h2 className="text-sm font-semibold mb-2 flex items-center text-foreground">
            <SiWeightsandbiases className="mr-1 text-emerald-500" />
            Food
          </h2>
          <div className="grid grid-cols-12 gap-3">
            {/* Food Moisture */}
            <div className="col-span-6 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-emerald-500 mb-1">
                <MdOutlineWaterDrop className="mr-1" />
                <span className="text-xs font-medium">Food Moisture</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatValue(soilMoisture, '%')}
              </div>
            </div>

            {/* Food Weight */}
            <div className="col-span-6 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-amber-500 mb-1">
                <FaWeight className="mr-1" />
                <span className="text-xs font-medium">Food Weight</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatValue(Math.abs(typeof foodWeight === 'number' ? foodWeight : 0), 'kg', 3)}
              </div>
            </div>
          </div>
        </div>

        {/* Power System Section */}
        <div className="col-span-12 md:col-span-7 xl:col-span-4">
          <h2 className="text-sm font-semibold mb-2 flex items-center text-foreground">
            <MdPower className="mr-1 text-blue-500" />
            Power System
          </h2>
          <div className="grid grid-cols-12 gap-3">
            {/* System Voltage */}
            <div className="col-span-4 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-blue-500 mb-1">
                <TbArrowsCross className="mr-1" />
                <span className="text-xs font-medium">Voltage</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatValue(loadVoltage, 'V')}
              </div>
            </div>

            {/* System Current */}
            <div className="col-span-4 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-blue-500 mb-1">
                <BsLightningCharge className="mr-1" />
                <span className="text-xs font-medium">Current</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatValue(loadCurrent, 'A')}
              </div>
            </div>

            {/* Battery */}
            <div className="col-span-4 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-green-500 mb-1">
                <BiBattery className="mr-1" />
                <span className="text-xs font-medium">Battery</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatValue(batteryPercentage, '%')}
              </div>
            </div>
          </div>
        </div>

        {/* Power Solar Section */}
        <div className="col-span-12 md:col-span-5 xl:col-span-4">
          <h2 className="text-sm font-semibold mb-2 flex items-center text-foreground">
            <FaSolarPanel className="mr-1 text-amber-500" />
            Power Solar
          </h2>
          <div className="grid grid-cols-12 gap-3">
            {/* Solar Voltage */}
            <div className="col-span-6 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-amber-600 mb-1">
                <TbArrowsCross className="mr-1" />
                <span className="text-xs font-medium">Voltage</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatValue(solarVoltage, 'V')}
              </div>
            </div>

            {/* Solar Current */}
            <div className="col-span-6 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-amber-600 mb-1">
                <BsLightningCharge className="mr-1" />
                <span className="text-xs font-medium">Current</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatValue(solarCurrent, 'A')}
              </div>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="col-span-12">
          <h2 className="text-sm font-semibold mb-2 flex items-center text-foreground">
            <IoSettingsOutline className="mr-1 text-purple-500" />
            Status
          </h2>
          <div className="grid grid-cols-12 gap-3">
            {/* Last Feed */}
            <div className="col-span-4 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-blue-500 mb-1">
                <MdOutlineWaterDrop className="mr-1" />
                <span className="text-xs font-medium">Last Feed</span>
              </div>
              <div className="text-xs space-y-0.5">
                <div className="flex">
                  <span className="text-default-500 w-14">Time:</span>
                  <span className="text-foreground font-medium">14:30</span>
                </div>
                <div className="flex">
                  <span className="text-default-500 w-14">Amount:</span>
                  <span className="text-foreground font-medium">50g</span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="col-span-8 bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="space-y-3">
                <div className="flex items-center text-purple-500 mb-1">
                  <IoSettingsOutline className="mr-1" />
                  <span className="text-xs font-medium">System Status</span>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  <div className="flex items-center">
                    <span className="text-xs text-default-500 mr-1">Light:</span>
                    <span className={`text-xs font-medium ${isLedOn ? 'text-green-500' : 'text-red-500'}`}>
                      {isLedOn === null ? 'N/A' : (isLedOn ? 'ON' : 'OFF')}
                    </span>
                  </div>
                </div>

                {/* Alert Logs */}
                <div className="mt-3">
                  <div className="text-xs font-medium text-default-500 mb-1">Alert Logs</div>
                  <div className="max-h-40 overflow-auto space-y-1">
                    {alertLogs.length === 0 ? (
                      <div className="text-xs text-default-400">No recent logs</div>
                    ) : (
                      alertLogs.map((log) => (
                        <div key={log.id} className="text-xs flex items-center justify-between border border-divider rounded px-2 py-1">
                          <div className="truncate mr-2">
                            <span className="text-default-500">{log.sensorKey}</span>
                            <span className="mx-1">•</span>
                            <span className={log.level === 'critical' ? 'text-danger-500' : log.level === 'warning' ? 'text-warning-500' : 'text-success-500'}>{log.level}</span>
                            <span className="mx-1">•</span>
                            <span className="text-default-600">{log.value}%</span>
                            {log.action ? <span className="ml-1 text-default-400">({log.action})</span> : null}
                          </div>
                          <div className="text-[10px] text-default-400 ml-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Power Flow Analysis Chart */}
        <div className="col-span-12">
          <div className="bg-content1 rounded-lg shadow-small p-5 border border-divider">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center text-foreground">
                <FaSolarPanel className="mr-2 text-amber-500" />
                Power Flow Analysis
              </h2>
              <DatePicker
                label="Select Date"
                value={powerFlowDate}
                onChange={(date) => date && setPowerFlowDate(date)}
                className="max-w-xs"
                size="sm"
              />
            </div>
            <div className="h-80">
              {isLoadingPowerFlow ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
                    <p className="text-default-500 text-sm">Loading power flow data...</p>
                  </div>
                </div>
              ) : powerFlowData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={powerFlowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      label={{ value: 'Solar (V)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value, name) => [`${value}V`, name]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="solarGeneration" 
                      stroke="#F59E0B" 
                      strokeWidth={3}
                      name="Solar Generation"
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-default-500 text-sm">No data available for selected date</p>
                    <p className="text-default-400 text-xs mt-1">Try selecting a different date</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Battery Level Monitoring Chart */}
        <div className="col-span-12">
          <div className="bg-content1 rounded-lg shadow-small p-5 border border-divider">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center text-foreground">
                <BiBattery className="mr-2 text-green-500" />
                Battery Level Monitoring
              </h2>
              <DatePicker
                label="Select Date"
                value={batteryDate}
                onChange={(date) => date && setBatteryDate(date)}
                className="max-w-xs"
                size="sm"
              />
            </div>
            <div className="h-80">
              {isLoadingBattery ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                    <p className="text-default-500 text-sm">Loading battery data...</p>
                  </div>
                </div>
              ) : batteryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={batteryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      domain={[0, 100]}
                      label={{ value: 'Battery Level (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value) => [`${value}%`, 'Battery Level']}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="batteryLevel" 
                      stroke="#10B981" 
                      fill="#10B981"
                      fillOpacity={0.6}
                      strokeWidth={2}
                      name="Battery Level"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-default-500 text-sm">No battery data available for selected date</p>
                    <p className="text-default-400 text-xs mt-1">Try selecting a different date</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selectable Metric Chart */}
        <div className="col-span-12">
          <div className="bg-content1 rounded-lg shadow-small p-5 border border-divider">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center text-foreground">
                <MdPower className="mr-2 text-blue-500" />
                Metric Monitoring
              </h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-default-500 mr-1">Metric</label>
                <select
                  className="bg-content2 text-foreground text-sm rounded px-2 py-1 border border-divider"
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                >
                  <option value="feederTemp">Feeder Temp</option>
                  <option value="foodWeight">Food Weight</option>
                  <option value="systemTemp">System Temp</option>
                  <option value="systemHumi">System Humi</option>
                  <option value="foodMoisture">Food Moisture</option>
                  <option value="systemVoltage">System Voltage</option>
                  <option value="systemCurrent">System Current</option>
                  <option value="battery">Battery</option>
                  <option value="solarVoltage">Solar Voltage</option>
                  <option value="solarCurrent">Solar Current</option>
                </select>
                <DatePicker
                  label="Select Date"
                  value={metricDate}
                  onChange={(date) => date && setMetricDate(date)}
                  className="max-w-xs"
                  size="sm"
                />
              </div>
            </div>
            <div className="h-80">
              {isLoadingMetric ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-default-500 text-sm">Loading metric data...</p>
                  </div>
                </div>
              ) : metricData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      label={{ value: `${metricDisplayMap[selectedMetric].label} (${metricDisplayMap[selectedMetric].unit})`, angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: any) => [`${value}${metricDisplayMap[selectedMetric].unit}`, metricDisplayMap[selectedMetric].label]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={metricDisplayMap[selectedMetric].color}
                      strokeWidth={3}
                      name={metricDisplayMap[selectedMetric].label}
                      dot={{ fill: metricDisplayMap[selectedMetric].color, strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-default-500 text-sm">No data available for selected date</p>
                    <p className="text-default-400 text-xs mt-1">Try selecting a different date</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 