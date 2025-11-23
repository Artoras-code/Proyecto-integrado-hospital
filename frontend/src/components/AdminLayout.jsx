import React, { useState } from 'react'; 
import { Outlet } from 'react-router-dom'; 
import Sidebar from './Sidebar';
import Header from './Header'; 

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden" role="dialog" aria-modal="true">
          

          <div 
            className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <Sidebar 
                isMobile={true} 
                onClose={() => setMobileMenuOpen(false)} 
                isSidebarOpen={true}
              />
              
            </div>
          </div>
        </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] lg:items-start lg:gap-6">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="flex-1 flex flex-col min-w-0 gap-6">
          <Header onMobileMenuClick={() => setMobileMenuOpen(true)} /> 
          
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}