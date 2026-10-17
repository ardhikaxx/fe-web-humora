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
  releaseDate: string;
  views: number;
  likes: number; // Jumlah suka (Likes)
  likesCount?: number; // Sinkron dengan mobile prototype (e.g. 4250)
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
  thumbnail: string; // Unified 16:9 thumbnail (tidak perlu poster dan cover terpisah)
  poster?: string; // Optional fallback
  cover?: string; // Optional fallback
  likes: number; // Jumlah suka (Likes)
  likesCount?: number; // Sinkron dengan mobile prototype (e.g. 14200)
  year: number;
  videoCount?: number;
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
  avatarUrl?: string;
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
  userAvatar?: string;
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

/** @deprecated Kompatibilitas cache dev server: fitur notifikasi manual admin sudah dihapus */
export type AdminNotification = Record<string, unknown>;

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
  name: string; // Nama Lengkap
  email: string; // Email
  phone: string; // Nomor Telfon
  password?: string; // Password
  avatarInitials: string;
  username?: string;
  role?: string;
  roleBadge?: string;
  department?: string;
  bio?: string;
  timezone?: string;
  avatarUrl?: string;
  joinedDate?: string;
  lastLogin?: string;
}

export interface AdminAccount {
  id: string;
  name: string; // Nama Lengkap
  email: string; // Email
  password: string; // Password
  phone: string; // Nomor Telfon
  avatarInitials?: string;
  isPrimary?: boolean; // Penanda akun admin pertama
}

