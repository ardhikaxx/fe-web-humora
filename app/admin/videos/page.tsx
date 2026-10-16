'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Pagination } from '../../../components/ui/Pagination';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { formatNumber } from '../../../lib/utils/formatters';
import { AdminEpisode } from '../../../lib/types/admin';
import {
  Video,
  Plus,
  Sparkles,
  Crown,
  CheckCircle2,
  Edit,
  Trash2,
  Copy,
} from 'lucide-react';

export default function VideosListPage() {
  const router = useRouter();
  const {
    episodes,
    series,
    toggleEpisodeAccessType,
    toggleEpisodePublish,
    deleteEpisode,
    addEpisode,
  } = useAdmin();
  const { success } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'number' | 'views' | 'title' | 'duration'>('views');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Deletion state
  const [episodeToDelete, setEpisodeToDelete] = useState<AdminEpisode | null>(null);

  // Filter & sort
  const filteredEpisodes = useMemo(() => {
    return episodes
      .filter((ep) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchTitle = ep.title.toLowerCase().includes(q);
          const matchSeries = ep.seriesTitle?.toLowerCase().includes(q);
          if (!matchTitle && !matchSeries) return false;
        }
        if (seriesFilter !== 'all' && ep.seriesId !== seriesFilter) {
          return false;
        }
        if (accessFilter !== 'all' && ep.accessType !== accessFilter) {
          return false;
        }
        if (statusFilter !== 'all' && ep.publicationStatus !== statusFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'number') return a.number - b.number;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'duration') return b.durationSeconds - a.durationSeconds;
        return b.views - a.views;
      });
  }, [episodes, searchQuery, seriesFilter, accessFilter, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredEpisodes.length / itemsPerPage) || 1;
  const paginatedEpisodes = filteredEpisodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const freeCount = episodes.filter((ep) => ep.accessType === 'free').length;
  const premCount = episodes.filter((ep) => ep.accessType === 'premium').length;
  const publishedCount = episodes.filter((ep) => ep.publicationStatus === 'published').length;
  const draftCount = episodes.filter((ep) => ep.publicationStatus === 'draft').length;

  const handleDeleteConfirm = () => {
    if (episodeToDelete) {
      deleteEpisode(episodeToDelete.id);
      success('Episode Dihapus', `Episode ${episodeToDelete.number} "${episodeToDelete.title}" telah dihapus.`);
      setEpisodeToDelete(null);
    }
  };

  const handleDuplicate = (ep: AdminEpisode) => {
    const parentSeries = series.find((s) => s.id === ep.seriesId);
    const nextEpNum = parentSeries ? parentSeries.episodeCount + 1 : ep.number + 1;

    addEpisode({
      seriesId: ep.seriesId,
      seriesSlug: ep.seriesSlug,
      seriesTitle: ep.seriesTitle,
      number: nextEpNum,
      title: `${ep.title} (Salinan Draft)`,
      description: ep.description,
      duration: ep.duration,
      durationSeconds: ep.durationSeconds,
      accessType: ep.accessType,
      publicationStatus: 'draft',
      thumbnail: ep.thumbnail,
      videoSource: ep.videoSource,
      hasVideoFile: ep.hasVideoFile,
      hasSubtitleFile: ep.hasSubtitleFile,
      subtitleLanguage: ep.subtitleLanguage,
      releaseDate: 'Draf',
      views: 0,
      watchTimeHours: 0,
      completionRate: 0,
    });

    success('Episode Digandakan', `Episode berhasil digandakan sebagai draft (Ep ${nextEpNum}).`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Videos & Episodes"
        description="Kelola seluruh video episode, aturan akses Free Preview vs Premium, serta publikasi tayangan HUMORA."
        breadcrumbs={[{ label: 'Videos & Episodes' }]}
        actions={
          <Link
            href="/admin/videos/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#FFD52E]" />
            Tambah Episode Baru
          </Link>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Episode"
          value={episodes.length.toString()}
          subtitle="Seluruh series lokal"
          icon={<Video className="w-5 h-5" />}
          iconBg="bg-[#F6F1F8]"
          iconColor="text-[#4B0B7A]"
        />
        <StatCard
          title="Free Preview"
          value={`${freeCount} Ep`}
          subtitle="Gratis tanpa langganan"
          icon={<Sparkles className="w-5 h-5" />}
          iconBg="bg-[#EAF8F1]"
          iconColor="text-[#21865B]"
        />
        <StatCard
          title="Episode Premium"
          value={`${premCount} Ep`}
          subtitle="Terkunci untuk subscriber"
          icon={<Crown className="w-5 h-5" />}
          iconBg="bg-[#F3E8FF]"
          iconColor="text-[#6B21A8]"
        />
        <StatCard
          title="Status Terbit"
          value={`${publishedCount} Terbit`}
          subtitle={`${draftCount} masih draf`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-[#E0F2FE]"
          iconColor="text-[#0369A1]"
        />
      </div>

      {/* Filter and Search Bar */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Cari judul episode atau nama series..."
        hasActiveFilters={
          seriesFilter !== 'all' || accessFilter !== 'all' || statusFilter !== 'all' || !!searchQuery
        }
        onResetFilters={() => {
          setSearchQuery('');
          setSeriesFilter('all');
          setAccessFilter('all');
          setStatusFilter('all');
          setSortBy('views');
          setCurrentPage(1);
        }}
      >
        {/* Series Filter */}
        <select
          value={seriesFilter}
          onChange={(e) => {
            setSeriesFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden max-w-[170px]"
        >
          <option value="all">Semua Series</option>
          {series.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>

        {/* Access Type Filter */}
        <select
          value={accessFilter}
          onChange={(e) => {
            setAccessFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="all">Semua Akses</option>
          <option value="free">Free Preview</option>
          <option value="premium">Premium</option>
        </select>

        {/* Publication Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="all">Semua Publikasi</option>
          <option value="published">Terpublikasi</option>
          <option value="draft">Draft</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'number' | 'views' | 'title' | 'duration')}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="views">Views Terbanyak</option>
          <option value="number">Nomor Episode</option>
          <option value="title">Judul (A-Z)</option>
          <option value="duration">Durasi Terlama</option>
        </select>
      </SearchFilterBar>

      {/* Episodes Table */}
      {filteredEpisodes.length === 0 ? (
        <EmptyState
          icon={<Video className="w-7 h-7" />}
          title="Tidak Ada Episode Ditemukan"
          description="Coba ubah filter atau kata kunci pencarian Anda."
          actionLabel="Tambah Episode Baru"
          onAction={() => router.push('/admin/videos/create')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8FB] text-[11px] font-bold text-[#786F7D] uppercase tracking-wider border-b border-[#EEE8F0]">
                  <th className="py-3 px-4">Episode & Series</th>
                  <th className="py-3 px-4 text-center">No.</th>
                  <th className="py-3 px-4">Durasi</th>
                  <th className="py-3 px-4 text-center">Tipe Akses (Klik Toggle)</th>
                  <th className="py-3 px-4 text-center">Status Publikasi</th>
                  <th className="py-3 px-4 text-right">Penayangan</th>
                  <th className="py-3 px-4 text-right">Completion</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8F0]">
                {paginatedEpisodes.map((ep) => (
                  <tr key={ep.id} className="hover:bg-[#FAF8FB] transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-9 rounded-lg overflow-hidden bg-black/10 shrink-0 relative border border-[#EEE8F0]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 max-w-[240px]">
                          <Link
                            href={`/admin/videos/${ep.id}/edit`}
                            className="font-bold text-[#24172B] hover:text-[#4B0B7A] truncate block text-xs"
                          >
                            {ep.title}
                          </Link>
                          <span className="text-[11px] text-[#786F7D] truncate block">
                            {ep.seriesTitle}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Episode Number */}
                    <td className="py-3 px-4 text-center font-black text-[#786F7D]">
                      #{ep.number}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 font-semibold text-[#24172B]">
                      {ep.duration}
                    </td>

                    {/* Access Type Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          toggleEpisodeAccessType(ep.id);
                          const next = ep.accessType === 'free' ? 'Premium' : 'Free Preview';
                          success('Akses Berubah', `Episode "${ep.title}" sekarang ${next}.`);
                        }}
                        className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        title="Klik untuk mengubah status akses"
                      >
                        <StatusBadge type="access" value={ep.accessType} />
                      </button>
                    </td>

                    {/* Publication Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          toggleEpisodePublish(ep.id);
                          const next = ep.publicationStatus === 'published' ? 'Draft' : 'Terpublikasi';
                          success('Publikasi Berubah', `Episode "${ep.title}" sekarang ${next}.`);
                        }}
                        className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        title="Klik untuk mengubah status publikasi"
                      >
                        <StatusBadge type="publication" value={ep.publicationStatus} />
                      </button>
                    </td>

                    {/* Views */}
                    <td className="py-3 px-4 text-right font-black text-[#24172B]">
                      {formatNumber(ep.views)}
                    </td>

                    {/* Completion rate */}
                    <td className="py-3 px-4 text-right">
                      {ep.completionRate > 0 ? (
                        <span className="font-bold text-[#21865B]">{ep.completionRate}%</span>
                      ) : (
                        <span className="text-[#786F7D]">-</span>
                      )}
                    </td>

                    {/* Actions */}
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
                          onClick={() => handleDuplicate(ep)}
                          className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#21865B] hover:bg-[#EAF8F1] transition-colors"
                          title="Duplikasi sebagai Draft Baru"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredEpisodes.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!episodeToDelete}
        title="Hapus Episode Ini?"
        message={`Apakah Anda yakin ingin menghapus Episode #${episodeToDelete?.number} "${episodeToDelete?.title}" dari series ${episodeToDelete?.seriesTitle}?`}
        confirmLabel="Ya, Hapus Episode"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setEpisodeToDelete(null)}
      />
    </div>
  );
}
