'use client';

import React, { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '../../../../lib/context/AdminContext';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { StatCard } from '../../../../components/ui/StatCard';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { useToast } from '../../../../components/ui/Toast';
import { formatNumber, formatDate } from '../../../../lib/utils/formatters';
import { AdminEpisode } from '../../../../lib/types/admin';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Heart,
  Play,
  Eye,
  Sparkles,
  Crown,
  Calendar,
} from 'lucide-react';

function SeriesDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { series, episodes, deleteSeries, toggleSeriesPublish, toggleEpisodeAccessType, toggleEpisodePublish, deleteEpisode } = useAdmin();
  const { success } = useToast();

  const seriesId = params?.id as string;
  const currentSeries = series.find((s) => s.id === seriesId);

  // Episodes for this series
  const seriesEpisodes = episodes
    .filter((ep) => ep.seriesId === seriesId)
    .sort((a, b) => a.number - b.number);

  const [isDeleteSeriesModalOpen, setIsDeleteSeriesModalOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<AdminEpisode | null>(null);

  if (!currentSeries) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#24172B]">Series Tidak Ditemukan</h2>
        <p className="text-xs text-[#786F7D]">Series dengan ID &ldquo;{seriesId}&rdquo; mungkin telah dihapus.</p>
        <Link
          href="/admin/series"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4B0B7A] text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Series
        </Link>
      </div>
    );
  }

  const freeCount = seriesEpisodes.filter((ep) => ep.accessType === 'free').length;
  const premCount = seriesEpisodes.filter((ep) => ep.accessType === 'premium').length;
  const totalViews = seriesEpisodes.reduce((acc, ep) => acc + ep.views, 0);
  const totalWatchTime = seriesEpisodes.reduce((acc, ep) => acc + ep.watchTimeHours, 0);

  const handleDeleteSeries = () => {
    deleteSeries(currentSeries.id);
    success('Series Dihapus', `Series "${currentSeries.title}" berhasil dihapus.`);
    router.push('/admin/series');
  };

  const handleTogglePublish = () => {
    toggleSeriesPublish(currentSeries.id);
    const next = currentSeries.publicationStatus === 'published' ? 'Draft' : 'Terpublikasi';
    success('Status Diperbarui', `Series "${currentSeries.title}" sekarang berstatus ${next}.`);
  };

  const handleDeleteEpisodeConfirm = () => {
    if (episodeToDelete) {
      deleteEpisode(episodeToDelete.id);
      success('Episode Dihapus', `Episode ${episodeToDelete.number} telah dihapus.`);
      setEpisodeToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={currentSeries.title}
        breadcrumbs={[{ label: 'Series', href: '/admin/series' }, { label: currentSeries.title }]}
        badge={<StatusBadge type="publication" value={currentSeries.publicationStatus} />}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/series"
              className="p-2.5 rounded-xl border border-[#EEE8F0] bg-white text-[#786F7D] hover:text-[#24172B] hover:bg-[#F8F7FA] transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <button
              onClick={handleTogglePublish}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] bg-white text-xs font-semibold text-[#24172B] hover:bg-[#F8F7FA] transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-[#21865B]" />
              {currentSeries.publicationStatus === 'published' ? 'Ubah ke Draft' : 'Terbitkan Series'}
            </button>

            <Link
              href={`/admin/series/${currentSeries.id}/edit`}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] bg-white text-xs font-semibold text-[#24172B] hover:bg-[#F8F7FA] transition-colors"
            >
              <Edit className="w-4 h-4 text-[#4B0B7A]" /> Edit Series
            </Link>

            <button
              onClick={() => setIsDeleteSeriesModalOpen(true)}
              className="p-2.5 rounded-xl text-[#D94152] bg-[#FEECEF] hover:bg-[#FCD8DF] transition-colors"
              title="Hapus Series"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <Link
              href={`/admin/videos/create?seriesId=${currentSeries.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#FFD52E]" /> Tambah Video
            </Link>
          </div>
        }
      />

      {/* Series Hero Info Card */}
      <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row gap-6">
          <div className="aspect-16/9 w-full md:w-80 rounded-2xl overflow-hidden bg-black/10 shrink-0 relative border border-[#EEE8F0] shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentSeries.thumbnail || currentSeries.cover || currentSeries.poster || ''}
              alt={currentSeries.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {currentSeries.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F6F1F8] text-[#4B0B7A]"
                  >
                    {g}
                  </span>
                ))}
                <span className="text-xs text-[#786F7D] font-medium">• {currentSeries.year}</span>
                {(currentSeries.likes || 0) > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D94152] bg-[#FEECEF] px-2.5 py-0.5 rounded-md">
                    <Heart className="w-3.5 h-3.5 fill-[#D94152] text-[#D94152]" /> {formatNumber(currentSeries.likes || 0)} Suka
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black text-[#24172B] tracking-tight">{currentSeries.title}</h2>
              <p className="text-xs text-[#786F7D] font-mono mt-0.5">Slug: /{currentSeries.slug}</p>

              <p className="mt-3 text-sm text-[#786F7D] leading-relaxed max-w-3xl">
                {currentSeries.synopsis}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EEE8F0] flex flex-wrap items-center gap-4 text-xs text-[#786F7D]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Dibuat: {formatDate(currentSeries.createdAt)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                Diperbarui: {formatDate(currentSeries.updatedAt)}
              </span>
              {currentSeries.featured && (
                <>
                  <span>•</span>
                  <span className="font-bold text-[#D97706] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Tampil di Hero Spotlight Beranda
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Series Specific Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Episode"
          value={seriesEpisodes.length.toString()}
          subtitle="Tercatat dalam series"
          icon={<Play className="w-5 h-5" />}
          iconBg="bg-[#F6F1F8]"
          iconColor="text-[#4B0B7A]"
        />
        <StatCard
          title="Episode Gratis"
          value={`${freeCount} Episode`}
          subtitle="Free Preview untuk umum"
          icon={<Sparkles className="w-5 h-5" />}
          iconBg="bg-[#EAF8F1]"
          iconColor="text-[#21865B]"
        />
        <StatCard
          title="Episode Premium"
          value={`${premCount} Episode`}
          subtitle="Khusus langganan aktif"
          icon={<Crown className="w-5 h-5" />}
          iconBg="bg-[#F3E8FF]"
          iconColor="text-[#6B21A8]"
        />
        <StatCard
          title="Total Views Series"
          value={formatNumber(totalViews)}
          subtitle={`${formatNumber(totalWatchTime)} jam ditonton`}
          icon={<Eye className="w-5 h-5" />}
          iconBg="bg-[#FFF5E8]"
          iconColor="text-[#E58A16]"
        />
      </div>

      {/* Episodes Table for this Series */}
      <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#EEE8F0] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
              Daftar Episode ({seriesEpisodes.length})
            </h3>
            <p className="text-xs text-[#786F7D] mt-0.5">
              Atur status akses Free Preview dan publikasi untuk setiap episode serial ini.
            </p>
          </div>

          <Link
            href={`/admin/videos/create?seriesId=${currentSeries.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4B0B7A] text-white text-xs font-bold hover:bg-[#3B0762] transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Episode
          </Link>
        </div>

        {seriesEpisodes.length === 0 ? (
          <EmptyState
            icon={<Play className="w-7 h-7" />}
            title="Belum Ada Episode"
            description="Series ini belum memiliki episode terdaftar. Tambahkan episode pertamamu sekarang."
            actionLabel="Tambah Episode Sekarang"
            onAction={() => router.push(`/admin/videos/create?seriesId=${currentSeries.id}`)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8FB] text-[11px] font-bold text-[#786F7D] uppercase tracking-wider border-b border-[#EEE8F0]">
                  <th className="py-3 px-4 w-12 text-center">Ep #</th>
                  <th className="py-3 px-4">Judul Episode</th>
                  <th className="py-3 px-4">Durasi</th>
                  <th className="py-3 px-4 text-center">Tipe Akses (Klik Toggle)</th>
                  <th className="py-3 px-4 text-center">Publikasi</th>
                  <th className="py-3 px-4 text-right">Views</th>
                  <th className="py-3 px-4 text-right">Jumlah Suka</th>
                  <th className="py-3 px-4 text-right">Completion</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8F0]">
                {seriesEpisodes.map((ep) => (
                  <tr key={ep.id} className="hover:bg-[#FAF8FB] transition-colors">
                    <td className="py-3 px-4 font-black text-[#786F7D] text-center">
                      {ep.number}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 rounded-lg overflow-hidden bg-black/10 shrink-0 relative border border-[#EEE8F0]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/videos/${ep.id}/edit`}
                            className="font-bold text-[#24172B] hover:text-[#4B0B7A] truncate block max-w-[260px]"
                          >
                            {ep.title}
                          </Link>
                          <p className="text-[11px] text-[#786F7D] line-clamp-1">{ep.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-[#24172B]">
                      {ep.duration}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          toggleEpisodeAccessType(ep.id);
                          const next = ep.accessType === 'free' ? 'Premium' : 'Free Preview';
                          success('Akses Episode Berubah', `Episode ${ep.number} kini berstatus ${next}.`);
                        }}
                        className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        title="Klik untuk mengubah antara Free Preview & Premium"
                      >
                        <StatusBadge type="access" value={ep.accessType} />
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          toggleEpisodePublish(ep.id);
                          const next = ep.publicationStatus === 'published' ? 'Draft' : 'Terpublikasi';
                          success('Status Diperbarui', `Episode ${ep.number} kini berstatus ${next}.`);
                        }}
                        className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        title="Klik untuk mengubah status publikasi"
                      >
                        <StatusBadge type="publication" value={ep.publicationStatus} />
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right font-black text-[#24172B]">
                      {formatNumber(ep.views)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center justify-end gap-1 font-bold text-[#D94152]">
                        <Heart className="w-3.5 h-3.5 fill-[#D94152] text-[#D94152]" />
                        {formatNumber(ep.likes ?? 0)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-[#21865B]">
                      {ep.completionRate}%
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/videos/${ep.id}/edit`}
                          className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#4B0B7A] hover:bg-[#F6F1F8] transition-colors"
                          title="Edit Episode"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setEpisodeToDelete(ep)}
                          className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#D94152] hover:bg-[#FEECEF] transition-colors"
                          title="Hapus Episode"
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
        )}
      </div>

      {/* Delete Series Dialog */}
      <ConfirmDialog
        isOpen={isDeleteSeriesModalOpen}
        title={`Hapus Series "${currentSeries.title}"?`}
        message="Menghapus series ini akan menghapus seluruh data keterkaitan episode lokalnya dari prototype HUMORA. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus Seluruhnya"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDeleteSeries}
        onCancel={() => setIsDeleteSeriesModalOpen(false)}
      />

      {/* Delete Episode Dialog */}
      <ConfirmDialog
        isOpen={!!episodeToDelete}
        title="Hapus Episode Ini?"
        message={`Apakah Anda yakin ingin menghapus Episode ${episodeToDelete?.number} "${episodeToDelete?.title}"?`}
        confirmLabel="Ya, Hapus Episode"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDeleteEpisodeConfirm}
        onCancel={() => setEpisodeToDelete(null)}
      />
    </div>
  );
}

export default function SeriesDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#786F7D]">Memuat detail series...</div>}>
      <SeriesDetailContent />
    </Suspense>
  );
}
