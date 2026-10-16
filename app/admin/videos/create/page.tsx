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
} from 'lucide-react';

function CreateEpisodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSeriesId = searchParams?.get('seriesId') || '';

  const { series, episodes, addEpisode, addSubtitle } = useAdmin();
  const { success, error } = useToast();

  const initialSeriesId = preselectedSeriesId || (series[0]?.id ?? '');
  const [selectedSeriesId, setSelectedSeriesId] = useState(initialSeriesId);

  // Episode form state
  const [title, setTitle] = useState('');
  const initialEpCount = episodes.filter((ep) => ep.seriesId === initialSeriesId).length;
  const [episodeNumber, setEpisodeNumber] = useState<number>(initialEpCount + 1);
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [durationSeconds, setDurationSeconds] = useState<number>(15);
  const [releaseDate, setReleaseDate] = useState('16 Feb 2026');

  // Access & Publication
  const [accessType, setAccessType] = useState<AccessType>(initialEpCount + 1 <= 2 ? 'free' : 'premium');
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>('published');

  // Media
  const [videoPreview, setVideoPreview] = useState<string>('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [hasVideo, setHasVideo] = useState(true);
  const initialSeries = series.find((s) => s.id === initialSeriesId);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(initialSeries?.cover || initialSeries?.poster || '/images/series/kontrak-jadi-pacar-cover.jpg');
  const [hasSubtitle, setHasSubtitle] = useState(false);
  const [subtitleFileName, setSubtitleFileName] = useState('');
  const [subtitleLanguage, setSubtitleLanguage] = useState<'id' | 'en'>('id');

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
    const targetSeries = series.find((s) => s.id === sId);
    if (targetSeries) {
      setThumbnailUrl(targetSeries.cover || targetSeries.poster);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
  };

  // Completeness score
  const completeness = useMemo(() => {
    let score = 0;
    if (title.trim()) score += 20;
    if (selectedSeriesId) score += 20;
    if (hasVideo) score += 20;
    if (thumbnailUrl) score += 15;
    if (description.trim()) score += 15;
    if (hasSubtitle) score += 10;
    return Math.min(100, score);
  }, [title, selectedSeriesId, hasVideo, thumbnailUrl, description, hasSubtitle]);

  const handleSubmit = (e: React.FormEvent, forceStatus?: PublicationStatus) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!selectedSeriesId) newErrors.seriesId = 'Pilih series terlebih dahulu';
    if (!title.trim()) newErrors.title = 'Judul episode wajib diisi';
    if (!episodeNumber || episodeNumber < 1) newErrors.episodeNumber = 'Nomor episode tidak valid';

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
      description: description.trim() || `Episode ke-${episodeNumber} dari series ${currentSeries?.title}.`,
      duration: durationStr,
      durationSeconds: durationTotalSeconds,
      accessType,
      publicationStatus: finalStatus,
      thumbnail: thumbnailUrl,
      videoSource: videoPreview,
      hasVideoFile: hasVideo,
      hasSubtitleFile: hasSubtitle,
      subtitleLanguage: hasSubtitle ? subtitleLanguage : undefined,
      releaseDate,
      views: 0,
      watchTimeHours: 0,
      completionRate: 0,
    });

    if (hasSubtitle && subtitleFileName) {
      addSubtitle({
        episodeId: newEp.id,
        episodeNumber: newEp.number,
        episodeTitle: newEp.title,
        seriesId: newEp.seriesId,
        seriesTitle: currentSeries?.title || '',
        language: subtitleLanguage,
        languageLabel: subtitleLanguage === 'id' ? 'Bahasa Indonesia' : 'English',
        format: subtitleFileName.endsWith('.vtt') ? 'VTT' : 'SRT',
        fileName: subtitleFileName,
        fileSize: '14.5 KB',
        status: 'active',
        sampleLines: [
          { timestamp: '00:00:03,000 --> 00:00:07,000', text: `Dialog contoh episode: ${newEp.title}` },
        ],
      });
    }

    success('Episode Berhasil Disimpan', `Episode ${newEp.number} "${newEp.title}" berhasil ditambahkan.`);
    router.push('/admin/videos');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Tambah Episode Baru"
        description="Unggah aset video, atur nomor episode, tentukan akses gratis/premium, serta kelengkapan subtitle."
        breadcrumbs={[
          { label: 'Videos & Episodes', href: '/admin/videos' },
          { label: 'Tambah Episode' },
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
              <Save className="w-4 h-4 text-[#FFD52E]" /> Simpan Episode
            </button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Pilihan Series & Hubungan Konten */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE8F0]">
              <h2 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                1. Pilih Series Terkait
              </h2>
              {currentSeries && (
                <span className="text-xs text-[#4B0B7A] font-bold bg-[#F6F1F8] px-2.5 py-1 rounded-lg">
                  {currentSeries.episodeCount} Episode Terdaftar
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Series <span className="text-[#D94152]">*</span>
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

            {/* Quick Series context callout */}
            {currentSeries && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8FB] border border-[#EEE8F0]">
                <div className="w-10 h-14 rounded-lg overflow-hidden bg-black/10 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentSeries.poster} alt={currentSeries.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#24172B]">{currentSeries.title}</p>
                  <p className="text-[11px] text-[#786F7D] line-clamp-1">{currentSeries.synopsis}</p>
                  <p className="text-[10px] text-[#21865B] font-semibold mt-0.5">
                    💡 Rekomendasi nomor episode berikutnya: Episode #{episodeNumber}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Informasi Episode */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              2. Informasi & Detail Episode
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Nomor Ep <span className="text-[#D94152]">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                  className={`w-full bg-[#F8F7FA] border rounded-xl px-4 py-2.5 text-sm font-black text-[#24172B] focus:bg-white focus:outline-hidden ${
                    errors.episodeNumber ? 'border-[#D94152]' : 'border-[#EEE8F0] focus:border-[#4B0B7A]'
                  }`}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Judul Episode <span className="text-[#D94152]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Misal: Kopi Dingin & Tanda Tangan"
                  className={`w-full bg-[#F8F7FA] border rounded-xl px-4 py-2.5 text-sm text-[#24172B] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4B0B7A]/20 ${
                    errors.title ? 'border-[#D94152]' : 'border-[#EEE8F0] focus:border-[#4B0B7A]'
                  }`}
                />
                {errors.title && <p className="text-xs text-[#D94152] mt-1">{errors.title}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Deskripsi / Sinopsis Episode
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan kejadian menarik atau plot twist penting di episode ini..."
                className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl p-4 text-sm text-[#24172B] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A]"
              />
            </div>

            {/* Duration & Release Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Durasi Video
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <input
                      type="number"
                      min={0}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-l-xl px-3 py-2 text-sm text-[#24172B]"
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
                      className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-l-xl px-3 py-2 text-sm text-[#24172B]"
                    />
                    <span className="px-2.5 py-2.5 bg-[#EEE8F0] text-xs font-bold text-[#786F7D] rounded-r-xl border border-l-0 border-[#EEE8F0]">
                      Detik
                    </span>
                  </div>
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

          {/* Card 3: Media Upload Dropzones (Video, Thumbnail, Subtitle) */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              3. Unggah Berkas Media & Subtitle
            </h2>

            <div className="space-y-4">
              <UploadDropzone
                acceptType="video"
                label="File Video Episode (MP4 / WebM)"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <UploadDropzone
                  acceptType="image"
                  value={thumbnailUrl}
                  label="Thumbnail Episode (16:9)"
                  hint="Gambar cuplikan adegan episode"
                  onSelect={(m) => m?.previewUrl && setThumbnailUrl(m.previewUrl)}
                />

                <div className="space-y-2">
                  <UploadDropzone
                    acceptType="subtitle"
                    label="File Subtitle (.SRT / .VTT)"
                    hint="Pilih berkas subtitle terjemahan"
                    onSelect={(m) => {
                      if (m) {
                        setHasSubtitle(true);
                        setSubtitleFileName(m.name);
                      } else {
                        setHasSubtitle(false);
                        setSubtitleFileName('');
                      }
                    }}
                  />

                  {hasSubtitle && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-[#786F7D] font-bold">Bahasa:</span>
                      <select
                        value={subtitleLanguage}
                        onChange={(e) => setSubtitleLanguage(e.target.value as 'id' | 'en')}
                        className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#24172B]"
                      >
                        <option value="id">Bahasa Indonesia</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
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
                Model HUMORA: Ep 1 & 2 default gratis, Ep 3+ premium.
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
                  Episode terkunci dengan ikon gembok. Membutuhkan paket langganan aktif untuk menonton.
                </p>
              </div>
            </div>

            {accessType === 'premium' && (
              <div className="p-3 rounded-xl bg-[#FFF5E8] border border-[#FED7AA] flex items-start gap-2.5 text-xs text-[#E58A16]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-tight">
                  Pengguna tanpa subscription akan diarahkan ke bottom sheet pembelian paket jika menekan episode ini.
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
              Hanya episode berstatus &ldquo;Terpublikasi&rdquo; yang dapat diputar penonton di aplikasi mobile.
            </p>
          </div>

          {/* Card Kelengkapan Metadata Checklist */}
          <div className="bg-white p-5 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE8F0]">
              <h3 className="text-xs font-bold text-[#24172B] uppercase tracking-wider">
                Kelengkapan Episode
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
                <span>Judul & nomor episode terisi</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${selectedSeriesId ? 'text-[#21865B]' : 'text-[#EEE8F0]'}`} />
                <span>Series induk terpilih</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasVideo ? 'text-[#21865B]' : 'text-[#EEE8F0]'}`} />
                <span>File video siap</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${thumbnailUrl ? 'text-[#21865B]' : 'text-[#EEE8F0]'}`} />
                <span>Thumbnail tersedia</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasSubtitle ? 'text-[#21865B]' : 'text-[#EEE8F0]'}`} />
                <span>Subtitle terlampir ({hasSubtitle ? 'Tersedia' : 'Opsional'})</span>
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#786F7D]">Memuat formulir episode...</div>}>
      <CreateEpisodeForm />
    </Suspense>
  );
}
