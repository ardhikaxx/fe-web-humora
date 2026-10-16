'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '../../lib/context/AdminContext';
import { StatCard } from '../../components/ui/StatCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { InteractiveAreaChart } from '../../components/charts/InteractiveAreaChart';
import { CategoryBarChart } from '../../components/charts/CategoryBarChart';
import {
  formatNumber,
  formatRupiah,
  formatDateTime,
} from '../../lib/utils/formatters';
import {
  getAnalyticsForPeriod,
  AnalyticsPeriod,
  CATEGORY_DISTRIBUTION,
} from '../../lib/data/analyticsData';
import {
  Users,
  Eye,
  Clock,
  Crown,
  CreditCard,
  Video,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clapperboard,
  Sparkles,
  Layers,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { stats, topPerformingVideos, recentActivities } = useAdmin();
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>('30d');

  const analyticsSummary = getAnalyticsForPeriod(analyticsPeriod);

  const chartData = analyticsSummary.points.map((p) => ({
    label: p.dateLabel,
    value: p.views,
    secondaryValue: p.watchTimeHours,
    fullDate: `${p.dateLabel} 2026`,
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Pantau performa konten, pertumbuhan audiens, dan aktivitas HUMORA dalam satu tempat."
        actions={
          <>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EEE8F0] bg-white text-xs font-semibold text-[#24172B] hover:bg-[#F8F7FA] transition-colors shadow-2xs"
            >
              <TrendingUp className="w-4 h-4 text-[#4B0B7A]" />
              Lihat Analytics
            </Link>
            <Link
              href="/admin/videos/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#FFD52E]" />
              Tambah Episode
            </Link>
          </>
        }
      />

      {/* 6 Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          change={12.4}
          changeLabel="vs bln lalu"
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-[#F3E8FF]"
          iconColor="text-[#6B21A8]"
        />

        <StatCard
          title="Total Views"
          value={formatNumber(stats.totalViews)}
          change={18.2}
          changeLabel="vs bln lalu"
          icon={<Eye className="w-5 h-5" />}
          iconBg="bg-[#EAF8F1]"
          iconColor="text-[#21865B]"
        />

        <StatCard
          title="Watch Time"
          value={`${formatNumber(stats.totalWatchTimeHours)} jam`}
          change={15.6}
          changeLabel="vs bln lalu"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-[#FFF5E8]"
          iconColor="text-[#E58A16]"
        />

        <StatCard
          title="Subscribers"
          value={formatNumber(stats.totalSubscribers)}
          change={8.5}
          changeLabel="vs bln lalu"
          icon={<Crown className="w-5 h-5" />}
          iconBg="bg-[#F6F1F8]"
          iconColor="text-[#4B0B7A]"
          badge="VIP"
        />

        <StatCard
          title="Revenue"
          value={formatRupiah(stats.totalRevenue)}
          change={14.2}
          changeLabel="vs bln lalu"
          icon={<CreditCard className="w-5 h-5" />}
          iconBg="bg-[#EAF8F1]"
          iconColor="text-[#21865B]"
        />

        <StatCard
          title="Published Ep"
          value={formatNumber(stats.publishedEpisodesCount)}
          subtitle={`${stats.draftEpisodesCount} draft`}
          icon={<Video className="w-5 h-5" />}
          iconBg="bg-[#E0F2FE]"
          iconColor="text-[#0369A1]"
        />
      </div>

      {/* Analytics Overview & Category Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Curve Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-[#24172B]">Pertumbuhan Views & Watch Time</h2>
              <p className="text-xs text-[#786F7D] mt-0.5">
                Total {formatNumber(analyticsSummary.totalViews)} views ({analyticsSummary.viewsChangePercent > 0 ? '+' : ''}{analyticsSummary.viewsChangePercent}% vs periode lalu)
              </p>
            </div>

            {/* Period Selector Tabs */}
            <div className="flex items-center gap-1 bg-[#F8F7FA] p-1 rounded-xl border border-[#EEE8F0]">
              {(['7d', '30d', '90d'] as AnalyticsPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setAnalyticsPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    analyticsPeriod === p
                      ? 'bg-[#4B0B7A] text-white shadow-2xs'
                      : 'text-[#786F7D] hover:text-[#24172B]'
                  }`}
                >
                  {p === '7d' ? '7 Hari' : p === '30d' ? '30 Hari' : '90 Hari'}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="w-full">
            <InteractiveAreaChart
              data={chartData}
              height={260}
              primaryLabel="Penayangan (Views)"
              secondaryLabel="Waktu Tonton"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-[#F6F1F8] flex items-center justify-between text-xs text-[#786F7D]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4B0B7A]" /> Penayangan
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFD52E]" /> Durasi Tonton (Jam)
              </span>
            </div>
            <Link
              href="/admin/analytics"
              className="text-[#4B0B7A] font-bold hover:underline inline-flex items-center gap-1"
            >
              Laporan Mendalam <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Category Distribution (1 col) */}
        <div className="flex flex-col">
          <CategoryBarChart
            categories={CATEGORY_DISTRIBUTION}
            title="Distribusi Genre Tontonan"
            className="h-full flex flex-col justify-between"
          />
        </div>
      </div>

      {/* Content Overview Counters Bar */}
      <div className="bg-gradient-to-r from-[#21052F] to-[#4B0B7A] rounded-2xl p-6 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#FFD52E] text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" /> Ringkasan Katalog Aktif
            </div>
            <h3 className="text-xl font-black mt-1">Status Konten Platform HUMORA</h3>
            <p className="text-xs text-white/80 mt-0.5">
              Status ini menentukan ketersediaan konten di katalog aplikasi mobile HUMORA.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs border border-white/10 text-center">
              <p className="text-[10px] text-white/70 font-semibold uppercase">Series Aktif</p>
              <p className="text-xl font-black text-white mt-0.5">{stats.publishedSeriesCount}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs border border-white/10 text-center">
              <p className="text-[10px] text-white/70 font-semibold uppercase">Ep Published</p>
              <p className="text-xl font-black text-[#FFD52E] mt-0.5">{stats.publishedEpisodesCount}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs border border-white/10 text-center">
              <p className="text-[10px] text-white/70 font-semibold uppercase">Ep Draft</p>
              <p className="text-xl font-black text-white/80 mt-0.5">{stats.draftEpisodesCount}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs border border-white/10 text-center">
              <p className="text-[10px] text-white/70 font-semibold uppercase">Free Preview</p>
              <p className="text-xl font-black text-[#56ECC4] mt-0.5">{stats.freeEpisodesCount}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs border border-white/10 text-center">
              <p className="text-[10px] text-white/70 font-semibold uppercase">Premium</p>
              <p className="text-xl font-black text-[#D6B5FF] mt-0.5">{stats.premiumEpisodesCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Videos & Recent Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Videos Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-[#EEE8F0] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                  Top Performing Episodes
                </h3>
                <p className="text-xs text-[#786F7D] mt-0.5">Paling banyak ditonton dengan completion rate tertinggi</p>
              </div>
              <Link
                href="/admin/videos"
                className="text-xs font-bold text-[#4B0B7A] hover:underline inline-flex items-center gap-1"
              >
                Lihat Semua Video <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF8FB] text-[11px] font-bold text-[#786F7D] uppercase tracking-wider border-b border-[#EEE8F0]">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Episode</th>
                    <th className="py-3 px-4">Series & Kategori</th>
                    <th className="py-3 px-4 text-right">Views</th>
                    <th className="py-3 px-4 text-right">Completion</th>
                    <th className="py-3 px-4 text-center">Akses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEE8F0] text-xs">
                  {topPerformingVideos.slice(0, 6).map((ep, idx) => (
                    <tr key={ep.id} className="hover:bg-[#FAF8FB] transition-colors">
                      <td className="py-3 px-4 font-black text-[#786F7D] text-center">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 rounded-lg overflow-hidden bg-black/10 shrink-0 relative border border-[#EEE8F0]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/videos/${ep.id}/edit`}
                              className="font-bold text-[#24172B] hover:text-[#4B0B7A] truncate block max-w-[200px]"
                            >
                              Ep {ep.number}: {ep.title}
                            </Link>
                            <span className="text-[11px] text-[#786F7D]">{ep.duration}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#24172B] truncate max-w-[150px]">{ep.seriesTitle}</p>
                        <span className="text-[10px] text-[#786F7D]">Serial Komedi</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-[#24172B]">
                        {formatNumber(ep.views)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 h-1.5 bg-[#F6F1F8] rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-[#21865B] rounded-full"
                              style={{ width: `${ep.completionRate}%` }}
                            />
                          </div>
                          <span className="font-bold text-[#21865B]">{ep.completionRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge type="access" value={ep.accessType} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-[#FAF8FB] border-t border-[#EEE8F0] text-center">
            <Link
              href="/admin/videos"
              className="text-xs font-bold text-[#4B0B7A] hover:underline"
            >
              Kelola Seluruh Episode ({stats.publishedEpisodesCount} Total) &rarr;
            </Link>
          </div>
        </div>

        {/* Recent Activities Feed (1 col) */}
        <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                Aktivitas Terbaru
              </h3>
              <span className="text-[11px] text-[#786F7D]">Log Real-time</span>
            </div>

            <div className="space-y-4">
              {recentActivities.slice(0, 5).map((act) => {
                const icon =
                  act.type === 'episode_published' ? (
                    <Video className="w-4 h-4 text-[#0369A1]" />
                  ) : act.type === 'series_created' ? (
                    <Clapperboard className="w-4 h-4 text-[#4B0B7A]" />
                  ) : act.type === 'access_changed' ? (
                    <Sparkles className="w-4 h-4 text-[#21865B]" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#E58A16]" />
                  );

                return (
                  <div key={act.id} className="flex items-start gap-3 text-left">
                    <div className="p-2 rounded-xl bg-[#F6F1F8] shrink-0 mt-0.5">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#24172B] leading-tight">{act.title}</p>
                      <p className="text-[11px] text-[#786F7D] mt-0.5 leading-snug line-clamp-2">
                        {act.description}
                      </p>
                      <p className="text-[10px] text-[#A39CA9] mt-1 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(act.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#F6F1F8] text-center">
            <span className="text-[11px] text-[#786F7D]">
              Semua aktivitas tersinkronisasi otomatis
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
