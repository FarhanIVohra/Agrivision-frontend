import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar when clicking outside or on navigation
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 1024) { // lg breakpoint
        const sidebar = document.querySelector('[data-sidebar]');
        const toggle = document.querySelector('[data-sidebar-toggle]');
        if (sidebar && !sidebar.contains(event.target) && !toggle?.contains(event.target)) {
          setIsMobileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const value = {
    isCollapsed,
    isMobileOpen,
    toggleSidebar,
    closeMobileSidebar,
    setIsCollapsed,
    setIsMobileOpen
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContext;
