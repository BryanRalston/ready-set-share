'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IoGlobeOutline, IoShareOutline, IoOpenOutline, IoDownloadOutline } from 'react-icons/io5';
import { useUser } from '@/lib/user-context';
import { generateLandingHTML } from '@/lib/landing-generator';
import { getPhotos } from '@/lib/photo-library';
import { getConnectedAccounts } from '@/lib/social-accounts';
import { useToast } from '@/components/ui/Toast';

export default function LandingPagePreview() {
  const { businessName, businessDescription, businessType } = useUser();
  const { toast } = useToast();
  const shareTitle = businessName || 'My Business';
  const shareText = businessDescription || 'Check out our quality products!';
  const [downloading, setDownloading] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/landing`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
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

  const handleDownloadHtml = async () => {
    setDownloading(true);
    try {
      let photos: Array<{ base64: string; name?: string }> = [];
      try {
        const allPhotos = await getPhotos();
        photos = allPhotos.slice(0, 6).map((p) => ({
          base64: p.thumbnail || p.base64,
          name: p.name,
        }));
      } catch {
        // IndexedDB unavailable
      }

      const socialAccounts = getConnectedAccounts();
      const socialLinks = socialAccounts
        .filter((a) => a.username)
        .map((a) => ({ platform: a.platform, username: a.username }));

      const html = generateLandingHTML({
        businessName: businessName || 'My Business',
        businessDescription: businessDescription || '',
        businessType: businessType || 'other',
        photos,
        socialLinks,
      });

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const slug = (businessName || 'my-business')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-website.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silent fail
    }
    setDownloading(false);
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <IoGlobeOutline className="w-4 h-4 text-sage-500" />
        <h3 className="font-semibold text-brown text-sm">Your Business Page</h3>
      </div>

      {/* Phone frame mockup */}
      <motion.div
        whileHover={{ rotateY: 5, rotateX: -3 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mx-auto w-40 h-72 rounded-2xl border-4 border-brown/20 bg-cream-50 overflow-hidden shadow-inner mb-4"
        style={{ perspective: 600 }}
      >
        {/* Mini landing page preview */}
        <div className="h-full flex flex-col">
          {/* Hero */}
          <div className="h-24 bg-gradient-to-br from-sage-500 to-sage-300 flex items-center justify-center">
            <div className="text-center">
              <span className="text-2xl block">✨</span>
              <span className="text-[7px] text-white font-semibold">{businessName || 'My Business'}</span>
            </div>
          </div>
          {/* Body */}
          <div className="flex-1 p-2 space-y-1.5">
            <div className="h-1.5 bg-cream-200 rounded-full w-3/4 mx-auto" />
            <div className="h-1 bg-cream-200 rounded-full w-1/2 mx-auto" />
            {/* Mini gallery grid */}
            <div className="grid grid-cols-3 gap-0.5 mt-2">
              {['📸', '✨', '🎨', '💫', '🛍️', '❤️'].map((emoji, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-sm bg-sage-50 flex items-center justify-center text-[8px]"
                >
                  {emoji}
                </div>
              ))}
            </div>
            {/* Mini buttons */}
            <div className="flex gap-1 mt-2 justify-center">
              <div className="h-3 w-12 bg-sage-300 rounded-full" />
              <div className="h-3 w-12 bg-gold-200 rounded-full" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Link href="/landing" className="flex-1">
          <Button variant="primary" size="sm" className="w-full gap-1.5">
            <IoOpenOutline className="w-3.5 h-3.5" />
            View Page
          </Button>
        </Link>
        <Button variant="secondary" size="sm" className="flex-1 gap-1.5" onClick={handleShare}>
          <IoShareOutline className="w-3.5 h-3.5" />
          Share Link
        </Button>
      </div>
      <div className="mt-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-1.5 text-brown-light"
          onClick={handleDownloadHtml}
          loading={downloading}
        >
          <IoDownloadOutline className="w-3.5 h-3.5" />
          {downloading ? 'Generating...' : 'Download as HTML'}
        </Button>
      </div>
    </Card>
  );
}
