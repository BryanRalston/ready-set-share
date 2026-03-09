// Business seasonal calendar
// Provides context-aware season data, upcoming events, content tips, and hashtag suggestions

export interface SeasonalEvent {
  name: string;
  date: Date;
  daysUntil: number;
  postingRecommendation: string;
  hashtags: string[];
}

export interface SeasonInfo {
  season: string;
  icon: string;
  upcomingEvents: SeasonalEvent[];
  contentTips: string[];
  hashtagSuggestions: string[];
  colors: SeasonalColors;
}

export interface SeasonalColors {
  primary: string;
  secondary: string;
  accent: string;
  names: string[];
}

interface RawEvent {
  name: string;
  month: number;
  day: number;
  postingRecommendation: string;
  hashtags: string[];
}

const BUSINESS_EVENTS: RawEvent[] = [
  { name: "New Year's", month: 1, day: 1, postingRecommendation: 'Kick off the year with fresh product launches and "new year, new look" content.', hashtags: ['#NewYear', '#FreshStart', '#NewYearNewYou', '#ShopSmall'] },
  { name: "Valentine's Day", month: 2, day: 14, postingRecommendation: 'Post gift ideas and themed products 2 weeks before. Highlight gift packaging options.', hashtags: ['#ValentinesDay', '#GiftIdeas', '#LoveLocal', '#ValentineGift', '#ShopSmall'] },
  { name: "St. Patrick's Day", month: 3, day: 17, postingRecommendation: 'Feature green-themed products and festive promotions 10 days before.', hashtags: ['#StPatricksDay', '#LuckyFinds', '#GreenTheme', '#ShopLocal'] },
  { name: 'Easter', month: 4, day: 1, postingRecommendation: 'Spring-themed product showcases 3 weeks before. Pastel styling and seasonal bundles.', hashtags: ['#Easter', '#SpringSale', '#SpringStyle', '#EasterGifts', '#ShopSmall'] },
  { name: "Mother's Day", month: 5, day: 11, postingRecommendation: 'Push gift guides hard 2 weeks before. "Perfect gift for Mom" angle works great.', hashtags: ['#MothersDay', '#GiftForMom', '#MomDeservesBest', '#ShopSmall', '#HandmadeGift'] },
  { name: "Father's Day", month: 6, day: 15, postingRecommendation: 'Feature gifts for dads 2 weeks before. Bundle deals and personalization options.', hashtags: ['#FathersDay', '#GiftForDad', '#DadDeservesBest', '#ShopSmall', '#UniqueGifts'] },
  { name: 'Fourth of July', month: 7, day: 4, postingRecommendation: 'Patriotic and summer-themed products 3 weeks before. Highlight outdoor-ready items.', hashtags: ['#4thOfJuly', '#FourthOfJuly', '#AmericanMade', '#PatrioticStyle', '#SummerSale'] },
  { name: 'Back to School', month: 8, day: 15, postingRecommendation: 'Back-to-school promotions and teacher gift ideas early August.', hashtags: ['#BackToSchool', '#TeacherGifts', '#SchoolReady', '#ShopSmall'] },
  { name: 'Halloween', month: 10, day: 31, postingRecommendation: 'Spooky and fall-themed products 3 weeks before. Show versatile seasonal designs.', hashtags: ['#Halloween', '#SpookySeason', '#FallVibes', '#TrickOrTreat', '#ShopSmall'] },
  { name: 'Thanksgiving', month: 11, day: 27, postingRecommendation: 'Gratitude-themed content and hosting essentials early November.', hashtags: ['#Thanksgiving', '#GratefulSmallBiz', '#HarvestSeason', '#ShopSmall', '#ThankfulForCustomers'] },
  { name: 'Black Friday', month: 11, day: 28, postingRecommendation: 'Tease deals 1 week before. Highlight handmade value over big-box discounts.', hashtags: ['#BlackFriday', '#SmallBizDeals', '#BlackFridaySale', '#ShopSmall'] },
  { name: 'Small Business Saturday', month: 11, day: 29, postingRecommendation: 'Your biggest advocacy day! Share your story, show your process, rally your community.', hashtags: ['#SmallBusinessSaturday', '#ShopSmall', '#SupportLocal', '#SmallBizSaturday', '#Handmade'] },
  { name: 'Christmas', month: 12, day: 25, postingRecommendation: 'Start holiday content right after Thanksgiving. Post daily in December — gift guides, shipping deadlines, and real customer photos.', hashtags: ['#Christmas', '#HolidayGifts', '#ChristmasShopping', '#HandmadeHoliday', '#ShopSmall', '#GiftIdeas'] },
];

function getSeasonName(month: number): string {
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall';
  return 'Winter';
}

function getSeasonIcon(season: string): string {
  switch (season) {
    case 'Spring': return '🌸';
    case 'Summer': return '☀️';
    case 'Fall': return '🍂';
    case 'Winter': return '❄️';
    default: return '🌿';
  }
}

export function getSeasonalColors(season?: string): SeasonalColors {
  const s = season || getSeasonName(new Date().getMonth() + 1);
  switch (s) {
    case 'Spring':
      return { primary: '#E8B4CB', secondary: '#A8C5A0', accent: '#F5D6E8', names: ['Blush Pink', 'Sage Green', 'Lavender', 'Cream'] };
    case 'Summer':
      return { primary: '#E85D4A', secondary: '#1B4B8A', accent: '#F5D6E8', names: ['Patriotic Red', 'Navy Blue', 'Sunflower Yellow', 'White'] };
    case 'Fall':
      return { primary: '#C8602A', secondary: '#8B4513', accent: '#DAA520', names: ['Burnt Orange', 'Rustic Brown', 'Gold', 'Deep Red'] };
    case 'Winter':
      return { primary: '#B22222', secondary: '#006400', accent: '#FFD700', names: ['Classic Red', 'Evergreen', 'Gold', 'Silver'] };
    default:
      return { primary: '#7C9A6E', secondary: '#D4A574', accent: '#A8C5A0', names: ['Sage', 'Gold', 'Eucalyptus'] };
  }
}

