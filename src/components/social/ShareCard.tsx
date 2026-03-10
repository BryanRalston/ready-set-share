'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IoShareOutline } from 'react-icons/io5';
import { useToast } from '@/components/ui/Toast';

export default function ShareCard() {
  const [flipped, setFlipped] = useState(false);
  const { toast } = useToast();

  const generateShareImage = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      // Sage gradient background
      const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
      gradient.addColorStop(0, '#7C9A6E');
      gradient.addColorStop(0.5, '#8fb284');
      gradient.addColorStop(1, '#A8C5A0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 630);

      // App icon
      ctx.font = '80px serif';
      ctx.textAlign = 'center';
      ctx.fillText('📱✨📱', 600, 200);

      // Title
      ctx.fillStyle = '#FFFCF7';
      ctx.font = 'bold 56px serif';
      ctx.fillText('Ready Set Share', 600, 320);

      // Subtitle
      ctx.font = '28px sans-serif';
      ctx.fillStyle = '#FFFCF7DD';
      ctx.fillText('AI-powered content management for small businesses', 600, 380);

      // URL
      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#FFFCF770';
      ctx.fillText('readysetshare.app', 600, 560);

      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }, []);

  const handleShare = async () => {
    setFlipped(true);

    const url = window.location.origin;

    if (navigator.share) {
      try {
        const blob = await generateShareImage();
        if (blob) {
          const file = new File([blob], 'readysetshare-share.png', { type: 'image/png' });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({
              title: 'Ready Set Share',
              text: 'AI-powered content management for small businesses',
              url,
              files: [file],
            });
            return;
          }
        }
        await navigator.share({
          title: 'Ready Set Share',
          text: 'AI-powered content management for small businesses',
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast('Link copied!', 'success');
    }
  };

  return (
    <div style={{ perspective: 800 }}>
      <AnimatePresence mode="wait">
        {!flipped ? (
          <motion.div
            key="front"
            initial={{ opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <div className="text-center py-2">
                <div className="text-3xl mb-2">📱✨</div>
                <h3 className="text-sm font-semibold text-brown mb-1">Share Ready Set Share</h3>
                <p className="text-[10px] text-brown-light mb-3">
                  Know a small business owner? Share the love!
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleShare}
                >
                  <IoShareOutline className="w-3.5 h-3.5" />
                  Share
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden">
              {/* OG preview mockup */}
              <div className="bg-gradient-to-r from-sage-500 to-sage-300 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">📱✨</div>
                <h3 className="text-white font-bold text-lg font-[family-name:var(--font-heading)]">
                  Ready Set Share
                </h3>
                <p className="text-sage-100 text-[10px] mt-1">
                  AI-powered content management for small businesses
                </p>
              </div>
              <div className="mt-3 text-center">
                <button
                  onClick={() => setFlipped(false)}
                  className="text-[10px] text-brown-light hover:text-sage-500 transition-colors"
                >
                  Back
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
