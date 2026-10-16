'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HumoraLogo } from '../brand/HumoraLogo';
import {
  LayoutDashboard,
  BarChart3,
  Clapperboard,
  Video,
  FolderTree,
  FileText,
  Users,
  Crown,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useAdmin } from '../../lib/context/AdminContext';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { adminProfile } = useAdmin();

  const navGroups: NavGroup[] = [
    {
      groupTitle: 'Overview',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ],
    },
    {
      groupTitle: 'Manajemen Konten',
      items: [
        { label: 'Series', href: '/admin/series', icon: Clapperboard },
        { label: 'Videos & Episodes', href: '/admin/videos', icon: Video },
        { label: 'Kategori', href: '/admin/categories', icon: FolderTree },
        { label: 'Subtitle', href: '/admin/subtitles', icon: FileText },
      ],
    },
    {
      groupTitle: 'Audiens & Pendapatan',
      items: [
        { label: 'Pengguna', href: '/admin/users', icon: Users },
        { label: 'Pelanggan Premium', href: '/admin/subscribers', icon: Crown },
        { label: 'Transaksi', href: '/admin/transactions', icon: Receipt },
      ],
    },
    {
      groupTitle: 'Sistem',
      items: [
        { label: 'Profil Admin', href: '/admin/profile', icon: UserCheck },
        { label: 'Pengaturan', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const checkIsActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-[#EEE8F0] select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 border-b border-[#EEE8F0] flex items-center justify-between">
          <Link href="/admin" onClick={onCloseMobile} className="flex items-center">
            {isCollapsed ? (
              <div className="w-9 h-9 rounded-xl bg-[#4B0B7A] flex items-center justify-center text-[#FFD52E] font-black text-lg">
                H
              </div>
            ) : (
              <HumoraLogo size="sm" showAdminBadge={true} showTagline={false} />
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-[#786F7D] hover:text-[#24172B] hover:bg-[#F6F1F8] transition-colors"
            title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menus */}
        <div className="py-4 px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] no-scrollbar">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#786F7D]/80 mb-2">
                  {group.groupTitle}
                </p>
              )}

              {group.items.map((item) => {
                const isActive = checkIsActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-[#4B0B7A] text-white shadow-xs'
                        : 'text-[#786F7D] hover:text-[#24172B] hover:bg-[#F6F1F8]'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#FFD52E]' : 'text-[#786F7D] group-hover:text-[#4B0B7A]'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="flex-1 truncate leading-none">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                        isActive ? 'bg-[#FFD52E] text-[#21052F]' : 'bg-[#F6F1F8] text-[#4B0B7A]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Admin Demo Profile Card in Footer */}
      <div className="p-3 border-t border-[#EEE8F0] bg-[#FAF8FB]">
        <Link
          href="/admin/profile"
          onClick={onCloseMobile}
          className={`flex items-center gap-3 rounded-xl transition-colors hover:bg-[#F3E8FF]/70 ${
            isCollapsed ? 'justify-center p-1' : 'p-2'
          } ${checkIsActive('/admin/profile') ? 'bg-[#F3E8FF]' : ''}`}
          title="Buka Profil Admin"
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4B0B7A] to-[#7028B8] text-white font-bold text-xs flex items-center justify-center shadow-xs border border-white">
              {adminProfile.avatarInitials || 'AH'}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#21865B] border-2 border-white" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-[#24172B] truncate leading-tight">
                  {adminProfile.name}
                </p>
                <Shield className="w-3 h-3 text-[#4B0B7A] shrink-0" />
              </div>
              <p className="text-[10px] text-[#786F7D] truncate mt-0.5 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#E58A16]" /> {adminProfile.roleBadge || adminProfile.role}
              </p>
            </div>
          )}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 z-30 sticky top-0 h-screen ${
          isCollapsed ? 'w-[76px]' : 'w-[260px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
