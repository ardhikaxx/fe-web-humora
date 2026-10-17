'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../lib/context/AdminContext';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';
import {
  Menu,
  Bell,
  CheckCircle2,
  Settings,
  LogOut,
  ChevronDown,
  User,
} from 'lucide-react';

interface AdminTopbarProps {
  onOpenMobileSidebar: () => void;
}

export function AdminTopbar({ onOpenMobileSidebar }: AdminTopbarProps) {
  const router = useRouter();
  const { recentActivities, adminProfile } = useAdmin();
  const { success } = useToast();

  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const systemAlerts = (recentActivities || []).slice(0, 5);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('humora_admin_session');
      localStorage.setItem('humora_admin_logged_out', 'true');
    }
    setIsProfileDropdownOpen(false);
    setIsLogoutDialogOpen(false);
    success('Berhasil Keluar', 'Sesi admin telah diakhiri. Sampai jumpa kembali!');
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 px-4 lg:px-8 bg-white border-b border-[#EEE8F0] sticky top-0 z-20 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-[#24172B] hover:bg-[#F6F1F8] transition-colors"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right Actions: System Activity Bell, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Activity Alerts Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifDropdownOpen(!isNotifDropdownOpen);
                setIsProfileDropdownOpen(false);
              }}
              className="relative p-2 rounded-xl text-[#786F7D] hover:text-[#24172B] hover:bg-[#F6F1F8] transition-colors"
              aria-label="Aktivitas Sistem"
            >
              <Bell className="w-5 h-5" />
              {systemAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4B0B7A] ring-2 ring-white" />
              )}
            </button>

            {isNotifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#EEE8F0] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#EEE8F0] mb-2 px-1">
                  <span className="text-xs font-bold text-[#24172B]">Aktivitas Sistem ({systemAlerts.length})</span>
                  <span className="text-[10px] font-semibold text-[#786F7D]">Terbaru</span>
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto no-scrollbar">
                  {systemAlerts.length > 0 ? (
                    systemAlerts.map((act) => (
                      <div
                        key={act.id}
                        className="p-2.5 rounded-xl hover:bg-[#F6F1F8] transition-colors flex items-start gap-2.5 text-left"
                      >
                        <div className="p-1.5 rounded-lg bg-[#EAF8F1] text-[#21865B] shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#24172B] leading-tight truncate">{act.title}</p>
                          <p className="text-[11px] text-[#786F7D] line-clamp-2 mt-0.5">{act.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#786F7D] text-center py-4">Belum ada aktivitas tercatat.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Avatar & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
                setIsNotifDropdownOpen(false);
              }}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-[#F6F1F8] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#4B0B7A] text-[#FFD52E] font-extrabold text-xs flex items-center justify-center shadow-xs">
                {adminProfile.avatarInitials || 'AH'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#786F7D]" />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#EEE8F0] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 border-b border-[#EEE8F0] mb-1">
                  <p className="text-xs font-bold text-[#24172B]">{adminProfile.name}</p>
                  <p className="text-[11px] text-[#786F7D]">{adminProfile.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3E8FF] text-[#6B21A8]">
                    {adminProfile.roleBadge || adminProfile.role || 'Pengelola Portal'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <Link
                    href="/admin/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#24172B] hover:bg-[#F6F1F8] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#4B0B7A]" />
                    <span>Profil Saya</span>
                  </Link>

                  <Link
                    href="/admin/settings"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#24172B] hover:bg-[#F6F1F8] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#786F7D]" />
                    <span>Pengaturan Umum</span>
                  </Link>


                  <div className="my-1 border-t border-[#EEE8F0]" />

                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setIsLogoutDialogOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#D94152] hover:bg-[#FEECEF] transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-[#D94152]" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        title="Keluar dari Akun Admin?"
        message="Sesi login Anda akan diakhiri. Anda perlu memasukkan kredensial administrator kembali untuk mengakses dashboard."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        variant="danger"
        icon={<LogOut className="w-6 h-6 text-[#D94152]" />}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </>
  );
}
