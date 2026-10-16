'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { UploadDropzone } from '../../../components/ui/UploadDropzone';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { formatDate } from '../../../lib/utils/formatters';
import { AdminSubtitle } from '../../../lib/types/admin';
import {
  FileText,
  Plus,
  Eye,
  Trash2,
  CheckCircle2,
  X,
  Languages,
  Clock,
} from 'lucide-react';

export default function SubtitlesPage() {
  const { subtitles, series, episodes, addSubtitle, deleteSubtitle } = useAdmin();
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');

  // Preview Modal
  const [previewSubtitle, setPreviewSubtitle] = useState<AdminSubtitle | null>(null);

  // Add Subtitle Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSeriesId, setSelectedSeriesId] = useState(series[0]?.id || '');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<number>(1);
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [format, setFormat] = useState<'SRT' | 'VTT'>('SRT');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');

  // Delete Subtitle Dialog
  const [subToDelete, setSubToDelete] = useState<AdminSubtitle | null>(null);

  // Filtered episodes for the modal
  const modalEpisodes = useMemo(() => {
    return episodes.filter((ep) => ep.seriesId === selectedSeriesId);
  }, [episodes, selectedSeriesId]);

  // Update selectedEpisodeId when series changes
  const handleSeriesChange = (sId: string) => {
    setSelectedSeriesId(sId);
    const eps = episodes.filter((ep) => ep.seriesId === sId);
    if (eps.length > 0) setSelectedEpisodeId(eps[0].id);
  };

  const filteredSubtitles = useMemo(() => {
    return subtitles.filter((sub) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = sub.episodeTitle.toLowerCase().includes(q);
        const matchSeries = sub.seriesTitle.toLowerCase().includes(q);
        const matchFile = sub.fileName.toLowerCase().includes(q);
        if (!matchTitle && !matchSeries && !matchFile) return false;
      }
      if (languageFilter !== 'all' && sub.language !== languageFilter) {
        return false;
      }
      if (formatFilter !== 'all' && sub.format !== formatFilter) {
        return false;
      }
      return true;
    });
  }, [subtitles, searchQuery, languageFilter, formatFilter]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) {
      error('Pilih File', 'Silakan pilih berkas subtitle SRT atau VTT.');
      return;
    }

    const curEp = episodes.find((e) => e.id === selectedEpisodeId);
    const curSer = series.find((s) => s.id === selectedSeriesId);

    addSubtitle({
      episodeId: selectedEpisodeId,
      episodeNumber: curEp?.number || 1,
      episodeTitle: curEp?.title || 'Episode',
      seriesId: selectedSeriesId,
      seriesTitle: curSer?.title || 'Series',
      language,
      languageLabel: language === 'id' ? 'Bahasa Indonesia' : 'English',
      format,
      fileName,
      fileSize: fileSize || '12.4 KB',
      status: 'active',
      sampleLines: [
        { timestamp: '00:00:02,400 --> 00:00:06,100', text: `Dialog 1: Episode ${curEp?.title}` },
        { timestamp: '00:00:07,000 --> 00:00:10,500', text: 'Dialog 2: Cuplikan percakapan subtitle.' },
      ],
    });

    success('Subtitle Ditambahkan', `Berkas subtitle "${fileName}" berhasil dikaitkan ke episode.`);
    setIsAddModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (subToDelete) {
      deleteSubtitle(subToDelete.id);
      success('Subtitle Dihapus', `Subtitle "${subToDelete.fileName}" berhasil dihapus.`);
      setSubToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Manajemen Subtitle"
        description="Kelola berkas terjemahan dialog SRT dan VTT dalam Bahasa Indonesia dan English untuk setiap episode serial."
        breadcrumbs={[{ label: 'Subtitle' }]}
        actions={
          <button
            onClick={() => {
              setFileName('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#FFD52E]" /> Tambah Subtitle Baru
          </button>
        }
      />

      {/* Filter and Search */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cari nama berkas, judul episode, atau series..."
        hasActiveFilters={languageFilter !== 'all' || formatFilter !== 'all' || !!searchQuery}
        onResetFilters={() => {
          setSearchQuery('');
          setLanguageFilter('all');
          setFormatFilter('all');
        }}
      >
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="all">Semua Bahasa</option>
          <option value="id">Bahasa Indonesia</option>
          <option value="en">English</option>
        </select>

        <select
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value)}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="all">Semua Format</option>
          <option value="SRT">Format SRT</option>
          <option value="VTT">Format VTT</option>
        </select>
      </SearchFilterBar>

      {/* Subtitles Table */}
      {filteredSubtitles.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-7 h-7" />}
          title="Tidak Ada Berkas Subtitle"
          description="Belum ada subtitle yang sesuai kriteria pencarian atau filter yang dipilih."
          actionLabel="Tambah Subtitle Baru"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8FB] text-[11px] font-bold text-[#786F7D] uppercase tracking-wider border-b border-[#EEE8F0]">
                  <th className="py-3 px-4">Nama File Subtitle</th>
                  <th className="py-3 px-4">Episode & Series Terkait</th>
                  <th className="py-3 px-4 text-center">Bahasa</th>
                  <th className="py-3 px-4 text-center">Format</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Diperbarui</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8F0]">
                {filteredSubtitles.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#FAF8FB] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#24172B]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#4B0B7A]" />
                        <span>{sub.fileName}</span>
                        <span className="text-[10px] text-[#786F7D] font-sans">({sub.fileSize})</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-[#24172B]">
                        Ep {sub.episodeNumber}: {sub.episodeTitle}
                      </p>
                      <span className="text-[11px] text-[#786F7D]">{sub.seriesTitle}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F6F1F8] text-[#4B0B7A]">
                        <Languages className="w-3.5 h-3.5" />
                        {sub.languageLabel}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-[#786F7D]">
                      <span className="px-2 py-0.5 rounded bg-[#F8F7FA] border border-[#EEE8F0]">
                        .{sub.format}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF8F1] text-[#21865B]">
                        <CheckCircle2 className="w-3 h-3" /> Siap Diputar
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#786F7D] font-medium">
                      {formatDate(sub.updatedAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewSubtitle(sub)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F6F1F8] text-[#4B0B7A] hover:bg-[#E9DEEF] transition-colors"
                          title="Lihat Cuplikan Subtitle"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview Teks</span>
                        </button>
                        <button
                          onClick={() => setSubToDelete(sub)}
                          className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#D94152] hover:bg-[#FEECEF] transition-colors"
                          title="Hapus Subtitle"
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

      {/* Interactive Subtitle Text Preview Modal */}
      {previewSubtitle && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EEE8F0] transform animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0] mb-4">
              <div>
                <h3 className="text-base font-bold text-[#24172B]">
                  Pratinjau Subtitle: {previewSubtitle.fileName}
                </h3>
                <p className="text-xs text-[#786F7D] mt-0.5">
                  {previewSubtitle.seriesTitle} — Ep {previewSubtitle.episodeNumber} ({previewSubtitle.languageLabel})
                </p>
              </div>
              <button
                onClick={() => setPreviewSubtitle(null)}
                className="p-1 text-[#786F7D] hover:text-[#24172B] hover:bg-[#F6F1F8] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Code / Cue Lines Box */}
            <div className="bg-[#21052F] rounded-xl p-4 font-mono text-xs text-white/90 space-y-3 max-h-72 overflow-y-auto">
              <div className="text-[10px] text-[#FFD52E] font-bold border-b border-white/10 pb-1.5 mb-2">
                Format: {previewSubtitle.format} • Encoding: UTF-8
              </div>

              {previewSubtitle.sampleLines.map((line, idx) => (
                <div key={idx} className="space-y-0.5 border-l-2 border-[#FFD52E] pl-2.5">
                  <span className="text-[10px] text-[#A39CA9] block">{line.timestamp}</span>
                  <p className="text-white font-medium">{line.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-end">
              <button
                onClick={() => setPreviewSubtitle(null)}
                className="px-4 py-2 rounded-xl bg-[#4B0B7A] text-white text-xs font-bold hover:bg-[#3B0762] transition-colors"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subtitle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EEE8F0] transform animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0] mb-4">
              <h3 className="text-base font-bold text-[#24172B]">Tambah Subtitle Episode</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#786F7D] hover:text-[#24172B] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Pilih Series
                </label>
                <select
                  value={selectedSeriesId}
                  onChange={(e) => handleSeriesChange(e.target.value)}
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#24172B]"
                >
                  {series.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Pilih Episode
                </label>
                <select
                  value={selectedEpisodeId}
                  onChange={(e) => setSelectedEpisodeId(Number(e.target.value))}
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#24172B]"
                >
                  {modalEpisodes.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      Ep {ep.number}: {ep.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                    Bahasa
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
                    className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#24172B]"
                  >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                    Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as 'SRT' | 'VTT')}
                    className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#24172B]"
                  >
                    <option value="SRT">SRT (.srt)</option>
                    <option value="VTT">VTT (.vtt)</option>
                  </select>
                </div>
              </div>

              <UploadDropzone
                acceptType="subtitle"
                label="Pilih File Subtitle"
                onSelect={(m) => {
                  if (m) {
                    setFileName(m.name);
                    setFileSize(m.size);
                  } else {
                    setFileName('');
                    setFileSize('');
                  }
                }}
              />

              <div className="mt-6 pt-4 border-t border-[#EEE8F0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#EEE8F0] text-xs font-semibold text-[#24172B]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4B0B7A] text-white text-xs font-bold hover:bg-[#3B0762]"
                >
                  Simpan Subtitle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!subToDelete}
        title={`Hapus Subtitle "${subToDelete?.fileName}"?`}
        message={`Apakah Anda yakin ingin menghapus subtitle bahasa ${subToDelete?.languageLabel} untuk episode "${subToDelete?.episodeTitle}"?`}
        confirmLabel="Ya, Hapus Subtitle"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSubToDelete(null)}
      />
    </div>
  );
}
