export type AccessType = 'free' | 'premium';
export type PublicationStatus = 'draft' | 'published';
export type AccountStatus = 'active' | 'suspended';
export type UserSubscriptionStatus = 'free' | 'premium' | 'expired';

export interface AdminEpisode {
  id: number;
  seriesId: string;
  seriesSlug: string;
  seriesTitle?: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  durationSeconds: number;
  accessType: AccessType;
  publicationStatus: PublicationStatus;
  thumbnail: string;
  videoSource?: string;
  hasVideoFile?: boolean;
  hasSubtitleFile?: boolean;
  subtitleLanguage?: string;
  releaseDate: string;
  views: number;
  watchTimeHours: number;
  completionRate: number; // e.g. 84 for 84%
  createdAt: string;
  updatedAt: string;
}

export interface AdminSeries {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  genres: string[];
  poster: string; // 2:3 vertical aspect ratio
  cover: string; // horizontal banner aspect ratio
  rating: number; // e.g. 4.9
  year: number;
  episodeCount: number;
  featured: boolean;
  isPopular: boolean;
  isNew: boolean;
  publicationStatus: PublicationStatus;
  displayOrder: number;
  sectionPlacements: string[]; // e.g. ['popular', 'recommended', 'new']
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  seriesCount: number;
  episodeCount: number;
  createdAt: string;
}

export interface AdminSubtitle {
  id: string;
  episodeId: number;
  episodeNumber: number;
  episodeTitle: string;
  seriesId: string;
  seriesTitle: string;
  language: 'id' | 'en';
  languageLabel: string;
  format: 'SRT' | 'VTT';
  fileName: string;
  fileSize: string;
  status: 'active' | 'draft';
  sampleLines: { timestamp: string; text: string }[];
  updatedAt: string;
}

export interface UserWatchHistoryItem {
  seriesId: string;
  seriesSlug: string;
  seriesTitle: string;
  seriesPoster: string;
  episodeId: number;
  episodeNumber: number;
  episodeTitle: string;
  progressPercent: number;
  lastWatchedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  joinedDate: string;
  status: AccountStatus;
  subscriptionStatus: UserSubscriptionStatus;
  episodesWatched: number;
  totalWatchHours: number;
  lastActiveAt: string;
  watchHistory: UserWatchHistoryItem[];
}

export interface AdminSubscriber {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  planId: 'monthly' | 'quarterly' | 'annual';
  planName: string;
  price: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired';
  paymentMethod: string;
  autoRenew: boolean;
  totalSpent: number;
}

export interface AdminTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userAvatar?: string;
  planId: 'monthly' | 'quarterly' | 'annual';
  planName: string;
  planDurationDays?: number;
  amount: number;
  discount: number;
  total: number;
  paymentMethod: 'QRIS' | 'BCA Virtual Account' | 'Mandiri VA' | 'GoPay' | 'OVO' | 'ShopeePay' | 'Transfer Bank BCA' | 'Transfer Bank Mandiri';
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  // Verification details
  paymentProofUrl?: string; // foto bukti pembayaran / screenshot transfer
  senderName?: string; // nama pengirim di bukti transfer
  senderBank?: string; // nama bank / e-wallet pengirim
  referenceNumber?: string; // nomor referensi transaksi
  verifiedAt?: string; // waktu diverifikasi / ditolak
  verifiedBy?: string; // admin yang memverifikasi
  rejectionReason?: string; // alasan jika ditolak
  notes?: string;
}


export interface AnalyticsDataPoint {
  date: string;
  dateLabel: string;
  views: number;
  watchTimeHours: number;
  subscribers: number;
  revenue: number;
}

export interface SubscriptionPlanConfig {
  id: 'monthly' | 'quarterly' | 'annual';
  name: string;
  durationDays: number;
  price: number;
  originalPrice: number;
  periodLabel: string;
  badge?: string;
  description: string;
  active: boolean;
  features: string[];
}

export interface AdminSettingsConfig {
  appName: string;
  tagline: string;
  defaultFreeEpisodes: number;
  enableAutoPublish: boolean;
  supportEmail: string;
  demoModeNotice: boolean;
  plans: SubscriptionPlanConfig[];
}

export interface AdminProfileConfig {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  roleBadge: string;
  department: string;
  bio: string;
  timezone: string;
  avatarInitials: string;
  avatarUrl?: string;
  twoFactorEnabled: boolean;
  joinedDate: string;
  lastLogin: string;
}

