import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto md:pb-6 pb-24 md:mb-0 mb-[66px]">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 