/**
 * src/utils/format.ts
 * Shared formatting utilities used across Entrustory components.
 */

/**
 * Converts a date string into a human-readable relative time label.
 * @example timeAgo("2024-01-01T00:00:00Z") // "3d ago"
 */
export const timeAgo = (dateString: string): string => {
  if (!dateString) return 'Just now';
  const seconds = Math.floor(
    (new Date().getTime() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 0) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

/**
 * Formats a byte count into a human-readable string (e.g. "1.5 MB").
 */
export const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formats a UTC date string to "YYYY-MM-DD HH:mm:ss" format.
 */
export const formatDateUTC = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().replace('T', ' ').substring(0, 19);
};
