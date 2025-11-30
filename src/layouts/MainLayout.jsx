import React from 'react';
import { useSidebar } from '../context/SidebarContext';
import MainSidebar from '../components/ui/MainSidebar';
import MobileNavigationBar from '../components/ui/MobileNavigationBar';

const MainLayout = ({ children }) => {
  const { isCollapsed, isMobileOpen, closeMobileSidebar } = useSidebar();

  return (
    <div className="flex h-screen bg-gray-100">
      <MainSidebar />

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <div
        className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        }`}
      >
        {children}
        <MobileNavigationBar />
      </div>
    </div>
  );
};

export default MainLayout;
