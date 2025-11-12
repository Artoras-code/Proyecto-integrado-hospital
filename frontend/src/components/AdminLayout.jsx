import React, { useState } from 'react'; 
import { Outlet } from 'react-router-dom'; 
import Sidebar from './Sidebar';
import Header from './Header'; 

export default function AdminLayout() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">

      <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] lg:items-start lg:gap-6">
        

        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />


        <div className="flex-1 flex flex-col min-w-0 gap-6">
          <Header /> 
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}