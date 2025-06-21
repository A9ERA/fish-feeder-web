import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MdSpaceDashboard } from "react-icons/md";
import { SiApachedolphinscheduler } from "react-icons/si";
import { FaTemperatureLow } from "react-icons/fa6";
import { VscSettings } from "react-icons/vsc";
import { FaGear } from "react-icons/fa6";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { ThemeSwitch } from "@/components/theme-switch";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Auto collapse if width is less than 1000px
      if (window.innerWidth < 1000) {
        setCollapsed(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <MdSpaceDashboard /> },
    { path: '/feed-control', label: 'Feed Control', icon: <SiApachedolphinscheduler /> },
    { path: '/fan-temp-control', label: 'Temperature Control', icon: <FaTemperatureLow /> },
    { path: '/motor-pwm', label: 'Motor & PWM Settings', icon: <VscSettings /> },
    { path: '/settings', label: 'Settings', icon: <FaGear /> },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <div className={`bg-gray-800 text-white ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 relative hidden md:block min-h-screen p-4`}>
        <button
          onClick={toggleSidebar}
          className="absolute right-0 top-4 translate-x-1/2 bg-gray-700 rounded-full p-1 text-white hover:bg-gray-600 z-10"
        >
          {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
        </button>

        <h2 className={`text-xl font-bold mb-6 ${collapsed ? 'hidden' : 'block'}`}>
          Fish Feeder
        </h2>

        <nav>
          <ul className="space-y-2 text-left">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${collapsed ? 'justify-center' : ''} gap-2 p-2 rounded-lg ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300'
                    }`
                  }
                  title={collapsed ? item.label : ''}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className={`absolute bottom-4 left-0 right-0 ${collapsed ? 'flex justify-center' : 'pl-4'}`}>
          <ThemeSwitch />
        </div>
      </div>

      {/* Mobile bottom navigation - icons only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-2 px-4 z-10">
        <nav>
          <ul className="flex justify-around items-center">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-center p-2 rounded-lg ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300'
                    }`
                  }
                  title={item.label}
                >
                  <span className="text-2xl">{item.icon}</span>
                </NavLink>
              </li>
            ))}
            {/* Add ThemeSwitch as part of navigation items */}
            <li>
              <div className="flex items-center justify-center p-2">
                <ThemeSwitch />
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar; 