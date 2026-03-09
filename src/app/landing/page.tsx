'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { IoLogoInstagram, IoLogoPinterest, IoLogoFacebook, IoImageOutline } from 'react-icons/io5';
import { useUser } from '@/lib/user-context';
import { getDrafts, type PostDraft } from '@/lib/publisher';
import { getConnectedAccounts, type ConnectedAccount } from '@/lib/social-accounts';
import { getPhotos, type LibraryPhoto } from '@/lib/photo-library';
import { getBusinessTypeInfo, type BusinessType } from '@/lib/business-profile';

function FadeInOnScroll({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

const PLATFORM_CONFIG: Record<string, { icon: typeof IoLogoInstagram; urlPrefix: string; color: string; label: string }> = {
  instagram: {
    icon: IoLogoInstagram,
    urlPrefix: 'https://instagram.com/',
    color: 'bg-sage-500',
    label: 'Instagram',
  },
  pinterest: {
    icon: IoLogoPinterest,
    urlPrefix: 'https://pinterest.com/',
    color: 'bg-gold-300',
    label: 'Pinterest',
  },
  facebook: {
    icon: IoLogoFacebook,
    urlPrefix: 'https://facebook.com/',
    color: 'bg-blue-500',
    label: 'Facebook',
  },
};

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  const { displayName, businessName: userBusinessName, businessDescription, businessType } = useUser();
  const [libraryPhotos, setLibraryPhotos] = useState<LibraryPhoto[]>([]);
  const [draftPhotos, setDraftPhotos] = useState<PostDraft[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<ConnectedAccount[]>([]);
  const [mounted, setMounted] = useState(false);

  const typeInfo = businessType ? getBusinessTypeInfo(businessType as BusinessType) : null;
  const heroEmoji = typeInfo?.emoji || '🛍️';

  useEffect(() => {
    // Load photos from IndexedDB library first
    getPhotos()
      .then((photos) => setLibraryPhotos(photos))
      .catch(() => {
        // IndexedDB unavailable — fall through to drafts
      });

    // Load drafts that have images as fallback
    const allDrafts = getDrafts();
    const withImages = allDrafts.filter(d => d.imageUrl || d.imageBase64);
    setDraftPhotos(withImages);

    // Load connected social accounts
    setSocialAccounts(getConnectedAccounts());
    setMounted(true);
  }, []);

  // Use library photos if available, otherwise fall back to draft images
  const hasLibraryPhotos = libraryPhotos.length > 0;
  const hasDraftPhotos = draftPhotos.length > 0;
  const hasPhotos = hasLibraryPhotos || hasDraftPhotos;

  // Determine the display name for the hero
  const heroName = userBusinessName
    || (displayName && displayName !== 'there' ? displayName : '')
    || 'My Business';

  // Determine the subtitle
  const heroSubtitle = businessDescription
    || 'Quality products crafted with care. Every piece is made with attention to detail and love for the craft.';

  // About section text
  const aboutText = businessDescription
    || 'Quality products crafted with care. Every piece is made with attention to detail and love for the craft.';

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero */}
      <div ref={heroRef} className="relative h-[70vh] overflow-hidden">
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 bg-gradient-to-br from-sage-500 via-sage-400 to-sage-300"
        >
          {/* Decorative icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span className="text-[200px]">{heroEmoji}</span>
          </div>
        </motion.div>
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <span className="text-6xl mb-4 block">{heroEmoji}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-heading)] mb-3"
          >
            {heroName}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-sage-100 text-base max-w-sm"
          >
            {heroSubtitle}
          </motion.p>
        </motion.div>
      </div>

      {/* About */}
      <div className="max-w-md mx-auto px-6 py-12">
        <FadeInOnScroll>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)] mb-3">
              About
            </h2>
            <p className="text-sm text-brown-light leading-relaxed">
              {aboutText}
            </p>
          </div>
        </FadeInOnScroll>

        {/* Gallery */}
        <FadeInOnScroll>
          <h2 className="text-xl font-bold text-brown font-[family-name:var(--font-heading)] text-center mb-5">
            Recent Creations
          </h2>
        </FadeInOnScroll>

        {mounted && hasPhotos ? (
          <div className="grid grid-cols-3 gap-2 mb-12">
            {hasLibraryPhotos
              ? libraryPhotos.slice(0, 9).map((photo, i) => (
                  <FadeInOnScroll key={photo.id} delay={i * 0.05}>
                    <div className="aspect-square rounded-xl overflow-hidden border border-cream-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumbnail || photo.base64}
                        alt={photo.name || 'Product photo'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </FadeInOnScroll>
                ))
              : draftPhotos.slice(0, 9).map((draft, i) => (
                  <FadeInOnScroll key={draft.id} delay={i * 0.05}>
                    <div className="aspect-square rounded-xl overflow-hidden border border-cream-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={draft.imageUrl || draft.imageBase64 || ''}
                        alt={draft.caption ? draft.caption.slice(0, 60) : 'Product photo'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </FadeInOnScroll>
                ))}
          </div>
        ) : mounted ? (
          <FadeInOnScroll>
            <div className="flex flex-col items-center justify-center py-12 mb-12 rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50/50">
              <IoImageOutline className="w-10 h-10 text-sage-300 mb-3" />
              <p className="text-sm text-brown-light text-center max-w-[240px]">
                Upload your first photo to build your gallery!
              </p>
            </div>
          </FadeInOnScroll>
        ) : (
          /* Skeleton while loading */
          <div className="grid grid-cols-3 gap-2 mb-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-cream-200 animate-pulse" />
            ))}
          </div>
        )}

        {/* Contact / Social Links — only show if there are connected accounts with usernames */}
        {mounted && socialAccounts.filter(a => a.username).length > 0 && (
          <FadeInOnScroll>
            <div className="text-center space-y-3 mb-10">
              <h2 className="text-xl font-bold text-brown font-[family-name:var(--font-heading)]">
                Get In Touch
              </h2>
              <p className="text-sm text-brown-light">
                Custom orders welcome! Reach out on social media.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {socialAccounts.map((account) => {
                  const config = PLATFORM_CONFIG[account.platform];
                  if (!config || !account.username) return null;
                  const Icon = config.icon;
                  const href = `${config.urlPrefix}${account.username}`;
                  return (
                    <motion.a
                      key={account.platform}
                      whileTap={{ scale: 0.95 }}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 ${config.color} text-white rounded-full px-5 py-2.5 text-sm font-medium shadow-sm`}
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </FadeInOnScroll>
        )}

        {/* Footer */}
        <FadeInOnScroll>
          <div className="text-center py-6 border-t border-cream-200">
            <p className="text-[10px] text-brown-light/60">
              Made with PostCraft
            </p>
          </div>
        </FadeInOnScroll>
      </div>
    </div>
  );
}
