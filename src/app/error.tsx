'use client';

import Button from '@/components/ui/Button';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mb-4">
        <span className="text-2xl">😅</span>
      </div>
      <h2 className="text-lg font-semibold text-brown font-[family-name:var(--font-heading)] mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-brown-light mb-6 max-w-[260px]">
        Don&apos;t worry — your data is safe. Try refreshing.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
