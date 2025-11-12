import React from 'react';
import { Outlet } from 'react-router-dom';
import ClinicoHeader from './ClinicoHeader'; 
export default function ClinicoLayout() {


  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 lg:p-6">
        <ClinicoHeader />
      </div>
      <main className="flex-1 p-4 lg:p-6 pt-0 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}