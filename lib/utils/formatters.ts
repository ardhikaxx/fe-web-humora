/**
 * Format number to Indonesian Rupiah currency string (e.g. Rp48.750.000)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with thousand separators (e.g. 186.420)
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

/**
 * Format duration in seconds to descriptive text (e.g. "12m 30s" or "1j 15m")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}d`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return `${hours}j ${remMinutes}m`;
}

/**
 * Format duration string from minutes and seconds input (e.g. "8m 42s")
 */
export function formatMinutesSeconds(minutes: number, seconds: number): string {
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

/**
 * Format ISO date string into Indonesian locale format (e.g. "15 Okt 2026")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Format date with time (e.g. "15 Okt 2026, 14:30 WIB")
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const formattedDate = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${formattedDate}, ${hours}:${mins} WIB`;
  } catch {
    return dateString;
  }
}

/**
 * Generate URL-friendly slug from title (e.g. "Kontrak Jadi Pacar" -> "kontrak-jadi-pacar")
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate long text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Format likes count matching the mobile prototype format (e.g. 14200 -> "14.2rb")
 */
export function formatLikes(count?: number | null): string {
  if (!count && count !== 0) return '0';
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace('.0', '')}jt`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace('.0', '')}rb`;
  }
  return count.toLocaleString('id-ID');
}

