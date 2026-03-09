export type BusinessType =
  | 'wreaths' | 'candles' | 'jewelry' | 'pottery'
  | 'baked-goods' | 'soap' | 'art' | 'clothing'
  | 'woodwork' | 'flowers' | 'crafts' | 'other';

export interface BusinessTypeInfo {
  key: BusinessType;
  label: string;
  emoji: string;
  defaultKeywords: string[];
  exampleDescription: string;
}

export const BUSINESS_TYPES: BusinessTypeInfo[] = [
  { key: 'wreaths', label: 'Wreaths', emoji: '🌿', defaultKeywords: ['wreath', 'door decor', 'handmade'], exampleDescription: 'Handcrafted wreaths for every season' },
  { key: 'candles', label: 'Candles', emoji: '🕯️', defaultKeywords: ['candle', 'soy wax', 'handpoured'], exampleDescription: 'Hand-poured candles with natural fragrances' },
  { key: 'jewelry', label: 'Jewelry', emoji: '💍', defaultKeywords: ['jewelry', 'handmade', 'artisan'], exampleDescription: 'Unique handcrafted jewelry pieces' },
  { key: 'pottery', label: 'Pottery', emoji: '🏺', defaultKeywords: ['pottery', 'ceramic', 'handmade'], exampleDescription: 'Handmade pottery and ceramic art' },
  { key: 'baked-goods', label: 'Baked Goods', emoji: '🧁', defaultKeywords: ['bakery', 'homemade', 'fresh baked'], exampleDescription: 'Fresh-baked treats made with love' },
  { key: 'soap', label: 'Soap & Bath', emoji: '🧼', defaultKeywords: ['soap', 'bath bomb', 'natural skincare'], exampleDescription: 'Natural handmade soaps and bath products' },
  { key: 'art', label: 'Art & Prints', emoji: '🎨', defaultKeywords: ['art', 'print', 'original artwork'], exampleDescription: 'Original artwork and fine art prints' },
  { key: 'clothing', label: 'Clothing', emoji: '👗', defaultKeywords: ['fashion', 'handmade', 'boutique'], exampleDescription: 'Unique clothing and accessories' },
  { key: 'woodwork', label: 'Woodwork', emoji: '🪵', defaultKeywords: ['woodwork', 'handcrafted', 'custom'], exampleDescription: 'Custom woodwork and home decor' },
  { key: 'flowers', label: 'Flowers', emoji: '💐', defaultKeywords: ['flowers', 'bouquet', 'floral arrangement'], exampleDescription: 'Beautiful floral arrangements for any occasion' },
  { key: 'crafts', label: 'General Crafts', emoji: '✂️', defaultKeywords: ['handmade', 'craft', 'artisan'], exampleDescription: 'Handcrafted goods made with care' },
  { key: 'other', label: 'Other', emoji: '🛍️', defaultKeywords: ['small business', 'handmade', 'shop small'], exampleDescription: 'Quality products from a small business' },
];

export function getBusinessTypeInfo(type: BusinessType): BusinessTypeInfo {
  return BUSINESS_TYPES.find(t => t.key === type) || BUSINESS_TYPES[BUSINESS_TYPES.length - 1];
}