function getContentTips(month: number): string[] {
  const tips: Record<number, string[]> = {
    1: ['Post New Year promotions and fresh product launches', 'Share your goals for the year — customers love a behind-the-scenes look', 'Start teasing Valentine\'s Day products early'],
    2: ['Valentine\'s Day gift guides are your top priority this month', 'Show gift packaging and shipping options', 'Countdown posts to Valentine\'s Day build urgency'],
    3: ['Spring is here! Fresh, bright product photos perform best', 'Show your process — behind-the-scenes content is highly engaging', 'Easter and spring prep content starts mid-March'],
    4: ['Easter and spring promotions peak now', 'Start Mother\'s Day "gift for Mom" content', 'Show before/after transformations with your products'],
    5: ['Mother\'s Day rush — post gift guides daily', 'Memorial Day promotions for summer kickoff', 'Transition to summer products after Memorial Day'],
    6: ['Father\'s Day gift guides and promotions', 'Fourth of July prep starts now', 'Summer product features — show items in real-life settings'],
    7: ['Patriotic content for July 4th', 'Summer product care tips resonate well', 'Start hinting at fall collection coming soon'],
    8: ['Back to school promotions and teacher gift ideas', 'Early fall product reveals build anticipation', 'Summer clearance posts to make room for fall inventory'],
    9: ['Fall collection launch! Your busiest season starts', 'Show seasonal materials and autumn styling', 'Behind-the-scenes content of your creative process'],
    10: ['Halloween-themed content is trending', 'Versatile fall designs that transition through the season sell best', 'Start Thanksgiving content late October'],
    11: ['Thanksgiving and gratitude-themed content early month', 'Black Friday / Small Business Saturday deals', 'Christmas product launches right after Thanksgiving!'],
    12: ['Post daily — this is your peak month', 'Gift guides, custom order deadlines, shipping cutoffs', 'Show your products in real customer settings for social proof'],
  };
  return tips[month] || tips[1];
}

function getBaseHashtags(businessType?: string): string[] {
  const base = ['#ShopSmall', '#Handmade', '#SmallBusiness', '#SupportLocal', '#ShopLocal', '#HomeDecor', '#HandmadeWithLove'];
  const seasonal: Record<string, string[]> = {
    Spring: ['#SpringStyle', '#SpringDecor', '#FreshFinds', '#SpringCollection', '#NewArrivals'],
    Summer: ['#SummerStyle', '#SummerVibes', '#SummerSale', '#OutdoorLiving'],
    Fall: ['#FallDecor', '#AutumnVibes', '#FallStyle', '#CozyVibes', '#FallFinds'],
    Winter: ['#WinterStyle', '#HolidayDecor', '#HolidayGifts', '#WinterWonderland'],
  };
  const season = getSeasonName(new Date().getMonth() + 1);
  const businessTags = businessType
    ? [`#${businessType.replace(/\s+/g, '')}`, `#${businessType.replace(/\s+/g, '')}Shop`]
    : [];
  return [...base, ...businessTags, ...(seasonal[season] || [])];
}

export function getCurrentSeason(): SeasonInfo {
  const now = new Date();
  const month = now.getMonth() + 1;
  const season = getSeasonName(month);

  return {
    season,
    icon: getSeasonIcon(season),
    upcomingEvents: getUpcomingDates(45),
    contentTips: getContentTips(month),
    hashtagSuggestions: getBaseHashtags(),
    colors: getSeasonalColors(season),
  };
}

export function getSeasonalNudge(): string {
  const now = new Date();
  const month = now.getMonth() + 1;

  const nudges: Record<number, string> = {
    1: 'New year, fresh content! Share your resolutions and new products.',
    2: 'Valentine\'s Day is coming! Gift guides and themed products perform great.',
    3: 'Spring is here! Bright, fresh product photos are what people want to see.',
    4: 'Easter is around the corner. Mother\'s Day prep starts now too!',
    5: 'Mother\'s Day rush! Post gift ideas daily — this is a huge sales window.',
    6: 'Summer vibes and Father\'s Day. Show your products in outdoor settings.',
    7: 'Patriotic content for the 4th! Start teasing your fall collection.',
    8: 'Back to school + early fall reveals. Build anticipation!',
    9: 'Fall season is HERE. Your followers are craving autumn content!',
    10: 'Halloween peak + fall in full swing. Post your most seasonal content!',
    11: 'Thanksgiving and holiday prep — your busiest time of year starts now!',
    12: 'Holiday peak! Post daily, show real customers, push gift guides and deadlines.',
  };

  return nudges[month] || nudges[1];
}

export function getUpcomingDates(daysAhead: number = 30): SeasonalEvent[] {
  const now = new Date();
  const events: SeasonalEvent[] = [];

  for (const event of BUSINESS_EVENTS) {
    // Check this year and next year
    for (const yearOffset of [0, 1]) {
      const year = now.getFullYear() + yearOffset;
      const eventDate = new Date(year, event.month - 1, event.day);
      const diffMs = eventDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= daysAhead) {
        events.push({
          name: event.name,
          date: eventDate,
          daysUntil: diffDays,
          postingRecommendation: event.postingRecommendation,
          hashtags: event.hashtags,
        });
      }
    }
  }

  return events.sort((a, b) => a.daysUntil - b.daysUntil);
}
