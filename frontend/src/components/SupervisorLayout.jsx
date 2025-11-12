import React from 'react';
import { Outlet } from 'react-router-dom';
import SupervisorSidebar from './SupervisorSidebar'; 

export default function SupervisorLayout() {
  return (
    <div className="flex min-h-screen">
      <SupervisorSidebar />
      <main className="flex-1 bg-background p-8">
        <Outlet /> 
      </main>
    </div>
  );
}