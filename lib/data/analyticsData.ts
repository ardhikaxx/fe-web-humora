import { AnalyticsDataPoint } from '../types/admin';

// Deterministic mock generation for 90 days ending in Oct 2026
function generateAnalyticsHistory(): AnalyticsDataPoint[] {
  const points: AnalyticsDataPoint[] = [];
  const endDate = new Date('2026-10-15T00:00:00Z');

  for (let i = 89; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Gradual upward trend with weekend spikes and occasional viral peaks
    const progressFactor = (90 - i) / 90; // 0 to 1
    const baseViews = 1400 + progressFactor * 800 + (isWeekend ? 450 : 0);
    const noise = Math.sin(i * 0.4) * 150 + Math.cos(i * 0.9) * 100;
    const views = Math.max(900, Math.round(baseViews + noise));

    const watchTimeHours = Math.round((views * (7.2 + Math.sin(i * 0.5) * 0.8)) / 60);

    const baseSubs = 22 + Math.round(progressFactor * 20 + (isWeekend ? 10 : 0) + Math.sin(i * 0.3) * 6);
    const subscribers = Math.max(12, baseSubs);

    const avgRevenuePerSub = 24000;
    const revenue = subscribers * avgRevenuePerSub + Math.round(Math.sin(i) * 50000);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dateLabel = `${d.getDate()} ${monthNames[d.getMonth()]}`;

    points.push({
      date: dateStr,
      dateLabel,
      views,
      watchTimeHours,
      subscribers,
      revenue: Math.max(250000, revenue),
    });
  }

  return points;
}

export const ALL_ANALYTICS_DATA: AnalyticsDataPoint[] = generateAnalyticsHistory();

export type AnalyticsPeriod = '7d' | '30d' | '90d';

export interface AnalyticsSummary {
  period: AnalyticsPeriod;
  totalViews: number;
  totalWatchTimeHours: number;
  totalSubscribers: number;
  totalRevenue: number;
  uniqueViewers: number;
  avgWatchMinutes: number;
  completionRateAvg: number;
  viewsChangePercent: number;
  watchTimeChangePercent: number;
  subscribersChangePercent: number;
  revenueChangePercent: number;
  points: AnalyticsDataPoint[];
}

export function getAnalyticsForPeriod(period: AnalyticsPeriod): AnalyticsSummary {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const currentPoints = ALL_ANALYTICS_DATA.slice(-days);

  // Previous period for delta comparison
  const prevStartIndex = Math.max(0, ALL_ANALYTICS_DATA.length - days * 2);
  const prevPoints = ALL_ANALYTICS_DATA.slice(prevStartIndex, ALL_ANALYTICS_DATA.length - days);

  const sumField = (arr: AnalyticsDataPoint[], field: keyof AnalyticsDataPoint) =>
    arr.reduce((acc, curr) => acc + (typeof curr[field] === 'number' ? (curr[field] as number) : 0), 0);

  const totalViews = sumField(currentPoints, 'views');
  const prevTotalViews = sumField(prevPoints, 'views') || 1;

  const totalWatchTimeHours = sumField(currentPoints, 'watchTimeHours');
  const prevWatchTime = sumField(prevPoints, 'watchTimeHours') || 1;

  const totalSubscribers = sumField(currentPoints, 'subscribers');
  const prevSubscribers = sumField(prevPoints, 'subscribers') || 1;

  const totalRevenue = sumField(currentPoints, 'revenue');
  const prevRevenue = sumField(prevPoints, 'revenue') || 1;

  const calcChange = (curr: number, prev: number) => {
    const change = ((curr - prev) / prev) * 100;
    return Math.round(change * 10) / 10;
  };

  const uniqueViewers = Math.round(totalViews * 0.68);
  const avgWatchMinutes = totalViews > 0 ? Math.round((totalWatchTimeHours * 60) / totalViews) : 0;
  const completionRateAvg = 78.4;

  return {
    period,
    totalViews,
    totalWatchTimeHours,
    totalSubscribers,
    totalRevenue,
    uniqueViewers,
    avgWatchMinutes,
    completionRateAvg,
    viewsChangePercent: calcChange(totalViews, prevTotalViews),
    watchTimeChangePercent: calcChange(totalWatchTimeHours, prevWatchTime),
    subscribersChangePercent: calcChange(totalSubscribers, prevSubscribers),
    revenueChangePercent: calcChange(totalRevenue, prevRevenue),
    points: currentPoints,
  };
}

