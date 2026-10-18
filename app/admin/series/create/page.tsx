'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '../../../../lib/context/AdminContext';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { UploadDropzone } from '../../../../components/ui/UploadDropzone';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { useToast } from '../../../../components/ui/Toast';
import { generateSlug } from '../../../../lib/utils/formatters';
import { PublicationStatus } from '../../../../lib/types/admin';
import {
  Save,
  ArrowLeft,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

export default function CreateSeriesPage() {
  const router = useRouter();
  const { series, addSeries } = useAdmin();
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Komedi']);
  const [year, setYear] = useState(2026);
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>('published');

  // Urutan tampil di katalog terisi otomatis, tidak dapat diubah manual
  const displayOrder = series.length + 1;

  // Thumbnail tunggal 16:9 (tidak terisi otomatis, diunggah manual oleh admin)
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Inline errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(generateSlug(val));
  };

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = (e: React.FormEvent, forceStatus?: PublicationStatus) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = 'Judul konten wajib diisi';
    if (!slug.trim()) newErrors.slug = 'Slug wajib diisi';
    if (!synopsis.trim()) newErrors.synopsis = 'Sinopsis konten wajib diisi';
    if (selectedGenres.length === 0) newErrors.genres = 'Pilih minimal satu genre';

    // Unique slug check
    const slugExists = series.some((s) => s.slug === slug.trim());
    if (slugExists) {
      newErrors.slug = 'Slug ini sudah digunakan oleh judul konten lain';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      error('Validasi Gagal', 'Harap periksa kolom yang ditandai merah.');
      return;
    }

    const finalStatus = forceStatus || publicationStatus;

    const newSeries = addSeries({
      title: title.trim(),
      slug: slug.trim(),
      synopsis: synopsis.trim(),
      genres: selectedGenres,
      year,
      displayOrder,
      likes: 0,
      episodeCount: 0,
      videoCount: 0,
      featured: false,
      isPopular: false,
      isNew: true, // Lencana "Baru di HUMORA" mengikuti data: judul yang baru dibuat otomatis berstatus baru
      publicationStatus: finalStatus,
      thumbnail: thumbnailUrl,
      poster: thumbnailUrl,
      cover: thumbnailUrl,
      sectionPlacements: ['new'],
    });

    success('Judul Konten Berhasil Dibuat', `Judul "${newSeries.title}" berhasil disimpan.`);
    router.push(`/admin/series/${newSeries.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Tambah Judul Konten Baru"
        description="Buat judul besar baru untuk menampung video sketsa pendek di aplikasi mobile HUMORA."
        breadcrumbs={[{ label: 'Judul Konten', href: '/admin/series' }, { label: 'Buat Baru' }]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/series"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EEE8F0] bg-white text-xs font-semibold text-[#24172B] hover:bg-[#F8F7FA] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Batal
            </Link>
            <button
              onClick={(e) => handleSubmit(e, 'draft')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EEE8F0] bg-white text-xs font-bold text-[#786F7D] hover:text-[#24172B] hover:bg-[#F8F7FA] transition-colors"
            >
              Simpan sebagai Draft
            </button>
            <button
              onClick={(e) => handleSubmit(e)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
            >
              <Save className="w-4 h-4 text-[#FFD52E]" /> Simpan & Terbitkan
            </button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Informasi Dasar */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              1. Informasi Judul Konten
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Judul Besar <span className="text-[#D94152]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Misal: Tipe Penumpang Taxi Online"
                className={`w-full bg-[#F8F7FA] border rounded-xl px-4 py-2.5 text-sm text-[#24172B] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4B0B7A]/20 ${
                  errors.title ? 'border-[#D94152]' : 'border-[#EEE8F0] focus:border-[#4B0B7A]'
                }`}
              />
              {errors.title && <p className="text-xs text-[#D94152] mt-1">{errors.title}</p>}
            </div>

            {/* Slug URL */}
            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Slug Identifikasi <span className="text-[#D94152]">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3.5 py-2.5 bg-[#FAF8FB] border border-r-0 border-[#EEE8F0] rounded-l-xl text-xs text-[#786F7D] font-mono select-none">
                  humora.id/watch/
                </span>
                <input
                  type="text"
                  value={slug}
                  readOnly
                  className={`w-full bg-[#F8F7FA] border rounded-r-xl px-4 py-2 text-sm text-[#24172B] font-mono cursor-not-allowed opacity-80 focus:outline-hidden ${
                    errors.slug ? 'border-[#D94152]' : 'border-[#EEE8F0]'
                  }`}
                />
              </div>
              {errors.slug && <p className="text-xs text-[#D94152] mt-1">{errors.slug}</p>}
            </div>

            {/* Synopsis */}
            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Sinopsis & Ringkasan Konten <span className="text-[#D94152]">*</span>
              </label>
              <textarea
                rows={4}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Ceritakan tema besar, latar belakang, dan daya tarik utama video sketsa ini..."
                className={`w-full bg-[#F8F7FA] border rounded-xl p-3.5 text-sm text-[#24172B] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4B0B7A]/20 ${
                  errors.synopsis ? 'border-[#D94152]' : 'border-[#EEE8F0] focus:border-[#4B0B7A]'
                }`}
              />
              {errors.synopsis && <p className="text-xs text-[#D94152] mt-1">{errors.synopsis}</p>}
            </div>

            {/* Genres */}
            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-2">
                Pilih Genre / Kategori <span className="text-[#D94152]">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {['Komedi', 'Romantis', 'Drama', 'Slice of Life', 'Workplace', 'Sketsa', 'Keluarga'].map(
                  (genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-[#4B0B7A] text-white border-[#4B0B7A] shadow-xs'
                            : 'bg-[#F8F7FA] text-[#786F7D] border-[#EEE8F0] hover:border-[#4B0B7A]/40'
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  }
                )}
              </div>
              {errors.genres && <p className="text-xs text-[#D94152] mt-1.5">{errors.genres}</p>}
            </div>

            {/* Year & Display Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Tahun Rilis
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm text-[#24172B] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Urutan Tampil di Katalog
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  readOnly
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm text-[#24172B] cursor-not-allowed opacity-80 focus:outline-hidden"
                />
                <p className="text-[11px] text-[#786F7D] mt-1">
                  Terisi otomatis berdasarkan jumlah judul konten.
                </p>
              </div>
            </div>
          </div>

          {/* Card Media Aset Visual: Thumbnail 16:9 */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE8F0]">
              <h2 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                2. Thumbnail Konten (16:9)
              </h2>
              <span className="text-xs font-semibold text-[#786F7D]">
                Format rasio 16:9 terpadu
              </span>
            </div>

            <UploadDropzone
              acceptType="image"
              value={thumbnailUrl}
              label="Thumbnail Utama (16:9)"
              hint="Gambar sampul utama untuk beranda, daftar putar, dan katalog mobile"
              onSelect={(meta) => {
                if (meta?.previewUrl) setThumbnailUrl(meta.previewUrl);
              }}
            />
          </div>
        </div>

        {/* Side Column: Status & Live Preview (1 col) */}
        <div className="space-y-6">
          {/* Status Publikasi */}
          <div className="bg-white p-5 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              Pengaturan Publikasi
            </h3>

            <div>
              <label className="text-xs font-semibold text-[#786F7D] mb-2 block">Status Publikasi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPublicationStatus('published')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    publicationStatus === 'published'
                      ? 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]'
                      : 'bg-[#F8F7FA] text-[#786F7D] border-[#EEE8F0]'
                  }`}
                >
                  Terpublikasi
                </button>
                <button
                  type="button"
                  onClick={() => setPublicationStatus('draft')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    publicationStatus === 'draft'
                      ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                      : 'bg-[#F8F7FA] text-[#786F7D] border-[#EEE8F0]'
                  }`}
                >
                  Draft
                </button>
              </div>
            </div>
          </div>

          {/* Live Mini Preview Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#24172B] uppercase tracking-wider flex items-center justify-between pb-2 border-b border-[#EEE8F0]">
              <span>Pratinjau Kartu 16:9</span>
              <Sparkles className="w-3.5 h-3.5 text-[#FFD52E]" />
            </h3>

            <div className="rounded-2xl border border-[#EEE8F0] overflow-hidden bg-[#FAF8FB] p-3">
              <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden bg-[#F6F1F8] mb-3 border border-[#EEE8F0]">
                {thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <ImageIcon className="w-5 h-5 text-[#C4BCC9]" />
                    <span className="text-[10px] font-semibold text-[#A39CA9]">Belum ada thumbnail</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <StatusBadge type="publication" value={publicationStatus} />
                </div>
              </div>

              <h4 className="font-bold text-sm text-[#24172B] truncate">
                {title || 'Judul Konten Anda'}
              </h4>
              <p className="text-[11px] text-[#786F7D] line-clamp-2 mt-0.5">
                {synopsis || 'Sinopsis judul konten akan tampil di sini saat penonton membuka katalog mobile.'}
              </p>

              <div className="mt-2 flex flex-wrap gap-1">
                {selectedGenres.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[#F6F1F8] text-[#4B0B7A]"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
