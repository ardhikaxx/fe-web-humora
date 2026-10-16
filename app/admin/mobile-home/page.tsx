'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { MobilePhonePreview } from '../../../components/mobile/MobilePhonePreview';
import { useToast } from '../../../components/ui/Toast';
import { AdminSeries } from '../../../lib/types/admin';
import {
  Save,
  CheckCircle2,
  EyeOff,
  Sparkles,
  Layers,
  Lock,
  ArrowRight,
  Info,
  Flame,
  Star,
  Gift,
} from 'lucide-react';

export default function MobileHomeLayoutPage() {
  const {
    mobileHomeLayout,
    series,
    updateMobileHomeLayout,
  } = useAdmin();
  const { success } = useToast();

  const publishedSeries = useMemo(
    () => series.filter((s) => s.publicationStatus === 'published'),
    [series]
  );

  // Automated section content mapping based on real published series attributes
  const getAutoSectionData = (sectionId: string): { criteria: string; icon: React.ReactNode; seriesList: AdminSeries[]; isAutoVisible: boolean } => {
    switch (sectionId) {
      case 'section-popular': {
        const matching = publishedSeries.filter((s) => s.isPopular);
        return {
          criteria: 'Otomatis mengambil series terpublikasi dengan tanda "Populer" (isPopular)',
          icon: <Flame className="w-4 h-4 text-[#E58A16]" />,
          seriesList: matching,
          isAutoVisible: matching.length > 0,
        };
      }
      case 'section-new': {
        const matching = publishedSeries.filter((s) => s.isNew);
        return {
          criteria: 'Otomatis mengambil series terpublikasi dengan tanda "Series Baru" (isNew)',
          icon: <Sparkles className="w-4 h-4 text-[#0284C7]" />,
          seriesList: matching,
          isAutoVisible: matching.length > 0,
        };
      }
      case 'section-recommended': {
        const matching = publishedSeries.filter((s) => s.featured || s.rating >= 4.7);
        return {
          criteria: 'Otomatis mengambil series terpublikasi "Unggulan" (featured) atau rating ≥ 4.7',
          icon: <Star className="w-4 h-4 text-[#D97706]" />,
          seriesList: matching,
          isAutoVisible: matching.length > 0,
        };
      }
      case 'section-free':
      default: {
        const matching = publishedSeries; // All published series have Free Preview Ep 1 & 2
        return {
          criteria: 'Otomatis menampilkan seluruh series yang menyediakan Free Preview episode 1 & 2',
          icon: <Gift className="w-4 h-4 text-[#21865B]" />,
          seriesList: matching,
          isAutoVisible: matching.length > 0,
        };
      }
    }
  };

  // Fixed section definitions in standard immutable sequence
  const fixedSectionsConfig = useMemo(() => {
    const standardSections = [
      {
        id: 'section-popular',
        title: 'Series Populer 🔥',
        subtitle: 'Paling banyak ditonton minggu ini',
      },
      {
        id: 'section-new',
        title: 'Terbaru di HUMORA ✨',
        subtitle: 'Episode segar rilis tiap minggu',
      },
      {
        id: 'section-recommended',
        title: 'Rekomendasi Buat Kamu 💡',
        subtitle: 'Dipilih berdasarkan tontonan favoritmu',
      },
      {
        id: 'section-free',
        title: 'Gratis untuk Kamu 🍿',
        subtitle: 'Tonton 2 episode pertama tanpa langganan',
      },
    ];

    return standardSections.map((sec) => {
      const autoData = getAutoSectionData(sec.id);
      return {
        ...sec,
        enabled: autoData.isAutoVisible,
        seriesIds: autoData.seriesList.map((s) => s.id),
        criteria: autoData.criteria,
        icon: autoData.icon,
        seriesList: autoData.seriesList,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publishedSeries]);

  // Local state for hero configuration (the only part admin curates manually)
  const [heroSeriesId, setHeroSeriesId] = useState(mobileHomeLayout.heroSeriesId || publishedSeries[0]?.id || 'series-1');
  const [heroHeadline, setHeroHeadline] = useState(mobileHomeLayout.heroHeadline || 'SERIES SPESIAL BULAN INI');
  const [heroSubheadline, setHeroSubheadline] = useState(mobileHomeLayout.heroSubheadline || 'Kontrak formal 30 hari yang berujung cinta sejati');

  // Preview layout automatically built from fixed sections and current hero settings
  const previewLayout = useMemo(() => {
    return {
      heroSeriesId,
      heroHeadline,
      heroSubheadline,
      sections: fixedSectionsConfig.map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        enabled: s.enabled,
        seriesIds: s.seriesIds,
      })),
    };
  }, [heroSeriesId, heroHeadline, heroSubheadline, fixedSectionsConfig]);

  const handleSaveAll = () => {
    updateMobileHomeLayout(previewLayout);
    success(
      'Tata Letak Beranda Tersimpan',
      'Hero Spotlight Banner diperbarui. Urutan baku dan visibilitas otomatis tetap sinkron dengan data katalog.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Mobile Home Layout CMS"
        description="Atur sorotan Hero Spotlight Banner pada beranda aplikasi mobile HUMORA. Urutan section telah dibakukan secara tetap, dan visibilitas setiap section aktif secara otomatis mengikuti ketersediaan data konten."
        breadcrumbs={[{ label: 'Mobile Home Layout' }]}
        actions={
          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
          >
            <Save className="w-4 h-4 text-[#FFD52E]" /> Simpan Hero Banner
          </button>
        }
      />

      {/* Information Banner on Immutable Sequence & Automatic Visibility */}
      <div className="p-4 rounded-2xl bg-[#FFF9E0] border border-[#FFD52E] flex items-start gap-3.5 text-xs text-[#21052F]">
        <Info className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-[13px] text-[#21052F]">
            Standar Otomatisasi UX Beranda Mobile HUMORA
          </p>
          <p className="text-[11px] text-[#786F7D] leading-relaxed">
            1. <strong>Urutan Section Tetap:</strong> Urutan carousel beranda di bawah ini telah <strong>dibakukan</strong> (#1 Populer, #2 Terbaru, #3 Rekomendasi, #4 Gratis) dan tidak dapat diubah atau dipindah-pindah demi konsistensi pengalaman pengguna mobile.<br />
            2. <strong>Visibilitas Otomatis Sesuai Data:</strong> Anda tidak perlu menyalakan atau mematikan section secara manual. Section akan <strong>otomatis tampil</strong> jika terdapat minimal 1 series terpublikasi yang memenuhi kriteria, dan otomatis disembunyikan jika datanya kosong.
          </p>
        </div>
      </div>

      {/* Two Column Layout: Settings (Left) vs Real-time Interactive Phone Mockup (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Hero Controls + Fixed Section Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Hero Spotlight Banner Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
              <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D97706]" /> 1. Hero Spotlight Banner (Kurasi Admin)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD52E] text-[#21052F]">
                Sorotan Utama Mobile
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Pilih Series untuk Tampil di Hero Banner
              </label>
              <select
                value={heroSeriesId}
                onChange={(e) => setHeroSeriesId(e.target.value)}
                className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-xs font-bold text-[#24172B] focus:bg-white focus:outline-hidden"
              >
                {publishedSeries.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.genres.join(', ')}) — Rating {s.rating}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Lencana Headline Hero
                </label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={(e) => setHeroHeadline(e.target.value)}
                  placeholder="SERIES SPESIAL BULAN INI"
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-bold text-[#24172B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Sub-headline / Tagline Ringkas
                </label>
                <input
                  type="text"
                  value={heroSubheadline}
                  onChange={(e) => setHeroSubheadline(e.target.value)}
                  placeholder="Kisah drama komedi terheboh..."
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs text-[#24172B]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Fixed Standard Sections with Automatic Data Visibility */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EEE8F0] gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#4B0B7A]" /> 2. Section Beranda Mobile (Urutan Tetap &amp; Otomatis Sesuai Data)
                </h3>
                <p className="text-[11px] text-[#786F7D] mt-0.5">
                  Urutan section bersifat tetap tidak dapat diubah. Visibilitas aktif/sembunyi ditentukan 100% secara otomatis oleh data katalog series.
                </p>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F6F1F8] text-[#4B0B7A] border border-[#EEE8F0] shrink-0 flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#4B0B7A]" /> Urutan Baku Tetap
              </span>
            </div>

            <div className="space-y-4">
              {fixedSectionsConfig.map((sec, idx) => (
                <div
                  key={sec.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    sec.enabled
                      ? 'border-[#EEE8F0] bg-[#FAF8FB]'
                      : 'border-[#EEE8F0]/70 bg-[#F8F7FA] opacity-75'
                  }`}
                >
                  {/* Section Title & Automatic Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#4B0B7A] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-[#24172B] flex items-center gap-1.5">
                            {sec.icon}
                            {sec.title}
                          </h4>
                          <span className="text-[9px] text-[#786F7D] bg-white px-1.5 py-0.5 rounded border border-[#EEE8F0] font-semibold">
                            Urutan Tetap #{idx + 1}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#786F7D] mt-0.5">{sec.subtitle}</p>
                      </div>
                    </div>

                    {/* Automatic Data-Driven Visibility Indicator (No manual toggle) */}
                    <div>
                      {sec.enabled ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#EAF8F1] text-[#21865B] border border-[#21865B]/20"
                          title="Section otomatis tampil di aplikasi mobile karena terdapat data series yang sesuai kriteria"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Otomatis Tampil ({sec.seriesList.length} Series Sesuai)</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#F8F7FA] text-[#786F7D] border border-[#EEE8F0]"
                          title="Section otomatis disembunyikan karena belum ada data series yang sesuai kriteria"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Otomatis Disembunyikan (0 Data)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Criteria & Current Content Preview */}
                  <div className="mt-3 pt-3 border-t border-[#EEE8F0] space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#786F7D] font-medium">
                        <strong>Kriteria Otomatis:</strong> {sec.criteria}
                      </span>
                      <Link
                        href="/admin/series"
                        className="text-[#4B0B7A] hover:underline font-bold inline-flex items-center gap-0.5"
                      >
                        Kelola Series <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Preview chips of automatically included series */}
                    {sec.seriesList.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {sec.seriesList.map((s) => (
                          <span
                            key={s.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white text-[#24172B] border border-[#EEE8F0] shadow-2xs"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#21865B]" />
                            {s.title}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#786F7D] italic pt-1">
                        Belum ada series terpublikasi yang memenuhi kriteria ini. Tandai series pada menu [Series] agar otomatis muncul di sini.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile Smartphone Preview (5 cols) */}
        <div className="lg:col-span-5 flex justify-center sticky top-20">
          <MobilePhonePreview
            layoutConfig={previewLayout}
            allSeries={series}
          />
        </div>
      </div>
    </div>
  );
}
