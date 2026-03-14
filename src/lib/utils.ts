import { format, formatDistanceToNow } from 'date-fns';

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: Date | string) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Get the Next.js basePath at runtime.
 * Works for both local dev (basePath='') and GitHub Pages (basePath='/ready-set-share').
 */
export function getBasePath(): string {
  if (typeof window === 'undefined') return '';
  try {
    return (window as Record<string, unknown>).__NEXT_DATA__
      ? ((window as Record<string, unknown>).__NEXT_DATA__ as Record<string, string>).basePath || ''
      : '';
  } catch {
    return '';
  }
}

/**
 * Full site URL including basePath (e.g. "https://bryanralston.github.io/ready-set-share").
 */
export function getSiteUrl(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${getBasePath()}`;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}
