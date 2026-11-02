import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function StudentLayout() {
  return (
    <div className="min-h-screen bg-page flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 pb-24 sm:p-6 sm:pb-24 md:p-8 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function ProfessorLayout() {
  return (
    <div className="min-h-screen bg-page flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 pb-24 sm:p-6 sm:pb-24 md:p-8 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
