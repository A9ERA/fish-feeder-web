import { FaTemperatureHigh, FaWeight } from 'react-icons/fa';
import { WiHumidity } from 'react-icons/wi';
import { IoWaterOutline } from 'react-icons/io5';
import { MdOutlineWaterDrop } from 'react-icons/md';
import { BiBattery } from 'react-icons/bi';
import { BsLightningCharge } from 'react-icons/bs';
import { TbArrowsCross } from 'react-icons/tb';
import { IoSettingsOutline } from 'react-icons/io5';
import { FaSolarPanel } from 'react-icons/fa';
import { MdPower } from 'react-icons/md';
import { SiWeightsandbiases } from "react-icons/si";
import CameraPreview from '../components/CameraPreview';

const Dashboard = () => {

  return (
    <div className="p-2 max-h-screen">
      <div className="grid grid-cols-12 gap-3">

        {/* Camera Preview */}
        <CameraPreview className="col-span-12 md:col-span-5 xl:col-span-4 md:row-span-2 xl:row-span-3 aspect-square" />

        {/* Temperature & Humidity Section */}
        <div className="col-span-12 md:col-span-7 xl:col-span-8">
          <h2 className="text-sm font-semibold mb-2 flex items-center text-foreground">
            <FaTemperatureHigh className="mr-1 text-blue-500" />
            Temperature & Humidity
          </h2>
          <div className="grid grid-cols-12 gap-3">
            {/* Temperature */}
            <div className="col-span-6 xl:col-span-4 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-blue-500 mb-1">
                <FaTemperatureHigh className="mr-1" />
                <span className="text-xs font-medium">Temperature</span>
              </div>
              <div className="text-2xl font-bold text-foreground">25.5°C</div>
            </div>

            {/* Humidity */}
            <div className="col-span-6 xl:col-span-4 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-indigo-500 mb-1">
                <WiHumidity className="mr-1 text-lg" />
                <span className="text-xs font-medium">Humidity</span>
              </div>
              <div className="text-2xl font-bold text-foreground">65%</div>
            </div>

            {/* Water Temperature */}
            <div className="col-span-12 xl:col-span-4 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-cyan-500 mb-1">
                <IoWaterOutline className="mr-1" />
                <span className="text-xs font-medium">Water Temperature</span>
              </div>
              <div className="text-2xl font-bold text-foreground">24°C</div>
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
              <div className="text-2xl font-bold text-foreground">75%</div>
            </div>

            {/* Food Weight */}
            <div className="col-span-6 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-amber-500 mb-1">
                <FaWeight className="mr-1" />
                <span className="text-xs font-medium">Food Weight</span>
              </div>
              <div className="text-2xl font-bold text-foreground">2.5kg</div>
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
              <div className="text-2xl font-bold text-foreground">12.5V</div>
            </div>

            {/* System Current */}
            <div className="col-span-4 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-blue-500 mb-1">
                <BsLightningCharge className="mr-1" />
                <span className="text-xs font-medium">Current</span>
              </div>
              <div className="text-2xl font-bold text-foreground">1.2A</div>
            </div>

            {/* Battery */}
            <div className="col-span-4 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-green-500 mb-1">
                <BiBattery className="mr-1" />
                <span className="text-xs font-medium">Battery</span>
              </div>
              <div className="text-2xl font-bold text-foreground">85%</div>
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
              <div className="text-2xl font-bold text-foreground">13.8V</div>
            </div>

            {/* Solar Current */}
            <div className="col-span-6 h-[86px] bg-content1 rounded-lg shadow-small p-3 border border-divider">
              <div className="flex items-center text-amber-600 mb-1">
                <BsLightningCharge className="mr-1" />
                <span className="text-xs font-medium">Current</span>
              </div>
              <div className="text-2xl font-bold text-foreground">2.5A</div>
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
              <div className="flex items-center text-purple-500 mb-1">
                <IoSettingsOutline className="mr-1" />
                <span className="text-xs font-medium">System Status</span>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <div className="flex items-center">
                  <span className="text-xs text-default-500 mr-1">Relay:</span>
                  <span className="text-xs text-green-600 font-medium">ON</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-default-500 mr-1">Fan:</span>
                  <span className="text-xs text-red-500 font-medium">OFF</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-default-500 mr-1">Pump:</span>
                  <span className="text-xs text-green-600 font-medium">ON</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-default-500 mr-1">Light:</span>
                  <span className="text-xs text-red-500 font-medium">OFF</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-default-500 mr-1">Heater:</span>
                  <span className="text-xs text-green-600 font-medium">ON</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-default-500 mr-1">Filter:</span>
                  <span className="text-xs text-green-600 font-medium">ON</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 