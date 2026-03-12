export type BusinessType =
  | 'wreaths' | 'candles' | 'jewelry' | 'pottery'
  | 'baked-goods' | 'soap' | 'art' | 'clothing'
  | 'woodwork' | 'flowers' | 'crafts'
  | 'restaurant' | 'food-truck' | 'cafe'
  | 'salon' | 'barber' | 'cleaning' | 'landscaping'
  | 'fitness' | 'pet-services' | 'photography'
  | 'auto-detailing' | 'boutique' | 'coaching'
  | 'real-estate' | 'other';

export interface BusinessTypeInfo {
  key: BusinessType;
  label: string;
  emoji: string;
  defaultKeywords: string[];
  exampleDescription: string;
}

export const BUSINESS_TYPES: BusinessTypeInfo[] = [
  // Handmade & Crafts
  { key: 'wreaths', label: 'Wreaths', emoji: '🌿', defaultKeywords: ['wreath', 'door decor', 'handmade'], exampleDescription: 'Handcrafted wreaths for every season' },
  { key: 'candles', label: 'Candles', emoji: '🕯️', defaultKeywords: ['candle', 'soy wax', 'handpoured'], exampleDescription: 'Hand-poured candles with natural fragrances' },
  { key: 'jewelry', label: 'Jewelry', emoji: '💍', defaultKeywords: ['jewelry', 'handmade', 'artisan'], exampleDescription: 'Unique handcrafted jewelry pieces' },
  { key: 'pottery', label: 'Pottery', emoji: '🏺', defaultKeywords: ['pottery', 'ceramic', 'handmade'], exampleDescription: 'Handmade pottery and ceramic art' },
  { key: 'soap', label: 'Soap & Bath', emoji: '🧼', defaultKeywords: ['soap', 'bath bomb', 'natural skincare'], exampleDescription: 'Natural handmade soaps and bath products' },
  { key: 'art', label: 'Art & Prints', emoji: '🎨', defaultKeywords: ['art', 'print', 'original artwork'], exampleDescription: 'Original artwork and fine art prints' },
  { key: 'clothing', label: 'Clothing', emoji: '👗', defaultKeywords: ['fashion', 'handmade', 'boutique'], exampleDescription: 'Unique clothing and accessories' },
  { key: 'woodwork', label: 'Woodwork', emoji: '🪵', defaultKeywords: ['woodwork', 'handcrafted', 'custom'], exampleDescription: 'Custom woodwork and home decor' },
  { key: 'flowers', label: 'Flowers', emoji: '💐', defaultKeywords: ['flowers', 'bouquet', 'floral arrangement'], exampleDescription: 'Beautiful floral arrangements for any occasion' },
  { key: 'crafts', label: 'General Crafts', emoji: '✂️', defaultKeywords: ['handmade', 'craft', 'artisan'], exampleDescription: 'Handcrafted goods made with care' },

  // Food & Drink
  { key: 'baked-goods', label: 'Baked Goods', emoji: '🧁', defaultKeywords: ['bakery', 'homemade', 'fresh baked'], exampleDescription: 'Fresh-baked treats made with love' },
  { key: 'restaurant', label: 'Restaurant', emoji: '🍽️', defaultKeywords: ['restaurant', 'food', 'dining', 'local eats'], exampleDescription: 'Delicious meals made fresh daily' },
  { key: 'food-truck', label: 'Food Truck', emoji: '🚚', defaultKeywords: ['food truck', 'street food', 'local food'], exampleDescription: 'Street food with big flavor' },
  { key: 'cafe', label: 'Coffee & Cafe', emoji: '☕', defaultKeywords: ['coffee', 'cafe', 'latte', 'espresso'], exampleDescription: 'Your neighborhood coffee spot' },

  // Beauty & Wellness
  { key: 'salon', label: 'Hair Salon', emoji: '💇', defaultKeywords: ['hair', 'salon', 'hairstylist', 'beauty'], exampleDescription: 'Cuts, color, and styles that make you shine' },
  { key: 'barber', label: 'Barbershop', emoji: '💈', defaultKeywords: ['barber', 'haircut', 'fade', 'grooming'], exampleDescription: 'Classic cuts and sharp fades' },

  // Home Services
  { key: 'cleaning', label: 'Cleaning', emoji: '✨', defaultKeywords: ['cleaning', 'house cleaning', 'spotless', 'deep clean'], exampleDescription: 'Professional cleaning that sparkles' },
  { key: 'landscaping', label: 'Landscaping', emoji: '🌱', defaultKeywords: ['landscaping', 'lawn care', 'garden', 'outdoor'], exampleDescription: 'Beautiful yards and outdoor spaces' },
  { key: 'auto-detailing', label: 'Auto Detailing', emoji: '🚗', defaultKeywords: ['auto detailing', 'car wash', 'car care', 'detail'], exampleDescription: 'Making vehicles look showroom new' },

  // Health & Fitness
  { key: 'fitness', label: 'Fitness', emoji: '💪', defaultKeywords: ['fitness', 'personal trainer', 'workout', 'gym'], exampleDescription: 'Helping you reach your fitness goals' },

  // Professional Services
  { key: 'photography', label: 'Photography', emoji: '📸', defaultKeywords: ['photography', 'photographer', 'portraits', 'photos'], exampleDescription: 'Capturing moments that last forever' },
  { key: 'coaching', label: 'Coaching', emoji: '📚', defaultKeywords: ['coaching', 'mentor', 'growth', 'learning'], exampleDescription: 'Guiding you toward your goals' },
  { key: 'real-estate', label: 'Real Estate', emoji: '🏠', defaultKeywords: ['real estate', 'homes', 'property', 'realtor'], exampleDescription: 'Helping you find your perfect home' },

  // Retail
  { key: 'boutique', label: 'Boutique', emoji: '👜', defaultKeywords: ['boutique', 'shop', 'curated', 'retail'], exampleDescription: 'A curated collection of unique finds' },
  { key: 'pet-services', label: 'Pet Services', emoji: '🐾', defaultKeywords: ['pets', 'dog grooming', 'pet care', 'animals'], exampleDescription: 'Loving care for your furry friends' },

  // Catch-all
  { key: 'other', label: 'Other', emoji: '🛍️', defaultKeywords: ['small business', 'local', 'shop small'], exampleDescription: 'Quality products and services from a small business' },
];

export function getBusinessTypeInfo(type: BusinessType): BusinessTypeInfo {
  return BUSINESS_TYPES.find(t => t.key === type) || BUSINESS_TYPES[BUSINESS_TYPES.length - 1];
}
