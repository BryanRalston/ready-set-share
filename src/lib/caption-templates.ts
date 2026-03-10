export interface CaptionTemplate {
  id: string;
  category: 'product' | 'behind-scenes' | 'engagement' | 'seasonal' | 'educational' | 'promotion';
  title: string;
  template: string;
  hashtags: string[];
  tip?: string;
}

// ─── Categories ───────────────────────────────────────────────────────
export function getCategories(): Array<{ key: string; label: string; emoji: string }> {
  return [
    { key: 'product', label: 'Product', emoji: '✨' },
    { key: 'behind-scenes', label: 'Behind the Scenes', emoji: '🎬' },
    { key: 'engagement', label: 'Engagement', emoji: '💬' },
    { key: 'seasonal', label: 'Seasonal', emoji: '🌸' },
    { key: 'educational', label: 'Educational', emoji: '💡' },
    { key: 'promotion', label: 'Promotion', emoji: '🏷️' },
  ];
}

// ─── Generic templates (work for any business type) ──────────────────

const GENERIC_TEMPLATES: CaptionTemplate[] = [
  // Product (4)
  {
    id: 'g-prod-1',
    category: 'product',
    title: 'New Product Drop',
    template: 'Meet [product name] — our newest creation! [One thing that makes it special]. Available now — link in bio!',
    hashtags: ['#newproduct', '#handmade', '#shopsmall', '#justlaunched'],
    tip: 'Post new products between 11am-1pm for maximum visibility.',
  },
  {
    id: 'g-prod-2',
    category: 'product',
    title: 'Inspiration Story',
    template: 'This [product] was inspired by [inspiration]. Every detail is [quality adjective] — from [detail 1] to [detail 2].',
    hashtags: ['#handcrafted', '#artisan', '#madewithlove', '#inspiration'],
    tip: 'People connect with the story behind the product more than the product itself.',
  },
  {
    id: 'g-prod-3',
    category: 'product',
    title: 'Product Close-Up',
    template: 'The details on this [product] are everything. [Describe a detail]. Each one is made by hand, so no two are exactly alike.',
    hashtags: ['#details', '#handmade', '#oneofakind', '#craftsmanship'],
  },
  {
    id: 'g-prod-4',
    category: 'product',
    title: 'Customer Favorite',
    template: 'You asked, we made more! Our [product name] has been your most-requested item. [What makes it popular]. Grab yours before they sell out!',
    hashtags: ['#bestseller', '#customerfavorite', '#restocked', '#shopsmall'],
    tip: 'Social proof is powerful — mention when something is popular.',
  },

  // Behind the Scenes (3)
  {
    id: 'g-bts-1',
    category: 'behind-scenes',
    title: 'Process Peek',
    template: "Here's a peek at how we make our [product type]! The process starts with [first step] and takes about [time]. Worth every minute.",
    hashtags: ['#behindthescenes', '#process', '#handmade', '#makerslife'],
    tip: 'Behind-the-scenes content gets 3x more engagement than product-only posts.',
  },
  {
    id: 'g-bts-2',
    category: 'behind-scenes',
    title: 'Studio Day',
    template: "Studio day! Working on [what you're making] today. This is my favorite part of the process — [why].",
    hashtags: ['#studiolife', '#makersgonnamake', '#workinprogress', '#creativespace'],
  },
  {
    id: 'g-bts-3',
    category: 'behind-scenes',
    title: 'Packing Orders',
    template: 'Packing up orders today! Each one gets [special packaging detail]. Headed to [city/state] and beyond. Thank you for your support!',
    hashtags: ['#packingorders', '#smallbusinesslife', '#thankyou', '#supportsmall'],
    tip: 'Showing orders being packed builds trust and excitement.',
  },

  // Engagement (4)
  {
    id: 'g-eng-1',
    category: 'engagement',
    title: 'This or That',
    template: 'Quick question: [option A] or [option B]? Drop your pick in the comments!',
    hashtags: ['#thisorthat', '#youpick', '#poll', '#community'],
    tip: 'Simple either/or questions get the most comments.',
  },
  {
    id: 'g-eng-2',
    category: 'engagement',
    title: 'Ask Your Audience',
    template: "What's your favorite way to [use/display/enjoy] [product type]? We love hearing your ideas!",
    hashtags: ['#community', '#tellusbelow', '#shopsmall', '#customerideas'],
  },
  {
    id: 'g-eng-3',
    category: 'engagement',
    title: 'Caption Contest',
    template: "Caption this! Best comment gets [prize — e.g. 10% off]. We'll pick a winner on [day]. Go!",
    hashtags: ['#captionthis', '#contest', '#giveaway', '#funpost'],
    tip: 'Contests boost engagement and attract new followers.',
  },
  {
    id: 'g-eng-4',
    category: 'engagement',
    title: 'Share Your Story',
    template: 'We love seeing how you use our [product type]! Tag us in your photos or share in the comments — you might get featured!',
    hashtags: ['#shareyourstory', '#customerfeature', '#community', '#ugc'],
  },

  // Seasonal (3)
  {
    id: 'g-sea-1',
    category: 'seasonal',
    title: 'Seasonal Launch',
    template: '[Season] is here and so is our [seasonal product]! Perfect for [use case]. Limited quantities available.',
    hashtags: ['#seasonal', '#limitededition', '#shopsmall', '#newcollection'],
  },
  {
    id: 'g-sea-2',
    category: 'seasonal',
    title: 'Holiday Gift Guide',
    template: "[Holiday] is coming! Our [product] makes the perfect gift for [who]. Order by [date] to get it in time.",
    hashtags: ['#giftguide', '#perfectgift', '#shopsmall', '#handmadegifts'],
    tip: 'Post gift guides 3-4 weeks before the holiday for best results.',
  },
  {
    id: 'g-sea-3',
    category: 'seasonal',
    title: 'Seasonal Mood',
    template: "Nothing says [season] like [sensory detail]. Our [product] brings that feeling right into your [home/space]. What's your favorite part of [season]?",
    hashtags: ['#seasonal', '#homedecor', '#vibes', '#shopsmall'],
  },

  // Educational (3)
  {
    id: 'g-edu-1',
    category: 'educational',
    title: 'Fun Fact',
    template: 'Did you know? [Interesting fact about your craft]. That\'s why we [unique practice] — it makes all the difference.',
    hashtags: ['#didyouknow', '#funfact', '#handmade', '#crafteducation'],
    tip: 'Educational content positions you as an expert and builds trust.',
  },
  {
    id: 'g-edu-2',
    category: 'educational',
    title: 'Pro Tip',
    template: 'Pro tip: [Helpful advice related to your product]. This is one of those little things that [benefit].',
    hashtags: ['#protip', '#tips', '#helpful', '#knowyourcraft'],
  },
  {
    id: 'g-edu-3',
    category: 'educational',
    title: 'Care Instructions',
    template: 'How to care for your [product type]: [Step 1]. [Step 2]. [Step 3]. Take care of it and it\'ll last [how long]!',
    hashtags: ['#careguide', '#tips', '#quality', '#handmade'],
  },

  // Promotion (3)
  {
    id: 'g-promo-1',
    category: 'promotion',
    title: 'Flash Sale',
    template: "This week only: [offer details]! Use code [CODE] at checkout. Don't miss out!",
    hashtags: ['#sale', '#discount', '#limitedtime', '#shopsmall'],
    tip: 'Create urgency with a clear end date.',
  },
  {
    id: 'g-promo-2',
    category: 'promotion',
    title: 'Back in Stock',
    template: 'Our bestseller is back in stock! [Product name] — [why people love it]. Grab yours before they\'re gone again.',
    hashtags: ['#backinstock', '#bestseller', '#restocked', '#dontmissout'],
  },
  {
    id: 'g-promo-3',
    category: 'promotion',
    title: 'Free Shipping',
    template: 'Free shipping on all orders over [amount] this [weekend/week]! Perfect time to grab that [product] you\'ve been eyeing.',
    hashtags: ['#freeshipping', '#shopnow', '#deal', '#handmade'],
  },
];

