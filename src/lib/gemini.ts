'use client';

import { GoogleGenerativeAI } from '@google/generative-ai';

const STORAGE_KEY = 'wreath-social-gemini-key';

export function getGeminiApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setGeminiApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key);
}

export function removeGeminiApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isGeminiConfigured(): boolean {
  return !!getGeminiApiKey();
}

function getClient() {
  const key = getGeminiApiKey();
  if (!key) throw new Error('Gemini API key not configured');
  return new GoogleGenerativeAI(key);
}

export interface AnalysisResult {
  caption: string;
  hashtags: string[];
  platform: string;
  tip: string;
  altCaptions?: string[];
}

function buildSystemPrompt(
  voiceProfile?: string,
  season?: { name: string; hashtags: string[]; tips: string[] } | null
): string {
  let systemPrompt = `You are a social media expert specializing in handmade wreath and craft businesses.
You analyze product photos and create engaging social media posts.

When given a photo, respond with a JSON object containing:
- caption: An engaging, warm social media caption (2-3 sentences)
- hashtags: Array of 8-12 relevant hashtags (without the # symbol)
- platform: The best platform for this type of post ("Instagram" or "Pinterest")
- tip: A brief posting tip for this specific content
- altCaptions: Array of 2 alternative caption styles (casual, professional)

Keep the tone warm, authentic, and enthusiastic. Use language that connects with the handmade/craft community.
Focus on the craftsmanship, materials, colors, and seasonal appeal of the wreath.`;

  if (voiceProfile) {
    systemPrompt += `\n\nIMPORTANT: Match this writing voice style:\n${voiceProfile}`;
  }

  if (season) {
    systemPrompt += `\n\nCurrent season context: ${season.name}. Relevant hashtags to consider: ${season.hashtags.join(', ')}. Tips: ${season.tips.join('. ')}`;
  }

  return systemPrompt;
}

export async function analyzeWreathPhoto(
  imageBase64: string,
  voiceProfile?: string,
  season?: { name: string; hashtags: string[]; tips: string[] } | null
): Promise<AnalysisResult> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = buildSystemPrompt(voiceProfile, season);

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const result = await model.generateContent([
      { text: systemPrompt + '\n\nAnalyze this wreath photo and respond with ONLY a valid JSON object, no markdown formatting.' },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      },
    ]);

    const responseText = result.response.text();
    // Parse JSON from response (handle potential markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      caption: parsed.caption || 'Beautiful handmade wreath!',
      hashtags: parsed.hashtags || ['wreath', 'handmade', 'homedecor'],
      platform: parsed.platform || 'Instagram',
      tip: parsed.tip || 'Post during peak engagement hours for best results!',
      altCaptions: parsed.altCaptions || [],
    };
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    // Return mock data as fallback
    return {
      caption: 'Check out this beautiful handmade wreath! Every detail is crafted with love. Perfect for adding a warm touch to any door.',
      hashtags: ['wreath', 'handmade', 'homedecor', 'frontdoor', 'wreathmaking', 'crafts', 'doorwreath', 'homedesign'],
      platform: 'Instagram',
      tip: 'Set up your AI key in Settings to get personalized captions!',
      altCaptions: [
        'Just finished this beauty! What do you think?',
        'Introducing our latest handcrafted wreath, designed to bring elegance to your entryway.',
      ],
    };
  }
}

export async function polishCaption(transcript: string): Promise<{ caption: string }> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(
      `You are a social media caption writer for a handmade wreath business.
Take this voice memo transcript and turn it into a polished, engaging social media caption.
Keep the original meaning and personality, but make it ready to post.
Only return the caption text, nothing else.

Transcript: "${transcript}"`
    );

    return { caption: result.response.text().trim() };
  } catch (error) {
    console.error('Caption polish failed:', error);
    return { caption: transcript };
  }
}
