'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoColorPaletteOutline, IoSparkles, IoRefreshOutline } from 'react-icons/io5';
import Card from '@/components/ui/Card';
import { extractColors, suggestVibe, type ExtractedColor } from '@/lib/color-extract';

const PHOTO_COUNT_KEY = 'wreath-social-photo-count';
const BRAND_COLORS_KEY = 'wreath-social-brand-colors';
const BRAND_VIBE_KEY = 'wreath-social-brand-vibe';

interface BrandKitProps {
  /** Optional image URLs to analyze. If empty, pulls from localStorage cache. */
  imageUrls?: string[];
}

export default function BrandKit({ imageUrls = [] }: BrandKitProps) {
  const [photoCount, setPhotoCount] = useState(0);
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [vibe, setVibe] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const count = parseInt(localStorage.getItem(PHOTO_COUNT_KEY) || '0', 10);
    setPhotoCount(count);

    const savedColors = localStorage.getItem(BRAND_COLORS_KEY);
    const savedVibe = localStorage.getItem(BRAND_VIBE_KEY);
    if (savedColors) {
      try {
        setColors(JSON.parse(savedColors));
        setVibe(savedVibe || '');
        setRevealed(true);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const analyzeImages = useCallback(async (urls: string[]) => {
    if (urls.length === 0) return;
    setAnalyzing(true);

    try {
      // Collect colors from all images
      const allColors: ExtractedColor[] = [];
      for (const url of urls.slice(0, 5)) {
        try {
          const extracted = await extractColors(url, 5);
          allColors.push(...extracted);
        } catch {
          // Skip failed images
        }
      }

      if (allColors.length === 0) {
        setAnalyzing(false);
        return;
      }

      // Re-cluster all collected colors down to 5-6
      // Simple approach: sort by count, merge similar colors
      const merged = mergeColors(allColors, 6);
      const brandVibe = suggestVibe(merged);

      setColors(merged);
      setVibe(brandVibe);
      setRevealed(true);

      // Save to localStorage
      localStorage.setItem(BRAND_COLORS_KEY, JSON.stringify(merged));
      localStorage.setItem(BRAND_VIBE_KEY, brandVibe);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  // Auto-analyze when new image URLs are provided
  useEffect(() => {
    if (imageUrls.length > 0) {
      analyzeImages(imageUrls);
    }
  }, [imageUrls, analyzeImages]);

  const hasEnoughPhotos = photoCount >= 3 || colors.length > 0;

  // Pre-reveal: placeholder card
  if (!hasEnoughPhotos) {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center shrink-0">
            <IoColorPaletteOutline className="w-5 h-5 text-gold-300" />
          </div>
          <div>
            <h3 className="font-semibold text-brown text-sm">Brand Kit</h3>
            <p className="text-xs text-brown-light mt-0.5 leading-relaxed">
              Upload {3 - photoCount} more photo{3 - photoCount !== 1 ? 's' : ''} to generate your personalized brand colors and style guide.
            </p>
            <div className="flex gap-1 mt-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full border-2 ${
                    i < photoCount
                      ? 'bg-sage-300 border-sage-400'
                      : 'bg-cream-100 border-cream-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IoColorPaletteOutline className="w-5 h-5 text-gold-300" />
          <h3 className="font-semibold text-brown text-sm">Your Brand</h3>
        </div>
        {imageUrls.length > 0 && (
          <button
            onClick={() => analyzeImages(imageUrls)}
            disabled={analyzing}
            className="text-xs text-sage-500 flex items-center gap-1 hover:text-sage-600 transition-colors"
          >
            <IoRefreshOutline className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      {analyzing && !revealed ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <IoSparkles className="w-6 h-6 text-gold-300 animate-pulse" />
          <p className="text-sm text-brown-light">Analyzing your brand colors...</p>
        </div>
      ) : (
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Color palette */}
              <div>
                <p className="text-xs text-brown-light mb-2">Color Palette</p>
                <div className="flex gap-2 items-center">
                  {colors.map((color, i) => (
                    <motion.div
                      key={color.hex}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 15 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-10 h-10 rounded-full shadow-sm border border-white/50"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[9px] text-brown-light font-mono">{color.hex}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Vibe */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs text-brown-light mb-1">Your Vibe</p>
                <p className="text-sm font-semibold text-brown">{vibe}</p>
              </motion.div>

              {/* Sample caption */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-cream-50 rounded-xl p-3 border border-cream-200"
              >
                <p className="text-xs text-brown-light mb-1">Sample caption in your voice</p>
                <p className="text-sm text-brown leading-relaxed italic">
                  &ldquo;Another day, another wreath! This one turned out so pretty with those {vibe.toLowerCase().includes('warm') ? 'warm autumn tones' : vibe.toLowerCase().includes('natural') ? 'natural greenery' : 'beautiful details'}. Would love to make one for your door too!&rdquo;
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Card>
  );
}

/**
 * Merge similar colors together and return the top N.
 */
function mergeColors(colors: ExtractedColor[], targetCount: number): ExtractedColor[] {
  if (colors.length <= targetCount) return colors;

  // Sort by count descending
  const sorted = [...colors].sort((a, b) => b.count - a.count);

  // Greedily pick colors that are sufficiently different
  const result: ExtractedColor[] = [sorted[0]];

  for (let i = 1; i < sorted.length && result.length < targetCount; i++) {
    const candidate = sorted[i];
    const tooClose = result.some((existing) => {
      const dist = Math.sqrt(
        (existing.r - candidate.r) ** 2 +
        (existing.g - candidate.g) ** 2 +
        (existing.b - candidate.b) ** 2
      );
      return dist < 50; // Merge threshold
    });

    if (!tooClose) {
      result.push(candidate);
    }
  }

  return result;
}

/** Utility to increment photo count in localStorage. Call after each upload. */
export function incrementPhotoCount(): number {
  const current = parseInt(localStorage.getItem(PHOTO_COUNT_KEY) || '0', 10);
  const next = current + 1;
  localStorage.setItem(PHOTO_COUNT_KEY, next.toString());
  return next;
}
