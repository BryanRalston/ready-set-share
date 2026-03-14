'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoSparkles,
  IoShareSocialOutline,
  IoLogoTwitter,
  IoLogoInstagram,
  IoLogoFacebook,
  IoCopyOutline,
  IoCheckmarkCircle,
  IoInformationCircleOutline,
} from 'react-icons/io5';
import { canNativeShare, canShareFiles } from '@/lib/publisher';

// Pinterest doesn't have a logo in io5, use a custom SVG
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

interface ApproveButtonProps {
  onApprove: () => void;
  onPlatformShare: (platform: string) => void;
  loading?: boolean;
  scheduleDate?: string;
}

export default function ApproveButton({
  onApprove,
  onPlatformShare,
  loading,
  scheduleDate,
}: ApproveButtonProps) {
  const isScheduled = !!scheduleDate;
  const webShareAvailable = canNativeShare();
  const fileShareAvailable = canShareFiles();
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const handleCopyOnly = () => {
    onPlatformShare('clipboard');
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  const primaryLabel = isScheduled
    ? 'Schedule Post'
    : 'Share to Social Media';

  return (
    <div className="relative space-y-4">
      {/* How it works */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: 0.1 }}
          >
            <div className="px-4 py-3 rounded-xl bg-cream-50 border border-cream-200">
              <p className="text-xs font-semibold text-brown mb-1.5">How it works</p>
              {webShareAvailable ? (
                <ol className="text-xs text-brown-light space-y-1 list-decimal list-inside">
                  <li>Tap <span className="font-medium text-brown">Share to Social Media</span> below</li>
                  <li>Your caption is copied automatically</li>
                  <li>Pick your app from the share sheet{fileShareAvailable ? ' — your photo is included!' : ''}</li>
                  <li>Paste your caption and post!</li>
                </ol>
              ) : (
                <ol className="text-xs text-brown-light space-y-1 list-decimal list-inside">
                  <li>Tap a <span className="font-medium text-brown">platform button</span> below</li>
                  <li>Your caption is copied to your clipboard</li>
                  <li>The platform opens — paste your caption and post!</li>
                </ol>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary share button */}
      <motion.button
        onClick={onApprove}
        disabled={loading}
        whileTap={!loading ? { scale: 0.92 } : undefined}
        className={`relative z-10 w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-sm ${
          loading
            ? 'bg-sage-400 text-white/80'
            : 'bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 shadow-sage-500/20'
        }`}
      >
        {loading ? (
          <>
            <IoSparkles className="w-5 h-5 animate-pulse" />
            Opening share...
          </>
        ) : (
          <>
            <IoShareSocialOutline className="w-5 h-5" />
            {primaryLabel}
          </>
        )}
      </motion.button>

      {/* Platform-specific share buttons */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <p className="text-xs text-brown-light text-center">
              Or share directly to a platform:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {/* X / Twitter */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onPlatformShare('twitter')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-cream-200 hover:bg-cream-50 transition-colors"
              >
                <IoLogoTwitter className="w-4.5 h-4.5 text-[#1DA1F2]" />
                <span className="text-sm font-medium text-brown">X / Twitter</span>
              </motion.button>

              {/* Instagram */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onPlatformShare('instagram')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-cream-200 hover:bg-cream-50 transition-colors"
              >
                <IoLogoInstagram className="w-4.5 h-4.5 text-[#E4405F]" />
                <span className="text-sm font-medium text-brown">Instagram</span>
              </motion.button>

              {/* Facebook */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onPlatformShare('facebook')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-cream-200 hover:bg-cream-50 transition-colors"
              >
                <IoLogoFacebook className="w-4.5 h-4.5 text-[#1877F2]" />
                <span className="text-sm font-medium text-brown">Facebook</span>
              </motion.button>

              {/* Pinterest */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onPlatformShare('pinterest')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-cream-200 hover:bg-cream-50 transition-colors"
              >
                <PinterestIcon className="w-4 h-4 text-[#BD081C]" />
                <span className="text-sm font-medium text-brown">Pinterest</span>
              </motion.button>
            </div>

            {/* Copy caption fallback */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyOnly}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cream-50 border border-cream-200 hover:bg-cream-100 transition-colors"
            >
              {copiedFeedback ? (
                <>
                  <IoCheckmarkCircle className="w-4 h-4 text-sage-500" />
                  <span className="text-sm font-medium text-sage-600">Copied!</span>
                </>
              ) : (
                <>
                  <IoCopyOutline className="w-4 h-4 text-brown-light" />
                  <span className="text-sm font-medium text-brown-light">Copy Caption Only</span>
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform tip (contextual, shown below) */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-gold-50 border border-gold-200">
              <IoInformationCircleOutline className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
              <p className="text-xs text-brown-light">
                {webShareAvailable ? (
                  <>
                    <span className="font-medium text-brown">Your caption is auto-copied</span> before the share sheet opens, so it&apos;s ready to paste in any app.
                  </>
                ) : (
                  <>
                    <span className="font-medium text-brown">Instagram tip:</span> Instagram can&apos;t pre-fill captions, but your caption will be copied to your clipboard — just paste it!
                  </>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
