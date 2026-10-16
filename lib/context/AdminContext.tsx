'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  AdminSeries,
  AdminEpisode,
  AdminCategory,
  AdminSubtitle,
  AdminUser,
  AdminSubscriber,
  AdminTransaction,
  AdminNotification,
  MobileHomeLayoutConfig,
  AdminSettingsConfig,
  PublicationStatus,
  AccessType,
} from '../types/admin';
import { formatRupiah } from '../utils/formatters';
import {
  INITIAL_SERIES,
  INITIAL_EPISODES,
  INITIAL_CATEGORIES,
  INITIAL_SUBTITLES,
  INITIAL_USERS,
  INITIAL_SUBSCRIBERS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MOBILE_HOME_LAYOUT,
  INITIAL_SETTINGS,
} from '../data/initialData';

export interface ActivityItem {
  id: string;
  type: 'episode_published' | 'series_created' | 'access_changed' | 'settings_updated' | 'notification_sent';
  title: string;
  description: string;
  timestamp: string;
  link?: string;
}

interface AdminContextType {
  // State
  series: AdminSeries[];
  episodes: AdminEpisode[];
  categories: AdminCategory[];
  subtitles: AdminSubtitle[];
  users: AdminUser[];
  subscribers: AdminSubscriber[];
  transactions: AdminTransaction[];
  notifications: AdminNotification[];
  mobileHomeLayout: MobileHomeLayoutConfig;
  settings: AdminSettingsConfig;
  isLoaded: boolean;

  // Computed metrics
  stats: {
    totalUsers: number;
    totalViews: number;
    totalWatchTimeHours: number;
    totalSubscribers: number;
    totalRevenue: number;
    publishedEpisodesCount: number;
    draftEpisodesCount: number;
    freeEpisodesCount: number;
    premiumEpisodesCount: number;
    totalSeriesCount: number;
    publishedSeriesCount: number;
    draftSeriesCount: number;
  };

  topPerformingVideos: AdminEpisode[];
  recentActivities: ActivityItem[];

  // Series actions
  addSeries: (seriesData: Omit<AdminSeries, 'id' | 'createdAt' | 'updatedAt'>) => AdminSeries;
  updateSeries: (id: string, updates: Partial<AdminSeries>) => void;
  deleteSeries: (id: string) => void;
  toggleSeriesPublish: (id: string) => void;

  // Episode actions
  addEpisode: (episodeData: Omit<AdminEpisode, 'id' | 'createdAt' | 'updatedAt'>) => AdminEpisode;
  updateEpisode: (id: number, updates: Partial<AdminEpisode>) => void;
  deleteEpisode: (id: number) => void;
  toggleEpisodePublish: (id: number) => void;
  toggleEpisodeAccessType: (id: number) => void;

  // Category actions
  addCategory: (categoryData: Omit<AdminCategory, 'id' | 'createdAt' | 'seriesCount' | 'episodeCount'>) => AdminCategory;
  updateCategory: (id: string, updates: Partial<AdminCategory>) => void;
  deleteCategory: (id: string) => void;

  // Subtitle actions
  addSubtitle: (subData: Omit<AdminSubtitle, 'id' | 'updatedAt'>) => AdminSubtitle;
  deleteSubtitle: (id: string) => void;

  // User actions
  updateUserStatus: (id: string, status: 'active' | 'suspended') => void;

  // Notification actions
  addNotification: (notifData: Omit<AdminNotification, 'id' | 'createdAt' | 'sentCount' | 'openCount'>) => AdminNotification;
  updateNotification: (id: string, updates: Partial<AdminNotification>) => void;
  deleteNotification: (id: string) => void;
  toggleNotificationPublish: (id: string) => void;

  // Mobile home layout actions
  updateMobileHomeLayout: (newLayout: MobileHomeLayoutConfig) => void;
  setHeroSeries: (seriesId: string) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  reorderSection: (sectionId: string, direction: 'up' | 'down') => void;
  updateSectionSeries: (sectionId: string, seriesIds: string[]) => void;

  // Transaction Verification & Simulation
  verifyTransaction: (
    transactionId: string,
    action: 'approve' | 'reject',
    rejectionReason?: string
  ) => void;
  createSimulationPayment: (
    paymentData: Omit<AdminTransaction, 'id' | 'createdAt' | 'status'>
  ) => AdminTransaction;

