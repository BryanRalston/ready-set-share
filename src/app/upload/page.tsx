'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '@/components/layout/AppShell';
import PhotoUploader from '@/components/upload/PhotoUploader';
import AIAnalysis, { AnalysisResult, CaptionOption } from '@/components/upload/AIAnalysis';
import VoiceCaption from '@/components/upload/VoiceCaption';
import { fileToBase64 } from '@/lib/utils';
import { incrementPhotoCount } from '@/components/profile/BrandKit';
import { getVoiceInstruction } from '@/lib/voice-matcher';
import { getCurrentSeason } from '@/lib/seasonal';
import { analyzeProductPhoto, isGeminiConfigured } from '@/lib/gemini';
import { getPhotos, getPhotoById, addPhoto, createThumbnail } from '@/lib/photo-library';
import type { LibraryPhoto } from '@/lib/photo-library';
import { useUser } from '@/lib/user-context';
import TemplatePicker from '@/components/upload/TemplatePicker';
import { IoArrowBackOutline, IoMicOutline, IoCreateOutline, IoImagesOutline, IoCheckmarkCircle, IoListOutline, IoDocumentTextOutline } from 'react-icons/io5';
import Image from 'next/image';
import { useToast } from '@/components/ui/Toast';

type UploadStep = 'choose' | 'library-picker' | 'analyzing' | 'results' | 'caption-choice' | 'caption-style' | 'template-picker';
type CaptionMode = 'write' | 'voice' | null;

/* ── Step progress helpers ── */

function getStepSequence(aiConfigured: boolean): UploadStep[] {
  if (aiConfigured) {
    return ['choose', 'analyzing', 'caption-choice', 'results'];
  }
  return ['choose', 'caption-style', 'results'];
}

function getStepIndex(step: UploadStep, aiConfigured: boolean): number {
  const seq = getStepSequence(aiConfigured);
  if (step === 'library-picker') return 0;
  if (step === 'template-picker') {
    return aiConfigured ? seq.indexOf('caption-choice') : seq.indexOf('caption-style');
  }
  const idx = seq.indexOf(step);
  return idx >= 0 ? idx : 0;
}

