'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { InteractiveAreaChart } from '../../../components/charts/InteractiveAreaChart';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import {
  getAnalyticsForPeriod,
  fetchLiveAnalytics,
  AnalyticsPeriod,
  AnalyticsSummary,
  AUDIENCE_INSIGHTS,
  SUBSCRIPTION_METRICS,
} from '../../../lib/data/analyticsData';
import {
  formatNumber,
  formatRupiah,
} from '../../../lib/utils/formatters';
import {
  Eye,
  Users,
  Clock,
  TrendingUp,
  Crown,
  CreditCard,
  Calendar,
  Heart,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { episodes } = useAdmin();
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const [activeTab, setActiveTab] = useState<'views' | 'watchTime' | 'subscribers' | 'revenue'>('views');

  // Video table filters & sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'completion' | 'watchTime'>('views');
  const [liveSummary, setLiveSummary] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLive = async () => {
      const data = await fetchLiveAnalytics(period);
      if (isMounted && data) {
        setLiveSummary(data);
      }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [period]);

  const summary = liveSummary || getAnalyticsForPeriod(period);

  // Prepare chart points based on activeTab
  const chartPoints = useMemo(() => {
    return summary.points.map((p) => {
      let val = p.views;
      let secVal = p.watchTimeHours;

      if (activeTab === 'watchTime') {
        val = p.watchTimeHours;
        secVal = p.views;
      } else if (activeTab === 'subscribers') {
        val = p.subscribers;
        secVal = p.revenue;
      } else if (activeTab === 'revenue') {
        val = p.revenue;
        secVal = p.subscribers;
      }

      return {
        label: p.dateLabel,
        value: val,
        secondaryValue: secVal,
        fullDate: `${p.dateLabel} 2026`,
      };
    });
  }, [summary, activeTab]);

  // Video ranking table data
  const filteredVideos = useMemo(() => {
    return episodes
      .filter((ep) => ep.publicationStatus === 'published')
      .filter((ep) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return ep.title.toLowerCase().includes(q) || (ep.seriesTitle && ep.seriesTitle.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        if (sortBy === 'completion') return b.completionRate - a.completionRate;
        if (sortBy === 'watchTime') return b.watchTimeHours - a.watchTimeHours;
        if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
        return b.views - a.views;
      });
  }, [episodes, searchQuery, sortBy]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Analytics & Performance"
        description="Analisis mendalam mengenai penayangan video, durasi tonton, retensi audiens, dan performa paket langganan HUMORA."
        breadcrumbs={[{ label: 'Analytics' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Sinkron Realtime</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#EEE8F0] shadow-2xs">
              <Calendar className="w-4 h-4 text-[#786F7D] ml-2" />
              {(['7d', '30d', '90d'] as AnalyticsPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    period === p
                      ? 'bg-[#4B0B7A] text-white shadow-2xs'
                      : 'text-[#786F7D] hover:text-[#24172B]'
                  }`}
                >
                  {p === '7d' ? '7 Hari Terakhir' : p === '30d' ? '30 Hari Terakhir' : '90 Hari Terakhir'}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* 6 Metrik Ringkasan Periode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Views"
          value={formatNumber(summary.totalViews)}
          change={summary.viewsChangePercent}
          changeLabel="vs periode lalu"
          icon={<Eye className="w-5 h-5" />}
          iconBg="bg-[#EAF8F1]"
          iconColor="text-[#21865B]"
        />

        <StatCard
          title="Penonton Unik"
          value={formatNumber(summary.uniqueViewers)}
          subtitle="68% dari total views"
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-[#F3E8FF]"
          iconColor="text-[#6B21A8]"
        />

        <StatCard
          title="Total Watch Time"
          value={`${formatNumber(summary.totalWatchTimeHours)} jam`}
          change={summary.watchTimeChangePercent}
          changeLabel="vs periode lalu"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-[#FFF5E8]"
          iconColor="text-[#E58A16]"
        />

        <StatCard
          title="Rata-rata Tonton"
          value={`${summary.avgWatchMinutes} menit`}
          subtitle="per penayangan episode"
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-[#E0F2FE]"
          iconColor="text-[#0369A1]"
        />

        <StatCard
          title="Subscribers Baru"
          value={formatNumber(summary.totalSubscribers)}
          change={summary.subscribersChangePercent}
          changeLabel="vs periode lalu"
          icon={<Crown className="w-5 h-5" />}
          iconBg="bg-[#F6F1F8]"
          iconColor="text-[#4B0B7A]"
        />

        <StatCard
          title="Total Pendapatan"
          value={formatRupiah(summary.totalRevenue)}
          change={summary.revenueChangePercent}
          changeLabel="vs periode lalu"
          icon={<CreditCard className="w-5 h-5" />}
          iconBg="bg-[#EAF8F1]"
          iconColor="text-[#21865B]"
        />
      </div>

      {/* Interactive Time-series Chart Explorer */}
      <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EEE8F0] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#24172B]">Eksplorasi Tren Metrik Waktu</h2>
            <p className="text-xs text-[#786F7D] mt-0.5">
              Pilih metrik utama untuk melihat grafik visualisasi performa harian HUMORA.
            </p>
          </div>

          {/* Metric Switcher Tabs */}
          <div className="flex items-center gap-1 bg-[#F8F7FA] p-1 rounded-xl border border-[#EEE8F0]">
            <button
              onClick={() => setActiveTab('views')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'views'
                  ? 'bg-[#4B0B7A] text-white shadow-2xs'
                  : 'text-[#786F7D] hover:text-[#24172B]'
              }`}
            >
              Views ({formatNumber(summary.totalViews)})
            </button>
            <button
              onClick={() => setActiveTab('watchTime')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'watchTime'
                  ? 'bg-[#4B0B7A] text-white shadow-2xs'
                  : 'text-[#786F7D] hover:text-[#24172B]'
              }`}
            >
              Watch Time ({formatNumber(summary.totalWatchTimeHours)} jam)
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'subscribers'
                  ? 'bg-[#4B0B7A] text-white shadow-2xs'
                  : 'text-[#786F7D] hover:text-[#24172B]'
              }`}
            >
              Subscribers (+{formatNumber(summary.totalSubscribers)})
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'revenue'
                  ? 'bg-[#4B0B7A] text-white shadow-2xs'
                  : 'text-[#786F7D] hover:text-[#24172B]'
              }`}
            >
              Revenue ({formatRupiah(summary.totalRevenue)})
            </button>
          </div>
        </div>

        {/* Dynamic Chart Display */}
        <InteractiveAreaChart
          data={chartPoints}
          height={300}
          primaryLabel={
            activeTab === 'views'
              ? 'Penayangan (Views)'
              : activeTab === 'watchTime'
              ? 'Watch Time'
              : activeTab === 'subscribers'
              ? 'Pelanggan Baru'
              : 'Estimasi Revenue'
          }
          secondaryLabel={activeTab === 'revenue' ? 'Subscribers' : 'Metrik Terkait'}
          valueFormatter={activeTab === 'revenue' ? formatRupiah : formatNumber}
          secondaryValueFormatter={activeTab === 'revenue' ? formatNumber : (v) => `${formatNumber(v)} jam`}
        />
      </div>

      {/* Audience Insights & Subscription Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience Insights Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4B0B7A]" /> Audience Insights
              </h3>
              <span className="text-xs text-[#786F7D]">Aktivitas Penonton</span>
            </div>

            <p className="text-xs text-[#786F7D] mb-6">
              Distribusi perilaku audiens penikmat serial pendek komedi dan romantis HUMORA.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#24172B]">Penonton Aktif (Active Viewers)</span>
                  <span className="font-semibold text-[#4B0B7A]">
                    {formatNumber(AUDIENCE_INSIGHTS.activeViewers)} ({AUDIENCE_INSIGHTS.activePercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#F8F7FA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4B0B7A] rounded-full"
                    style={{ width: `${AUDIENCE_INSIGHTS.activePercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#24172B]">Penonton Baru (New Viewers)</span>
                  <span className="font-semibold text-[#21865B]">
                    {formatNumber(AUDIENCE_INSIGHTS.newViewers)} ({AUDIENCE_INSIGHTS.newPercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#F8F7FA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#21865B] rounded-full"
                    style={{ width: `${AUDIENCE_INSIGHTS.newPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#24172B]">Penonton Kembali (Returning Viewers)</span>
                  <span className="font-semibold text-[#E58A16]">
                    {formatNumber(AUDIENCE_INSIGHTS.returningViewers)} ({AUDIENCE_INSIGHTS.returningPercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#F8F7FA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E58A16] rounded-full"
                    style={{ width: `${AUDIENCE_INSIGHTS.returningPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Performance Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#FFD52E]" /> Subscription Performance
              </h3>
              <span className="text-xs font-bold text-[#21865B] bg-[#EAF8F1] px-2.5 py-0.5 rounded-full">
                {SUBSCRIPTION_METRICS.conversionRatePercent}% Conversion Rate
              </span>
            </div>

            <p className="text-xs text-[#786F7D] mb-6">
              Total {formatNumber(SUBSCRIPTION_METRICS.totalActiveSubscribers)} pelanggan premium aktif dengan churn rate hanya {SUBSCRIPTION_METRICS.churnRatePercent}%.
            </p>

            <div className="space-y-4">
              {SUBSCRIPTION_METRICS.planDistribution.map((plan) => (
                <div key={plan.planId}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plan.color }} />
                      <span className="font-bold text-[#24172B]">{plan.planName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#24172B]">
                        {formatNumber(plan.subscriberCount)} subs ({plan.percentage}%)
                      </span>
                      <span className="text-[11px] font-bold text-[#21865B]">{formatRupiah(plan.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-[#F8F7FA] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${plan.percentage}%`, backgroundColor: plan.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EEE8F0] flex items-center justify-between text-xs text-[#786F7D]">
            <span>Model: 2 Ep Gratis &rarr; Unlock Premium</span>
            <Link href="/admin/subscribers" className="text-[#4B0B7A] font-bold hover:underline">
              Kelola Pelanggan &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Top Episodes Performance Deep Table */}
      <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#EEE8F0] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
              Peringkat Performa Episode Lengkap
            </h3>
            <p className="text-xs text-[#786F7D] mt-0.5">
              Urutkan berdasarkan penayangan, retensi durasi, atau completion rate
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#786F7D] font-medium">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'views' | 'likes' | 'completion' | 'watchTime')}
              className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-1.5 text-xs text-[#24172B] font-semibold focus:outline-hidden"
            >
              <option value="views">Views Terbanyak</option>
              <option value="likes">Suka Terbanyak</option>
              <option value="completion">Completion Rate Tertinggi</option>
              <option value="watchTime">Watch Time Terlama</option>
            </select>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-[#EEE8F0] bg-[#FAF8FB]">
          <SearchFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Cari judul episode atau nama series..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8FB] text-[11px] font-bold text-[#786F7D] uppercase tracking-wider border-b border-[#EEE8F0]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Episode & Series</th>
                <th className="py-3 px-4 text-center">Status Akses</th>
                <th className="py-3 px-4 text-right">Views</th>
                <th className="py-3 px-4 text-right">Jumlah Suka</th>
                <th className="py-3 px-4 text-right">Watch Time</th>
                <th className="py-3 px-4 text-right">Completion Rate</th>
                <th className="py-3 px-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8F0]">
              {filteredVideos.slice(0, 10).map((ep, idx) => (
                <tr key={ep.id} className="hover:bg-[#FAF8FB] transition-colors">
                  <td className="py-3 px-4 font-black text-[#786F7D] text-center">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded-lg overflow-hidden bg-black/10 shrink-0 relative border border-[#EEE8F0]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-[#24172B] hover:text-[#4B0B7A]">
                          Ep {ep.number}: {ep.title}
                        </p>
                        <p className="text-[11px] text-[#786F7D]">{ep.seriesTitle} ({ep.duration})</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge type="access" value={ep.accessType} />
                  </td>
                  <td className="py-3 px-4 text-right font-black text-[#24172B]">
                    {formatNumber(ep.views)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center justify-end gap-1 font-bold text-[#D94152]">
                      <Heart className="w-3.5 h-3.5 fill-[#D94152] text-[#D94152]" />
                      {formatNumber(ep.likes ?? 0)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-[#786F7D]">
                    {formatNumber(ep.watchTimeHours)} jam
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#21865B]">
                    {ep.completionRate}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/admin/videos/${ep.id}/edit`}
                      className="text-xs font-bold text-[#4B0B7A] hover:underline"
                    >
                      Kelola
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
