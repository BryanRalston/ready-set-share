'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IoSparklesOutline } from 'react-icons/io5';

export default function AnalyticsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
    >
      <Card padding="lg" className="text-center">
        {/* Animated chart icon */}
        <motion.div
          className="w-24 h-24 mx-auto mb-4 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Bar chart bars growing up */}
          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-center gap-1.5 h-16">
            {[0.3, 0.5, 0.4, 0.7, 0.6, 0.9].map((height, i) => (
              <motion.div
                key={i}
                className="w-2.5 rounded-t-sm bg-sage-300"
                initial={{ height: 0 }}
                animate={{ height: `${height * 100}%` }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5, type: 'spring', stiffness: 200 }}
              />
            ))}
          </div>
          {/* Sparkles */}
          <motion.div
            className="absolute top-0 right-2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: 'spring', stiffness: 300 }}
          >
            <IoSparklesOutline className="w-6 h-6 text-gold-300" />
          </motion.div>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg font-semibold text-brown font-[family-name:var(--font-heading)] mb-2"
        >
          Your growth story is just beginning
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-brown-light mb-5 max-w-[260px] mx-auto"
        >
          Create your first post and watch your analytics come to life
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link href="/upload">
            <Button size="md" className="gap-2">
              <IoSparklesOutline className="w-4 h-4" />
              Upload Your First Photo
            </Button>
          </Link>
        </motion.div>
      </Card>
    </motion.div>
  );
}
