'use client';

import React, { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '../../../../../lib/context/AdminContext';
import { PageHeader } from '../../../../../components/ui/PageHeader';
import { UploadDropzone } from '../../../../../components/ui/UploadDropzone';
import { useToast } from '../../../../../components/ui/Toast';
import { AdminSeries, PublicationStatus } from '../../../../../lib/types/admin';
import { Save, ArrowLeft } from 'lucide-react';

function EditSeriesInner({ seriesItem }: { seriesItem: AdminSeries }) {
  const router = useRouter();
  const { categories, updateSeries } = useAdmin();
  const { success, error } = useToast();

  const [title, setTitle] = useState(seriesItem.title);
  const [slug, setSlug] = useState(seriesItem.slug);
  const [synopsis, setSynopsis] = useState(seriesItem.synopsis);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(seriesItem.genres);
  const [year, setYear] = useState(seriesItem.year);
  const [displayOrder, setDisplayOrder] = useState(seriesItem.displayOrder);
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>(seriesItem.publicationStatus);
  const [featured, setFeatured] = useState(seriesItem.featured);
  const [isPopular, setIsPopular] = useState(seriesItem.isPopular);
  const [isNew, setIsNew] = useState(seriesItem.isNew);
  const [thumbnailUrl, setThumbnailUrl] = useState(
    seriesItem.thumbnail || seriesItem.cover || seriesItem.poster || ''
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Judul wajib diisi';
    if (!slug.trim()) newErrors.slug = 'Slug wajib diisi';
    if (!synopsis.trim()) newErrors.synopsis = 'Sinopsis wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      error('Validasi Gagal', 'Harap periksa kolom yang ditandai merah.');
      return;
    }

    updateSeries(seriesItem.id, {
      title: title.trim(),
      slug: slug.trim(),
      synopsis: synopsis.trim(),
      genres: selectedGenres,
      year,
      displayOrder,
      publicationStatus,
      featured,
      isPopular,
      isNew,
      thumbnail: thumbnailUrl,
      poster: thumbnailUrl,
      cover: thumbnailUrl,
    });

    success('Perubahan Disimpan', `Judul konten "${title}" berhasil diperbarui.`);
    router.push(`/admin/series/${seriesItem.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Series: ${seriesItem.title}`}
        description="Perbarui informasi sinopsis, poster, genre, dan penempatan section katalog."
        breadcrumbs={[
          { label: 'Series', href: '/admin/series' },
          { label: seriesItem.title, href: `/admin/series/${seriesItem.id}` },
          { label: 'Edit' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/series/${seriesItem.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EEE8F0] bg-white text-xs font-semibold text-[#24172B] hover:bg-[#F8F7FA] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Batal
            </Link>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
            >
              <Save className="w-4 h-4 text-[#FFD52E]" /> Simpan Perubahan
            </button>
          </div>
        }
      />

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              Informasi Series
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Judul Series
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm text-[#24172B] focus:bg-white focus:outline-hidden"
              />
              {errors.title && <p className="text-xs text-[#D94152] mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Slug URL
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-mono text-[#24172B] focus:bg-white focus:outline-hidden"
              />
              {errors.slug && <p className="text-xs text-[#D94152] mt-1">{errors.slug}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Sinopsis
              </label>
              <textarea
                rows={4}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl p-4 text-sm text-[#24172B] focus:bg-white focus:outline-hidden"
              />
              {errors.synopsis && <p className="text-xs text-[#D94152] mt-1">{errors.synopsis}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-2">
                Pilih Genre
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
                          ? 'bg-[#4B0B7A] text-white shadow-xs'
                          : 'bg-[#F8F7FA] text-[#786F7D] border border-[#EEE8F0]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Tahun Rilis
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm text-[#24172B]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Urutan Katalog
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm text-[#24172B]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              Thumbnail Konten (16:9)
            </h3>
            <UploadDropzone
              acceptType="image"
              value={thumbnailUrl}
              label="Thumbnail Utama (16:9)"
              hint="Format rasio 16:9 terpadu untuk beranda dan katalog mobile"
              onSelect={(m) => m?.previewUrl && setThumbnailUrl(m.previewUrl)}
            />
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              Status & Penempatan
            </h3>

            <div>
              <label className="text-xs font-semibold text-[#786F7D] mb-2 block">Status Publikasi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPublicationStatus('published')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border ${
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
                  className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                    publicationStatus === 'draft'
                      ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                      : 'bg-[#F8F7FA] text-[#786F7D] border-[#EEE8F0]'
                  }`}
                >
                  Draft
                </button>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-[#EEE8F0]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-[#4B0B7A] focus:ring-[#4B0B7A] w-4 h-4"
                />
                <span className="text-xs font-bold text-[#24172B]">Series Unggulan Hero</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="rounded text-[#4B0B7A] focus:ring-[#4B0B7A] w-4 h-4"
                />
                <span className="text-xs font-semibold text-[#786F7D]">Section Populer</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="rounded text-[#4B0B7A] focus:ring-[#4B0B7A] w-4 h-4"
                />
                <span className="text-xs font-semibold text-[#786F7D]">Lencana Series Baru</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function EditSeriesForm() {
  const params = useParams();
  const { series } = useAdmin();
  const seriesId = params?.id as string;
  const existingSeries = series.find((s) => s.id === seriesId);

  if (!existingSeries) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#24172B]">Series Tidak Ditemukan</h2>
        <Link
          href="/admin/series"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4B0B7A] text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>
    );
  }

  return <EditSeriesInner seriesItem={existingSeries} key={existingSeries.id} />;
}

export default function EditSeriesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#786F7D]">Memuat formulir edit...</div>}>
      <EditSeriesForm />
    </Suspense>
  );
}
