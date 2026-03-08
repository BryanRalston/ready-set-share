'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { IoLogoInstagram, IoLogoPinterest } from 'react-icons/io5';

const MOCK_PHOTOS = [
  { id: 1, emoji: '🌿', label: 'Spring Wreath' },
  { id: 2, emoji: '🌸', label: 'Cherry Blossom' },
  { id: 3, emoji: '🍂', label: 'Fall Harvest' },
  { id: 4, emoji: '🎄', label: 'Holiday Classic' },
  { id: 5, emoji: '🌻', label: 'Sunflower' },
  { id: 6, emoji: '🌹', label: 'Rose Garden' },
  { id: 7, emoji: '🍁', label: 'Autumn Leaves' },
  { id: 8, emoji: '🪻', label: 'Lavender Dreams' },
  { id: 9, emoji: '🌾', label: 'Wheat & Sage' },
];

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

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  const businessName = 'Sarah\'s Custom Wreaths';

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero */}
      <div ref={heroRef} className="relative h-[70vh] overflow-hidden">
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 bg-gradient-to-br from-sage-500 via-sage-400 to-sage-300"
        >
          {/* Decorative wreaths */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span className="text-[200px]">🌿</span>
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
            <span className="text-6xl mb-4 block">🌿</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-heading)] mb-3"
          >
            {businessName}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-sage-100 text-base max-w-sm"
          >
            Handcrafted wreaths for every season, made with love and natural materials
          </motion.p>
        </motion.div>
      </div>

      {/* About */}
      <div className="max-w-md mx-auto px-6 py-12">
        <FadeInOnScroll>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)] mb-3">
              About My Wreaths
            </h2>
            <p className="text-sm text-brown-light leading-relaxed">
              Every wreath is a unique creation, handcrafted with carefully sourced materials.
              From seasonal door wreaths to custom centerpieces, each piece brings warmth
              and natural beauty to your home. I love combining traditional wreath-making
              techniques with fresh, modern designs.
            </p>
          </div>
        </FadeInOnScroll>

        {/* Gallery */}
        <FadeInOnScroll>
          <h2 className="text-xl font-bold text-brown font-[family-name:var(--font-heading)] text-center mb-5">
            Recent Creations
          </h2>
        </FadeInOnScroll>
        <div className="grid grid-cols-3 gap-2 mb-12">
          {MOCK_PHOTOS.map((photo, i) => (
            <FadeInOnScroll key={photo.id} delay={i * 0.05}>
              <div className="aspect-square rounded-xl bg-gradient-to-br from-cream-200 to-sage-50 flex flex-col items-center justify-center gap-1 border border-cream-200">
                <span className="text-3xl">{photo.emoji}</span>
                <span className="text-[8px] text-brown-light">{photo.label}</span>
              </div>
            </FadeInOnScroll>
          ))}
        </div>

        {/* Contact */}
        <FadeInOnScroll>
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-xl font-bold text-brown font-[family-name:var(--font-heading)]">
              Get In Touch
            </h2>
            <p className="text-sm text-brown-light">
              Custom orders welcome! Reach out on social media.
            </p>
            <div className="flex items-center justify-center gap-3">
              <motion.a
                whileTap={{ scale: 0.95 }}
                href="#"
                className="flex items-center gap-2 bg-sage-500 text-white rounded-full px-5 py-2.5 text-sm font-medium shadow-sm"
              >
                <IoLogoInstagram className="w-4 h-4" />
                Instagram
              </motion.a>
              <motion.a
                whileTap={{ scale: 0.95 }}
                href="#"
                className="flex items-center gap-2 bg-gold-300 text-white rounded-full px-5 py-2.5 text-sm font-medium shadow-sm"
              >
                <IoLogoPinterest className="w-4 h-4" />
                Pinterest
              </motion.a>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Footer */}
        <FadeInOnScroll>
          <div className="text-center py-6 border-t border-cream-200">
            <p className="text-[10px] text-brown-light/60">
              Made with 💚 using Wreath Social
            </p>
          </div>
        </FadeInOnScroll>
      </div>
    </div>
  );
}
