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
import { formatDate } from '../../../lib/utils/formatters';
import { AdminSeries } from '../../../lib/types/admin';
import {
  Clapperboard,
  Plus,
  LayoutGrid,
  List,
  Star,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function SeriesListPage() {
  const router = useRouter();
  const { series, episodes, deleteSeries, toggleSeriesPublish } = useAdmin();
  const { success } = useToast();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'episodes' | 'rating'>('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Deletion modal state
  const [seriesToDelete, setSeriesToDelete] = useState<AdminSeries | null>(null);

  // Filter & sort
  const filteredSeries = useMemo(() => {
    return series
      .filter((s) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchTitle = s.title.toLowerCase().includes(q);
          const matchSynopsis = s.synopsis.toLowerCase().includes(q);
          if (!matchTitle && !matchSynopsis) return false;
        }
        if (genreFilter !== 'all' && !s.genres.includes(genreFilter)) {
          return false;
        }
        if (statusFilter !== 'all' && s.publicationStatus !== statusFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'episodes') return b.episodeCount - a.episodeCount;
        if (sortBy === 'rating') return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [series, searchQuery, genreFilter, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredSeries.length / itemsPerPage) || 1;
  const paginatedSeries = filteredSeries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const publishedCount = series.filter((s) => s.publicationStatus === 'published').length;
  const draftCount = series.filter((s) => s.publicationStatus === 'draft').length;
  const featuredCount = series.filter((s) => s.featured).length;

  const handleDeleteConfirm = () => {
    if (seriesToDelete) {
      deleteSeries(seriesToDelete.id);
      success('Series Dihapus', `Series "${seriesToDelete.title}" telah dihapus dari data lokal.`);
      setSeriesToDelete(null);
    }
  };

  const handleTogglePublish = (s: AdminSeries) => {
    toggleSeriesPublish(s.id);
    const next = s.publicationStatus === 'published' ? 'Draft' : 'Terpublikasi';
    success('Status Diperbarui', `Series "${s.title}" kini berstatus ${next}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Judul Konten & Video"
        description="Kelola seluruh judul konten besar dan video yang tampil dalam katalog mobile HUMORA."
        breadcrumbs={[{ label: 'Judul Konten' }]}
        actions={
          <Link
            href="/admin/series/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#FFD52E]" />
            Tambah Judul Baru
          </Link>
        }
      />

      {/* Series Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Judul"
          value={series.length.toString()}
          subtitle="Seluruh katalog lokal"
          icon={<Clapperboard className="w-5 h-5" />}
          iconBg="bg-[#F6F1F8]"
          iconColor="text-[#4B0B7A]"
        />

        <StatCard
          title="Judul Terbit"
          value={publishedCount.toString()}
          subtitle="Tampil di mobile app"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-[#EAF8F1]"
          iconColor="text-[#21865B]"
        />

        <StatCard
          title="Series Draf"
          value={draftCount.toString()}
          subtitle="Belum dipublikasikan"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-[#FFF5E8]"
          iconColor="text-[#E58A16]"
        />

        <StatCard
          title="Series Unggulan"
          value={featuredCount.toString()}
          subtitle="Spotlight hero banner"
          icon={<Sparkles className="w-5 h-5" />}
          iconBg="bg-[#FFF9E0]"
          iconColor="text-[#D97706]"
        />
      </div>

      {/* Filter and Search Bar */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Cari judul series atau sinopsis..."
        hasActiveFilters={genreFilter !== 'all' || statusFilter !== 'all' || !!searchQuery}
        onResetFilters={() => {
          setSearchQuery('');
          setGenreFilter('all');
          setStatusFilter('all');
          setSortBy('newest');
          setCurrentPage(1);
        }}
      >
        {/* Genre Filter */}
        <select
          value={genreFilter}
          onChange={(e) => {
            setGenreFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="all">Semua Genre</option>
          <option value="Komedi">Komedi</option>
          <option value="Romantis">Romantis</option>
          <option value="Drama">Drama</option>
          <option value="Slice of Life">Slice of Life</option>
          <option value="Persahabatan">Persahabatan</option>
          <option value="Keluarga">Keluarga</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="all">Semua Status</option>
          <option value="published">Terpublikasi</option>
          <option value="draft">Draft</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'title' | 'episodes' | 'rating')}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="newest">Terbaru</option>
          <option value="title">Judul (A-Z)</option>
          <option value="episodes">Jumlah Episode</option>
          <option value="rating">Rating Tertinggi</option>
        </select>

        {/* Table / Grid Toggle */}
        <div className="flex items-center gap-1 bg-[#F8F7FA] p-1 rounded-xl border border-[#EEE8F0]">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'table' ? 'bg-[#4B0B7A] text-white shadow-2xs' : 'text-[#786F7D]'
            }`}
            title="Tampilan Tabel"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-[#4B0B7A] text-white shadow-2xs' : 'text-[#786F7D]'
            }`}
            title="Tampilan Grid Card"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </SearchFilterBar>

      {/* Main Content: Table or Grid */}
      {filteredSeries.length === 0 ? (
        <EmptyState
          icon={<Clapperboard className="w-7 h-7" />}
          title="Tidak Ada Series Ditemukan"
          description="Coba ubah kata kunci pencarian atau reset filter untuk menampilkan kembali katalog series."
          actionLabel="Tambah Series Baru"
          onAction={() => router.push('/admin/series/create')}
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8FB] text-[11px] font-bold text-[#786F7D] uppercase tracking-wider border-b border-[#EEE8F0]">
                  <th className="py-3 px-4">Series</th>
                  <th className="py-3 px-4">Genre / Kategori</th>
                  <th className="py-3 px-4 text-center">Total Episode</th>
                  <th className="py-3 px-4 text-center">Akses Episode</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Rating</th>
                  <th className="py-3 px-4">Diperbarui</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8F0]">
                {paginatedSeries.map((s) => {
                  const seriesEpisodes = episodes.filter((ep) => ep.seriesId === s.id);
                  const freeCount = seriesEpisodes.filter((ep) => ep.accessType === 'free').length;
                  const premCount = seriesEpisodes.filter((ep) => ep.accessType === 'premium').length;

                  return (
                    <tr key={s.id} className="hover:bg-[#FAF8FB] transition-colors">
                      {/* Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="aspect-16/9 w-16 rounded-lg overflow-hidden bg-black/10 shrink-0 relative border border-[#EEE8F0]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={s.thumbnail || s.cover || s.poster || ''}
                              alt={s.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <Link
                              href={`/admin/series/${s.id}`}
                              className="font-bold text-[#24172B] hover:text-[#4B0B7A] truncate block text-sm"
                            >
                              {s.title}
                            </Link>
                            <span className="text-[10px] text-[#786F7D] font-mono">/{s.slug}</span>
                            {s.featured && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FFD52E] text-[#21052F]">
                                Unggulan
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Genres */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {s.genres.map((g) => (
                            <span
                              key={g}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F6F1F8] text-[#4B0B7A]"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Episode count */}
                      <td className="py-3 px-4 text-center font-bold text-[#24172B]">
                        {s.episodeCount} Ep
                      </td>

                      {/* Free vs Premium Breakdown */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EAF8F1] text-[#21865B]">
                            {freeCount} Free
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F3E8FF] text-[#6B21A8]">
                            {premCount} Premium
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <StatusBadge type="publication" value={s.publicationStatus} />
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-4 text-center">
                        {s.rating > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[#24172B]">
                            <Star className="w-3.5 h-3.5 fill-[#FFD52E] text-[#FFD52E]" />
                            {s.rating}
                          </span>
                        ) : (
                          <span className="text-[#786F7D]">-</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-[#786F7D] font-medium">
                        {formatDate(s.updatedAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/series/${s.id}`}
                            className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#4B0B7A] hover:bg-[#F6F1F8] transition-colors"
                            title="Lihat Detail & Episode"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/series/${s.id}/edit`}
                            className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#4B0B7A] hover:bg-[#F6F1F8] transition-colors"
                            title="Edit Series"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleTogglePublish(s)}
                            className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#21865B] hover:bg-[#EAF8F1] transition-colors"
                            title={s.publicationStatus === 'published' ? 'Ubah ke Draf' : 'Terbitkan'}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSeriesToDelete(s)}
                            className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#D94152] hover:bg-[#FEECEF] transition-colors"
                            title="Hapus Series"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSeries.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </div>
      ) : (
        /* GRID VIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {paginatedSeries.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  {/* Thumbnail Aspect Ratio 16:9 */}
                  <div className="relative aspect-16/9 w-full overflow-hidden bg-black/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.thumbnail || s.cover || s.poster || ''}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <StatusBadge type="publication" value={s.publicationStatus} />
                      {s.featured && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FFD52E] text-[#21052F] shadow-xs">
                          Unggulan
                        </span>
                      )}
                    </div>

                    {s.rating > 0 && (
                      <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#FFD52E] text-[#FFD52E]" />
                        {s.rating}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <Link
                      href={`/admin/series/${s.id}`}
                      className="font-bold text-sm text-[#24172B] hover:text-[#4B0B7A] line-clamp-1"
                    >
                      {s.title}
                    </Link>

                    <p className="text-[11px] text-[#786F7D] line-clamp-2 mt-1 leading-relaxed">
                      {s.synopsis}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {s.genres.map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F6F1F8] text-[#4B0B7A]"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF8FB] border-t border-[#EEE8F0] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#24172B]">{s.episodeCount} Episode</span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/series/${s.id}`}
                      className="px-2.5 py-1 rounded-lg bg-[#4B0B7A] text-white text-[11px] font-semibold hover:bg-[#3B0762] transition-colors"
                    >
                      Detail
                    </Link>
                    <Link
                      href={`/admin/series/${s.id}/edit`}
                      className="p-1 rounded-lg text-[#786F7D] hover:text-[#4B0B7A] hover:bg-[#EEE8F0] transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSeries.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!seriesToDelete}
        title="Hapus Series Ini?"
        message={`Apakah Anda yakin ingin menghapus series "${seriesToDelete?.title}"? Seluruh keterkaitan episode simulasi juga akan dihapus dari prototype.`}
        confirmLabel="Ya, Hapus Series"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSeriesToDelete(null)}
      />
    </div>
  );
}
