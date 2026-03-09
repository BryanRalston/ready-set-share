'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getRandomIdea, type ContentIdea as ContentIdeaType } from '@/lib/content-ideas';
import { IoSparklesOutline, IoRefreshOutline } from 'react-icons/io5';

// Fixed initial idea to avoid hydration mismatch (Math.random differs server vs client)
const INITIAL_IDEA: ContentIdeaType = { idea: 'Show a close-up detail shot of your latest product', type: 'product' };

export default function ContentIdea() {
  const [idea, setIdea] = useState<ContentIdeaType>(INITIAL_IDEA);
  const [isSpinning, setIsSpinning] = useState(false);

  // Randomize on mount (client-side only)
  useEffect(() => {
    setIdea(getRandomIdea());
  }, []);

  const handleNewIdea = useCallback(() => {
    setIsSpinning(true);
    // Small delay for visual feedback
    setTimeout(() => {
      setIdea(getRandomIdea());
      setIsSpinning(false);
    }, 300);
  }, []);

  const typeBadgeLabels: Record<string, string> = {
    'product': 'Product',
    'behind-scenes': 'Behind the Scenes',
    'educational': 'Educational',
    'seasonal': 'Seasonal',
    'engagement': 'Engagement',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card className="bg-cream-50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center shrink-0">
            <IoSparklesOutline className="w-5 h-5 text-sage-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-semibold text-brown text-sm font-[family-name:var(--font-heading)]">
                What should I post today?
              </h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleNewIdea}
                className="w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center text-sage-500 hover:bg-sage-200 transition-colors shrink-0"
                aria-label="New idea"
              >
                <motion.div
                  animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <IoRefreshOutline className="w-3.5 h-3.5" />
                </motion.div>
              </motion.button>
            </div>
            <motion.p
              key={idea.idea}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-xs text-brown-light leading-relaxed mb-2"
            >
              {idea.idea}
            </motion.p>
            <Badge variant="sage" className="text-[10px]">
              {typeBadgeLabels[idea.type] || idea.type}
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