function StepIndicator({ step, aiConfigured }: { step: UploadStep; aiConfigured: boolean }) {
  const seq = getStepSequence(aiConfigured);
  const totalSteps = seq.length;
  const currentIndex = getStepIndex(step, aiConfigured);

  const labels = aiConfigured
    ? ['Photo', 'Analyzing', 'Caption Style', 'Review']
    : ['Photo', 'Caption Style', 'Review'];

  return (
    <div className="flex items-center justify-center gap-1.5 mb-4">
      {labels.map((label, i) => {
        const isActive = i === currentIndex;
        const isComplete = i < currentIndex;
        return (
          <div key={label} className="flex items-center gap-1.5">
            {i > 0 && (
              <div className={`w-6 h-0.5 rounded-full transition-colors duration-300 ${isComplete ? 'bg-sage-400' : 'bg-cream-200'}`} />
            )}
            <div className="flex flex-col items-center gap-0.5">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-sage-500 ring-2 ring-sage-200 ring-offset-1'
                    : isComplete
                    ? 'bg-sage-400'
                    : 'bg-cream-200'
                }`}
              />
              <span className={`text-[9px] transition-colors duration-300 ${
                isActive ? 'text-sage-600 font-medium' : isComplete ? 'text-sage-400' : 'text-brown-light/50'
              }`}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
      <span className="ml-2 text-[10px] text-brown-light/60">
        {currentIndex + 1}/{totalSteps}
      </span>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <AppShell title="Upload Photo" showNotifications={false}>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-sage-300 border-t-transparent animate-spin" />
        </div>
      </AppShell>
    }>
      <UploadPageInner />
    </Suspense>
  );
}

function UploadPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { businessType, businessName, businessDescription } = useUser();
  const { toast } = useToast();
  const [step, setStep] = useState<UploadStep>('choose');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [captionMode, setCaptionMode] = useState<CaptionMode>(null);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const aiConfigured = isGeminiConfigured();

  // Library picker state
  const [libraryPhotos, setLibraryPhotos] = useState<LibraryPhoto[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  // Save to library state
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const [savingToLibrary, setSavingToLibrary] = useState(false);

  // Check for fromLibrary query param on mount
  useEffect(() => {
    const fromLibraryId = searchParams.get('fromLibrary');
    if (fromLibraryId) {
      handleLibraryPhotoById(fromLibraryId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLibraryPhotoById = async (id: string) => {
    try {
      const photo = await getPhotoById(id);
      if (photo) {
        const dataUrl = photo.base64.startsWith('data:')
          ? photo.base64
          : `data:image/jpeg;base64,${photo.base64}`;
        setPreviewUrl(dataUrl);
        setImageBase64(photo.base64);
        setSavedToLibrary(true);
        if (isGeminiConfigured()) {
          runAnalysis(photo.base64);
        } else {
          setStep('caption-style');
        }
      }
    } catch (err) {
      console.error('Failed to load library photo:', err);
    }
  };

  const runAnalysis = async (base64: string) => {
    setStep('analyzing');
    setUploadProgress(20);

    try {
      setUploadProgress(50);

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

      const bizContext = { type: businessType, name: businessName, description: businessDescription };

      const geminiResult = await analyzeProductPhoto(
        base64,
        bizContext,
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
        captionOptions: geminiResult.captionOptions,
      };

      setAnalysisResult(parsed);
      setStep('caption-choice');
    } catch {
      const name = businessName || 'our shop';
      const fallbackOptions: CaptionOption[] = [
        { label: 'Warm & Friendly', caption: `Check out our latest creation! Made with love at ${name}. We can't wait to hear what you think! 💛` },
        { label: 'Professional', caption: `Introducing our newest offering — crafted with precision and care at ${name}. Quality you can see and feel.` },
        { label: 'Fun & Catchy', caption: `Stop scrolling — you NEED to see this! 🔥 Fresh out of the ${name} workshop and ready for you!` },
      ];
      setAnalysisResult({
        caption: fallbackOptions[0].caption,
        hashtags: ['#handmade', '#smallbusiness', '#shopsmall', '#madewithcare', '#supportsmall', '#handcrafted', '#shoplocal', '#makersofinstagram'],
        platform: 'Instagram',
        tip: aiConfigured
          ? 'Post between 11am-1pm for best engagement. Use stories to show the making process!'
          : 'Basic suggestion — set up AI in Settings for personalized captions',
        postType: 'Single Post',
        captionOptions: fallbackOptions,
      });
      setStep('caption-choice');
    }
  };

  const handlePhotoSelected = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSavedToLibrary(false);

    try { incrementPhotoCount(); } catch { /* localStorage may fail */ }

    try {
      const base64 = await fileToBase64(file);
      setImageBase64(base64);

      // Auto-save to library in the background
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      createThumbnail(dataUrl)
        .then((thumbnail) =>
          addPhoto({ name: file.name || '', description: '', base64: dataUrl, thumbnail, tags: [] })
        )
        .then(() => setSavedToLibrary(true))
        .catch(() => { /* IndexedDB may be unavailable */ });

      if (isGeminiConfigured()) {
        runAnalysis(base64);
      } else {
        setStep('caption-style');
      }
    } catch {
      const name = businessName || 'our shop';
      const fallbackOptions: CaptionOption[] = [
        { label: 'Warm & Friendly', caption: `Check out our latest creation! Made with love at ${name}. We can't wait to hear what you think! 💛` },
        { label: 'Professional', caption: `Introducing our newest offering — crafted with precision and care at ${name}. Quality you can see and feel.` },
        { label: 'Fun & Catchy', caption: `Stop scrolling — you NEED to see this! 🔥 Fresh out of the ${name} workshop and ready for you!` },
      ];
      setAnalysisResult({
        caption: fallbackOptions[0].caption,
        hashtags: ['#handmade', '#smallbusiness', '#shopsmall', '#madewithcare', '#supportsmall', '#handcrafted', '#shoplocal', '#makersofinstagram'],
        platform: 'Instagram',
        tip: aiConfigured
          ? 'Post between 11am-1pm for best engagement. Use stories to show the making process!'
          : 'Basic suggestion — set up AI in Settings for personalized captions',
        postType: 'Single Post',
        captionOptions: fallbackOptions,
      });
      setStep('caption-choice');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiConfigured, businessType, businessName, businessDescription]);

  const handleChooseFromLibrary = async () => {
    setLibraryLoading(true);
    setStep('library-picker');
    try {
      const photos = await getPhotos();
      setLibraryPhotos(photos);
    } catch (err) {
      console.error('Failed to load library photos:', err);
    } finally {
      setLibraryLoading(false);
    }
  };

  const handleLibraryPhotoSelected = (photo: LibraryPhoto) => {
    const dataUrl = photo.base64.startsWith('data:')
      ? photo.base64
      : `data:image/jpeg;base64,${photo.base64}`;
    setPreviewUrl(dataUrl);
    setImageBase64(photo.base64);
    setSavedToLibrary(true);
    if (isGeminiConfigured()) {
      runAnalysis(photo.base64);
    } else {
      setStep('caption-style');
    }
  };

  const handleSaveToLibrary = async () => {
    if (!imageBase64 || savedToLibrary || savingToLibrary) return;
    setSavingToLibrary(true);
    try {
      const base64ForStorage = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;
      const thumbnail = await createThumbnail(base64ForStorage);
      await addPhoto({
        name: '',
        description: '',
        base64: base64ForStorage,
        thumbnail,
        tags: [],
      });
      setSavedToLibrary(true);
      toast('Saved to library', 'success');
    } catch (err) {
      console.error('Failed to save to library:', err);
    } finally {
      setSavingToLibrary(false);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImageBase64(null);
    setAnalysisResult(null);
    setStep('choose');
    setUploadProgress(0);
    setCaptionMode(null);
    setSelectedCaption(null);
    setSavedToLibrary(false);
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

  const handleCaptionSelected = (caption: string) => {
    setSelectedCaption(caption);
  };

  const handleCreatePost = () => {
    if (analysisResult) {
      const pendingPost = {
        caption: selectedCaption || analysisResult.caption,
        hashtags: analysisResult.hashtags,
        platform: analysisResult.platform,
        tip: analysisResult.tip,
        postType: analysisResult.postType,
        imageUrl: previewUrl || '',
      };
      try {
        sessionStorage.setItem('biz-social-pending-post', JSON.stringify(pendingPost));
      } catch { /* sessionStorage may be unavailable */ }
    }
    router.push('/post/new');
  };

  const handleSaveForLater = () => {
    router.push('/');
  };

  const handleTemplateCaption = (caption: string, hashtags: string[]) => {
    setAnalysisResult({
      caption,
      hashtags: hashtags.map(h => h.startsWith('#') ? h : `#${h}`),
      platform: 'Instagram',
      tip: 'Personalize your caption — swap out any placeholder text to make it yours.',
      postType: 'Single Post',
    });
    setCaptionMode('write');
    setStep('results');
  };

  const handleWriteOwnCaption = () => {
    setAnalysisResult({
      caption: '',
      hashtags: ['#handmade', '#shopsmall', '#smallbusiness'],
      platform: 'Instagram',
      tip: 'Write from the heart — authentic captions perform best.',
      postType: 'Single Post',
    });
    setCaptionMode('write');
    setStep('results');
  };

  /* ── Simplified back-button logic ── */
  const getBackAction = (): (() => void) => {
    switch (step) {
      case 'library-picker':
        return () => setStep('choose');
      case 'template-picker':
        return () => setStep('caption-style');
      case 'results':
        return () => { setStep(aiConfigured ? 'caption-choice' : 'caption-style'); setCaptionMode(null); };
      case 'caption-choice':
      case 'caption-style':
      case 'analyzing':
        return handleClear;
      default:
        return handleClear;
    }
  };

  const backAction = step !== 'choose' ? (
    <button
      onClick={getBackAction()}
      aria-label="Go back"
      className="w-9 h-9 rounded-full bg-white border border-cream-200 flex items-center justify-center text-brown-light hover:text-sage-500 transition-colors"
    >
      <IoArrowBackOutline size={18} />
    </button>
  ) : undefined;

  /* ── Save to Library: rendered once, shown on photo-selected steps ── */
  const showSaveToLibrary = imageBase64 && !['choose', 'library-picker', 'analyzing'].includes(step);

  const saveToLibraryButton = showSaveToLibrary && (
    <>
      {!savedToLibrary ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={handleSaveToLibrary}
          disabled={savingToLibrary}
          className="flex items-center justify-center gap-2 w-full mt-3 py-2 text-sm text-sage-500 hover:text-sage-600 transition-colors disabled:opacity-50"
        >
          <IoImagesOutline className="w-4 h-4" />
          {savingToLibrary ? 'Saving...' : 'Save to Library'}
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-1.5 mt-3 py-2 text-sm text-sage-500"
        >
          <IoCheckmarkCircle className="w-4 h-4" />
          Saved to Library
        </motion.div>
      )}
    </>
  );

  return (
    <AppShell title="Upload Photo" rightAction={backAction} showNotifications={false}>
      <div className="space-y-6">
        {/* Step progress indicator */}
        <StepIndicator step={step} aiConfigured={aiConfigured} />

        <AnimatePresence mode="wait">
          {step === 'choose' && (
            <motion.div key="choose" exit={{ opacity: 0, y: -12 }}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-brown-light text-sm mb-4"
              >
                Upload a product photo and let AI craft the perfect post for you.
              </motion.p>
              <PhotoUploader
                onPhotoSelected={handlePhotoSelected}
                onChooseFromLibrary={handleChooseFromLibrary}
              />
            </motion.div>
          )}

          {step === 'library-picker' && (
            <motion.div key="library-picker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-brown-light text-sm mb-4"
              >
                Choose a photo from your library.
              </motion.p>

              {libraryLoading && (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-sage-300 border-t-transparent animate-spin" />
                </div>
              )}

              {!libraryLoading && libraryPhotos.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-sage-50 flex items-center justify-center mx-auto mb-3">
                    <IoImagesOutline className="w-7 h-7 text-sage-400" />
                  </div>
                  <p className="text-sm text-brown-light mb-4">No photos in your library yet.</p>
                  <button
                    onClick={() => setStep('choose')}
                    className="text-sm text-sage-500 hover:text-sage-600 transition-colors underline underline-offset-2"
                  >
                    Upload a new photo instead
                  </button>
                </div>
              )}

              {!libraryLoading && libraryPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {libraryPhotos.map((photo, index) => (
                    <motion.button
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLibraryPhotoSelected(photo)}
                      className="relative aspect-square rounded-xl overflow-hidden bg-cream-100 border-2 border-transparent hover:border-sage-400 transition-all"
                    >
                      <Image
                        src={photo.thumbnail || (photo.base64.startsWith('data:') ? photo.base64 : `data:image/jpeg;base64,${photo.base64}`)}
                        alt={photo.name || 'Library photo'}
                        fill
                        className="object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
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

          {step === 'caption-style' && (
            <motion.div key="caption-style" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }}>
              {previewUrl && (
                <PhotoUploader
                  onPhotoSelected={handlePhotoSelected}
                  previewUrl={previewUrl}
                  onClear={handleClear}
                />
              )}

              {saveToLibraryButton}

              <div className="mt-6 space-y-3">
                <p className="text-sm font-medium text-brown text-center">Choose your caption style</p>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => setStep('template-picker')}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-cream-200 hover:border-sage-300 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-sage-50 flex items-center justify-center">
                      <IoListOutline className="w-5 h-5 text-sage-500" />
                    </div>
                    <span className="text-sm font-medium text-brown">Use a Template</span>
                    <span className="text-xs text-brown-light">Fill-in-the-blank captions</span>
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={handleWriteOwnCaption}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-cream-200 hover:border-sage-300 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center">
                      <IoDocumentTextOutline className="w-5 h-5 text-gold-300" />
                    </div>
                    <span className="text-sm font-medium text-brown">Write My Own</span>
                    <span className="text-xs text-brown-light">Start from scratch</span>
                  </motion.button>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs text-brown-light/60 text-center pt-1"
                >
                  Add a Gemini API key in Settings for AI-generated captions
                </motion.p>
              </div>
            </motion.div>
          )}

          {step === 'template-picker' && (
            <motion.div key="template-picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }}>
              {previewUrl && (
                <PhotoUploader
                  onPhotoSelected={handlePhotoSelected}
                  previewUrl={previewUrl}
                  onClear={handleClear}
                />
              )}

              {saveToLibraryButton}

              <div className="mt-4">
                <TemplatePicker
                  businessType={businessType}
                  onSelectCaption={handleTemplateCaption}
                  onCancel={() => setStep('caption-style')}
                />
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

              {saveToLibraryButton}

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

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => setStep('template-picker')}
                  className="w-full text-center text-sm text-sage-500 hover:text-sage-600 transition-colors py-1"
                >
                  Or use a template
                </motion.button>

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

              {saveToLibraryButton}

              <div className="mt-6">
                <AIAnalysis
                  result={analysisResult}
                  onCreatePost={handleCreatePost}
                  onSaveForLater={handleSaveForLater}
                  onCaptionSelected={handleCaptionSelected}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
