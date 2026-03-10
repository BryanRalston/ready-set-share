'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  IoHeartOutline,
  IoChatbubbleOutline,
  IoBookmarkOutline,
  IoStarOutline,
  IoStar,
  IoBarChartOutline,
} from 'react-icons/io5';
import {
  getAverageMetrics,
  getUnloggedEntries,
  getPerformanceLog,
} from '@/lib/performance-log';
import Link from 'next/link';

export default function PostPerformance() {
  const [metrics, setMetrics] = useState<ReturnType<typeof getAverageMetrics> | null>(null);
  const [unloggedCount, setUnloggedCount] = useState(0);
  const [totalLogged, setTotalLogged] = useState(0);

  useEffect(() => {
    const m = getAverageMetrics();
    setMetrics(m);
    setUnloggedCount(getUnloggedEntries().length);
    setTotalLogged(getPerformanceLog().filter(e => e.loggedAt).length);
  }, []);

  if (!metrics) return null;

  const hasLoggedData = totalLogged > 0;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center">
          <IoBarChartOutline className="w-4 h-4 text-brown" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-brown font-[family-name:var(--font-heading)]">
            Post Performance
          </h3>
          <p className="text-[10px] text-brown-light">
            {totalLogged} post{totalLogged !== 1 ? 's' : ''} logged
          </p>
        </div>
      </div>

      {hasLoggedData ? (
        <>
          {/* Average metrics */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center bg-cream-50 rounded-xl p-3">
              <IoHeartOutline className="w-4 h-4 text-sage-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-brown">{metrics.avgLikes}</p>
              <p className="text-[10px] text-brown-light">Avg Likes</p>
            </div>
            <div className="text-center bg-cream-50 rounded-xl p-3">
              <IoChatbubbleOutline className="w-4 h-4 text-sage-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-brown">{metrics.avgComments}</p>
              <p className="text-[10px] text-brown-light">Avg Comments</p>
            </div>
            <div className="text-center bg-cream-50 rounded-xl p-3">
              <IoBookmarkOutline className="w-4 h-4 text-sage-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-brown">{metrics.avgSaves}</p>
              <p className="text-[10px] text-brown-light">Avg Saves</p>
            </div>
          </div>

          {/* Top rated post */}
          {metrics.topRated && metrics.topRated.rating && (
            <div className="bg-sage-50 rounded-xl p-3 mb-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <IoStarOutline className="w-3.5 h-3.5 text-sage-600" />
                <span className="text-[10px] font-medium text-sage-600">Top Rated Post</span>
              </div>
              <p className="text-xs text-brown line-clamp-2 mb-1.5">
                {metrics.topRated.caption}
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-gold-300">
                    {star <= (metrics.topRated?.rating || 0) ? (
                      <IoStar className="w-3 h-3" />
                    ) : (
                      <IoStarOutline className="w-3 h-3" />
                    )}
                  </span>
                ))}
                <span className="text-[10px] text-brown-light ml-1">
                  on {metrics.topRated.platform}
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <IoBarChartOutline className="w-8 h-8 text-cream-200 mx-auto mb-2" />
          <p className="text-xs text-brown-light mb-1">No performance data yet</p>
          <p className="text-[10px] text-brown-light/60">
            Log your post results to see trends here
          </p>
        </div>
      )}

      {/* CTA for unlogged entries */}
      {unloggedCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3"
        >
          <Link href="/">
            <Button variant="secondary" size="sm" className="w-full text-xs">
              Log {unloggedCount} post result{unloggedCount !== 1 ? 's' : ''}
            </Button>
          </Link>
        </motion.div>
      )}
    </Card>
  );
}
