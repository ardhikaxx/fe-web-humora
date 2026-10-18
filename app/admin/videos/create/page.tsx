'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '../../../../lib/context/AdminContext';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { UploadDropzone } from '../../../../components/ui/UploadDropzone';
import { useToast } from '../../../../components/ui/Toast';
import { formatMinutesSeconds } from '../../../../lib/utils/formatters';
import { AccessType, PublicationStatus } from '../../../../lib/types/admin';
import {
  Save,
  ArrowLeft,
  Sparkles,
  Crown,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Clock,
} from 'lucide-react';

function CreateEpisodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSeriesId = searchParams?.get('seriesId') || '';

  const { series, episodes, addEpisode } = useAdmin();
  const { success, error } = useToast();

  const initialSeriesId = preselectedSeriesId || (series[0]?.id ?? '');
  const [selectedSeriesId, setSelectedSeriesId] = useState(initialSeriesId);

  // Video form state
  const [title, setTitle] = useState('');
  const initialEpCount = episodes.filter((ep) => ep.seriesId === initialSeriesId).length;
  const [episodeNumber, setEpisodeNumber] = useState<number>(initialEpCount + 1);
  const [description, setDescription] = useState('');
  // Default to -+ 2 menit per user requirement
  const [durationMinutes, setDurationMinutes] = useState<number>(2);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [releaseDate, setReleaseDate] = useState('16 Feb 2026');

  // Access & Publication
  const [accessType, setAccessType] = useState<AccessType>(initialEpCount + 1 <= 2 ? 'free' : 'premium');
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>('published');

  // Media
  const [videoPreview, setVideoPreview] = useState<string>('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [hasVideo, setHasVideo] = useState(true);

  // Inline errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const currentSeries = useMemo(() => {
    return series.find((s) => s.id === selectedSeriesId);
  }, [series, selectedSeriesId]);

  const handleSeriesSelect = (sId: string) => {
    setSelectedSeriesId(sId);
    const existingEpCount = episodes.filter((ep) => ep.seriesId === sId).length;
    const nextNum = existingEpCount + 1;
    setEpisodeNumber(nextNum);
    setAccessType(nextNum <= 2 ? 'free' : 'premium');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
  };

  const setDurationPreset = (min: number, sec: number) => {
    setDurationMinutes(min);
    setDurationSeconds(sec);
  };

  // Completeness score
  const completeness = useMemo(() => {
    let score = 0;
    if (title.trim()) score += 25;
    if (selectedSeriesId) score += 25;
    if (hasVideo) score += 25;
    if (currentSeries?.thumbnail || currentSeries?.cover || currentSeries?.poster) score += 15;
    if (description.trim()) score += 10;
    return Math.min(100, score);
  }, [title, selectedSeriesId, hasVideo, currentSeries, description]);

  const handleSubmit = (e: React.FormEvent, forceStatus?: PublicationStatus) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!selectedSeriesId) newErrors.seriesId = 'Pilih judul konten terlebih dahulu';
    if (!title.trim()) newErrors.title = 'Judul video wajib diisi';
    if (!episodeNumber || episodeNumber < 1) newErrors.episodeNumber = 'Nomor video tidak valid';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      error('Validasi Gagal', 'Mohon lengkapi kolom yang wajib diisi.');
      return;
    }

    const durationStr = formatMinutesSeconds(durationMinutes, durationSeconds);
    const durationTotalSeconds = durationMinutes * 60 + durationSeconds;
    const finalStatus = forceStatus || publicationStatus;

    const newEp = addEpisode({
      seriesId: selectedSeriesId,
      seriesSlug: currentSeries?.slug || '',
      seriesTitle: currentSeries?.title || '',
      number: episodeNumber,
      title: title.trim(),
      description: description.trim() || `Video ke-${episodeNumber} dari "${currentSeries?.title}".`,
      duration: durationStr,
      durationSeconds: durationTotalSeconds,
      accessType,
      publicationStatus: finalStatus,
      // Thumbnail: otomatis memakai sampul judul besar (tidak diunggah di sini)
      thumbnail:
        currentSeries?.thumbnail ||
        currentSeries?.cover ||
        currentSeries?.poster ||
        '/images/thumbnails/tipe-penumpang-taxi-online.jpg',
      videoSource: videoPreview,
      hasVideoFile: hasVideo,
      releaseDate,
      views: 0,
      likes: 0,
      watchTimeHours: 0,
      completionRate: 0,
    });

    success('Video Berhasil Disimpan', `Video ${newEp.number} "${newEp.title}" berhasil ditambahkan.`);
    router.push('/admin/videos');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Tambah Video Baru"
        description="Tambahkan video pendek (-+2 menit) ke dalam judul besar konten pilihan. Thumbnail otomatis mengikuti sampul judul besar."
        breadcrumbs={[
          { label: 'Kelola Video', href: '/admin/videos' },
          { label: 'Tambah Video' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/videos"
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
              <Save className="w-4 h-4 text-[#FFD52E]" /> Simpan Video
            </button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Pilihan Judul Konten (Judul Besar) */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE8F0]">
              <h2 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                1. Pilih Judul Konten (Judul Besar)
              </h2>
              <div className="flex items-center gap-2">
                {currentSeries && (
                  <span className="text-xs text-[#4B0B7A] font-bold bg-[#F6F1F8] px-2.5 py-1 rounded-lg">
                    {currentSeries.episodeCount} Video Terdaftar
                  </span>
                )}
                <Link
                  href="/admin/series/create"
                  className="text-xs font-bold text-[#4B0B7A] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Buat Judul Baru
                </Link>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Judul Besar <span className="text-[#D94152]">*</span>
              </label>
              <select
                value={selectedSeriesId}
                onChange={(e) => handleSeriesSelect(e.target.value)}
                className={`w-full bg-[#F8F7FA] border rounded-xl px-4 py-2.5 text-sm text-[#24172B] font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4B0B7A]/20 ${
                  errors.seriesId ? 'border-[#D94152]' : 'border-[#EEE8F0] focus:border-[#4B0B7A]'
                }`}
              >
                {series.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.genres.join(', ')})
                  </option>
                ))}
              </select>
              {errors.seriesId && <p className="text-xs text-[#D94152] mt-1">{errors.seriesId}</p>}
            </div>

            {/* Quick Context Callout with 16:9 Thumbnail Preview */}
            {currentSeries && (
              <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#FAF8FB] border border-[#EEE8F0]">
                <div className="aspect-16/9 w-28 sm:w-32 rounded-xl overflow-hidden bg-black/10 shrink-0 border border-[#EEE8F0]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentSeries.thumbnail || currentSeries.cover || currentSeries.poster || ''}
                    alt={currentSeries.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs font-bold text-[#24172B]">{currentSeries.title}</p>
                  <p className="text-[11px] text-[#786F7D] line-clamp-1">{currentSeries.synopsis}</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[10px] text-[#21865B] font-bold bg-[#EAF8F1] px-2 py-0.5 rounded-md">
                      💡 Nomor berikutnya: Video #{episodeNumber}
                    </span>
                    <span className="text-[10px] text-[#786F7D]">
                      {currentSeries.genres.join(' • ')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Informasi & Detail Video */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              2. Informasi & Detail Video
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Video Ke- <span className="text-[#D94152]">*</span>
                </label>
                <input
                  type="number"
                  value={episodeNumber}
                  disabled
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-black text-[#24172B] cursor-not-allowed opacity-80 focus:outline-hidden"
                />
                <p className="text-[11px] text-[#786F7D] mt-1">
                  Terisi otomatis berdasarkan jumlah video pada judul ini.
                </p>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Judul / Sub-Topik Video <span className="text-[#D94152]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Misal: Tipe Bawel / Tipe Sensi / Pake Hadiah"
                  className={`w-full bg-[#F8F7FA] border rounded-xl px-4 py-2.5 text-sm text-[#24172B] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4B0B7A]/20 ${
                    errors.title ? 'border-[#D94152]' : 'border-[#EEE8F0] focus:border-[#4B0B7A]'
                  }`}
                />
                {errors.title && <p className="text-xs text-[#D94152] mt-1">{errors.title}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Deskripsi Cerita / Sketsa Video
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan adegan lucu atau momen unik yang terjadi di video ini..."
                className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl p-3.5 text-sm text-[#24172B] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A]"
              />
            </div>

            {/* Duration (-+2 Menit) & Release Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide">
                    Durasi Video (-+2 Menit)
                  </label>
                  <span className="text-[10px] text-[#4B0B7A] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Standar HUMORA ~2m
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <input
                      type="number"
                      min={0}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-l-xl px-3 py-2 text-sm text-[#24172B] font-bold"
                    />
                    <span className="px-2.5 py-2.5 bg-[#EEE8F0] text-xs font-bold text-[#786F7D] rounded-r-xl border border-l-0 border-[#EEE8F0]">
                      Menit
                    </span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={durationSeconds}
                      onChange={(e) => setDurationSeconds(Number(e.target.value))}
                      className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-l-xl px-3 py-2 text-sm text-[#24172B] font-bold"
                    />
                    <span className="px-2.5 py-2.5 bg-[#EEE8F0] text-xs font-bold text-[#786F7D] rounded-r-xl border border-l-0 border-[#EEE8F0]">
                      Detik
                    </span>
                  </div>
                </div>

                {/* Quick Presets for -+2 Minutes */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[#786F7D]">Preset Cepat:</span>
                  {[
                    { label: '1m 55s', min: 1, sec: 55 },
                    { label: '1m 58s', min: 1, sec: 58 },
                    { label: '2m 00s', min: 2, sec: 0 },
                    { label: '2m 05s', min: 2, sec: 5 },
                    { label: '2m 14s', min: 2, sec: 14 },
                    { label: '2m 20s', min: 2, sec: 20 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setDurationPreset(preset.min, preset.sec)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FAF8FB] hover:bg-[#F3E8FF] text-[#4B0B7A] border border-[#EEE8F0] transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Tanggal Rilis Tayang
                </label>
                <input
                  type="text"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2 text-sm text-[#24172B] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Unggah Berkas Video */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              3. Unggah Berkas Video
            </h2>

            <div className="space-y-4">
              <UploadDropzone
                acceptType="video"
                label="File Video (MP4 / WebM)"
                hint="Unggah file video master atau gunakan simulasi video bawaan"
                onSelect={(m) => {
                  if (m) {
                    setHasVideo(true);
                    if (m.previewUrl) setVideoPreview(m.previewUrl);
                  } else {
                    setHasVideo(false);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Side Column (1 col): Access, Publication & Checklist */}
        <div className="space-y-6">
          {/* Card Aturan Akses Free Preview vs Premium */}
          <div className="bg-white p-5 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-[#24172B] uppercase tracking-wider">
                Status Akses Pengguna
              </h3>
              <p className="text-[11px] text-[#786F7D] mt-0.5">
                Model HUMORA: Video 1 & 2 gratis ditonton, Video 3+ khusus pelanggan.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Radio Card: Free Preview */}
              <div
                onClick={() => setAccessType('free')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  accessType === 'free'
                    ? 'border-[#21865B] bg-[#EAF8F1]/40 shadow-xs'
                    : 'border-[#EEE8F0] hover:border-[#21865B]/40 bg-[#FAF8FB]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#21865B]" />
                    <span className="text-xs font-black text-[#21865B]">Free Preview</span>
                  </div>
                  <input
                    type="radio"
                    name="accessType"
                    checked={accessType === 'free'}
                    onChange={() => setAccessType('free')}
                    className="text-[#21865B] focus:ring-[#21865B]"
                  />
                </div>
                <p className="text-[11px] text-[#786F7D] mt-1 leading-snug">
                  Dapat ditonton secara gratis oleh seluruh pengguna aplikasi tanpa perlu berlangganan.
                </p>
              </div>

              {/* Radio Card: Premium */}
              <div
                onClick={() => setAccessType('premium')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  accessType === 'premium'
                    ? 'border-[#4B0B7A] bg-[#F3E8FF]/40 shadow-xs'
                    : 'border-[#EEE8F0] hover:border-[#4B0B7A]/40 bg-[#FAF8FB]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#7028B8]" />
                    <span className="text-xs font-black text-[#4B0B7A]">Premium (Terkunci)</span>
                  </div>
                  <input
                    type="radio"
                    name="accessType"
                    checked={accessType === 'premium'}
                    onChange={() => setAccessType('premium')}
                    className="text-[#4B0B7A] focus:ring-[#4B0B7A]"
                  />
                </div>
                <p className="text-[11px] text-[#786F7D] mt-1 leading-snug">
                  Video terkunci dengan ikon gembok. Memerlukan akun berlangganan aktif untuk menonton.
                </p>
              </div>
            </div>

            {accessType === 'premium' && (
              <div className="p-3 rounded-xl bg-[#FFF5E8] border border-[#FED7AA] flex items-start gap-2.5 text-xs text-[#E58A16]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-tight">
                  Pengguna tanpa langganan akan diarahkan ke pop-up paket langganan jika memutar video ini.
                </p>
              </div>
            )}
          </div>

          {/* Card Status Publikasi */}
          <div className="bg-white p-5 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#24172B] uppercase tracking-wider">
              Status Publikasi
            </h3>

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
            <p className="text-[10px] text-[#786F7D] leading-tight">
              Hanya video berstatus &ldquo;Terpublikasi&rdquo; yang dapat ditonton pengguna aplikasi mobile.
            </p>
          </div>

          {/* Card Kelengkapan Metadata Checklist */}
          <div className="bg-white p-5 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE8F0]">
              <h3 className="text-xs font-bold text-[#24172B] uppercase tracking-wider">
                Kelengkapan Video
              </h3>
              <span className="text-xs font-black text-[#4B0B7A]">{completeness}%</span>
            </div>

            <div className="w-full h-2 bg-[#F8F7FA] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4B0B7A] to-[#21865B] rounded-full transition-all duration-300"
                style={{ width: `${completeness}%` }}
              />
            </div>

            <ul className="space-y-1.5 text-xs text-[#786F7D] pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${title ? 'text-[#21865B]' : 'text-[#EEE8F0]'}`} />
                <span>Judul & nomor video terisi</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${selectedSeriesId ? 'text-[#21865B]' : 'text-[#EEE8F0]'}`} />
                <span>Judul besar terpilih</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasVideo ? 'text-[#21865B]' : 'text-[#EEE8F0]'}`} />
                <span>File video siap</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${currentSeries?.thumbnail || currentSeries?.cover || currentSeries?.poster ? 'text-[#21865B]' : 'text-[#EEE8F0]'}`} />
                <span>Thumbnail 16:9 mengikuti judul besar</span>
              </li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CreateEpisodePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#786F7D]">Memuat formulir video...</div>}>
      <CreateEpisodeForm />
    </Suspense>
  );
}
