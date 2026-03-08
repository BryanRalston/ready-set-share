'use client';

import Card from '@/components/ui/Card';

interface PostCardProps {
  title: string;
  caption: string;
  imageUrl?: string;
  platform?: string;
  scheduledAt?: string;
}

export default function PostCard({ title, caption, platform, scheduledAt }: PostCardProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-brown">{title}</h3>
        {platform && (
          <span className="text-xs bg-sage-50 text-sage-600 px-2 py-1 rounded-full">
            {platform}
          </span>
        )}
      </div>
      <p className="text-sm text-brown-light line-clamp-3">{caption}</p>
      {scheduledAt && (
        <p className="text-xs text-brown-light/70">Scheduled: {scheduledAt}</p>
      )}
    </Card>
  );
}
