'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <TopNav />
        <main className="flex-1 px-6 py-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
