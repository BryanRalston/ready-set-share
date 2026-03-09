'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMicOutline, IoStopOutline, IoSparkles } from 'react-icons/io5';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { polishCaption, type BusinessContext } from '@/lib/gemini';
import { useUser } from '@/lib/user-context';

// Web Speech API types (not available in all TS configs)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface VoiceCaptionProps {
  onCaptionGenerated: (caption: string) => void;
}

// Waveform bar component
function WaveformBar({ index, active }: { index: number; active: boolean }) {
  return (
    <motion.div
      className="w-1 rounded-full bg-sage-400"
      animate={
        active
          ? {
              height: [8, 20 + Math.random() * 16, 8, 24 + Math.random() * 12, 8],
            }
          : { height: 8 }
      }
      transition={
        active
          ? {
              duration: 0.6 + index * 0.1,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : { duration: 0.3 }
      }
    />
  );
}

export default function VoiceCaption({ onCaptionGenerated }: VoiceCaptionProps) {
  const { businessType, businessName, businessDescription } = useUser();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedCaption, setPolishedCaption] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    // Check for browser support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
    }
  }, []);

  const startRecording = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition: SpeechRecognitionInstance = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTranscript('');
    setPolishedCaption('');
  }, []);

  const stopRecording = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);

    if (!transcript.trim()) return;

    // Polish with Gemini
    setIsPolishing(true);
    const bizContext: BusinessContext = { type: businessType, name: businessName, description: businessDescription };
    try {
      const data = await polishCaption(transcript.trim(), bizContext);
      setPolishedCaption(data.caption);
    } catch {
      setPolishedCaption(transcript.trim());
    } finally {
      setIsPolishing(false);
    }
  }, [transcript]);

  const useCaption = () => {
    onCaptionGenerated(polishedCaption || transcript);
  };

  if (!supported) {
    return (
      <Card className="text-center">
        <p className="text-sm text-brown-light">
          Voice input is not supported in this browser. Try Chrome or Edge for the best experience.
        </p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card>
        <div className="flex flex-col items-center gap-4 py-2">
          {/* Mic button with pulsing ring */}
          <div className="relative">
            <AnimatePresence>
              {isRecording && (
                <>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-sage-400"
                  />
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.3, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    className="absolute inset-0 rounded-full bg-sage-400"
                  />
                </>
              )}
            </AnimatePresence>
            <motion.button
              animate={isRecording ? { scale: 1.1 } : { scale: 1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white shadow-red-500/30'
                  : 'bg-sage-500 text-white shadow-sage-500/30 hover:bg-sage-600'
              }`}
            >
              {isRecording ? (
                <IoStopOutline className="w-7 h-7" />
              ) : (
                <IoMicOutline className="w-7 h-7" />
              )}
            </motion.button>
          </div>

          {/* Waveform animation */}
          <div className="flex items-center gap-1 h-8">
            {[0, 1, 2, 3, 4].map((i) => (
              <WaveformBar key={i} index={i} active={isRecording} />
            ))}
          </div>

          <p className="text-xs text-brown-light">
            {isRecording ? 'Listening... tap to stop' : 'Tap to start speaking'}
          </p>
        </div>

        {/* Transcript preview */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="bg-cream-50 rounded-xl p-3 border border-cream-200">
                <p className="text-xs text-brown-light mb-1">You said:</p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-brown leading-relaxed"
                >
                  &ldquo;{transcript}&rdquo;
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Polishing state */}
        <AnimatePresence>
          {isPolishing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 justify-center"
            >
              <IoSparkles className="w-4 h-4 text-gold-300 animate-pulse" />
              <p className="text-sm text-brown-light">Polishing your caption...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Polished caption */}
        <AnimatePresence>
          {polishedCaption && !isPolishing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 space-y-3"
            >
              <div className="bg-sage-50 rounded-xl p-3 border border-sage-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <IoSparkles className="w-3.5 h-3.5 text-sage-500" />
                  <p className="text-xs font-medium text-sage-600">Polished caption:</p>
                </div>
                <p className="text-sm text-brown leading-relaxed">{polishedCaption}</p>
              </div>
              <Button
                size="md"
                className="w-full gap-2"
                onClick={useCaption}
              >
                Use This Caption
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
