// Voice Matcher — learns from her caption edits to match her writing style

export interface CaptionEdit {
  before: string;
  after: string;
  timestamp: number;
}

export interface VoiceProfile {
  length: 'short' | 'medium' | 'long';
  emojiLevel: 'none' | 'some' | 'lots';
  tone: string;
  commonPhrases: string[];
  style: string;
  exclamationFrequency: 'low' | 'medium' | 'high';
  ellipsisUsage: boolean;
  sampleBefore: string;
  sampleAfter: string;
  editCount: number;
}

const STORAGE_KEY = 'biz-social-caption-edits';
const MIN_EDITS_FOR_PROFILE = 5;

export function saveCaptionEdit(before: string, after: string): void {
  if (typeof window === 'undefined') return;
  if (before.trim() === after.trim()) return;

  const edits = getCaptionEdits();
  edits.push({ before, after, timestamp: Date.now() });

  // Keep last 50 edits
  const trimmed = edits.slice(-50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getCaptionEdits(): CaptionEdit[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function hasEnoughEdits(): boolean {
  return getCaptionEdits().length >= MIN_EDITS_FOR_PROFILE;
}

export function getEditCount(): number {
  return getCaptionEdits().length;
}

function analyzeLength(edits: CaptionEdit[]): 'short' | 'medium' | 'long' {
  const avgLength = edits.reduce((sum, e) => sum + e.after.length, 0) / edits.length;
  if (avgLength < 80) return 'short';
  if (avgLength < 200) return 'medium';
  return 'long';
}

function analyzeEmojis(edits: CaptionEdit[]): 'none' | 'some' | 'lots' {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const avgEmojis = edits.reduce((sum, e) => {
    const matches = e.after.match(emojiRegex);
    return sum + (matches ? matches.length : 0);
  }, 0) / edits.length;

  if (avgEmojis < 0.5) return 'none';
  if (avgEmojis < 3) return 'some';
  return 'lots';
}

function analyzeTone(edits: CaptionEdit[]): string {
  const allText = edits.map(e => e.after).join(' ').toLowerCase();

  const markers = {
    enthusiastic: ['!', 'love', 'amazing', 'gorgeous', 'beautiful', 'obsessed', 'can\'t wait', 'so excited'],
    warm: ['cozy', 'warm', 'home', 'welcome', 'handmade', 'with love', 'heart', 'family'],
    professional: ['available', 'order', 'custom', 'dm', 'link in bio', 'shop', 'collection'],
    casual: ['y\'all', 'hey', 'gonna', 'kinda', 'lol', 'haha', 'just', 'literally'],
    storytelling: ['behind the scenes', 'story', 'inspired by', 'this one', 'fun fact', 'did you know'],
  };

  const scores: Record<string, number> = {};
  for (const [tone, words] of Object.entries(markers)) {
    scores[tone] = words.reduce((count, word) => {
      const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = allText.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  const second = sorted[1];

  if (top[1] === 0) return 'Authentic';
  if (second && second[1] > top[1] * 0.6) {
    return formatTone(top[0]) + ' & ' + formatTone(second[0]);
  }
  return formatTone(top[0]);
}

function formatTone(tone: string): string {
  return tone.charAt(0).toUpperCase() + tone.slice(1);
}

function findCommonPhrases(edits: CaptionEdit[]): string[] {
  // Find phrases she frequently adds (in "after" but not "before")
  const addedPhrases: Record<string, number> = {};

  for (const edit of edits) {
    const afterWords = edit.after.toLowerCase();
    const beforeWords = edit.before.toLowerCase();

    // Check for common small business phrases they add
    const candidatePhrases = [
      'handmade with love', 'made with love', 'link in bio', 'dm to order',
      'custom orders welcome', 'limited edition', 'one of a kind',
      'shop small', 'support small', 'new in shop',
      'just dropped', 'back in stock',
    ];

    for (const phrase of candidatePhrases) {
      if (afterWords.includes(phrase) && !beforeWords.includes(phrase)) {
        addedPhrases[phrase] = (addedPhrases[phrase] || 0) + 1;
      }
    }

    // Also detect short repeated phrases she types
    const words = edit.after.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = words.slice(i, i + 2).join(' ').toLowerCase().replace(/[^a-z\s]/g, '');
      if (bigram.length > 5 && !beforeWords.includes(bigram)) {
        addedPhrases[bigram] = (addedPhrases[bigram] || 0) + 1;
      }
    }
  }

  return Object.entries(addedPhrases)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase]) => phrase);
}

function analyzeExclamations(edits: CaptionEdit[]): 'low' | 'medium' | 'high' {
  const avg = edits.reduce((sum, e) => {
    return sum + (e.after.match(/!/g) || []).length;
  }, 0) / edits.length;

  if (avg < 0.5) return 'low';
  if (avg < 2) return 'medium';
  return 'high';
}

function analyzeEllipsis(edits: CaptionEdit[]): boolean {
  const count = edits.filter(e => e.after.includes('...')).length;
  return count >= edits.length * 0.3;
}

function buildStyleDescription(profile: Partial<VoiceProfile>): string {
  const parts: string[] = [];

  switch (profile.length) {
    case 'short': parts.push('short, punchy captions'); break;
    case 'medium': parts.push('medium-length captions'); break;
    case 'long': parts.push('detailed, storytelling captions'); break;
  }

  switch (profile.emojiLevel) {
    case 'none': parts.push('no emojis'); break;
    case 'some': parts.push('a few emojis'); break;
    case 'lots': parts.push('lots of emojis'); break;
  }

  if (profile.exclamationFrequency === 'high') parts.push('enthusiastic punctuation');
  if (profile.ellipsisUsage) parts.push('uses ellipses for dramatic pauses');

  return 'You like ' + parts.join(' with ');
}

export function analyzeVoice(): VoiceProfile | null {
  const edits = getCaptionEdits();
  if (edits.length < MIN_EDITS_FOR_PROFILE) return null;

  const length = analyzeLength(edits);
  const emojiLevel = analyzeEmojis(edits);
  const tone = analyzeTone(edits);
  const commonPhrases = findCommonPhrases(edits);
  const exclamationFrequency = analyzeExclamations(edits);
  const ellipsisUsage = analyzeEllipsis(edits);

  // Pick most recent edit as the sample
  const latestEdit = edits[edits.length - 1];

  const partial = { length, emojiLevel, exclamationFrequency, ellipsisUsage };

  return {
    length,
    emojiLevel,
    tone,
    commonPhrases,
    style: buildStyleDescription(partial),
    exclamationFrequency,
    ellipsisUsage,
    sampleBefore: latestEdit.before,
    sampleAfter: latestEdit.after,
    editCount: edits.length,
  };
}

export function getVoiceInstruction(): string {
  const profile = analyzeVoice();
  if (!profile) return '';

  const parts: string[] = [];
  parts.push(`Write captions that match this voice profile:`);

  // Length
  switch (profile.length) {
    case 'short': parts.push('- Keep captions SHORT (under 80 characters). Punchy and direct.'); break;
    case 'medium': parts.push('- Medium-length captions (2-3 sentences). Engaging but not too long.'); break;
    case 'long': parts.push('- Longer, storytelling captions (3-5 sentences). Share the story behind the product.'); break;
  }

  // Emoji
  switch (profile.emojiLevel) {
    case 'none': parts.push('- Do NOT use emojis. Keep it clean and professional.'); break;
    case 'some': parts.push('- Use 1-3 emojis naturally. Don\'t overdo it.'); break;
    case 'lots': parts.push('- Use plenty of emojis! She loves expressive, emoji-rich captions.'); break;
  }

  // Tone
  parts.push(`- Tone: ${profile.tone}`);

  // Common phrases
  if (profile.commonPhrases.length > 0) {
    parts.push(`- She often uses: "${profile.commonPhrases.join('", "')}"`);
  }

  // Punctuation
  if (profile.exclamationFrequency === 'high') {
    parts.push('- She loves exclamation marks! Use them freely!');
  } else if (profile.exclamationFrequency === 'low') {
    parts.push('- Minimize exclamation marks. She prefers a calmer tone.');
  }

  if (profile.ellipsisUsage) {
    parts.push('- She uses "..." for dramatic pauses and transitions.');
  }

  return parts.join('\n');
}
