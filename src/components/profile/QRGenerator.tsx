'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getConnectedAccounts } from '@/lib/social-accounts';
import { IoQrCodeOutline, IoDownloadOutline } from 'react-icons/io5';

type LinkOption = 'landing' | 'instagram' | 'pinterest' | 'custom';

const linkOptions: { value: LinkOption; label: string }[] = [
  { value: 'landing', label: 'Landing Page' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'custom', label: 'Custom URL' },
];

export default function QRGenerator() {
  const [selectedLink, setSelectedLink] = useState<LinkOption>('landing');
  const [customUrl, setCustomUrl] = useState('');
  const [printSize, setPrintSize] = useState<'small' | 'large'>('small');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [generated, setGenerated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const accounts = getConnectedAccounts();
  const instagramAccount = accounts.find(a => a.platform === 'instagram');
  const pinterestAccount = accounts.find(a => a.platform === 'pinterest');

  const needsAccountForSelected =
    (selectedLink === 'instagram' && !instagramAccount) ||
    (selectedLink === 'pinterest' && !pinterestAccount);

  const getUrl = useCallback(() => {
    switch (selectedLink) {
      case 'landing':
        return typeof window !== 'undefined' ? `${window.location.origin}/landing` : '/landing';
      case 'instagram':
        return instagramAccount
          ? `https://instagram.com/${instagramAccount.username}`
          : '';
      case 'pinterest':
        return pinterestAccount
          ? `https://pinterest.com/${pinterestAccount.username}`
          : '';
      case 'custom':
        return customUrl || 'https://example.com';
    }
  }, [selectedLink, customUrl, instagramAccount, pinterestAccount]);

  const generateQR = useCallback(async () => {
    const url = getUrl();
    if (!url) {
      setQrDataUrl('');
      setGenerated(false);
      return;
    }
    const size = printSize === 'small' ? 200 : 400;

    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        color: {
          dark: '#6B4F3A',
          light: '#FFFCF7',
        },
        errorCorrectionLevel: 'H', // High — allows center logo
      });
      setQrDataUrl(dataUrl);
      setGenerated(true);
    } catch (err) {
      console.error('QR generation failed', err);
    }
  }, [getUrl, printSize]);

  // Auto-generate on mount and when options change
  useEffect(() => {
    generateQR();
  }, [generateQR]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `wreath-qr-${selectedLink}.png`;
    a.click();
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <IoQrCodeOutline className="w-4 h-4 text-sage-500" />
        <h3 className="font-semibold text-brown text-sm">QR Code</h3>
      </div>

      {/* Link selector */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {linkOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedLink(opt.value)}
            className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors ${
              selectedLink === opt.value
                ? 'bg-sage-500 text-white'
                : 'bg-cream-100 text-brown-light hover:bg-cream-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Custom URL input */}
      {selectedLink === 'custom' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mb-3"
        >
          <input
            type="url"
            placeholder="https://your-url.com"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="w-full text-xs bg-cream-50 border border-cream-200 rounded-lg px-3 py-2 text-brown placeholder:text-brown-light/40 focus:outline-none focus:ring-2 focus:ring-sage-300"
          />
        </motion.div>
      )}

      {/* Missing account message */}
      {needsAccountForSelected && (
        <p className="text-xs text-brown-light mb-3 text-center">
          Add your social media usernames above to generate QR codes
        </p>
      )}

      {/* QR display */}
      <AnimatePresence mode="wait">
        {qrDataUrl && !needsAccountForSelected && (
          <motion.div
            key={qrDataUrl}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col items-center mb-3"
          >
            <div className="relative bg-cream-50 rounded-xl p-4 border border-cream-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="QR Code"
                className={printSize === 'small' ? 'w-36 h-36' : 'w-52 h-52'}
              />
              {/* Center wreath icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 bg-cream-50 rounded-full flex items-center justify-center">
                  <span className="text-lg">🌿</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-brown-light mt-2">Scan to see my wreaths!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Print size toggle */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-brown-light">Size:</span>
          <button
            onClick={() => setPrintSize('small')}
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              printSize === 'small' ? 'bg-sage-500 text-white' : 'bg-cream-100 text-brown-light'
            }`}
          >
            Card
          </button>
          <button
            onClick={() => setPrintSize('large')}
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              printSize === 'large' ? 'bg-sage-500 text-white' : 'bg-cream-100 text-brown-light'
            }`}
          >
            Print
          </button>
        </div>

        <Button variant="secondary" size="sm" className="gap-1.5" onClick={handleDownload}>
          <IoDownloadOutline className="w-3.5 h-3.5" />
          Download
        </Button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
}
