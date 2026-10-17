'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminTopbar } from '../../components/layout/AdminTopbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedOut = localStorage.getItem('humora_admin_logged_out');
      if (isLoggedOut === 'true') {
        router.replace('/login');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8F7FA] text-[#24172B] flex flex-row font-sans antialiased">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <AdminTopbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full min-w-0 animate-in fade-in duration-150">
          {children}
        </main>
      </div>
    </div>
  );
}
