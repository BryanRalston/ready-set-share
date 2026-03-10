'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoDownloadOutline, IoTextOutline, IoSparkles } from 'react-icons/io5';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface StoryCreatorProps {
  imageUrl: string;
}

const TEXT_OPTIONS = [
  { label: 'New Product!', emoji: '' },
  { label: 'Just Listed', emoji: '' },
  { label: 'Custom Order? DM me!', emoji: '' },
  { label: 'Custom...', emoji: '' },
];

export default function StoryCreator({ imageUrl }: StoryCreatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedText, setSelectedText] = useState(0);
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [rendered, setRendered] = useState(false);

  const overlayText = selectedText === 3 && customText
    ? customText
    : TEXT_OPTIONS[selectedText]?.label || '';

  const renderStory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Story dimensions (9:16)
    canvas.width = 1080;
    canvas.height = 1920;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Fill background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate crop to fill (cover behavior)
      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;

      let drawWidth: number, drawHeight: number, sx: number, sy: number;
      if (imgRatio > canvasRatio) {
        drawHeight = img.height;
        drawWidth = img.height * canvasRatio;
        sx = (img.width - drawWidth) / 2;
        sy = 0;
      } else {
        drawWidth = img.width;
        drawHeight = img.width / canvasRatio;
        sx = 0;
        sy = (img.height - drawHeight) / 2;
      }

      ctx.drawImage(img, sx, sy, drawWidth, drawHeight, 0, 0, canvas.width, canvas.height);

      // Gradient overlay at bottom for text readability
      const gradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw text if selected
      if (overlayText && selectedText < 3 || (selectedText === 3 && customText)) {
        const displayText = selectedText === 3 ? customText : TEXT_OPTIONS[selectedText].label;
        const emoji = TEXT_OPTIONS[selectedText].emoji;
        const fullText = emoji ? `${displayText} ${emoji}` : displayText;

        ctx.save();
        ctx.font = 'bold 64px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Text shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = 'white';
        ctx.fillText(fullText, canvas.width / 2, canvas.height * 0.78);
        ctx.restore();
      }

      setRendered(true);
    };
    img.src = imageUrl;
  }, [imageUrl, overlayText, selectedText, customText]);

  useEffect(() => {
    renderStory();
  }, [renderStory]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'readysetshare-story.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <IoSparkles className="w-4 h-4 text-gold-300" />
          <h3 className="font-semibold text-brown text-sm">Instagram Story</h3>
        </div>

        {/* Preview */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={rendered ? { scale: 1, opacity: 1 } : {}}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative mx-auto rounded-2xl overflow-hidden shadow-md"
          style={{ maxWidth: 240 }}
        >
          <canvas
            ref={canvasRef}
            className="w-full"
            style={{ aspectRatio: '9/16' }}
          />
        </motion.div>

        {/* Text options */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5 mb-2">
            <IoTextOutline className="w-4 h-4 text-brown-light" />
            <p className="text-xs text-brown-light">Text overlay</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEXT_OPTIONS.map((option, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => {
                  setSelectedText(i);
                  setShowCustomInput(i === 3);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selectedText === i
                    ? 'bg-sage-500 text-white border-sage-500'
                    : 'bg-cream-50 text-brown border-cream-200 hover:border-sage-300'
                }`}
              >
                {option.label} {option.emoji}
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {showCustomInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Your custom text..."
                  maxLength={40}
                  className="mt-2 w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-2.5 text-sm text-brown placeholder:text-brown-light/40 focus:outline-none focus:ring-2 focus:ring-sage-300"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Download */}
        <Button
          size="md"
          className="w-full mt-4 gap-2"
          onClick={handleDownload}
          disabled={!rendered}
        >
          <IoDownloadOutline className="w-4 h-4" />
          Save to Photos
        </Button>
      </Card>
    </motion.div>
  );
}
