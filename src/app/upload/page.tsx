'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '@/components/layout/AppShell';
import PhotoUploader from '@/components/upload/PhotoUploader';
import AIAnalysis, { AnalysisResult } from '@/components/upload/AIAnalysis';
import VoiceCaption from '@/components/upload/VoiceCaption';
import { fileToBase64 } from '@/lib/utils';
import { incrementPhotoCount } from '@/components/profile/BrandKit';
import { getVoiceInstruction } from '@/lib/voice-matcher';
import { getCurrentSeason } from '@/lib/seasonal';
import { analyzeWreathPhoto, isGeminiConfigured } from '@/lib/gemini';
import { IoArrowBackOutline, IoMicOutline, IoCreateOutline } from 'react-icons/io5';

type UploadStep = 'choose' | 'analyzing' | 'results' | 'caption-choice';
type CaptionMode = 'write' | 'voice' | null;

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<UploadStep>('choose');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [captionMode, setCaptionMode] = useState<CaptionMode>(null);

  const handlePhotoSelected = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStep('analyzing');
    setUploadProgress(20);

    // Increment photo count for BrandKit
    try { incrementPhotoCount(); } catch { /* localStorage may fail */ }

    try {
      const base64 = await fileToBase64(file);
      setUploadProgress(50);

      // Get voice profile and season context for enhanced AI
      const voiceInstruction = getVoiceInstruction();
      const seasonInfo = getCurrentSeason();
      const seasonPayload = {
        name: seasonInfo.season,
        events: seasonInfo.upcomingEvents.map(e => e.name),
        tips: seasonInfo.contentTips,
        hashtags: seasonInfo.hashtagSuggestions,
      };

      if (!isGeminiConfigured()) {
        console.warn('Gemini API key not configured — using fallback data. Set your key in Settings.');
      }

      const geminiResult = await analyzeWreathPhoto(
        base64,
        voiceInstruction || undefined,
        seasonPayload,
      );

      setUploadProgress(100);

      const parsed: AnalysisResult = {
        caption: geminiResult.caption,
        hashtags: geminiResult.hashtags.map(h => h.startsWith('#') ? h : `#${h}`),
        platform: geminiResult.platform,
        tip: geminiResult.tip,
        postType: 'Single Post',
      };

      setAnalysisResult(parsed);
      setStep('caption-choice');
    } catch {
      // Use fallback data on error (e.g., no API key configured)
      setAnalysisResult({
        caption: 'Beautiful handcrafted wreath, made with love! Every detail is carefully chosen to bring warmth to your home.',
        hashtags: ['#wreath', '#handmade', '#homedecor', '#wreathmaking', '#crafts', '#doorwreath', '#seasonal', '#naturaldecor', '#homestyle', '#shopsmall'],
        platform: 'Instagram',
        tip: 'Post between 11am-1pm for best engagement. Use stories to show the making process!',
        postType: 'Single Post',
      });
      setStep('caption-choice');
    }
  }, []);

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setStep('choose');
    setUploadProgress(0);
    setCaptionMode(null);
  };

  const handleUseAICaption = () => {
    setCaptionMode('write');
    setStep('results');
  };

  const handleVoiceCaption = (caption: string) => {
    if (analysisResult) {
      setAnalysisResult({ ...analysisResult, caption });
    }
    setCaptionMode('voice');
    setStep('results');
  };

  const handleCreatePost = () => {
    // Save AI analysis + image data to sessionStorage so the post editor can pick it up
    if (analysisResult) {
      const pendingPost = {
        caption: analysisResult.caption,
        hashtags: analysisResult.hashtags,
        platform: analysisResult.platform,
        tip: analysisResult.tip,
        postType: analysisResult.postType,
        imageUrl: previewUrl || '',
      };
      try {
        sessionStorage.setItem('wreath-social-pending-post', JSON.stringify(pendingPost));
      } catch { /* sessionStorage may be unavailable */ }
    }
    router.push('/post/new');
  };

  const handleSaveForLater = () => {
    router.push('/');
  };

  const backAction = step !== 'choose' ? (
    <button
      onClick={step === 'results' ? () => { setStep('caption-choice'); setCaptionMode(null); } : handleClear}
      className="w-9 h-9 rounded-full bg-white border border-cream-200 flex items-center justify-center text-brown-light hover:text-sage-500 transition-colors"
    >
      <IoArrowBackOutline size={18} />
    </button>
  ) : undefined;

  return (
    <AppShell title="Upload Photo" rightAction={backAction} showNotifications={false}>
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {step === 'choose' && (
            <motion.div key="choose" exit={{ opacity: 0, y: -12 }}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-brown-light text-sm mb-4"
              >
                Upload a wreath photo and let AI craft the perfect post for you.
              </motion.p>
              <PhotoUploader onPhotoSelected={handlePhotoSelected} />
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div key="analyzing" exit={{ opacity: 0, y: -12 }}>
              <PhotoUploader
                onPhotoSelected={handlePhotoSelected}
                previewUrl={previewUrl}
                uploading
                uploadProgress={uploadProgress}
              />
              <div className="mt-6">
                <AIAnalysis loading />
              </div>
            </motion.div>
          )}

          {step === 'caption-choice' && (
            <motion.div key="caption-choice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }}>
              {previewUrl && (
                <PhotoUploader
                  onPhotoSelected={handlePhotoSelected}
                  previewUrl={previewUrl}
                  onClear={handleClear}
                />
              )}
              <div className="mt-6 space-y-3">
                <p className="text-sm font-medium text-brown text-center">How do you want to caption this?</p>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={handleUseAICaption}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-cream-200 hover:border-sage-300 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-sage-50 flex items-center justify-center">
                      <IoCreateOutline className="w-5 h-5 text-sage-500" />
                    </div>
                    <span className="text-sm font-medium text-brown">Use AI caption</span>
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => setCaptionMode('voice')}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-cream-200 hover:border-sage-300 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center">
                      <IoMicOutline className="w-5 h-5 text-gold-300" />
                    </div>
                    <span className="text-sm font-medium text-brown">Say it out loud</span>
                  </motion.button>
                </div>

                <AnimatePresence>
                  {captionMode === 'voice' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <VoiceCaption onCaptionGenerated={handleVoiceCaption} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {previewUrl && (
                <PhotoUploader
                  onPhotoSelected={handlePhotoSelected}
                  previewUrl={previewUrl}
                  onClear={handleClear}
                />
              )}
              <div className="mt-6">
                <AIAnalysis
                  result={analysisResult}
                  onCreatePost={handleCreatePost}
                  onSaveForLater={handleSaveForLater}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

