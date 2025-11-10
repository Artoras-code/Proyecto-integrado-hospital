import React from 'react';
import { Outlet } from 'react-router-dom'; 
import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-background p-8">
        <Outlet />
      </main>
    </div>
  );
}