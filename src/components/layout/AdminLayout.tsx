import React from 'react';
import { Outlet } from 'react-router-dom';
import MobileHeader from './MobileHeader';
import Sidebar from './Sidebar';


export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50/95">
      {/* Mobile Header - Only visible on mobile */}
      <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/95 p-4 md:p-8 pt-[80px] md:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}