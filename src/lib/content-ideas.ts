import { getGeminiApiKey } from './gemini';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ContentIdea {
  idea: string;
  type: 'product' | 'behind-scenes' | 'educational' | 'seasonal' | 'engagement';
}

// Curated fallback ideas per business type
const GENERIC_IDEAS: ContentIdea[] = [
  { idea: 'Show a close-up detail shot of your latest product', type: 'product' },
  { idea: 'Film a quick behind-the-scenes of your process', type: 'behind-scenes' },
  { idea: 'Share what inspired you to start your business', type: 'engagement' },
  { idea: 'Post a before-and-after of a product being made', type: 'behind-scenes' },
  { idea: 'Ask your followers: which color/style do you prefer?', type: 'engagement' },
  { idea: 'Share a customer review or testimonial', type: 'engagement' },
  { idea: 'Show your workspace or studio setup', type: 'behind-scenes' },
  { idea: 'Create a flat-lay arrangement of your products', type: 'product' },
  { idea: 'Share a tip related to your craft or product', type: 'educational' },
  { idea: 'Post a "day in the life" story of running your business', type: 'behind-scenes' },
  { idea: 'Highlight a seasonal or limited-edition product', type: 'seasonal' },
  { idea: 'Share your packaging process', type: 'behind-scenes' },
];

// Get a random curated idea (no API needed)
export function getRandomIdea(): ContentIdea {
  return GENERIC_IDEAS[Math.floor(Math.random() * GENERIC_IDEAS.length)];
}

// Get multiple unique random ideas
export function getRandomIdeas(count: number): ContentIdea[] {
  const shuffled = [...GENERIC_IDEAS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Get an AI-powered content idea (requires Gemini key)
export async function getAIContentIdea(businessType: string, businessName: string, recentCaptions: string[]): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return getRandomIdea().idea;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const recentContext = recentCaptions.length > 0
      ? `They recently posted about: ${recentCaptions.slice(0, 3).join('; ')}`
      : 'They haven\'t posted yet.';

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });

    const result = await model.generateContent(
      `You are a social media strategist for a ${businessType} business called "${businessName}". ` +
      `It's ${currentMonth}. ${recentContext} ` +
      `Suggest ONE creative, specific social media post idea. Be actionable and brief (1-2 sentences). ` +
      `Don't use generic advice — make it specific to their business type.`
    );

    return result.response.text().trim();
  } catch {
    return getRandomIdea().idea;
  }
}
