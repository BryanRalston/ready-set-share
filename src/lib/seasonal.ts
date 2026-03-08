// Wreath business seasonal calendar
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

const WREATH_EVENTS: RawEvent[] = [
  { name: "Valentine's Day", month: 2, day: 14, postingRecommendation: 'Post heart & red wreaths 2 weeks before. Show gift-wrapping options.', hashtags: ['#ValentineWreath', '#HeartWreath', '#ValentinesDay', '#LoveDecor', '#RedWreath'] },
  { name: 'St. Patrick\'s Day', month: 3, day: 17, postingRecommendation: 'Green wreaths and shamrock designs 10 days before.', hashtags: ['#StPatricksWreath', '#GreenWreath', '#ShamrockDecor', '#IrishDecor'] },
  { name: 'Easter', month: 4, day: 20, postingRecommendation: 'Pastel spring wreaths 3 weeks before. Egg and bunny accents.', hashtags: ['#EasterWreath', '#SpringWreath', '#PastelDecor', '#EasterDecor', '#BunnyWreath'] },
  { name: "Mother's Day", month: 5, day: 11, postingRecommendation: 'Push gift wreaths hard 2 weeks before. "Perfect gift for Mom" angle.', hashtags: ['#MothersDay', '#GiftForMom', '#MothersDayWreath', '#MomDeservesBest', '#FloralWreath'] },
  { name: 'Memorial Day', month: 5, day: 26, postingRecommendation: 'Patriotic red/white/blue wreaths 1 week before.', hashtags: ['#MemorialDay', '#PatrioticWreath', '#RedWhiteBlue', '#AmericanWreath'] },
  { name: 'Fourth of July', month: 7, day: 4, postingRecommendation: 'Patriotic wreaths 3 weeks before. Show outdoor-ready designs.', hashtags: ['#4thOfJuly', '#PatrioticWreath', '#FourthOfJuly', '#AmericanDecor', '#RedWhiteBlueWreath'] },
  { name: 'Back to School', month: 8, day: 15, postingRecommendation: 'Teacher gift wreaths and classroom door designs early August.', hashtags: ['#BackToSchool', '#TeacherGift', '#ClassroomDecor', '#TeacherWreath'] },
  { name: 'Fall Season Kickoff', month: 9, day: 22, postingRecommendation: 'Start fall collection reveals mid-September. Pumpkins, leaves, warm tones.', hashtags: ['#FallWreath', '#AutumnDecor', '#FallDoorDecor', '#PumpkinWreath', '#AutumnWreath'] },
  { name: 'Halloween', month: 10, day: 31, postingRecommendation: 'Spooky wreaths 3 weeks before. Show versatile fall-to-Halloween designs.', hashtags: ['#HalloweenWreath', '#SpookyWreath', '#HalloweenDecor', '#SpookyDoor', '#TrickOrTreat'] },
  { name: 'Thanksgiving', month: 11, day: 27, postingRecommendation: 'Harvest wreaths early November. Show hosting & gratitude themes.', hashtags: ['#ThanksgivingWreath', '#HarvestWreath', '#GratefulDecor', '#FallHarvest', '#ThanksgivingDecor'] },
  { name: 'Christmas / Holiday Season', month: 12, day: 25, postingRecommendation: 'Start holiday wreaths right after Thanksgiving. Post daily in December.', hashtags: ['#ChristmasWreath', '#HolidayWreath', '#XmasDecor', '#ChristmasDoor', '#WinterWreath', '#HolidayDecor'] },
  { name: "New Year's", month: 1, day: 1, postingRecommendation: 'Fresh start / winter wreaths in late December. Elegant & minimal designs.', hashtags: ['#NewYearWreath', '#FreshStart', '#WinterWreath', '#NewYearDecor'] },
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
    1: ['Post winter clearance wreaths — bundle deals work great', 'Start teasing Valentine\'s designs', 'Share "New Year, New Door" transformations'],
    2: ['Valentine\'s wreaths are your top seller this month', 'Show gift packaging and shipping options', 'Countdown posts to Valentine\'s Day build urgency'],
    3: ['Spring is here! Fresh floral content does best', 'Show the making process — spring materials are photogenic', 'Easter prep content starts mid-March'],
    4: ['Easter wreaths peak now', 'Start Mother\'s Day "gift for Mom" content', 'Show spring door transformations — before/after'],
    5: ['Mother\'s Day rush — post gift guides daily', 'Memorial Day patriotic designs', 'Transition to summer styles after Memorial Day'],
    6: ['Wedding season = elegant wreath content', 'Fourth of July prep starts now', 'Show outdoor/weather-resistant designs for summer'],
    7: ['Patriotic wreaths for July 4th', 'Summer wreath care tips (heat, sun protection)', 'Start hinting at fall collection coming soon'],
    8: ['Back to school teacher gift wreaths', 'Early fall reveals build anticipation', 'Summer clearance posts to make room for fall'],
    9: ['Fall collection launch! Your busiest season starts', 'Show fall materials: preserved leaves, pumpkins, burlap', 'Behind-the-scenes fall wreath making'],
    10: ['Halloween wreaths are trending', 'Versatile fall-to-Halloween designs sell best', 'Start Thanksgiving content late October'],
    11: ['Thanksgiving harvest wreaths early month', 'Black Friday / Small Business Saturday deals', 'Christmas wreaths launch right after Thanksgiving!'],
    12: ['Post daily — this is your peak month', 'Gift guides, custom order deadlines, shipping cutoffs', 'Show your wreaths in real homes for social proof'],
  };
  return tips[month] || tips[1];
}

