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
  Star,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

export default function CreateSeriesPage() {
  const router = useRouter();
  const { series, categories, addSeries } = useAdmin();
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [synopsis, setSynopsis] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Komedi']);
  const [year, setYear] = useState(2026);
  const [displayOrder, setDisplayOrder] = useState(series.length + 1);
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>('published');
  const [featured, setFeatured] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [isNew, setIsNew] = useState(true);

  // Posters
  const [posterUrl, setPosterUrl] = useState('/images/series/kontrak-jadi-pacar-poster.jpg');
  const [coverUrl, setCoverUrl] = useState('/images/series/kontrak-jadi-pacar-cover.jpg');

  // Inline errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManual) {
      setSlug(generateSlug(val));
    }
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

    if (!title.trim()) newErrors.title = 'Judul series wajib diisi';
    if (!slug.trim()) newErrors.slug = 'Slug wajib diisi';
    if (!synopsis.trim()) newErrors.synopsis = 'Sinopsis series wajib diisi';
    if (selectedGenres.length === 0) newErrors.genres = 'Pilih minimal satu genre';

    // Unique slug check
    const slugExists = series.some((s) => s.slug === slug.trim());
    if (slugExists) {
      newErrors.slug = 'Slug ini sudah digunakan oleh series lain';
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
      rating: 4.8,
      episodeCount: 0,
      featured,
      isPopular,
      isNew,
      publicationStatus: finalStatus,
      poster: posterUrl,
      cover: coverUrl,
      sectionPlacements: featured ? ['popular', 'recommended'] : ['new'],
    });

    success('Series Berhasil Dibuat', `Series "${newSeries.title}" berhasil disimpan.`);
    router.push(`/admin/series/${newSeries.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Tambah Series Baru"
        description="Buat judul series baru yang akan menjadi wadah bagi episode cerita di aplikasi HUMORA."
        breadcrumbs={[{ label: 'Series', href: '/admin/series' }, { label: 'Buat Baru' }]}
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
              1. Informasi Series
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Judul Series <span className="text-[#D94152]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Misal: Kontrak Jadi Pacar, Kos Paling Berisik..."
                className={`w-full bg-[#F8F7FA] border rounded-xl px-4 py-2.5 text-sm text-[#24172B] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4B0B7A]/20 ${
                  errors.title ? 'border-[#D94152]' : 'border-[#EEE8F0] focus:border-[#4B0B7A]'
                }`}
              />
              {errors.title && <p className="text-xs text-[#D94152] mt-1">{errors.title}</p>}
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#24172B] uppercase tracking-wide">
                  Slug URL <span className="text-[#D94152]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsSlugManual(false);
                    setSlug(generateSlug(title));
                  }}
                  className="text-[11px] text-[#4B0B7A] font-semibold hover:underline"
                >
                  Otomatis dari Judul
                </button>
              </div>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-[#EEE8F0] text-[#786F7D] rounded-l-xl text-xs font-mono border border-r-0 border-[#EEE8F0]">
                  /series/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setIsSlugManual(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="kontrak-jadi-pacar"
                  className={`w-full bg-[#F8F7FA] border rounded-r-xl px-4 py-2.5 text-sm font-mono text-[#24172B] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4B0B7A]/20 ${
                    errors.slug ? 'border-[#D94152]' : 'border-[#EEE8F0] focus:border-[#4B0B7A]'
                  }`}
                />
              </div>
              {errors.slug && <p className="text-xs text-[#D94152] mt-1">{errors.slug}</p>}
            </div>

            {/* Synopsis */}
            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Sinopsis Lengkap <span className="text-[#D94152]">*</span>
              </label>
              <textarea
                rows={4}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Tuliskan ringkasan cerita serial yang memikat dan menggugah rasa penasaran penonton..."
                className={`w-full bg-[#F8F7FA] border rounded-xl p-4 text-sm text-[#24172B] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4B0B7A]/20 ${
                  errors.synopsis ? 'border-[#D94152]' : 'border-[#EEE8F0] focus:border-[#4B0B7A]'
                }`}
              />
              {errors.synopsis && <p className="text-xs text-[#D94152] mt-1">{errors.synopsis}</p>}
            </div>

            {/* Genres Multi-select Chips */}
            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-2">
                Pilih Genre / Kategori <span className="text-[#D94152]">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedGenres.includes(cat.name);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => toggleGenre(cat.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#4B0B7A] text-white shadow-xs ring-2 ring-[#4B0B7A]/20'
                          : 'bg-[#F8F7FA] text-[#786F7D] hover:bg-[#F6F1F8] border border-[#EEE8F0]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
              {errors.genres && <p className="text-xs text-[#D94152] mt-1">{errors.genres}</p>}
            </div>

            {/* Year & Display Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm text-[#24172B] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Card Media Aset Visual */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              2. Aset Visual Poster & Cover
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <UploadDropzone
                acceptType="image"
                value={posterUrl}
                label="Poster Vertikal (2:3)"
                hint="Format 2:3 untuk card beranda dan katalog"
                onSelect={(meta) => {
                  if (meta?.previewUrl) setPosterUrl(meta.previewUrl);
                }}
              />

              <UploadDropzone
                acceptType="image"
                value={coverUrl}
                label="Cover Horizontal (16:9)"
                hint="Format 16:9 untuk hero banner beranda"
                onSelect={(meta) => {
                  if (meta?.previewUrl) setCoverUrl(meta.previewUrl);
                }}
              />
            </div>
          </div>
        </div>

        {/* Side Column: Placement, Status & Live Preview (1 col) */}
        <div className="space-y-6">
          {/* Status Publikasi & Unggulan */}
          <div className="bg-white p-5 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              Pengaturan Publikasi
            </h3>

            <div>
              <label className="text-xs font-semibold text-[#786F7D] mb-2 block">Status Series</label>
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

            {/* Checkbox Options */}
            <div className="space-y-2.5 pt-2 border-t border-[#EEE8F0]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-[#4B0B7A] focus:ring-[#4B0B7A] w-4 h-4"
                />
                <span className="text-xs font-bold text-[#24172B]">
                  Tampilkan sebagai Series Unggulan
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="rounded text-[#4B0B7A] focus:ring-[#4B0B7A] w-4 h-4"
                />
                <span className="text-xs font-semibold text-[#786F7D]">
                  Masuk section &ldquo;Series Populer&rdquo;
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="rounded text-[#4B0B7A] focus:ring-[#4B0B7A] w-4 h-4"
                />
                <span className="text-xs font-semibold text-[#786F7D]">
                  Beri lencana &ldquo;Baru di HUMORA&rdquo;
                </span>
              </label>
            </div>
          </div>

          {/* Live Mini Preview Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#24172B] uppercase tracking-wider flex items-center justify-between pb-2 border-b border-[#EEE8F0]">
              <span>Pratinjau Kartu Katalog</span>
              <Sparkles className="w-3.5 h-3.5 text-[#FFD52E]" />
            </h3>

            <div className="rounded-2xl border border-[#EEE8F0] overflow-hidden bg-[#FAF8FB] p-3">
              <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-black/10 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterUrl}
                  alt="Poster Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <StatusBadge type="publication" value={publicationStatus} />
                </div>
                {featured && (
                  <div className="absolute bottom-2 left-2 bg-[#FFD52E] text-[#21052F] text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    UNGGULAN
                  </div>
                )}
              </div>

              <h4 className="font-bold text-sm text-[#24172B] truncate">
                {title || 'Judul Series Anda'}
              </h4>
              <p className="text-[11px] text-[#786F7D] line-clamp-2 mt-0.5">
                {synopsis || 'Sinopsis serial akan tampil di sini saat penonton membuka katalog mobile.'}
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
