// Smart Photo Grouping — analyzes batches of photos and suggests groupings

export interface PhotoInfo {
  id: string;
  file: File;
  previewUrl: string;
  dateModified?: number;
  width?: number;
  height?: number;
  sizeBytes: number;
}

export interface PhotoGroup {
  type: 'carousel' | 'spread' | 'single';
  label: string;
  reason: string;
  photos: PhotoInfo[];
  suggestedDate?: string;
}

export interface GroupingSuggestion {
  groups: PhotoGroup[];
  summary: string;
}

function areSimilarSizes(photos: PhotoInfo[]): boolean {
  if (photos.length < 2) return false;
  const sizes = photos.map(p => p.sizeBytes);
  const avg = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  return sizes.every(s => Math.abs(s - avg) < avg * 0.5);
}

function werePhotosCloseTogether(photos: PhotoInfo[], thresholdMs: number = 300000): boolean {
  // If photos were taken/modified within 5 minutes of each other, they're likely the same wreath
  const dates = photos.map(p => p.dateModified || 0).filter(d => d > 0);
  if (dates.length < 2) return false;
  const sorted = dates.sort((a, b) => a - b);
  return (sorted[sorted.length - 1] - sorted[0]) < thresholdMs;
}

function getSuggestedDates(count: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  // Best days: Tue, Wed, Thu
  const bestDays = [2, 3, 4]; // 0=Sun, 1=Mon...
  let dayOffset = 0;

  while (dates.length < count && dayOffset < 14) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    if (bestDays.includes(date.getDay())) {
      dates.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    }
    dayOffset++;
  }

  return dates;
}

export function suggestGroupings(photos: PhotoInfo[]): GroupingSuggestion {
  if (photos.length === 0) {
    return { groups: [], summary: 'Upload some photos to get grouping suggestions.' };
  }

  if (photos.length === 1) {
    return {
      groups: [{ type: 'single', label: 'Single Post', reason: 'One photo, one great post!', photos }],
      summary: 'Perfect for a single post.',
    };
  }

  const groups: PhotoGroup[] = [];
  const used = new Set<string>();

  // Check if photos were taken close together (same wreath, different angles)
  if (photos.length >= 2 && photos.length <= 5 && werePhotosCloseTogether(photos)) {
    groups.push({
      type: 'carousel',
      label: 'Show Every Angle',
      reason: 'These photos were taken around the same time — perfect for showing this wreath from all sides!',
      photos: [...photos],
    });
    photos.forEach(p => used.add(p.id));
  }

  // Check for similar-sized photos (likely same style/setup)
  if (groups.length === 0 && photos.length >= 3 && areSimilarSizes(photos)) {
    // Split into carousel (first 3-4) and spread the rest
    const carouselPhotos = photos.slice(0, Math.min(4, photos.length));
    const spreadPhotos = photos.slice(carouselPhotos.length);

    groups.push({
      type: 'carousel',
      label: 'Carousel Post',
      reason: 'These photos have a consistent style — they\'ll look great swiped together!',
      photos: carouselPhotos,
    });
    carouselPhotos.forEach(p => used.add(p.id));

    if (spreadPhotos.length > 0) {
      const dates = getSuggestedDates(spreadPhotos.length);
      groups.push({
        type: 'spread',
        label: 'Spread Through the Week',
        reason: 'Save these for variety — spacing out content keeps your feed interesting.',
        photos: spreadPhotos,
        suggestedDate: dates.join(', '),
      });
      spreadPhotos.forEach(p => used.add(p.id));
    }
  }

  // Default: if no smart grouping matched, suggest carousel for 2-5, spread for more
  if (groups.length === 0) {
    if (photos.length <= 5) {
      groups.push({
        type: 'carousel',
        label: 'Carousel Post',
        reason: `${photos.length} photos make a great swipeable carousel! Carousels get 1.4x more reach.`,
        photos: [...photos],
      });
    } else {
      const carousel = photos.slice(0, 4);
      const spread = photos.slice(4);
      const dates = getSuggestedDates(spread.length);

      groups.push({
        type: 'carousel',
        label: 'Best Carousel',
        reason: 'Lead with your strongest 4 photos in a carousel post.',
        photos: carousel,
      });
      groups.push({
        type: 'spread',
        label: 'Spread This Week',
        reason: 'Post these individually across the week for maximum visibility.',
        photos: spread,
        suggestedDate: dates.join(', '),
      });
    }
  }

  const totalGroups = groups.length;
  const totalPhotos = photos.length;
  const summary = totalGroups === 1
    ? `All ${totalPhotos} photos work great together!`
    : `Sorted into ${totalGroups} groups for maximum engagement.`;

  return { groups, summary };
}
