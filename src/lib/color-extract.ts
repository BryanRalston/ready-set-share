/**
 * Color extraction utility using Canvas API and simplified k-means clustering.
 * No external dependencies.
 */

export interface ExtractedColor {
  hex: string;
  r: number;
  g: number;
  b: number;
  count: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
    (a[1] - b[1]) ** 2 +
    (a[2] - b[2]) ** 2
  );
}

/**
 * Simple k-means clustering for RGB colors.
 * Runs for a fixed number of iterations.
 */
function kMeans(
  pixels: [number, number, number][],
  k: number,
  iterations: number = 10
): [number, number, number][] {
  // Initialize centroids by evenly spacing through the pixel array
  const step = Math.floor(pixels.length / k);
  const centroids: [number, number, number][] = [];
  for (let i = 0; i < k; i++) {
    centroids.push([...pixels[i * step]]);
  }

  for (let iter = 0; iter < iterations; iter++) {
    // Assign pixels to nearest centroid
    const clusters: [number, number, number][][] = centroids.map(() => []);

    for (const pixel of pixels) {
      let minDist = Infinity;
      let closest = 0;
      for (let c = 0; c < centroids.length; c++) {
        const dist = colorDistance(pixel, centroids[c]);
        if (dist < minDist) {
          minDist = dist;
          closest = c;
        }
      }
      clusters[closest].push(pixel);
    }

    // Update centroids
    for (let c = 0; c < centroids.length; c++) {
      if (clusters[c].length === 0) continue;
      const sum = [0, 0, 0];
      for (const pixel of clusters[c]) {
        sum[0] += pixel[0];
        sum[1] += pixel[1];
        sum[2] += pixel[2];
      }
      centroids[c] = [
        Math.round(sum[0] / clusters[c].length),
        Math.round(sum[1] / clusters[c].length),
        Math.round(sum[2] / clusters[c].length),
      ];
    }
  }

  return centroids;
}

/**
 * Extracts the top `count` dominant colors from an image URL or base64 string.
 * Uses Canvas API to sample pixels, then k-means clustering.
 */
export function extractColors(
  imageSrc: string,
  count: number = 5
): Promise<ExtractedColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Sample at a smaller size for performance
      const sampleSize = 100;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imageData.data;

      // Collect pixels, skip very dark and very light (near-white/black)
      const pixels: [number, number, number][] = [];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        // Skip transparent, near-black, and near-white pixels
        if (a < 128) continue;
        const brightness = (r + g + b) / 3;
        if (brightness < 20 || brightness > 235) continue;
        pixels.push([r, g, b]);
      }

      if (pixels.length < count) {
        // Not enough distinct pixels, return what we have
        const seen = new Set<string>();
        const results: ExtractedColor[] = [];
        for (const [r, g, b] of pixels) {
          const hex = rgbToHex(r, g, b);
          if (!seen.has(hex)) {
            seen.add(hex);
            results.push({ hex, r, g, b, count: 1 });
          }
        }
        resolve(results.slice(0, count));
        return;
      }

      // Run k-means
      const centroids = kMeans(pixels, count, 15);

      // Count assignments for each centroid to determine dominance
      const counts = new Array(centroids.length).fill(0);
      for (const pixel of pixels) {
        let minDist = Infinity;
        let closest = 0;
        for (let c = 0; c < centroids.length; c++) {
          const dist = colorDistance(pixel, centroids[c]);
          if (dist < minDist) {
            minDist = dist;
            closest = c;
          }
        }
        counts[closest]++;
      }

      // Build result sorted by dominance (most pixels first)
      const results: ExtractedColor[] = centroids.map((c, i) => ({
        hex: rgbToHex(c[0], c[1], c[2]),
        r: c[0],
        g: c[1],
        b: c[2],
        count: counts[i],
      }));

      results.sort((a, b) => b.count - a.count);
      resolve(results);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}

/**
 * Given extracted colors, suggest a brand vibe/tone.
 */
export function suggestVibe(colors: ExtractedColor[]): string {
  if (colors.length === 0) return 'Natural & Simple';

  let totalWarmth = 0;
  let totalSaturation = 0;
  let totalBrightness = 0;

  for (const color of colors) {
    // Warmth: reds/oranges are warm, blues are cool
    totalWarmth += (color.r - color.b) / 255;
    // Simple saturation estimate
    const max = Math.max(color.r, color.g, color.b);
    const min = Math.min(color.r, color.g, color.b);
    totalSaturation += max > 0 ? (max - min) / max : 0;
    totalBrightness += (color.r + color.g + color.b) / (3 * 255);
  }

  const avgWarmth = totalWarmth / colors.length;
  const avgSaturation = totalSaturation / colors.length;
  const avgBrightness = totalBrightness / colors.length;

  // Check for specific dominant color characteristics
  const hasGreen = colors.some(c => c.g > c.r && c.g > c.b && c.g > 100);
  const hasRed = colors.some(c => c.r > c.g * 1.3 && c.r > c.b * 1.3);

  if (hasGreen && avgWarmth < 0.1) return 'Natural & Earthy';
  if (hasRed && avgWarmth > 0.2) return 'Warm & Festive';
  if (avgBrightness > 0.7 && avgSaturation < 0.3) return 'Light & Airy';
  if (avgBrightness < 0.4) return 'Moody & Dramatic';
  if (avgWarmth > 0.15 && avgSaturation > 0.3) return 'Warm & Rustic';
  if (avgWarmth < -0.05) return 'Cool & Modern';
  if (avgSaturation > 0.5) return 'Bold & Vibrant';
  if (avgSaturation < 0.2) return 'Soft & Neutral';
  return 'Warm & Inviting';
}
