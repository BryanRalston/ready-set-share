'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IoChevronBackOutline, IoChevronForwardOutline, IoCameraOutline } from 'react-icons/io5';
import Link from 'next/link';
import BestTimes from '@/components/calendar/BestTimes';
import { getDrafts, type PostDraft } from '@/lib/publisher';

interface CalendarPost {
  id: string;
  date: string;
  caption: string;
  platform: string;
}

function draftsToCalendarPosts(drafts: PostDraft[]): CalendarPost[] {
  const posts: CalendarPost[] = [];
  for (const draft of drafts) {
    if (!draft.scheduledFor) continue;
    // Create one entry per platform (or a single "draft" entry if no platforms)
    const platforms = draft.platforms.length > 0 ? draft.platforms : ['draft'];
    for (const platform of platforms) {
      posts.push({
        id: draft.id,
        date: draft.scheduledFor,
        caption: draft.caption,
        platform,
      });
    }
  }
  return posts;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState(0);
  const [drafts, setDrafts] = useState<PostDraft[]>([]);

  useEffect(() => {
    setDrafts(getDrafts());
  }, []);

  const scheduledPosts = useMemo(() => draftsToCalendarPosts(drafts), [drafts]);
  const unscheduledDrafts = useMemo(() => drafts.filter((d) => !d.scheduledFor), [drafts]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart, calendarEnd]
  );

  const postsForDate = (date: Date) =>
    scheduledPosts.filter((p) => isSameDay(new Date(p.date), date));

  const selectedPosts = selectedDate ? postsForDate(selectedDate) : [];

  const goToPrevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  return (
    <AppShell title="Calendar">
      <div className="space-y-4">
        {/* Month header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={goToPrevMonth}
            className="w-9 h-9 rounded-full bg-white border border-cream-200 flex items-center justify-center text-brown-light hover:text-sage-500 transition-colors"
          >
            <IoChevronBackOutline size={18} />
          </button>
          <h2 className="text-lg font-bold text-brown font-[family-name:var(--font-heading)]">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={goToNextMonth}
            className="w-9 h-9 rounded-full bg-white border border-cream-200 flex items-center justify-center text-brown-light hover:text-sage-500 transition-colors"
          >
            <IoChevronForwardOutline size={18} />
          </button>
        </motion.div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-[10px] font-medium text-brown-light py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={format(currentMonth, 'yyyy-MM')}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-7 gap-1"
          >
            {days.map((day) => {
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const selected = selectedDate && isSameDay(day, selectedDate);
              const hasPosts = postsForDate(day).length > 0;

              return (
                <motion.button
                  key={day.toISOString()}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedDate(day)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all ${
                    selected
                      ? 'bg-sage-500 text-white shadow-sm'
                      : today
                      ? 'bg-sage-50 text-sage-600 font-semibold'
                      : inMonth
                      ? 'text-brown hover:bg-cream-200'
                      : 'text-brown-light/30'
                  }`}
                >
                  {format(day, 'd')}
                  {hasPosts && (
                    <div
                      className={`absolute bottom-1 w-1 h-1 rounded-full ${
                        selected ? 'bg-white' : 'bg-sage-400'
                      }`}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Selected day posts */}
        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-3"
            >
              <h3 className="font-semibold text-brown text-sm">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
              {selectedPosts.length > 0 ? (
                selectedPosts.map((post) => (
                  <Link key={post.id} href={`/post/${post.id}`}>
                    <Card className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cream-200 flex items-center justify-center text-lg">
                        📸
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-brown line-clamp-1">{post.caption}</p>
                        <span className="text-[10px] bg-sage-50 text-sage-600 px-2 py-0.5 rounded-full">
                          {post.platform}
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card padding="lg" className="text-center">
                  <IoCameraOutline className="w-8 h-8 text-sage-300 mx-auto mb-2" />
                  <p className="text-sm text-brown-light mb-3">No posts scheduled for this day</p>
                  <Link href="/upload">
                    <Button size="sm">Upload a Photo</Button>
                  </Link>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Best Times heatmap */}
        <BestTimes />

        {/* Unscheduled drafts section */}
        {unscheduledDrafts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="font-semibold text-brown text-sm font-[family-name:var(--font-heading)]">
              Unscheduled Drafts
            </h3>
            {unscheduledDrafts.map((draft) => (
              <Link key={draft.id} href={`/post/${draft.id}`}>
                <Card className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cream-200 flex items-center justify-center text-lg">
                    📝
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-brown line-clamp-1">{draft.caption}</p>
                    <span className="text-[10px] bg-cream-100 text-brown-light px-2 py-0.5 rounded-full">
                      No date set
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </motion.div>
        )}

        {/* Empty state when no date selected and no drafts at all */}
        {!selectedDate && drafts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card padding="lg" className="text-center">
              {/* Calendar with sparkles */}
              <div className="w-20 h-20 mx-auto mb-3 relative">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl bg-sage-50 flex items-center justify-center mx-auto"
                >
                  <IoCameraOutline className="w-8 h-8 text-sage-300" />
                </motion.div>
                <motion.span
                  className="absolute -top-1 -right-1 text-lg"
                  animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
                  transition={{ duration: 0.6, delay: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  ✨
                </motion.span>
                <motion.span
                  className="absolute -bottom-0.5 -left-1 text-sm"
                  animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
                  transition={{ duration: 0.6, delay: 1, repeat: Infinity, repeatDelay: 3 }}
                >
                  ✨
                </motion.span>
              </div>
              <h3 className="font-semibold text-brown mb-1 font-[family-name:var(--font-heading)]">
                No posts scheduled yet
              </h3>
              <p className="text-sm text-brown-light mb-4 max-w-[260px] mx-auto">
                Upload a photo to get started!
              </p>
              <Link href="/upload">
                <Button size="md">Upload a Photo</Button>
              </Link>
            </Card>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
