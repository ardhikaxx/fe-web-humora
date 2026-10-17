'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HumoraLogo } from '../brand/HumoraLogo';
import {
  LayoutDashboard,
  BarChart3,
  Clapperboard,
  Video,
  FolderTree,
  Users,
  Crown,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
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
        { label: 'Judul Konten', href: '/admin/series', icon: Clapperboard },
        { label: 'Kelola Video', href: '/admin/videos', icon: Video },
        { label: 'Kategori', href: '/admin/categories', icon: FolderTree },
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
        { label: 'Kelola Admin', href: '/admin/admins', icon: ShieldCheck },
        { label: 'Profil Admin', href: '/admin/profile', icon: UserCheck },
        { label: 'Pengaturan', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  // Auto close mobile drawer on route change
  const prevPathnameRef = React.useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (isMobileOpen) {
        onCloseMobile();
      }
    }
  }, [pathname, isMobileOpen, onCloseMobile]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const checkIsActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const renderSidebarContent = (collapsed: boolean, isMobileDrawer: boolean) => (
    <div className="h-full flex flex-col bg-white select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 sm:px-5 shrink-0 border-b border-[#EEE8F0] flex items-center justify-between gap-2">
        <Link href="/admin" onClick={onCloseMobile} className="flex items-center">
          {collapsed ? (
            <div className="w-9 h-9 rounded-xl bg-[#4B0B7A] flex items-center justify-center text-[#FFD52E] font-black text-lg shadow-xs">
              H
            </div>
          ) : (
            <HumoraLogo size="sm" showAdminBadge={true} showTagline={false} />
          )}
        </Link>

        {/* Action button: X on mobile/tablet drawer, collapse toggle on desktop */}
        {isMobileDrawer ? (
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-xl text-[#786F7D] hover:text-[#24172B] hover:bg-[#F6F1F8] border border-transparent hover:border-[#EEE8F0] active:scale-95 transition-all"
            aria-label="Tutup navigasi"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#24172B] hover:bg-[#F6F1F8] transition-colors"
            title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Menus with flexible scroll container */}
      <div className="flex-1 min-h-0 py-4 px-3 space-y-5 overflow-y-auto overscroll-contain no-scrollbar">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
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
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group min-h-[42px] ${
                    isActive
                      ? 'bg-[#4B0B7A] text-white shadow-xs'
                      : 'text-[#786F7D] hover:text-[#24172B] hover:bg-[#F6F1F8] active:scale-[0.99]'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#FFD52E]' : 'text-[#786F7D] group-hover:text-[#4B0B7A]'
                    }`}
                  />

                  {!collapsed && (
                    <span className="flex-1 truncate leading-none">{item.label}</span>
                  )}

                  {!collapsed && item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                        isActive ? 'bg-[#FFD52E] text-[#21052F]' : 'bg-[#F6F1F8] text-[#4B0B7A]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Admin Profile Card in Footer */}
      <div className="p-3 shrink-0 border-t border-[#EEE8F0] bg-[#FAF8FB]">
        <Link
          href="/admin/profile"
          onClick={onCloseMobile}
          className={`flex items-center gap-3 rounded-xl transition-colors hover:bg-[#F3E8FF]/70 ${
            collapsed ? 'justify-center p-1' : 'p-2'
          } ${checkIsActive('/admin/profile') ? 'bg-[#F3E8FF]' : ''}`}
          title="Buka Profil Admin"
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4B0B7A] to-[#7028B8] text-white font-bold text-xs flex items-center justify-center shadow-xs border border-white">
              {adminProfile.avatarInitials || 'AH'}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#21865B] border-2 border-white" />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-[#24172B] truncate leading-tight">
                  {adminProfile.name}
                </p>
                <Shield className="w-3 h-3 text-[#4B0B7A] shrink-0" />
              </div>
              <p className="text-[10px] text-[#786F7D] truncate mt-0.5 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#E58A16]" />{' '}
                {adminProfile.roleBadge || adminProfile.role || 'Pengelola Portal'}
              </p>
            </div>
          )}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (lg and above: >= 1024px) */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 z-30 sticky top-0 h-screen max-h-[100dvh] border-r border-[#EEE8F0] ${
          isCollapsed ? 'w-[76px]' : 'w-[260px]'
        }`}
      >
        {renderSidebarContent(isCollapsed, false)}
      </aside>

      {/* Mobile & Tablet Backdrop (below lg: < 1024px) */}
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 z-40 bg-[#21052F]/40 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Mobile & Tablet Slide-out Drawer */}
      <aside
        aria-label="Navigasi admin"
        className={`fixed inset-y-0 left-0 z-50 h-[100dvh] w-[280px] max-w-[85vw] sm:w-[320px] bg-white shadow-2xl flex flex-col border-r border-[#EEE8F0] transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent(false, true)}
      </aside>
    </>
  );
}
