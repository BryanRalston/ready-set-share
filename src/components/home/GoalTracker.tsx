'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import {
  IoFlagOutline,
  IoCheckmarkCircle,
  IoTrophyOutline,
} from 'react-icons/io5';
import {
  getGoal,
  setWeeklyTarget,
  isGoalMet,
  getGoalProgress,
  type PostingGoal,
} from '@/lib/goals';

export default function GoalTracker() {
  const [goal, setGoal] = useState<PostingGoal | null>(null);
  const [progress, setProgress] = useState(0);
  const [met, setMet] = useState(false);
  const [editing, setEditing] = useState(false);

  const refresh = useCallback(() => {
    const g = getGoal();
    setGoal(g);
    setProgress(getGoalProgress());
    setMet(isGoalMet());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleTargetChange = (newTarget: number) => {
    setWeeklyTarget(newTarget);
    refresh();
    setEditing(false);
  };

  if (!goal) return null;

  const dots = Array.from({ length: goal.weeklyTarget }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center">
              {met ? (
                <IoCheckmarkCircle className="w-4 h-4 text-sage-600" />
              ) : (
                <IoFlagOutline className="w-4 h-4 text-sage-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-brown font-[family-name:var(--font-heading)]">
                Weekly Goal
              </h3>
              {met ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-sage-600 font-medium"
                >
                  Goal reached!
                </motion.p>
              ) : (
                <p className="text-[10px] text-brown-light">
                  {goal.postsThisWeek} of {goal.weeklyTarget} posts
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="text-[10px] text-sage-500 font-medium hover:text-sage-600 transition-colors px-1"
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>

        {/* Edit target picker */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-3"
            >
              <p className="text-[10px] text-brown-light mb-2">Posts per week:</p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleTargetChange(n)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                      n === goal.weeklyTarget
                        ? 'bg-sage-500 text-white'
                        : 'bg-cream-100 text-brown hover:bg-cream-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
          {dots.map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8 }}
              animate={{
                scale: i < goal.postsThisWeek ? 1 : 0.8,
                backgroundColor:
                  i < goal.postsThisWeek
                    ? 'var(--color-sage-500, #7C9A6E)'
                    : 'var(--color-cream-200, #E8E0D4)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.05 }}
              className="w-5 h-5 rounded-full flex items-center justify-center"
            >
              {i < goal.postsThisWeek && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, delay: i * 0.05 + 0.1 }}
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                >
                  <path
                    d="M2 5L4.5 7.5L8 3"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              )}
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.2 }}
            className={`h-full rounded-full ${
              met ? 'bg-sage-500' : 'bg-sage-400'
            }`}
          />
        </div>

        {/* Streak display */}
        {goal.streakWeeks > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 mt-2.5"
          >
            <IoTrophyOutline className="w-3.5 h-3.5 text-gold-300" />
            <span className="text-[10px] text-brown-light font-medium">
              {goal.streakWeeks} weeks in a row!
            </span>
            {goal.bestStreak > goal.streakWeeks && (
              <span className="text-[10px] text-brown-light/60 ml-auto">
                Best: {goal.bestStreak}
              </span>
            )}
          </motion.div>
        )}

        {/* Celebration state */}
        <AnimatePresence>
          {met && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-2.5 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center gap-1.5 bg-sage-50 text-sage-600 text-xs font-medium px-3 py-1.5 rounded-full"
              >
                <IoCheckmarkCircle className="w-3.5 h-3.5" />
                Weekly goal complete!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