export async function fetchLiveAnalytics(period: AnalyticsPeriod): Promise<AnalyticsSummary | null> {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  try {
    const res = await fetch(`http://192.168.1.7:8000/api/v1/analytics/realtime?range=${days}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data) return null;
    const d = json.data;

    const points: AnalyticsDataPoint[] = [];
    if (d.chartLabels && d.chartViews) {
      for (let i = 0; i < d.chartLabels.length; i++) {
        points.push({
          date: d.chartLabels[i],
          dateLabel: d.chartLabels[i],
          views: d.chartViews[i] || 0,
          watchTimeHours: Math.round(((d.chartViews[i] || 0) * (d.avgDurationSeconds || 60)) / 3600),
          subscribers: 0,
          revenue: 0,
        });
      }
    }

    return {
      period,
      totalViews: d.totalViews,
      totalWatchTimeHours: Math.round(((d.totalWatchSeconds || 0) / 3600) * 10) / 10,
      totalSubscribers: 0,
      totalRevenue: 0,
      uniqueViewers: d.uniqueViewers,
      avgWatchMinutes: Math.round((d.avgDurationSeconds || 0) / 60),
      completionRateAvg: 78.4,
      viewsChangePercent: 0,
      watchTimeChangePercent: 0,
      subscribersChangePercent: 0,
      revenueChangePercent: 0,
      points: points.length > 0 ? points : ALL_ANALYTICS_DATA.slice(-days),
    };
  } catch {
    return null;
  }
}

export interface CategoryMetric {
  name: string;
  slug: string;
  views: number;
  percentage: number;
  color: string;
}

export const CATEGORY_DISTRIBUTION: CategoryMetric[] = [
  { name: 'Komedi', slug: 'komedi', views: 76420, percentage: 41, color: '#FFD52E' },
  { name: 'Romantis', slug: 'romantis', views: 48900, percentage: 26, color: '#7028B8' },
  { name: 'Drama', slug: 'drama', views: 31250, percentage: 17, color: '#4B0B7A' },
  { name: 'Slice of Life', slug: 'slice-of-life', views: 18400, percentage: 10, color: '#E58A16' },
  { name: 'Persahabatan', slug: 'persahabatan', views: 11450, percentage: 6, color: '#21865B' },
];

export interface AudienceInsight {
  activeViewers: number;
  activePercent: number;
  newViewers: number;
  newPercent: number;
  returningViewers: number;
  returningPercent: number;
  mobileDevicePercent: number;
  tabletDevicePercent: number;
}

export const AUDIENCE_INSIGHTS: AudienceInsight = {
  activeViewers: 15400,
  activePercent: 62,
  newViewers: 5960,
  newPercent: 24,
  returningViewers: 3490,
  returningPercent: 14,
  mobileDevicePercent: 91,
  tabletDevicePercent: 9,
};

export interface SubscriptionMetrics {
  totalActiveSubscribers: number;
  totalExpiredSubscribers: number;
  churnRatePercent: number;
  conversionRatePercent: number;
  planDistribution: {
    planId: string;
    planName: string;
    subscriberCount: number;
    percentage: number;
    revenue: number;
    color: string;
  }[];
}

export const SUBSCRIPTION_METRICS: SubscriptionMetrics = {
  totalActiveSubscribers: 3280,
  totalExpiredSubscribers: 415,
  churnRatePercent: 4.8,
  conversionRatePercent: 13.2,
  planDistribution: [
    {
      planId: 'quarterly',
      planName: 'Paket 3 Bulan',
      subscriberCount: 1870,
      percentage: 57,
      revenue: 91630000,
      color: '#4B0B7A',
    },
    {
      planId: 'monthly',
      planName: 'Paket Bulanan',
      subscriberCount: 880,
      percentage: 27,
      revenue: 16720000,
      color: '#FFD52E',
    },
    {
      planId: 'annual',
      planName: 'Paket Tahunan',
      subscriberCount: 530,
      percentage: 16,
      revenue: 94870000,
      color: '#7028B8',
    },
  ],
};
