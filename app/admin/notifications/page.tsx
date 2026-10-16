'use client';

import React, { useState } from 'react';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { HumoraLogo } from '../../../components/brand/HumoraLogo';
import { formatDate, formatDateTime, formatNumber } from '../../../lib/utils/formatters';
import { AdminNotification } from '../../../lib/types/admin';
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  X,
  ExternalLink,
} from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, series, addNotification, updateNotification, deleteNotification, toggleNotificationPublish } = useAdmin();
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotif, setEditingNotif] = useState<AdminNotification | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'episode_baru' | 'series_baru' | 'promo' | 'langganan'>('episode_baru');
  const [targetUrl, setTargetUrl] = useState('/series/kontrak-jadi-pacar');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  // Deletion modal
  const [notifToDelete, setNotifToDelete] = useState<AdminNotification | null>(null);

  const openCreateModal = () => {
    setEditingNotif(null);
    setTitle('');
    setDescription('');
    setCategory('episode_baru');
    setTargetUrl('/series/kontrak-jadi-pacar');
    setStatus('published');
    setIsModalOpen(true);
  };

  const openEditModal = (n: AdminNotification) => {
    setEditingNotif(n);
    setTitle(n.title);
    setDescription(n.description);
    setCategory(n.category);
    setTargetUrl(n.targetUrl);
    setStatus(n.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Judul Wajib Diisi', 'Silakan ketikkan judul notifikasi.');
      return;
    }

    const catLabels: Record<string, string> = {
      episode_baru: 'Episode Baru',
      series_baru: 'Series Baru',
      promo: 'Promo Spesial',
      langganan: 'Info Langganan',
    };

    if (editingNotif) {
      updateNotification(editingNotif.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        categoryLabel: catLabels[category] || 'Pemberitahuan',
        targetUrl,
        status,
      });
      success('Notifikasi Diperbarui', `Notifikasi "${title}" berhasil diubah.`);
    } else {
      addNotification({
        title: title.trim(),
        description: description.trim(),
        category,
        categoryLabel: catLabels[category] || 'Pemberitahuan',
        targetUrl,
        status,
      });
      success('Notifikasi Dibuat', `Notifikasi "${title}" berhasil disimpan.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (notifToDelete) {
      deleteNotification(notifToDelete.id);
      success('Notifikasi Dihapus', `Notifikasi "${notifToDelete.title}" telah dihapus.`);
      setNotifToDelete(null);
    }
  };

  const totalSent = notifications.reduce((acc, n) => acc + (n.sentCount || 0), 0);
  const totalOpen = notifications.reduce((acc, n) => acc + (n.openCount || 0), 0);
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpen / totalSent) * 100) : 38.4;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Pengelolaan Notifikasi"
        description="Kirim dan jadwalkan pesan pemberitahuan in-app serta simulasi push notification kepada pengguna aplikasi mobile HUMORA."
        breadcrumbs={[{ label: 'Notifikasi' }]}
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#FFD52E]" /> Buat Notifikasi Baru
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Notifikasi"
          value={notifications.length.toString()}
          subtitle="Draf & terpublikasi"
          icon={<Bell className="w-5 h-5" />}
          iconBg="bg-[#F6F1F8]"
          iconColor="text-[#4B0B7A]"
        />
        <StatCard
          title="Total Terkirim"
          value={formatNumber(totalSent)}
          subtitle="Penerima aktif"
          icon={<Smartphone className="w-5 h-5" />}
          iconBg="bg-[#EAF8F1]"
          iconColor="text-[#21865B]"
        />
        <StatCard
          title="Rata-rata Terbuka"
          value={`${avgOpenRate}%`}
          change={4.2}
          changeLabel="vs target"
          icon={<Sparkles className="w-5 h-5" />}
          iconBg="bg-[#FFF9E0]"
          iconColor="text-[#D97706]"
        />
        <StatCard
          title="Status Terbit"
          value={`${notifications.filter((n) => n.status === 'published').length} Terbit`}
          subtitle="Tampil di pusat notifikasi"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-[#E0F2FE]"
          iconColor="text-[#0369A1]"
        />
      </div>

      {/* Notifications Table */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-7 h-7" />}
          title="Belum Ada Notifikasi"
          description="Buat notifikasi promosi atau pemberitahuan episode baru untuk pengguna aplikasi mobile."
          actionLabel="Buat Notifikasi Pertama"
          onAction={openCreateModal}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#EEE8F0] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
              Daftar Notifikasi ({notifications.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8FB] text-[11px] font-bold text-[#786F7D] uppercase tracking-wider border-b border-[#EEE8F0]">
                  <th className="py-3 px-4">Judul & Isi Pesan</th>
                  <th className="py-3 px-4">Kategori Pesan</th>
                  <th className="py-3 px-4">Tautan Tujuan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Terkirim / Terbuka</th>
                  <th className="py-3 px-4">Waktu Dibuat</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8F0]">
                {notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-[#FAF8FB] transition-colors">
                    <td className="py-3 px-4">
                      <div className="max-w-sm">
                        <p className="font-bold text-sm text-[#24172B] leading-tight">{n.title}</p>
                        <p className="text-[11px] text-[#786F7D] line-clamp-1 mt-0.5">{n.description}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#F6F1F8] text-[#4B0B7A]">
                        {n.categoryLabel}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[#786F7D]">
                      {n.targetUrl}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleNotificationPublish(n.id)}
                        className="cursor-pointer transition-transform hover:scale-105"
                        title="Klik untuk mengubah status terbit"
                      >
                        <StatusBadge type="publication" value={n.status} />
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {n.sentCount > 0 ? (
                        <div>
                          <p className="font-bold text-[#24172B]">{formatNumber(n.sentCount)} terkirim</p>
                          <span className="text-[10px] text-[#21865B] font-semibold">
                            {formatNumber(n.openCount)} dibuka ({Math.round((n.openCount / n.sentCount) * 100)}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#786F7D]">Draf (0 terkirim)</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[#786F7D] font-medium">
                      {formatDate(n.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(n)}
                          className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#4B0B7A] hover:bg-[#F6F1F8] transition-colors"
                          title="Edit Notifikasi"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setNotifToDelete(n)}
                          className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#D94152] hover:bg-[#FEECEF] transition-colors"
                          title="Hapus Notifikasi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal with Live Smartphone Notification Banner Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#EEE8F0] transform animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
              <h3 className="text-base font-bold text-[#24172B]">
                {editingNotif ? 'Edit Notifikasi' : 'Buat Notifikasi Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#786F7D] hover:text-[#24172B] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Controls */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                    Kategori Pesan
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'episode_baru' | 'series_baru' | 'promo' | 'langganan')}
                    className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-bold text-[#24172B]"
                  >
                    <option value="episode_baru">Episode Baru Rilis</option>
                    <option value="series_baru">Series Baru Trending</option>
                    <option value="promo">Promo & Diskon Premium</option>
                    <option value="langganan">Pengingat Langganan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                    Judul Notifikasi
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Misal: Episode 3 Kontrak Jadi Pacar Rilis!"
                    className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-bold text-[#24172B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                    Isi Pesan Notifikasi
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tuliskan pesan singkat yang menggugah..."
                    className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl p-3 text-xs text-[#24172B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                    Tautan Tujuan di Aplikasi
                  </label>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="/series/kontrak-jadi-pacar"
                    className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-mono text-[#24172B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                    Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('published')}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold border ${
                        status === 'published' ? 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]' : 'bg-[#F8F7FA] text-[#786F7D]'
                      }`}
                    >
                      Terbitkan
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('draft')}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold border ${
                        status === 'draft' ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]' : 'bg-[#F8F7FA] text-[#786F7D]'
                      }`}
                    >
                      Simpan Draft
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-2 rounded-xl border border-[#EEE8F0] text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#4B0B7A] text-white text-xs font-bold hover:bg-[#3B0762]"
                  >
                    Simpan Notifikasi
                  </button>
                </div>
              </form>

              {/* Live Smartphone Notification Preview Widget */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-[#786F7D] uppercase tracking-wider block">
                  📱 Pratinjau Layar Kunci Mobile
                </span>

                <div className="w-full bg-[#21052F] rounded-2xl p-4 shadow-inner text-white space-y-3 border border-[#EEE8F0]">
                  <div className="text-center text-[10px] text-white/60 font-bold">
                    Senin, 16 Oktober • 10:30
                  </div>

                  {/* Push Banner Mockup */}
                  <div className="bg-white/95 text-[#24172B] p-3 rounded-2xl shadow-lg backdrop-blur-md space-y-1 border border-white/20">
                    <div className="flex items-center justify-between text-[10px] text-[#786F7D]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-md bg-[#FFD52E] flex items-center justify-center font-black text-[9px] text-[#21052F]">
                          H
                        </div>
                        <span className="font-extrabold text-[#21052F]">HUMORA</span>
                      </div>
                      <span>Sekarang</span>
                    </div>

                    <h5 className="font-bold text-xs text-[#24172B] leading-tight">
                      {title || 'Judul Notifikasi Anda'}
                    </h5>
                    <p className="text-[11px] text-[#786F7D] line-clamp-2 leading-snug">
                      {description || 'Pesan notifikasi akan terlihat seperti ini di layar smartphone pengguna.'}
                    </p>
                  </div>

                  {/* In-App Notification Center Mini Card */}
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FFD52E] text-[#21052F]">
                        In-App Feed
                      </span>
                      <span className="text-[10px] text-white/60">Pusat Notifikasi</span>
                    </div>
                    <p className="font-bold text-white text-xs truncate">
                      {title || 'Judul Notifikasi'}
                    </p>
                    <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                      {description || 'Teks preview feed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!notifToDelete}
        title={`Hapus Notifikasi "${notifToDelete?.title}"?`}
        message="Notifikasi ini akan dihapus dari pusat pesan dan tidak dapat dikembalikan."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setNotifToDelete(null)}
      />
    </div>
  );
}