  // Settings & System
  updateSettings: (newSettings: Partial<AdminSettingsConfig>) => void;
  resetAllDataToDefault: () => void;
}

const STORAGE_KEY = 'humora_admin_data_v1';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [series, setSeries] = useState<AdminSeries[]>(INITIAL_SERIES);
  const [episodes, setEpisodes] = useState<AdminEpisode[]>(INITIAL_EPISODES);
  const [categories, setCategories] = useState<AdminCategory[]>(INITIAL_CATEGORIES);
  const [subtitles, setSubtitles] = useState<AdminSubtitle[]>(INITIAL_SUBTITLES);
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [subscribers, setSubscribers] = useState<AdminSubscriber[]>(INITIAL_SUBSCRIBERS);
  const [transactions, setTransactions] = useState<AdminTransaction[]>(INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState<AdminNotification[]>(INITIAL_NOTIFICATIONS);
  const [mobileHomeLayout, setMobileHomeLayout] = useState<MobileHomeLayoutConfig>(INITIAL_MOBILE_HOME_LAYOUT);
  const [settings, setSettings] = useState<AdminSettingsConfig>(INITIAL_SETTINGS);
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      type: 'episode_published',
      title: 'Episode Terbit',
      description: 'Kontrak Jadi Pacar: Episode 3 "Malam Puncak Reuni Akbar" dipublikasikan.',
      timestamp: '2026-10-15T09:00:00Z',
      link: '/admin/videos',
    },
    {
      id: 'act-2',
      type: 'notification_sent',
      title: 'Notifikasi Terkirim',
      description: 'Promo Spesial HUMORAHEMAT terkirim ke 24.850 pengguna aplikasi mobile.',
      timestamp: '2026-10-14T11:30:00Z',
      link: '/admin/notifications',
    },
    {
      id: 'act-3',
      type: 'series_created',
      title: 'Draft Series Baru',
      description: 'Series "Mertua Idaman Netizen" ditambahkan sebagai draf produksi.',
      timestamp: '2026-10-12T10:00:00Z',
      link: '/admin/series',
    },
    {
      id: 'act-4',
      type: 'access_changed',
      title: 'Pembaruan Akses Episode',
      description: 'Episode 2 Kos Paling Berisik diubah menjadi Free Preview.',
      timestamp: '2026-10-10T14:15:00Z',
      link: '/admin/videos',
    },
  ]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.series && Array.isArray(parsed.series)) setSeries(parsed.series);
        if (parsed.episodes && Array.isArray(parsed.episodes)) setEpisodes(parsed.episodes);
        if (parsed.categories && Array.isArray(parsed.categories)) setCategories(parsed.categories);
        if (parsed.subtitles && Array.isArray(parsed.subtitles)) setSubtitles(parsed.subtitles);
        if (parsed.users && Array.isArray(parsed.users)) setUsers(parsed.users);
        if (parsed.subscribers && Array.isArray(parsed.subscribers)) setSubscribers(parsed.subscribers);
        if (parsed.transactions && Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
        if (parsed.notifications && Array.isArray(parsed.notifications)) setNotifications(parsed.notifications);
        if (parsed.mobileHomeLayout) {
          // Guarantee fixed standard immutable sequence and default sections
          setMobileHomeLayout({
            ...INITIAL_MOBILE_HOME_LAYOUT,
            heroSeriesId: parsed.mobileHomeLayout.heroSeriesId || INITIAL_MOBILE_HOME_LAYOUT.heroSeriesId,
            heroHeadline: parsed.mobileHomeLayout.heroHeadline || INITIAL_MOBILE_HOME_LAYOUT.heroHeadline,
            heroSubheadline: parsed.mobileHomeLayout.heroSubheadline || INITIAL_MOBILE_HOME_LAYOUT.heroSubheadline,
            sections: INITIAL_MOBILE_HOME_LAYOUT.sections,
          });
        }
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.activities && Array.isArray(parsed.activities)) setActivities(parsed.activities);
      }
    } catch (e) {
      console.warn('Failed to parse admin localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when state changes (only after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        series,
        episodes,
        categories,
        subtitles,
        users,
        subscribers,
        transactions,
        notifications,
        mobileHomeLayout,
        settings,
        activities,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Failed to save admin state to localStorage:', e);
    }
  }, [
    isLoaded,
    series,
    episodes,
    categories,
    subtitles,
    users,
    subscribers,
    transactions,
    notifications,
    mobileHomeLayout,
    settings,
    activities,
  ]);

  const addActivity = useCallback((activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newItem: ActivityItem = {
      ...activity,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newItem, ...prev.slice(0, 19)]);
  }, []);

  // Computed statistics
  const stats = useMemo(() => {
    const totalUsers = 24850;
    const totalViews = episodes.reduce((acc, ep) => acc + (ep.publicationStatus === 'published' ? ep.views : 0), 0) + 14000;
    const totalWatchTimeHours = episodes.reduce((acc, ep) => acc + (ep.publicationStatus === 'published' ? ep.watchTimeHours : 0), 0) + 1200;
    const totalSubscribers = subscribers.filter((s) => s.status === 'active').length + 3275;
    const totalRevenue = transactions.filter((t) => t.status === 'success').reduce((acc, t) => acc + t.total, 0) + 48450000;

    const publishedEpisodesCount = episodes.filter((ep) => ep.publicationStatus === 'published').length;
    const draftEpisodesCount = episodes.filter((ep) => ep.publicationStatus === 'draft').length;
    const freeEpisodesCount = episodes.filter((ep) => ep.accessType === 'free').length;
    const premiumEpisodesCount = episodes.filter((ep) => ep.accessType === 'premium').length;

    const publishedSeriesCount = series.filter((s) => s.publicationStatus === 'published').length;
    const draftSeriesCount = series.filter((s) => s.publicationStatus === 'draft').length;

    return {
      totalUsers,
      totalViews,
      totalWatchTimeHours,
      totalSubscribers,
      totalRevenue,
      publishedEpisodesCount,
      draftEpisodesCount,
      freeEpisodesCount,
      premiumEpisodesCount,
      totalSeriesCount: series.length,
      publishedSeriesCount,
      draftSeriesCount,
    };
  }, [series, episodes, subscribers, transactions]);

  // Top performing videos
  const topPerformingVideos = useMemo(() => {
    return [...episodes]
      .filter((ep) => ep.publicationStatus === 'published')
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);
  }, [episodes]);

  // Series Actions
  const addSeries = useCallback(
    (seriesData: Omit<AdminSeries, 'id' | 'createdAt' | 'updatedAt'>): AdminSeries => {
      const now = new Date().toISOString();
      const newId = `series-${Date.now()}`;
      const newSeries: AdminSeries = {
        ...seriesData,
        id: newId,
        createdAt: now,
        updatedAt: now,
      };
      setSeries((prev) => [newSeries, ...prev]);

      addActivity({
        type: 'series_created',
        title: 'Series Baru Ditambahkan',
        description: `Series "${newSeries.title}" berhasil dibuat dengan status ${newSeries.publicationStatus}.`,
        link: `/admin/series/${newSeries.id}`,
      });

      return newSeries;
    },
    [addActivity]
  );

  const updateSeries = useCallback((id: string, updates: Partial<AdminSeries>) => {
    setSeries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
    );
  }, []);

  const deleteSeries = useCallback(
    (id: string) => {
      const target = series.find((s) => s.id === id);
      setSeries((prev) => prev.filter((s) => s.id !== id));
      // Delete associated episodes
      setEpisodes((prev) => prev.filter((ep) => ep.seriesId !== id));

      if (target) {
        addActivity({
          type: 'settings_updated',
          title: 'Series Dihapus',
          description: `Series "${target.title}" dan seluruh episode terkait telah dihapus.`,
        });
      }
    },
    [series, addActivity]
  );

  const toggleSeriesPublish = useCallback(
    (id: string) => {
      setSeries((prev) =>
        prev.map((s) => {
          if (s.id === id) {
            const nextStatus: PublicationStatus = s.publicationStatus === 'published' ? 'draft' : 'published';
            addActivity({
              type: 'episode_published',
              title: nextStatus === 'published' ? 'Series Dipublikasikan' : 'Series Diubah ke Draf',
              description: `Series "${s.title}" sekarang berstatus ${nextStatus}.`,
              link: `/admin/series/${s.id}`,
            });
            return { ...s, publicationStatus: nextStatus, updatedAt: new Date().toISOString() };
          }
          return s;
        })
      );
    },
    [addActivity]
  );

  // Episode Actions
  const addEpisode = useCallback(
    (episodeData: Omit<AdminEpisode, 'id' | 'createdAt' | 'updatedAt'>): AdminEpisode => {
      const now = new Date().toISOString();
      const newId = episodes.length > 0 ? Math.max(...episodes.map((e) => e.id)) + 1 : 1;
      const newEpisode: AdminEpisode = {
        ...episodeData,
        id: newId,
        views: 0,
        watchTimeHours: 0,
        completionRate: 0,
        createdAt: now,
        updatedAt: now,
      };
      setEpisodes((prev) => [...prev, newEpisode]);

      // Update series episode count
      setSeries((prev) =>
        prev.map((s) =>
          s.id === episodeData.seriesId
            ? { ...s, episodeCount: s.episodeCount + 1, updatedAt: now }
            : s
        )
      );

      addActivity({
        type: 'episode_published',
        title: 'Episode Baru Ditambahkan',
        description: `Episode ${newEpisode.number} "${newEpisode.title}" ditambahkan ke ${newEpisode.seriesTitle || 'series'}.`,
        link: '/admin/videos',
      });

      return newEpisode;
    },
    [episodes, addActivity]
  );

  const updateEpisode = useCallback((id: number, updates: Partial<AdminEpisode>) => {
    setEpisodes((prev) =>
      prev.map((ep) => (ep.id === id ? { ...ep, ...updates, updatedAt: new Date().toISOString() } : ep))
    );
  }, []);

  const deleteEpisode = useCallback(
    (id: number) => {
      const target = episodes.find((e) => e.id === id);
      setEpisodes((prev) => prev.filter((e) => e.id !== id));

      if (target) {
        setSeries((prev) =>
          prev.map((s) =>
            s.id === target.seriesId
              ? { ...s, episodeCount: Math.max(0, s.episodeCount - 1), updatedAt: new Date().toISOString() }
              : s
          )
        );
      }
    },
    [episodes]
  );

  const toggleEpisodePublish = useCallback(
    (id: number) => {
      setEpisodes((prev) =>
        prev.map((ep) => {
          if (ep.id === id) {
            const nextStatus: PublicationStatus = ep.publicationStatus === 'published' ? 'draft' : 'published';
            addActivity({
              type: 'episode_published',
              title: nextStatus === 'published' ? 'Episode Dipublikasikan' : 'Episode Jadi Draf',
              description: `Episode "${ep.title}" sekarang berstatus ${nextStatus}.`,
              link: '/admin/videos',
            });
            return { ...ep, publicationStatus: nextStatus, updatedAt: new Date().toISOString() };
          }
          return ep;
        })
      );
    },
    [addActivity]
  );

  const toggleEpisodeAccessType = useCallback(
    (id: number) => {
      setEpisodes((prev) =>
        prev.map((ep) => {
          if (ep.id === id) {
            const nextAccess: AccessType = ep.accessType === 'free' ? 'premium' : 'free';
            addActivity({
              type: 'access_changed',
              title: 'Akses Episode Berubah',
              description: `Episode "${ep.title}" sekarang berstatus ${nextAccess === 'free' ? 'Free Preview' : 'Premium'}.`,
              link: '/admin/videos',
            });
            return { ...ep, accessType: nextAccess, updatedAt: new Date().toISOString() };
          }
          return ep;
        })
      );
    },
    [addActivity]
  );

  // Category Actions
  const addCategory = useCallback(
    (catData: Omit<AdminCategory, 'id' | 'createdAt' | 'seriesCount' | 'episodeCount'>): AdminCategory => {
      const newCat: AdminCategory = {
        ...catData,
        id: `cat-${catData.slug || Date.now()}`,
        seriesCount: 0,
        episodeCount: 0,
        createdAt: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCat]);
      return newCat;
    },
    []
  );

  const updateCategory = useCallback((id: string, updates: Partial<AdminCategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Subtitle Actions
  const addSubtitle = useCallback((subData: Omit<AdminSubtitle, 'id' | 'updatedAt'>): AdminSubtitle => {
    const newSub: AdminSubtitle = {
      ...subData,
      id: `sub-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setSubtitles((prev) => [newSub, ...prev]);
    return newSub;
  }, []);

  const deleteSubtitle = useCallback((id: string) => {
    setSubtitles((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // User Actions
  const updateUserStatus = useCallback((id: string, status: 'active' | 'suspended') => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
  }, []);

  // Notification Actions
  const addNotification = useCallback(
    (notifData: Omit<AdminNotification, 'id' | 'createdAt' | 'sentCount' | 'openCount'>): AdminNotification => {
      const newNotif: AdminNotification = {
        ...notifData,
        id: `notif-${Date.now()}`,
        sentCount: notifData.status === 'published' ? 24850 : 0,
        openCount: notifData.status === 'published' ? 8400 : 0,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);

      addActivity({
        type: 'notification_sent',
        title: 'Notifikasi Dibuat',
        description: `Notifikasi "${newNotif.title}" disimpan sebagai ${newNotif.status}.`,
        link: '/admin/notifications',
      });

      return newNotif;
    },
    [addActivity]
  );

  const updateNotification = useCallback((id: string, updates: Partial<AdminNotification>) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const toggleNotificationPublish = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const nextStatus = n.status === 'published' ? 'draft' : 'published';
          return {
            ...n,
            status: nextStatus,
            sentCount: nextStatus === 'published' ? (n.sentCount || 24850) : 0,
            openCount: nextStatus === 'published' ? (n.openCount || 8400) : 0,
          };
        }
        return n;
      })
    );
  }, []);

  // Mobile Home Actions
  const updateMobileHomeLayout = useCallback((newLayout: MobileHomeLayoutConfig) => {
    setMobileHomeLayout(newLayout);
  }, []);

  const setHeroSeries = useCallback((seriesId: string) => {
    setMobileHomeLayout((prev) => ({
      ...prev,
      heroSeriesId: seriesId,
    }));
  }, []);

  // Section visibility is 100% automated based on published series data (no manual toggle allowed)
  const toggleSectionVisibility = useCallback(() => {
    // No-op: Visibilitas section otomatis ditentukan oleh ketersediaan data konten
  }, []);

  // Section order is immutable (#1 Populer, #2 Terbaru, #3 Rekomendasi, #4 Gratis)
  const reorderSection = useCallback(() => {
    // No-op: Urutan section beranda bersifat tetap dan tidak dapat dipindah-pindah
  }, []);

  const updateSectionSeries = useCallback((sectionId: string, seriesIds: string[]) => {
    setMobileHomeLayout((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, seriesIds } : s)),
    }));
  }, []);

  // Transaction Verification (Approve / Reject)
  const verifyTransaction = useCallback(
    (transactionId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
      let targetTx: AdminTransaction | undefined;

      setTransactions((prev) =>
        prev.map((t) => {
          if (t.id === transactionId) {
            targetTx = t;
            if (action === 'approve') {
              return {
                ...t,
                status: 'success',
                verifiedAt: new Date().toISOString(),
                verifiedBy: 'Admin HUMORA',
                rejectionReason: undefined,
              };
            } else {
              return {
                ...t,
                status: 'failed',
                verifiedAt: new Date().toISOString(),
                verifiedBy: 'Admin HUMORA',
                rejectionReason: rejectionReason || 'Bukti transfer tidak valid atau dana tidak ditemukan pada mutasi',
              };
            }
          }
          return t;
        })
      );

      if (targetTx) {
        if (action === 'approve') {
          // 1. Activate user subscription status
          setUsers((prev) =>
            prev.map((u) =>
              u.id === targetTx!.userId
                ? { ...u, subscriptionStatus: 'premium' }
                : u
            )
          );

          // 2. Add or update subscriber record
          const durationDays = targetTx.planDurationDays || (targetTx.planId === 'annual' ? 365 : targetTx.planId === 'quarterly' ? 90 : 30);
          const startDate = new Date().toISOString();
          const endDate = new Date(Date.now() + durationDays * 86400000).toISOString();

          setSubscribers((prev) => {
            const existingIdx = prev.findIndex((s) => s.userId === targetTx!.userId);
            if (existingIdx >= 0) {
              const updated = [...prev];
              updated[existingIdx] = {
                ...updated[existingIdx],
                planId: targetTx!.planId,
                planName: targetTx!.planName,
                price: targetTx!.total,
                startDate,
                endDate,
                status: 'active',
                paymentMethod: targetTx!.paymentMethod,
                totalSpent: (updated[existingIdx].totalSpent || 0) + targetTx!.total,
              };
              return updated;
            } else {
              const newSub: AdminSubscriber = {
                id: `sub-${Date.now()}`,
                userId: targetTx!.userId,
                userName: targetTx!.userName,
                userEmail: targetTx!.userEmail,
                userAvatar: targetTx!.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop',
                planId: targetTx!.planId,
                planName: targetTx!.planName,
                price: targetTx!.total,
                startDate,
                endDate,
                status: 'active',
                paymentMethod: targetTx!.paymentMethod,
                autoRenew: true,
                totalSpent: targetTx!.total,
              };
              return [newSub, ...prev];
            }
          });

          // 3. Add activity
          addActivity({
            type: 'access_changed',
            title: 'Pembayaran Disetujui & Langganan Aktif',
            description: `${targetTx.userName} berhasil berlangganan ${targetTx.planName} (${formatRupiah(targetTx.total)}). Status akun kini Premium.`,
            link: '/admin/transactions',
          });
        } else {
          // Add activity for rejection
          addActivity({
            type: 'access_changed',
            title: 'Pembayaran Ditolak',
            description: `Transaksi ${targetTx.id} atas nama ${targetTx.userName} (${targetTx.planName}) ditolak oleh admin. Alasan: ${rejectionReason || 'Bukti transfer tidak valid'}.`,
            link: '/admin/transactions',
          });
        }
      }
    },
    [addActivity]
  );

  // Create Simulation Payment (Demo User Checkout)
  const createSimulationPayment = useCallback(
    (paymentData: Omit<AdminTransaction, 'id' | 'createdAt' | 'status'>): AdminTransaction => {
      const newTx: AdminTransaction = {
        ...paymentData,
        id: `TRX-2026-${1051 + transactions.length}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      setTransactions((prev) => [newTx, ...prev]);

      addActivity({
        type: 'access_changed',
        title: 'Pembayaran Masuk (Menunggu Verifikasi)',
        description: `${paymentData.userName} mengunggah bukti pembayaran untuk ${paymentData.planName} (${formatRupiah(paymentData.total)}).`,
        link: '/admin/transactions',
      });

      return newTx;
    },
    [addActivity, transactions.length]
  );

  // Settings
  const updateSettings = useCallback((newSettings: Partial<AdminSettingsConfig>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Reset to default
  const resetAllDataToDefault = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSeries(INITIAL_SERIES);
    setEpisodes(INITIAL_EPISODES);
    setCategories(INITIAL_CATEGORIES);
    setSubtitles(INITIAL_SUBTITLES);
    setUsers(INITIAL_USERS);
    setSubscribers(INITIAL_SUBSCRIBERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setMobileHomeLayout(INITIAL_MOBILE_HOME_LAYOUT);
    setSettings(INITIAL_SETTINGS);
    setActivities([
      {
        id: 'act-init',
        type: 'settings_updated',
        title: 'Data Demo Direset',
        description: 'Seluruh katalog series, episode, user, dan metrik telah dikembalikan ke kondisi demo awal.',
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const value = {
    series,
    episodes,
    categories,
    subtitles,
    users,
    subscribers,
    transactions,
    notifications,
    mobileHomeLayout,
    settings,
    isLoaded,
    stats,
    topPerformingVideos,
    recentActivities: activities,
    addSeries,
    updateSeries,
    deleteSeries,
    toggleSeriesPublish,
    addEpisode,
    updateEpisode,
    deleteEpisode,
    toggleEpisodePublish,
    toggleEpisodeAccessType,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubtitle,
    deleteSubtitle,
    updateUserStatus,
    addNotification,
    updateNotification,
    deleteNotification,
    toggleNotificationPublish,
    updateMobileHomeLayout,
    setHeroSeries,
    toggleSectionVisibility,
    reorderSection,
    updateSectionSeries,
    verifyTransaction,
    createSimulationPayment,
    updateSettings,
    resetAllDataToDefault,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
