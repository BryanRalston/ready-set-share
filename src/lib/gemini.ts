'use client';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBusinessTypeInfo, type BusinessType } from './business-profile';

const STORAGE_KEY = 'biz-social-gemini-key';

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

export interface BusinessContext {
  type: string;
  name: string;
  description: string;
}

export interface AnalysisResult {
  caption: string;
  hashtags: string[];
  platform: string;
  tip: string;
  altCaptions?: string[];
}

function buildSystemPrompt(
  businessContext: BusinessContext,
  voiceProfile?: string,
  season?: { name: string; hashtags: string[]; tips: string[] } | null
): string {
  const descriptionClause = businessContext.description
    ? ` ${businessContext.description}.`
    : '';

  let systemPrompt = `You are a social media expert helping small businesses grow their online presence. The user runs a ${businessContext.type || 'small'} business called '${businessContext.name || 'My Business'}'.${descriptionClause} Analyze their product photo and create an engaging social media post.

When given a photo, respond with a JSON object containing:
- caption: An engaging, warm social media caption (2-3 sentences)
- hashtags: Array of 8-12 relevant hashtags (without the # symbol)
- platform: The best platform for this type of post ("Instagram" or "Pinterest")
- tip: A brief posting tip for this specific content
- altCaptions: Array of 2 alternative caption styles (casual, professional)

Keep the tone warm, authentic, and enthusiastic. Use language that connects with the small business and handmade community.
Focus on the craftsmanship, quality, and appeal of the product.`;

  if (voiceProfile) {
    systemPrompt += `\n\nIMPORTANT: Match this writing voice style:\n${voiceProfile}`;
  }

  if (season) {
    systemPrompt += `\n\nCurrent season context: ${season.name}. Relevant hashtags to consider: ${season.hashtags.join(', ')}. Tips: ${season.tips.join('. ')}`;
  }

  return systemPrompt;
}

function buildFallbackResult(businessContext: BusinessContext): AnalysisResult {
  const businessName = businessContext.name || 'My Business';
  const typeKey = (businessContext.type || 'other') as BusinessType;
  const typeInfo = getBusinessTypeInfo(typeKey);
  const keywords = typeInfo.defaultKeywords;

  const fallbackHashtags = [
    ...keywords,
    'shopsmall',
    'supportsmall',
    'handmade',
    'smallbusiness',
    'madewithcare',
  ];

  return {
    caption: `Check out our latest creation! Made with love at ${businessName}.`,
    hashtags: fallbackHashtags,
    platform: 'Instagram',
    tip: 'Set up your AI key in Settings to get personalized captions!',
    altCaptions: [
      `Just finished this beauty! What do you think? - ${businessName}`,
      `Our latest product, crafted with care and attention to detail.`,
    ],
  };
}

export async function analyzeProductPhoto(
  imageBase64: string,
  businessContext: BusinessContext,
  voiceProfile?: string,
  season?: { name: string; hashtags: string[]; tips: string[] } | null
): Promise<AnalysisResult> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = buildSystemPrompt(businessContext, voiceProfile, season);

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const result = await model.generateContent([
      { text: systemPrompt + '\n\nAnalyze this product photo and respond with ONLY a valid JSON object, no markdown formatting.' },
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
      caption: parsed.caption || `Check out our latest creation! Made with love at ${businessContext.name || 'our shop'}.`,
      hashtags: parsed.hashtags || ['handmade', 'smallbusiness', 'shopsmall'],
      platform: parsed.platform || 'Instagram',
      tip: parsed.tip || 'Post during peak engagement hours for best results!',
      altCaptions: parsed.altCaptions || [],
    };
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    return buildFallbackResult(businessContext);
  }
}

export async function polishCaption(
  transcript: string,
  businessContext?: BusinessContext,
): Promise<{ caption: string }> {
  const businessType = businessContext?.type || 'small';
  const businessName = businessContext?.name || 'My Business';

  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(
      `You are a social media caption writer for a small ${businessType} business called '${businessName}'.
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