function getBaseHashtags(season: string): string[] {
  const base = ['#WreathMaker', '#Handmade', '#FrontDoorDecor', '#WreathsOfInstagram', '#DoorWreath', '#HomeDecor', '#ShopSmall'];
  const seasonal: Record<string, string[]> = {
    Spring: ['#SpringDecor', '#SpringWreath', '#FloralWreath', '#FreshFlowers', '#SpringDoor'],
    Summer: ['#SummerWreath', '#SummerDecor', '#SummerVibes', '#OutdoorDecor'],
    Fall: ['#FallDecor', '#FallWreath', '#AutumnVibes', '#FallDoorDecor', '#PumpkinSeason'],
    Winter: ['#WinterWreath', '#HolidayDecor', '#ChristmasWreath', '#WinterWonderland'],
  };
  return [...base, ...(seasonal[season] || [])];
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
    hashtagSuggestions: getBaseHashtags(season),
    colors: getSeasonalColors(season),
  };
}

export function getSeasonalNudge(): string {
  const now = new Date();
  const month = now.getMonth() + 1;

  const nudges: Record<number, string> = {
    1: 'Winter clearance and Valentine\'s prep — show your range!',
    2: 'Valentine\'s Day is coming! Your heart wreaths will fly off the shelf.',
    3: 'Spring is here! Fresh florals and Easter pastels are what people want.',
    4: 'Easter is around the corner. Mother\'s Day prep starts now too!',
    5: 'Mother\'s Day rush! Post gift ideas daily — this is a huge sales window.',
    6: 'Summer vibes and wedding season. Elegant, outdoor-ready wreaths shine.',
    7: 'Patriotic wreaths for the 4th! Start teasing your fall collection.',
    8: 'Back to school + early fall reveals. Build anticipation!',
    9: 'Fall season is HERE. Your followers are craving autumn content!',
    10: 'Halloween peak + fall in full swing. Post your spookiest and coziest!',
    11: 'Thanksgiving and Christmas prep — your busiest time of year starts now!',
    12: 'Holiday peak! Post daily, show real homes, push gift guides and deadlines.',
  };

  return nudges[month] || nudges[1];
}

export function getUpcomingDates(daysAhead: number = 30): SeasonalEvent[] {
  const now = new Date();
  const events: SeasonalEvent[] = [];

  for (const event of WREATH_EVENTS) {
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