// ─── Business-type-specific templates ────────────────────────────────

const TYPE_SPECIFIC_TEMPLATES: Record<string, CaptionTemplate[]> = {
  wreaths: [
    {
      id: 'wr-prod-1',
      category: 'product',
      title: 'Front Door Refresh',
      template: 'Front door refresh! This [season] wreath features [materials] in [color palette]. Measures [size] — perfect for [door type].',
      hashtags: ['#wreathmaking', '#frontdoordecor', '#wreathsofinstagram', '#doordecor'],
    },
    {
      id: 'wr-prod-2',
      category: 'product',
      title: 'Wreath of the Week',
      template: 'Wreath of the week: [wreath name]! Made with [materials] on a [base type] base. This one is giving [vibe — e.g. cozy farmhouse, modern elegance].',
      hashtags: ['#wreathoftheday', '#handmadewreath', '#homedecor', '#wreathdesign'],
    },
    {
      id: 'wr-bts-1',
      category: 'behind-scenes',
      title: 'Wreath Assembly',
      template: 'Building this beauty from scratch! Started with a [base type] form, then layered on [material 1], [material 2], and finished with [accent]. Swipe to see the transformation!',
      hashtags: ['#wreathmaking', '#behindthescenes', '#diy', '#craftprocess'],
    },
    {
      id: 'wr-sea-1',
      category: 'seasonal',
      title: 'Seasonal Door Decor',
      template: '[Season] wreaths are here! This year\'s collection features [theme/colors]. Which style is your front door calling for?',
      hashtags: ['#seasonalwreath', '#doordecor', '#seasonaldecor', '#wreathseason'],
      tip: 'Seasonal wreaths sell best 2-3 weeks before the season starts.',
    },
    {
      id: 'wr-eng-1',
      category: 'engagement',
      title: 'Pick Your Wreath',
      template: 'Left or right? Help me decide which [season] wreath to put on my own door! [Option A description] or [Option B description]?',
      hashtags: ['#wreathpoll', '#youpick', '#doordecor', '#wreathlife'],
    },
    {
      id: 'wr-edu-1',
      category: 'educational',
      title: 'Wreath Care Tips',
      template: 'Wreath care 101: [Tip — e.g. keep it out of direct rain]. A well-cared-for wreath can last [timeframe]. Your front door will thank you!',
      hashtags: ['#wreathtips', '#wreathcare', '#doordecor', '#homecare'],
    },
  ],

  candles: [
    {
      id: 'ca-prod-1',
      category: 'product',
      title: 'Scent Profile',
      template: 'Light notes of [top scent], a heart of [middle scent], and a base of [base scent]. [Candle name] burns for [hours] hours of pure bliss.',
      hashtags: ['#candlelover', '#scentoftheday', '#handpouredcandles', '#candlemaking'],
    },
    {
      id: 'ca-prod-2',
      category: 'product',
      title: 'New Scent Drop',
      template: 'New scent alert! [Candle name] — imagine [scent description]. Poured in small batches with [wax type] wax and [wick type] wicks.',
      hashtags: ['#newscent', '#candledrop', '#soycandle', '#handpoured'],
    },
    {
      id: 'ca-bts-1',
      category: 'behind-scenes',
      title: 'Pour Day',
      template: 'Pour day! Melting [wax type] wax at [temperature]. The whole studio smells like [scent]. This batch makes about [number] candles.',
      hashtags: ['#pourday', '#candlemaking', '#behindthescenes', '#smallbatch'],
      tip: 'Videos of wax pouring are incredibly satisfying — great for Reels.',
    },
    {
      id: 'ca-eng-1',
      category: 'engagement',
      title: 'Scent Vote',
      template: 'Next seasonal scent — help me choose! [Scent A] or [Scent B]? The winning scent drops [date].',
      hashtags: ['#scentpoll', '#candlecommunity', '#youpick', '#newscent'],
    },
    {
      id: 'ca-edu-1',
      category: 'educational',
      title: 'Candle Burning Tips',
      template: 'Candle tip: Always burn until the wax pool reaches the edges on the first light. This prevents [tunneling] and gives you [hours] more burn time!',
      hashtags: ['#candletips', '#candlecare', '#protip', '#candlelover'],
    },
    {
      id: 'ca-sea-1',
      category: 'seasonal',
      title: 'Seasonal Scent',
      template: '[Season] called and it wants [scent description]. Our [candle name] captures that feeling perfectly. Limited batch — [number] available.',
      hashtags: ['#seasonalcandle', '#limitededition', '#seasonalscent', '#cozy'],
    },
  ],

  jewelry: [
    {
      id: 'jw-prod-1',
      category: 'product',
      title: 'Collection Spotlight',
      template: 'The [collection name] collection — handcrafted in [material]. Each piece takes [time] to create. Which is your favorite?',
      hashtags: ['#handmadejewelry', '#artisanjewelry', '#jewelrycollection', '#wearableart'],
    },
    {
      id: 'jw-prod-2',
      category: 'product',
      title: 'Piece Detail',
      template: 'Every [piece type] in this collection features [detail — e.g. hand-set stones, hammered texture]. Made with [material] for a look that\'s [adjective].',
      hashtags: ['#jewelrydetails', '#handmade', '#artisan', '#finejewelry'],
    },
    {
      id: 'jw-bts-1',
      category: 'behind-scenes',
      title: 'Bench Work',
      template: 'At the bench today working on [what]. This step — [process step] — is where the magic happens. [Material] transforms into something you\'ll wear forever.',
      hashtags: ['#jewelrymaking', '#benchwork', '#goldsmiths', '#behindthescenes'],
    },
    {
      id: 'jw-eng-1',
      category: 'engagement',
      title: 'Style Poll',
      template: 'Gold or silver? Minimal or statement? Tell us your jewelry style and we\'ll recommend a piece from our collection!',
      hashtags: ['#jewelrystyle', '#poll', '#accessorize', '#personalstyle'],
    },
    {
      id: 'jw-edu-1',
      category: 'educational',
      title: 'Material Guide',
      template: '[Material] vs [material] — what\'s the difference? [Brief explanation]. We use [your choice] because [reason]. Your jewelry deserves the best.',
      hashtags: ['#jewelryeducation', '#knowyourjewelry', '#materials', '#quality'],
    },
    {
      id: 'jw-sea-1',
      category: 'seasonal',
      title: 'Gift-Worthy',
      template: 'Looking for the perfect [occasion] gift? Our [piece type] in [material] comes gift-wrapped and ready to make someone\'s day.',
      hashtags: ['#jewelrygift', '#giftideas', '#handmadegift', '#treatyourself'],
    },
    {
      id: 'jw-promo-1',
      category: 'promotion',
      title: 'Stack & Save',
      template: 'Mix, match, and stack! Buy [number]+ pieces from our [collection] and get [discount]. Build the set you\'ve been dreaming of.',
      hashtags: ['#stacksale', '#jewelrysale', '#mixandmatch', '#treatyourself'],
    },
  ],

  pottery: [
    {
      id: 'po-prod-1',
      category: 'product',
      title: 'Functional Art',
      template: 'Wheel-thrown and glazed by hand. This [piece] in our [glaze name] finish holds [amount] — perfect for your morning [beverage].',
      hashtags: ['#handmadepottery', '#ceramics', '#wheelthrownpottery', '#functionalart'],
    },
    {
      id: 'po-prod-2',
      category: 'product',
      title: 'Glaze Reveal',
      template: 'Just opened the kiln! This [glaze name] glaze came out [description]. Fired to cone [number] for [hours] hours. No two pieces are the same.',
      hashtags: ['#kilnopening', '#glazereveal', '#ceramicart', '#pottery'],
    },
    {
      id: 'po-bts-1',
      category: 'behind-scenes',
      title: 'On the Wheel',
      template: '[Pounds] pounds of [clay type] clay, centered and ready to throw. Today I\'m making [pieces]. The wheel is my happy place.',
      hashtags: ['#potterywheel', '#throwing', '#ceramics', '#claylife'],
      tip: 'Wheel-throwing videos are mesmerizing — even a 10-second clip gets great engagement.',
    },
    {
      id: 'po-eng-1',
      category: 'engagement',
      title: 'Glaze Choice',
      template: 'Which glaze for this [piece type]? [Glaze A — description] or [Glaze B — description]? I\'ll fire the winner this weekend!',
      hashtags: ['#glazepoll', '#youpick', '#pottery', '#ceramicchoices'],
    },
    {
      id: 'po-edu-1',
      category: 'educational',
      title: 'Clay to Cup',
      template: 'From clay to cup: [number] steps, [number] days, and [number] firings. Here\'s why handmade pottery takes time — and why it\'s worth the wait.',
      hashtags: ['#potteryprocess', '#handmade', '#slowcraft', '#artisanmade'],
    },
    {
      id: 'po-sea-1',
      category: 'seasonal',
      title: 'Seasonal Collection',
      template: 'Our [season] collection is glazed in [colors]. Inspired by [seasonal inspiration]. Each piece is food-safe and dishwasher-friendly.',
      hashtags: ['#seasonalpottery', '#ceramiccollection', '#handmade', '#tableware'],
    },
  ],

  'baked-goods': [
    {
      id: 'bg-prod-1',
      category: 'product',
      title: 'Fresh from the Oven',
      template: 'Fresh from the oven! Today\'s batch: [item]. Made with [key ingredient] and a whole lot of love. Order yours for [day/event]!',
      hashtags: ['#freshbaked', '#homemade', '#bakery', '#madewithlove'],
    },
    {
      id: 'bg-prod-2',
      category: 'product',
      title: 'Flavor Spotlight',
      template: 'Our [product] in [flavor] is back! [Description of taste/texture]. Pairs perfectly with [pairing]. Available [when].',
      hashtags: ['#bakerylife', '#flavoroftheweek', '#treatyourself', '#homebaked'],
    },
    {
      id: 'bg-bts-1',
      category: 'behind-scenes',
      title: 'Early Morning Bake',
      template: 'The alarm goes off at [time] so your [product] can be fresh by [time]. [Number] batches today. The kitchen smells like [scent description].',
      hashtags: ['#bakerlife', '#earlymorning', '#freshbaked', '#behindthescenes'],
      tip: 'Early morning baking shots feel authentic and build connection.',
    },
    {
      id: 'bg-eng-1',
      category: 'engagement',
      title: 'Flavor Vote',
      template: 'New flavor Friday! Should I try [flavor A] or [flavor B] [product]? Most votes wins — I\'ll bake the winner next week!',
      hashtags: ['#flavorvote', '#newrecipe', '#youdecide', '#bakingcommunity'],
    },
    {
      id: 'bg-edu-1',
      category: 'educational',
      title: 'Baking Secret',
      template: 'Secret to perfect [product]: [tip]. Most people skip this step, but it\'s the difference between good and unforgettable.',
      hashtags: ['#bakingtips', '#bakingsecrets', '#protip', '#homebaker'],
    },
    {
      id: 'bg-sea-1',
      category: 'seasonal',
      title: 'Seasonal Menu',
      template: '[Season] menu is live! Featuring [item 1], [item 2], and [item 3]. Pre-orders open now — they sell out fast!',
      hashtags: ['#seasonalmenu', '#limitedtime', '#preorder', '#bakery'],
    },
    {
      id: 'bg-promo-1',
      category: 'promotion',
      title: 'Dozen Deal',
      template: 'Order a dozen [product] and get [number] free! Perfect for [occasion]. Order by [date] — pickup or delivery available.',
      hashtags: ['#bakerydeal', '#ordernow', '#treatyourself', '#freshbaked'],
    },
  ],

  soap: [
    {
      id: 'sp-prod-1',
      category: 'product',
      title: 'Bar Spotlight',
      template: 'Our [soap name] bar — scented with [scent] and colored naturally with [colorant]. Gentle enough for [skin type] skin.',
      hashtags: ['#handmadesoap', '#naturalsoap', '#skincare', '#artisansoap'],
    },
    {
      id: 'sp-bts-1',
      category: 'behind-scenes',
      title: 'Soap Cutting',
      template: 'The most satisfying part of soap making: the cut! This batch of [soap name] cured for [weeks] weeks. Swipe to see inside!',
      hashtags: ['#soapcutting', '#soapmaking', '#satisfying', '#asmr'],
      tip: 'Soap cutting videos are incredibly shareable — perfect for Reels.',
    },
    {
      id: 'sp-edu-1',
      category: 'educational',
      title: 'Ingredient Spotlight',
      template: 'Why we use [ingredient] in our soaps: [benefit 1], [benefit 2], and it feels [description] on your skin. Your body deserves ingredients you can pronounce.',
      hashtags: ['#naturalingredients', '#skincareeducation', '#cleanbeauty', '#soapmaking'],
    },
  ],

  art: [
    {
      id: 'ar-prod-1',
      category: 'product',
      title: 'New Piece',
      template: '"[Title]" — [medium], [dimensions]. This piece explores [theme/idea]. Prints and originals available through the link in bio.',
      hashtags: ['#originalart', '#artforsale', '#contemporaryart', '#artistsoninstagram'],
    },
    {
      id: 'ar-bts-1',
      category: 'behind-scenes',
      title: 'Studio Session',
      template: 'In the studio working on a new [medium] piece. The [color palette/subject] keeps pulling me in a direction I didn\'t expect. That\'s the best part.',
      hashtags: ['#studiolife', '#artstudio', '#workinprogress', '#artistlife'],
    },
    {
      id: 'ar-edu-1',
      category: 'educational',
      title: 'Technique Talk',
      template: 'One technique I use in almost every piece: [technique]. It creates [effect] and adds [quality]. Small details make the biggest impact.',
      hashtags: ['#arttechnique', '#learntopaint', '#arteducation', '#artisttips'],
    },
  ],

  clothing: [
    {
      id: 'cl-prod-1',
      category: 'product',
      title: 'New Drop',
      template: 'Just dropped: The [item name] in [fabric/color]. [Fit description]. Sizes [range] available. Style it with [pairing suggestion].',
      hashtags: ['#newdrop', '#handmadefashion', '#boutique', '#ootd'],
    },
    {
      id: 'cl-eng-1',
      category: 'engagement',
      title: 'Style Challenge',
      template: 'Show us how you\'d style our [item]! Tag us for a chance to be featured. Bonus points for [creative styling idea].',
      hashtags: ['#stylechallenge', '#ootd', '#fashioninspo', '#boutiquestyle'],
    },
    {
      id: 'cl-bts-1',
      category: 'behind-scenes',
      title: 'Fabric Selection',
      template: 'Choosing fabrics for the [season/collection] line. This [fabric type] in [color] has the most beautiful [quality — e.g. drape, texture]. Can\'t wait for you to feel it.',
      hashtags: ['#fabricshopping', '#fashiondesign', '#behindthescenes', '#textiles'],
    },
  ],

  woodwork: [
    {
      id: 'ww-prod-1',
      category: 'product',
      title: 'Finished Piece',
      template: 'This [piece] is made from [wood type] with a [finish type] finish. The grain on this one is [description]. Dimensions: [dimensions].',
      hashtags: ['#woodworking', '#handmade', '#woodcraft', '#customfurniture'],
    },
    {
      id: 'ww-bts-1',
      category: 'behind-scenes',
      title: 'Shop Time',
      template: 'In the shop milling [wood type] for a [project]. There\'s nothing like the smell of fresh-cut [wood type]. This piece will become a [final product].',
      hashtags: ['#woodshop', '#woodworking', '#makerslife', '#handcrafted'],
    },
    {
      id: 'ww-edu-1',
      category: 'educational',
      title: 'Wood Guide',
      template: '[Wood type A] vs [Wood type B]: [Key difference]. We choose our wood based on [criteria]. Here\'s why [your choice] works best for [product type].',
      hashtags: ['#woodworkingtips', '#woodknowledge', '#crafteducation', '#quality'],
    },
  ],

  flowers: [
    {
      id: 'fl-prod-1',
      category: 'product',
      title: 'Arrangement Spotlight',
      template: 'This [arrangement type] features [flower 1], [flower 2], and [greenery]. The [color palette] palette is perfect for [occasion/space].',
      hashtags: ['#floralarrangement', '#freshflowers', '#florist', '#flowersofinstagram'],
    },
    {
      id: 'fl-bts-1',
      category: 'behind-scenes',
      title: 'Market Morning',
      template: '[Time] at the flower market! Picked up gorgeous [flowers] for this week\'s arrangements. The colors this week are [description].',
      hashtags: ['#flowermarket', '#floristlife', '#freshflowers', '#behindthescenes'],
    },
    {
      id: 'fl-edu-1',
      category: 'educational',
      title: 'Flower Care',
      template: 'Make your flowers last longer: [Tip 1]. [Tip 2]. [Tip 3]. With proper care, this [arrangement/bouquet] will stay beautiful for [timeframe].',
      hashtags: ['#flowertips', '#flowercare', '#freshflowers', '#protip'],
    },
  ],
};

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Get all templates for a given business type.
 * Returns generic templates plus any type-specific ones, sorted by category.
 */
export function getTemplatesForType(businessType: string): CaptionTemplate[] {
  const specific = TYPE_SPECIFIC_TEMPLATES[businessType] || [];
  return [...GENERIC_TEMPLATES, ...specific];
}

/**
 * Get templates for a specific business type filtered to one category.
 */
export function getTemplatesByCategory(businessType: string, category: string): CaptionTemplate[] {
  return getTemplatesForType(businessType).filter(t => t.category === category);
}

/**
 * Extract placeholder names from a template string.
 * e.g. "Meet [product name] — [detail]" => ["product name", "detail"]
 */
export function extractPlaceholders(template: string): string[] {
  const matches = template.match(/\[([^\]]+)\]/g);
  if (!matches) return [];
  const names = matches.map(m => m.slice(1, -1));
  // Return unique placeholders in order of appearance
  return [...new Set(names)];
}

/**
 * Fill in template placeholders with user-provided values.
 * Any unfilled placeholders are left as-is.
 */
export function fillTemplate(template: string, values: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    if (value.trim()) {
      // Replace all occurrences of [key] with value
      result = result.split(`[${key}]`).join(value.trim());
    }
  }
  return result;
}
