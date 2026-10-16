'use client';

import React, { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '../../../../../lib/context/AdminContext';
import { PageHeader } from '../../../../../components/ui/PageHeader';
import { UploadDropzone } from '../../../../../components/ui/UploadDropzone';
import { useToast } from '../../../../../components/ui/Toast';
import { formatMinutesSeconds } from '../../../../../lib/utils/formatters';
import { AdminEpisode, AccessType, PublicationStatus } from '../../../../../lib/types/admin';
import { Save, ArrowLeft, Sparkles, Crown } from 'lucide-react';

function EditEpisodeInner({ ep }: { ep: AdminEpisode }) {
  const router = useRouter();
  const { updateEpisode } = useAdmin();
  const { success, error } = useToast();

  const [title, setTitle] = useState(ep.title);
  const [episodeNumber, setEpisodeNumber] = useState<number>(ep.number);
  const [description, setDescription] = useState(ep.description);
  const [durationMinutes, setDurationMinutes] = useState<number>(Math.floor(ep.durationSeconds / 60));
  const [durationSeconds, setDurationSeconds] = useState<number>(ep.durationSeconds % 60);
  const [releaseDate, setReleaseDate] = useState(ep.releaseDate);
  const [accessType, setAccessType] = useState<AccessType>(ep.accessType);
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>(ep.publicationStatus);
  const [thumbnailUrl, setThumbnailUrl] = useState(ep.thumbnail);
  const [videoSource, setVideoSource] = useState(ep.videoSource || '');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: 'Judul episode tidak boleh kosong' });
      error('Validasi Gagal', 'Harap isi judul episode.');
      return;
    }

    const durationStr = formatMinutesSeconds(durationMinutes, durationSeconds);
    const durationTotalSeconds = durationMinutes * 60 + durationSeconds;

    updateEpisode(ep.id, {
      title: title.trim(),
      number: episodeNumber,
      description: description.trim(),
      duration: durationStr,
      durationSeconds: durationTotalSeconds,
      accessType,
      publicationStatus,
      thumbnail: thumbnailUrl,
      videoSource,
    });

    success('Episode Diperbarui', `Episode ${episodeNumber} "${title}" berhasil disimpan.`);
    router.push('/admin/videos');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Episode: ${ep.title}`}
        description={`Bagian dari series "${ep.seriesTitle}". Ubah status akses atau kelengkapan media.`}
        breadcrumbs={[
          { label: 'Videos & Episodes', href: '/admin/videos' },
          { label: `Ep ${ep.number}` },
          { label: 'Edit' },
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
              Informasi Episode
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Nomor Ep
                </label>
                <input
                  type="number"
                  min={1}
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-black text-[#24172B]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Judul Episode
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm text-[#24172B]"
                />
                {errors.title && <p className="text-xs text-[#D94152] mt-1">{errors.title}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Deskripsi Episode
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl p-4 text-sm text-[#24172B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Durasi Video
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-l-xl px-3 py-2 text-sm text-[#24172B]"
                    />
                    <span className="px-2 py-2 bg-[#EEE8F0] text-xs font-bold text-[#786F7D] rounded-r-xl border border-l-0 border-[#EEE8F0]">
                      m
                    </span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={durationSeconds}
                      onChange={(e) => setDurationSeconds(Number(e.target.value))}
                      className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-l-xl px-3 py-2 text-sm text-[#24172B]"
                    />
                    <span className="px-2 py-2 bg-[#EEE8F0] text-xs font-bold text-[#786F7D] rounded-r-xl border border-l-0 border-[#EEE8F0]">
                      s
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Tanggal Rilis
                </label>
                <input
                  type="text"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm text-[#24172B]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              Aset Media
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UploadDropzone
                acceptType="image"
                value={thumbnailUrl}
                label="Thumbnail Episode (16:9)"
                onSelect={(m) => m?.previewUrl && setThumbnailUrl(m.previewUrl)}
              />
              <UploadDropzone
                acceptType="video"
                value={videoSource}
                label="Video File"
                onSelect={(m) => m?.previewUrl && setVideoSource(m.previewUrl)}
              />
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              Akses & Publikasi
            </h3>

            {/* Access Type Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#786F7D] block">Tipe Akses Pengguna</label>
              <div
                onClick={() => setAccessType('free')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  accessType === 'free'
                    ? 'border-[#21865B] bg-[#EAF8F1]/40'
                    : 'border-[#EEE8F0] bg-[#FAF8FB]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#21865B]" />
                    <span className="text-xs font-bold text-[#21865B]">Free Preview</span>
                  </div>
                  <input
                    type="radio"
                    name="editAccess"
                    checked={accessType === 'free'}
                    onChange={() => setAccessType('free')}
                    className="text-[#21865B]"
                  />
                </div>
                <p className="text-[10px] text-[#786F7D] mt-1">Dapat ditonton tanpa berlangganan.</p>
              </div>

              <div
                onClick={() => setAccessType('premium')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  accessType === 'premium'
                    ? 'border-[#4B0B7A] bg-[#F3E8FF]/40'
                    : 'border-[#EEE8F0] bg-[#FAF8FB]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#7028B8]" />
                    <span className="text-xs font-bold text-[#4B0B7A]">Premium</span>
                  </div>
                  <input
                    type="radio"
                    name="editAccess"
                    checked={accessType === 'premium'}
                    onChange={() => setAccessType('premium')}
                    className="text-[#4B0B7A]"
                  />
                </div>
                <p className="text-[10px] text-[#786F7D] mt-1">Hanya untuk subscriber aktif.</p>
              </div>
            </div>

            {/* Publication Status */}
            <div className="pt-2 border-t border-[#EEE8F0]">
              <label className="text-xs font-semibold text-[#786F7D] block mb-2">Status Publikasi</label>
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
          </div>
        </div>
      </form>
    </div>
  );
}

function EditEpisodeForm() {
  const params = useParams();
  const { episodes } = useAdmin();
  const episodeId = Number(params?.id);
  const existingEp = episodes.find((e) => e.id === episodeId);

  if (!existingEp) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#24172B]">Episode Tidak Ditemukan</h2>
        <Link
          href="/admin/videos"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4B0B7A] text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>
    );
  }

  return <EditEpisodeInner ep={existingEp} key={existingEp.id} />;
}

export default function EditEpisodePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#786F7D]">Memuat formulir edit episode...</div>}>
      <EditEpisodeForm />
    </Suspense>
  );
}
