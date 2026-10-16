'use client';

import React from 'react';
import { MobileHomeLayoutConfig, AdminSeries } from '../../lib/types/admin';
import { HumoraLogo } from '../brand/HumoraLogo';
import { Star, Play, Bell, Home, Search, Clock, User, ShieldCheck } from 'lucide-react';

interface MobilePhonePreviewProps {
  layoutConfig: MobileHomeLayoutConfig;
  allSeries: AdminSeries[];
  className?: string;
}

export function MobilePhonePreview({ layoutConfig, allSeries, className = '' }: MobilePhonePreviewProps) {
  const seriesMap = React.useMemo(() => {
    const map = new Map<string, AdminSeries>();
    allSeries.forEach((s) => map.set(s.id, s));
    return map;
  }, [allSeries]);

  const heroSeries = seriesMap.get(layoutConfig.heroSeriesId) || allSeries[0];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="text-center mb-2">
        <span className="text-xs font-bold text-[#4B0B7A] uppercase tracking-wider bg-[#F6F1F8] px-3 py-1 rounded-full border border-[#EEE8F0]">
          📱 Live Preview Mobile App HUMORA
        </span>
      </div>

      {/* Virtual Smartphone Device Frame */}
      <div className="w-[310px] h-[640px] bg-[#21052F] rounded-[44px] p-2.5 shadow-2xl border-4 border-[#2E0B42] relative flex flex-col overflow-hidden">
        {/* Dynamic Island / Speaker notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-40 flex items-center justify-end pr-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#12001A] border border-white/10" />
        </div>

        {/* Smartphone Screen Inner Container */}
        <div className="w-full h-full bg-[#FFFDF7] rounded-[34px] overflow-hidden flex flex-col relative select-none">
          {/* Top Bar with Time & Status */}
          <div className="pt-3 px-5 pb-1 flex items-center justify-between text-[10px] font-bold text-[#24172B] z-30">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px]">5G</span>
              <div className="w-4 h-2 rounded-xs border border-[#24172B] flex items-center p-0.5">
                <div className="w-2.5 h-full bg-[#24172B] rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Mobile App Header */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-[#EEE8F0]/60 bg-[#FFFDF7]/90 backdrop-blur-xs z-20">
            <HumoraLogo size="sm" showAdminBadge={false} showTagline={false} />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#F6F1F8] flex items-center justify-center text-[#4B0B7A]">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div className="w-7 h-7 rounded-full bg-[#FFD52E] flex items-center justify-center text-[#21052F] font-black text-xs border border-[#21052F]">
                H
              </div>
            </div>
          </div>

          {/* Scrollable Mobile App Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 no-scrollbar text-left">
            {/* Hero Spotlight Banner */}
            {heroSeries && (
              <div className="relative rounded-2xl overflow-hidden shadow-md bg-black border border-[#EEE8F0] group">
                <div className="relative h-44 w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroSeries.cover || heroSeries.poster}
                    alt={heroSeries.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#21052F] via-[#21052F]/40 to-transparent" />

                  <div className="absolute top-2.5 left-2.5 bg-[#FFD52E] text-[#21052F] text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {layoutConfig.heroHeadline || 'SERIES UNGGULAN'}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                    <div className="flex items-center gap-1.5 text-[9px] text-white/80 mb-1">
                      <span className="flex items-center gap-0.5 text-[#FFD52E]">
                        <Star className="w-3 h-3 fill-[#FFD52E]" /> {heroSeries.rating}
                      </span>
                      <span>•</span>
                      <span>{heroSeries.genres.slice(0, 2).join(', ')}</span>
                      <span>•</span>
                      <span>{heroSeries.episodeCount} Ep</span>
                    </div>

                    <h4 className="font-extrabold text-sm leading-tight text-white line-clamp-1">
                      {heroSeries.title}
                    </h4>
                    <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                      {layoutConfig.heroSubheadline || heroSeries.synopsis}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <button className="flex-1 bg-[#FFD52E] text-[#21052F] py-1 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 shadow-sm">
                        <Play className="w-3 h-3 fill-[#21052F]" /> Nonton Gratis Ep 1-2
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Genre Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-[10px] font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-[#4B0B7A] text-white shrink-0">Semua</span>
              <span className="px-2.5 py-1 rounded-full bg-[#F6F1F8] text-[#24172B] shrink-0">Komedi</span>
              <span className="px-2.5 py-1 rounded-full bg-[#F6F1F8] text-[#24172B] shrink-0">Romantis</span>
              <span className="px-2.5 py-1 rounded-full bg-[#F6F1F8] text-[#24172B] shrink-0">Drama</span>
            </div>

            {/* Configured Sections */}
            {layoutConfig.sections.map((section) => {
              if (!section.enabled) return null;

              const sectionSeriesList = section.seriesIds
                .map((id) => seriesMap.get(id))
                .filter((s): s is AdminSeries => s !== undefined && s.publicationStatus === 'published');

              if (sectionSeriesList.length === 0) return null;

              return (
                <div key={section.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-[#24172B]">{section.title}</h5>
                      <p className="text-[9px] text-[#786F7D]">{section.subtitle}</p>
                    </div>
                    <span className="text-[9px] text-[#4B0B7A] font-bold">Semua</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {sectionSeriesList.map((s) => (
                      <div key={s.id} className="w-20 shrink-0 group">
                        <div className="w-20 h-28 rounded-xl overflow-hidden bg-black/10 border border-[#EEE8F0] relative shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.poster} alt={s.title} className="w-full h-full object-cover" />
                          <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-2xs px-1 py-0.5 rounded text-[8px] font-bold text-[#FFD52E] flex items-center gap-0.5">
                            <Star className="w-2 h-2 fill-[#FFD52E]" /> {s.rating}
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-[#24172B] truncate mt-1">{s.title}</p>
                        <p className="text-[8px] text-[#786F7D] truncate">
                          {s.genres[0]} • {s.episodeCount} Ep
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Navigation Mock */}
          <div className="px-4 py-2 border-t border-[#EEE8F0] bg-white flex items-center justify-around text-[9px] font-medium text-[#786F7D] z-20">
            <div className="flex flex-col items-center text-[#4B0B7A]">
              <Home className="w-4 h-4" />
              <span className="font-bold">Home</span>
            </div>
            <div className="flex flex-col items-center">
              <Search className="w-4 h-4" />
              <span>Cari</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-4 h-4" />
              <span>Riwayat</span>
            </div>
            <div className="flex flex-col items-center">
              <User className="w-4 h-4" />
              <span>Profil</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
