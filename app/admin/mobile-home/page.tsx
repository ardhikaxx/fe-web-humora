'use client';

import React, { useState } from 'react';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { MobilePhonePreview } from '../../../components/mobile/MobilePhonePreview';
import { useToast } from '../../../components/ui/Toast';
import {
  Save,
  CheckCircle2,
  EyeOff,
  Sparkles,
  Layers,
  Lock,
} from 'lucide-react';

export default function MobileHomeLayoutPage() {
  const {
    mobileHomeLayout,
    series,
    updateMobileHomeLayout,
  } = useAdmin();
  const { success } = useToast();

  const [localLayout, setLocalLayout] = useState(mobileHomeLayout);

  const publishedSeries = series.filter((s) => s.publicationStatus === 'published');

  const handleHeroChange = (seriesId: string) => {
    setLocalLayout((prev) => ({ ...prev, heroSeriesId: seriesId }));
  };

  const handleHeroTextChange = (headline: string, subheadline: string) => {
    setLocalLayout((prev) => ({ ...prev, heroHeadline: headline, heroSubheadline: subheadline }));
  };

  const toggleSeriesInSection = (sectionId: string, sId: string) => {
    setLocalLayout((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const exists = sec.seriesIds.includes(sId);
        const newIds = exists ? sec.seriesIds.filter((id) => id !== sId) : [...sec.seriesIds, sId];
        const hasPublishedContent = newIds.some((id) => publishedSeries.some((s) => s.id === id));
        return { ...sec, seriesIds: newIds, enabled: hasPublishedContent };
      }),
    }));
  };

  const handleSaveAll = () => {
    const synchronizedLayout = {
      ...localLayout,
      sections: localLayout.sections.map((sec) => ({
        ...sec,
        enabled: sec.seriesIds.some((id) => publishedSeries.some((s) => s.id === id)),
      })),
    };
    updateMobileHomeLayout(synchronizedLayout);
    success('Tata Letak Tersimpan', 'Perubahan tata letak beranda mobile HUMORA berhasil diperbarui.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Mobile Home Layout CMS"
        description="Atur penempatan konten, hero spotlight series, urutan section carousel, dan visibilitas katalog yang tampil di aplikasi mobile HUMORA."
        breadcrumbs={[{ label: 'Mobile Home Layout' }]}
        actions={
          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
          >
            <Save className="w-4 h-4 text-[#FFD52E]" /> Simpan Tata Letak
          </button>
        }
      />

      {/* Info Callout */}
      <div className="p-4 rounded-2xl bg-[#FFF9E0] border border-[#FFD52E]/60 flex items-start gap-3 text-xs text-[#21052F]">
        <Sparkles className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Pusat Kurasi Beranda Aplikasi Mobile HUMORA</p>
          <p className="text-[11px] text-[#786F7D] mt-0.5 leading-relaxed">
            Perubahan yang Anda atur di bawah ini langsung terproyeksikan secara visual pada smartphone mockup di sebelah kanan secara real-time. Hanya series berstatus <strong>Terpublikasi</strong> yang akan muncul di aplikasi penonton.
          </p>
        </div>
      </div>

      {/* Two Column Layout: Controls (Left) vs Interactive Phone Mockup (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Layout Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Hero Spotlight Banner Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
              <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D97706]" /> 1. Hero Spotlight Banner
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD52E] text-[#21052F]">
                Sorotan Utama
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Pilih Series untuk Hero Banner
              </label>
              <select
                value={localLayout.heroSeriesId}
                onChange={(e) => handleHeroChange(e.target.value)}
                className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-xs font-bold text-[#24172B] focus:bg-white focus:outline-hidden"
              >
                {publishedSeries.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.genres.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Badge Headline
                </label>
                <input
                  type="text"
                  value={localLayout.heroHeadline}
                  onChange={(e) => handleHeroTextChange(e.target.value, localLayout.heroSubheadline)}
                  placeholder="SERIES SPESIAL BULAN INI"
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-bold text-[#24172B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Sub-headline / Tagline
                </label>
                <input
                  type="text"
                  value={localLayout.heroSubheadline}
                  onChange={(e) => handleHeroTextChange(localLayout.heroHeadline, e.target.value)}
                  placeholder="Kisah drama komedi terheboh..."
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs text-[#24172B]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Sections Fixed Ordering & Automatic Visibility */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EEE8F0] gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#4B0B7A]" /> 2. Urutan & Visibilitas Section Beranda
                </h3>
                <p className="text-[11px] text-[#786F7D] mt-0.5">
                  Urutan section telah dibakukan secara tetap. Visibilitas aktif/sembunyi disesuaikan secara otomatis berdasarkan data konten.
                </p>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F6F1F8] text-[#4B0B7A] border border-[#EEE8F0] shrink-0 flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#4B0B7A]" /> Urutan Baku Tetap
              </span>
            </div>

            <div className="space-y-4">
              {localLayout.sections.map((section, idx) => {
                const activeSeriesInSec = section.seriesIds.filter((id) =>
                  publishedSeries.some((s) => s.id === id)
                );
                const isAutoVisible = activeSeriesInSec.length > 0;

                return (
                  <div
                    key={section.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isAutoVisible
                        ? 'border-[#EEE8F0] bg-[#FAF8FB]'
                        : 'border-[#EEE8F0]/60 bg-[#F8F7FA] opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#4B0B7A] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-[#24172B]">{section.title}</h4>
                            <span className="text-[10px] text-[#786F7D] bg-white px-1.5 py-0.5 rounded border border-[#EEE8F0] font-medium">
                              Urutan Tetap
                            </span>
                          </div>
                          <p className="text-[10px] text-[#786F7D] mt-0.5">{section.subtitle}</p>
                        </div>
                      </div>

                      {/* Automated Visibility Badge (Data-driven, no manual toggle) */}
                      <div>
                        {isAutoVisible ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EAF8F1] text-[#21865B] border border-[#21865B]/20"
                            title="Section otomatis tampil di aplikasi mobile karena memiliki series terpublikasi"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Otomatis Tampil ({activeSeriesInSec.length} Series)</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F8F7FA] text-[#786F7D] border border-[#EEE8F0]"
                            title="Section otomatis disembunyikan karena belum ada series terpublikasi yang dipilih"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Otomatis Disembunyikan (0 Konten)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Series multi-chips for this section */}
                    <div className="mt-3 pt-3 border-t border-[#EEE8F0]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-[#786F7D] uppercase">
                          Kelola Series dalam Section Ini:
                        </span>
                        <span className="text-[10px] text-[#786F7D]">
                          Klik untuk tambah atau lepas konten
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {publishedSeries.map((s) => {
                          const isInSection = section.seriesIds.includes(s.id);
                          return (
                            <button
                              type="button"
                              key={s.id}
                              onClick={() => toggleSeriesInSection(section.id, s.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                isInSection
                                  ? 'bg-[#4B0B7A] text-white shadow-2xs'
                                  : 'bg-white text-[#786F7D] border border-[#EEE8F0] hover:bg-[#F6F1F8]'
                              }`}
                            >
                              {isInSection && '✓ '}
                              {s.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile Smartphone Preview (5 cols) */}
        <div className="lg:col-span-5 flex justify-center sticky top-20">
          <MobilePhonePreview
            layoutConfig={localLayout}
            allSeries={series}
          />
        </div>
      </div>
    </div>
  );
}
