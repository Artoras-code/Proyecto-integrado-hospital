import React from 'react';
import { Outlet } from 'react-router-dom';
import ClinicoSidebar from './ClinicoSidebar'; 

export default function ClinicoLayout() {
  return (
    <div className="flex min-h-screen">
      <ClinicoSidebar />
      <main className="flex-1 bg-background p-8">
        <Outlet /> 
      </main>
    </div>
  );
}