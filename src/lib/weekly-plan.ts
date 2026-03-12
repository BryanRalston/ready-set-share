import { type BusinessType } from './business-profile';

// --- Types ---

export type PlanItemType =
  | 'product'
  | 'behind-scenes'
  | 'educational'
  | 'seasonal'
  | 'engagement'
  | 'promotion';

export type Platform = 'Instagram' | 'Pinterest' | 'Facebook';

export interface PlanItem {
  id: string;
  dayOfWeek: number; // 0=Sun ... 6=Sat (we use 1-5 for Mon-Fri)
  dayName: string;
  title: string;
  description: string;
  type: PlanItemType;
  platform: Platform;
  completed: boolean;
}

export interface WeeklyPlan {
  id: string;
  weekStart: string; // ISO string of Monday 00:00
  items: PlanItem[];
  generatedAt: string;
  businessType?: string;
}

const STORAGE_KEY = 'biz-social-weekly-plan';

// --- Helpers ---

/** Get the Monday 00:00 of the current week (ISO string). */
function getWeekStartISO(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  return monday.toISOString();
}

function uid(): string {
  return 'pi-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

// --- Template Library ---

interface TemplateEntry {
  title: string;
  description: string;
  platform: Platform;
}

type DaySlot = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

const DAY_META: { slot: DaySlot; dayOfWeek: number; dayName: string; type: PlanItemType }[] = [
  { slot: 'monday', dayOfWeek: 1, dayName: 'Monday', type: 'product' },
  { slot: 'tuesday', dayOfWeek: 2, dayName: 'Tuesday', type: 'behind-scenes' },
  { slot: 'wednesday', dayOfWeek: 3, dayName: 'Wednesday', type: 'educational' },
  { slot: 'thursday', dayOfWeek: 4, dayName: 'Thursday', type: 'engagement' },
  { slot: 'friday', dayOfWeek: 5, dayName: 'Friday', type: 'promotion' },
];

type TemplateMap = Record<DaySlot, TemplateEntry[]>;

// Business-type-specific templates
const BUSINESS_TEMPLATES: Partial<Record<BusinessType, TemplateMap>> = {
  wreaths: {
    monday: [
      { title: 'Feature your latest wreath', description: 'Close-up shot with natural light showing texture and detail.', platform: 'Instagram' },
      { title: 'Seasonal wreath spotlight', description: 'Photograph your newest seasonal design on a front door.', platform: 'Pinterest' },
      { title: 'Show a wreath in its new home', description: 'Share a customer photo or styled shot of a wreath on display.', platform: 'Instagram' },
      { title: 'New materials haul', description: 'Lay out your latest ribbons, greenery, or flowers before they become a wreath.', platform: 'Instagram' },
    ],
    tuesday: [
      { title: 'Film your wreath-making process', description: 'Short clip of you wiring or arranging — people love watching the build.', platform: 'Instagram' },
      { title: 'Show your workspace setup', description: 'Give followers a peek at your crafting table and materials.', platform: 'Facebook' },
      { title: 'Time-lapse a wreath from start to finish', description: 'Set up your phone and speed up the entire creation process.', platform: 'Instagram' },
      { title: 'Share your material sourcing trip', description: 'Snap photos at the craft store or farmer\'s market where you find supplies.', platform: 'Instagram' },
    ],
    wednesday: [
      { title: 'How to hang a wreath without damaging your door', description: 'Quick tip your followers will save and share.', platform: 'Pinterest' },
      { title: 'Wreath care 101', description: 'Share how to keep a wreath looking fresh through the season.', platform: 'Facebook' },
      { title: '3 ways to style a wreath beyond the front door', description: 'Show wreaths on mantels, above beds, or as table centerpieces.', platform: 'Pinterest' },
      { title: 'How to pick the right wreath size for your door', description: 'Share a simple measuring guide your customers can use.', platform: 'Facebook' },
    ],
    thursday: [
      { title: 'This or that: two wreath styles', description: 'Post two options side-by-side and ask followers to vote.', platform: 'Instagram' },
      { title: 'What season should I design for next?', description: 'Run a quick poll with 3-4 options to drive engagement.', platform: 'Facebook' },
      { title: 'Caption this wreath!', description: 'Post a fun or unusual wreath photo and ask followers for creative captions.', platform: 'Instagram' },
      { title: 'Ask: Where do you hang your wreath?', description: 'Start a conversation — front door, interior wall, or somewhere unexpected?', platform: 'Facebook' },
    ],
    friday: [
      { title: 'Weekend sale — limited wreath drop', description: 'Announce a small batch available this weekend only.', platform: 'Instagram' },
      { title: 'Custom order spotlight', description: 'Highlight that you take custom requests and show a recent example.', platform: 'Facebook' },
      { title: 'Free shipping this weekend', description: 'Create urgency with a time-limited shipping deal.', platform: 'Instagram' },
      { title: 'Gift idea: wreaths they\'ll love', description: 'Position your wreaths as the perfect gift for an upcoming holiday or occasion.', platform: 'Pinterest' },
    ],
  },
  restaurant: {
    monday: [
      { title: 'Show today\'s special being plated', description: 'Capture the moment the dish comes together — steam, color, detail.', platform: 'Instagram' },
      { title: 'Menu highlight: a fan favorite', description: 'Feature your most-ordered dish with a mouth-watering close-up.', platform: 'Instagram' },
      { title: 'New menu item reveal', description: 'Tease a new dish with a close-up that leaves them guessing.', platform: 'Instagram' },
      { title: 'Fresh ingredients of the day', description: 'Show the produce, meats, or herbs that arrived fresh this morning.', platform: 'Facebook' },
    ],
    tuesday: [
      { title: 'Film the kitchen in action', description: 'Quick clip of your line during the rush — the energy tells the story.', platform: 'Instagram' },
      { title: 'Introduce a team member', description: 'Photo and a few words about the person behind the food.', platform: 'Facebook' },
      { title: 'Prep work time-lapse', description: 'Show the morning setup — chopping, saucing, and getting ready for service.', platform: 'Instagram' },
      { title: 'Show your delivery packaging', description: 'Demonstrate how carefully you pack to-go orders.', platform: 'Facebook' },
    ],
    wednesday: [
      { title: 'Share your most popular dish\'s story', description: 'Tell the origin — who created it, what inspired it, why people love it.', platform: 'Facebook' },
      { title: 'Did you know? Food fact about an ingredient', description: 'Share something surprising about a key ingredient you use.', platform: 'Instagram' },
      { title: 'How to pair drinks with your entrees', description: 'Give a quick pairing guide for your menu.', platform: 'Pinterest' },
      { title: 'The secret behind your sauce', description: 'Share one fun detail about what makes your signature sauce special (without giving it all away).', platform: 'Instagram' },
    ],
    thursday: [
      { title: 'What should we add to the menu?', description: 'Ask followers to pick between 2-3 dish ideas.', platform: 'Instagram' },
      { title: 'Rate this plate 1-10', description: 'Post a gorgeous dish photo and ask for ratings — drives comments.', platform: 'Instagram' },
      { title: 'What\'s your go-to order?', description: 'Ask regulars to share their favorite meal in the comments.', platform: 'Facebook' },
      { title: 'Hot take: is this underrated?', description: 'Feature a less-ordered dish and ask if people have tried it.', platform: 'Instagram' },
    ],
    friday: [
      { title: 'Weekend reservation reminder', description: 'Encourage followers to grab a table before the weekend fills up.', platform: 'Facebook' },
      { title: 'Happy hour special this Friday', description: 'Promote your Friday drink and appetizer deals.', platform: 'Instagram' },
      { title: 'Weekend catering available', description: 'Remind followers you cater events and parties.', platform: 'Facebook' },
      { title: 'Bring a friend deal', description: 'Announce a BOGO or discount for groups this weekend.', platform: 'Instagram' },
    ],
  },
  salon: {
    monday: [
      { title: 'Before & after transformation', description: 'Side-by-side showing the dramatic difference your skills make.', platform: 'Instagram' },
      { title: 'Color of the week', description: 'Showcase a stunning color job you\'re proud of.', platform: 'Instagram' },
      { title: 'Client spotlight', description: 'Share a recent client\'s new look (with permission) and tag them.', platform: 'Instagram' },
      { title: 'Trending style showcase', description: 'Recreate a trending hairstyle and show your version.', platform: 'Instagram' },
    ],
    tuesday: [
      { title: 'Quick styling tip video', description: '30-second reel showing how to achieve a simple everyday look.', platform: 'Instagram' },
      { title: 'Show your station setup', description: 'Clean, organized, ready for clients — let them see the vibe.', platform: 'Instagram' },
      { title: 'Product shelf tour', description: 'Show the professional products you use and why you love them.', platform: 'Instagram' },
      { title: 'Morning routine at the salon', description: 'Quick clips of opening up, setting out tools, and prepping for the day.', platform: 'Instagram' },
    ],
    wednesday: [
      { title: 'How to maintain your color between visits', description: 'Simple home-care tips that build trust and expertise.', platform: 'Facebook' },
      { title: 'Healthy hair tip', description: 'Share one thing clients can do today for healthier hair.', platform: 'Instagram' },
      { title: 'What to tell your stylist at your next appointment', description: 'Help potential clients feel prepared and confident booking.', platform: 'Pinterest' },
      { title: 'Heat styling do\'s and don\'ts', description: 'Quick tips to protect hair from heat damage.', platform: 'Facebook' },
    ],
    thursday: [
      { title: 'Which style do you prefer?', description: 'Post two looks and let your audience vote in the comments or poll.', platform: 'Instagram' },
      { title: 'Tag someone who needs a hair refresh', description: 'Fun engagement prompt that spreads awareness.', platform: 'Facebook' },
      { title: 'Hair confession time', description: 'Ask followers to share their biggest hair mistake — relatable and fun.', platform: 'Instagram' },
      { title: 'Would you try this bold color?', description: 'Post a vivid color job and see who\'s brave enough.', platform: 'Instagram' },
    ],
    friday: [
      { title: 'Weekend appointment openings', description: 'Let followers know about last-minute availability.', platform: 'Instagram' },
      { title: 'Refer a friend discount', description: 'Promote your referral program to fill your book.', platform: 'Facebook' },
      { title: 'New client special this weekend', description: 'Offer first-visit pricing to convert followers into clients.', platform: 'Instagram' },
      { title: 'Gift card reminder', description: 'Position salon gift cards as the perfect present for any occasion.', platform: 'Facebook' },
    ],
  },
  candles: {
    monday: [
      { title: 'New scent reveal', description: 'Photograph your latest candle with props that hint at the fragrance.', platform: 'Instagram' },
      { title: 'Flat lay with your bestseller', description: 'Style your top-selling candle with cozy blankets, books, or flowers.', platform: 'Pinterest' },
      { title: 'Close-up of the pour', description: 'Show the smooth wax, the wick, the clean label — the details matter.', platform: 'Instagram' },
      { title: 'Seasonal collection preview', description: 'Tease upcoming seasonal scents with a styled group shot.', platform: 'Instagram' },
    ],
    tuesday: [
      { title: 'Watch me pour', description: 'Short video of the wax being poured — oddly satisfying content.', platform: 'Instagram' },
      { title: 'Label-making process', description: 'Show how you design and apply your labels.', platform: 'Instagram' },
      { title: 'Scent-blending session', description: 'Share the process of mixing fragrance oils for a new scent.', platform: 'Instagram' },
      { title: 'Packaging and shipping prep', description: 'Show how carefully you wrap candles for delivery.', platform: 'Facebook' },
    ],
    wednesday: [
      { title: 'How to get the most burn time from your candle', description: 'Trim the wick, burn to the edges — share the tips.', platform: 'Facebook' },
      { title: 'Why soy wax?', description: 'Educate your audience on the benefits of your wax choice.', platform: 'Pinterest' },
      { title: 'Candle safety 101', description: 'Share essential safety tips — your customers will appreciate it.', platform: 'Facebook' },
      { title: 'How scents affect mood', description: 'Share the science behind why certain fragrances feel calming or energizing.', platform: 'Instagram' },
    ],
    thursday: [
      { title: 'Which scent for tonight?', description: 'Post two candles and ask followers to pick their evening vibe.', platform: 'Instagram' },
      { title: 'Name this scent!', description: 'Show your ingredients and let followers suggest a creative name.', platform: 'Instagram' },
      { title: 'What room do you burn candles in?', description: 'Ask followers to share their favorite spot for a candle.', platform: 'Facebook' },
      { title: 'Cozy night in or dinner party?', description: 'Ask which occasion they\'d light a candle for — great for understanding your audience.', platform: 'Instagram' },
    ],
    friday: [
      { title: 'Weekend sale announcement', description: 'Limited-time deal on your candle collection.', platform: 'Instagram' },
      { title: 'Bundle deal for the weekend', description: 'Offer a set of 3 candles at a special price.', platform: 'Facebook' },
      { title: 'Last chance: limited edition scent', description: 'Create urgency around a scent that\'s almost sold out.', platform: 'Instagram' },
      { title: 'Gift set spotlight', description: 'Show off your curated gift box — perfect for upcoming holidays.', platform: 'Pinterest' },
    ],
  },
  'baked-goods': {
    monday: [
      { title: 'Fresh out of the oven', description: 'Capture the golden brown perfection before it\'s gone.', platform: 'Instagram' },
      { title: 'This week\'s menu preview', description: 'Share what flavors and items are available this week.', platform: 'Facebook' },
      { title: 'Best seller beauty shot', description: 'Style your most popular item with a clean, appetizing setup.', platform: 'Instagram' },
      { title: 'Custom order showcase', description: 'Feature a recent custom cake or order with all the details.', platform: 'Instagram' },
    ],
    tuesday: [
      { title: 'Mixing and measuring', description: 'Quick clip of dough being mixed or batter being poured.', platform: 'Instagram' },
      { title: 'Decorating in real time', description: 'Show the piping, the sprinkles, or the glaze going on.', platform: 'Instagram' },
      { title: 'Early morning bake session', description: 'Share the 4 AM alarm and the first trays going in.', platform: 'Instagram' },
      { title: 'Ingredient spotlight', description: 'Show the real butter, vanilla beans, or local honey you use.', platform: 'Facebook' },
    ],
    wednesday: [
      { title: 'How to store baked goods properly', description: 'Help customers keep their treats fresh longer.', platform: 'Facebook' },
      { title: 'Why we use real butter', description: 'Explain an ingredient choice that sets you apart.', platform: 'Instagram' },
      { title: 'Baking tip: room temperature ingredients matter', description: 'Share a quick tip that makes a big difference.', platform: 'Pinterest' },
      { title: 'The story behind your signature recipe', description: 'Was it grandma\'s recipe? A happy accident? Tell the tale.', platform: 'Facebook' },
    ],
    thursday: [
      { title: 'What should I bake this weekend?', description: 'Give followers 3 options and let them pick.', platform: 'Instagram' },
      { title: 'Chocolate or vanilla?', description: 'Classic debate that always drives comments.', platform: 'Facebook' },
      { title: 'Guess the flavor!', description: 'Post a close-up of a new item and let followers guess.', platform: 'Instagram' },
      { title: 'Share your favorite dessert memory', description: 'Ask followers to share a sweet memory — builds community.', platform: 'Facebook' },
    ],
    friday: [
      { title: 'Weekend pre-order reminder', description: 'Let people know the deadline to order for the weekend.', platform: 'Facebook' },
      { title: 'Free cookie with every order this weekend', description: 'Small perk that drives action.', platform: 'Instagram' },
      { title: 'Holiday ordering is open!', description: 'Announce availability for upcoming holiday orders.', platform: 'Facebook' },
      { title: 'Treat yourself Friday', description: 'Encourage followers to grab something sweet to end the week.', platform: 'Instagram' },
    ],
  },
  cafe: {
    monday: [
      { title: 'Monday morning latte art', description: 'Beautiful pour to start the week — everyone needs this.', platform: 'Instagram' },
      { title: 'Featured drink of the week', description: 'Introduce a special or seasonal drink with a styled photo.', platform: 'Instagram' },
      { title: 'The perfect pairing', description: 'Show a coffee + pastry combo that goes perfectly together.', platform: 'Pinterest' },
      { title: 'New beans on the bar', description: 'Feature a new coffee origin or roast you\'re serving.', platform: 'Instagram' },
    ],
    tuesday: [
      { title: 'Watch the espresso pull', description: 'Slow-mo shot of a perfect extraction.', platform: 'Instagram' },
      { title: 'Morning prep behind the bar', description: 'Show the grinders, the steam wand, the setup before doors open.', platform: 'Instagram' },
      { title: 'Meet your barista', description: 'Quick intro and fun fact about the person making your coffee.', platform: 'Facebook' },
      { title: 'How we brew our cold brew', description: 'Show the overnight process that makes it smooth.', platform: 'Instagram' },
    ],
    wednesday: [
      { title: 'How to order like a pro', description: 'Decode coffee shop lingo for newcomers.', platform: 'Facebook' },
      { title: 'Iced vs hot: when to choose each', description: 'Quick guide to picking the right temp for the weather.', platform: 'Instagram' },
      { title: 'Why single-origin matters', description: 'Quick education on what makes specialty coffee special.', platform: 'Facebook' },
      { title: 'Milk alternatives guide', description: 'Break down oat, almond, soy — which works best in each drink.', platform: 'Pinterest' },
    ],
    thursday: [
      { title: 'What\'s your go-to order?', description: 'Simple question that always drives comments.', platform: 'Instagram' },
      { title: 'Hot take: best pastry pairing for espresso', description: 'Start a friendly debate in the comments.', platform: 'Instagram' },
      { title: 'Morning person or afternoon caffeine?', description: 'Fun poll about coffee habits.', platform: 'Facebook' },
      { title: 'Name our next seasonal drink', description: 'Crowdsource a name for an upcoming special.', platform: 'Instagram' },
    ],
    friday: [
      { title: 'Happy Friday — BOGO afternoon drinks', description: 'Drive foot traffic on a typically slower afternoon.', platform: 'Instagram' },
      { title: 'Weekend hours reminder', description: 'Let people know when you\'re open for their Saturday plans.', platform: 'Facebook' },
      { title: 'Loyalty card reminder', description: 'Remind followers about your rewards program.', platform: 'Instagram' },
      { title: 'Grab a bag of beans for the weekend', description: 'Promote retail coffee sales for at-home brewing.', platform: 'Facebook' },
    ],
  },
  fitness: {
    monday: [
      { title: 'Motivation Monday workout', description: 'Share a quick workout or move of the day to kick off the week.', platform: 'Instagram' },
      { title: 'Client transformation spotlight', description: 'Before & after (with permission) showing real results.', platform: 'Instagram' },
      { title: 'This week\'s class schedule', description: 'Post a clean graphic with your weekly classes and times.', platform: 'Facebook' },
      { title: 'New equipment or space update', description: 'Show off a new piece of gear or studio improvement.', platform: 'Instagram' },
    ],
    tuesday: [
      { title: 'Behind the scenes: session prep', description: 'Show how you set up for a client session or class.', platform: 'Instagram' },
      { title: 'Your own workout today', description: 'Practice what you preach — show your personal training.', platform: 'Instagram' },
      { title: 'Day in the life of a trainer', description: 'Quick montage from first client to last.', platform: 'Instagram' },
      { title: 'Equipment breakdown', description: 'Show the tools you use most and why you love them.', platform: 'Facebook' },
    ],
    wednesday: [
      { title: 'Form check: common mistake fix', description: 'Show a common exercise mistake and the correct form.', platform: 'Instagram' },
      { title: 'Quick nutrition tip', description: 'One simple eating habit that supports fitness goals.', platform: 'Facebook' },
      { title: 'Recovery matters', description: 'Teach the importance of rest days, stretching, or sleep.', platform: 'Instagram' },
      { title: 'Myth buster', description: 'Debunk a common fitness myth with facts.', platform: 'Instagram' },
    ],
    thursday: [
      { title: 'What\'s your fitness goal right now?', description: 'Ask followers to share — builds community and gives you content ideas.', platform: 'Instagram' },
      { title: 'Would you rather: two exercise options', description: 'Fun poll — burpees or mountain climbers?', platform: 'Instagram' },
      { title: 'Workout partner tag', description: 'Ask followers to tag their gym buddy.', platform: 'Facebook' },
      { title: 'What motivates you to train?', description: 'Open conversation that resonates with your audience.', platform: 'Instagram' },
    ],
    friday: [
      { title: 'Weekend class openings', description: 'Highlight available spots in weekend sessions.', platform: 'Instagram' },
      { title: 'First session free promo', description: 'Offer a trial session to convert followers into clients.', platform: 'Facebook' },
      { title: 'Weekend challenge', description: 'Give followers a mini fitness challenge to do over the weekend.', platform: 'Instagram' },
      { title: 'New client packages available', description: 'Promote your training packages with clear pricing.', platform: 'Facebook' },
    ],
  },
  cleaning: {
    monday: [
      { title: 'Before & after: a real clean', description: 'Side-by-side showing the transformation — satisfying content.', platform: 'Instagram' },
      { title: 'This week\'s availability', description: 'Let followers know which days you have open slots.', platform: 'Facebook' },
      { title: 'Sparkling kitchen showcase', description: 'Show a kitchen you just finished — every surface gleaming.', platform: 'Instagram' },
      { title: 'Deep clean results', description: 'Focus on a tough job you tackled — grout, oven, or windows.', platform: 'Instagram' },
    ],
    tuesday: [
      { title: 'What\'s in my cleaning caddy', description: 'Show the products and tools you bring to every job.', platform: 'Instagram' },
      { title: 'Watch this grime disappear', description: 'Satisfying cleaning clip that people can\'t stop watching.', platform: 'Instagram' },
      { title: 'Loading up the van', description: 'Show your organized supplies and professional setup.', platform: 'Facebook' },
      { title: 'The products we trust', description: 'Share why you chose eco-friendly or specific cleaning products.', platform: 'Instagram' },
    ],
    wednesday: [
      { title: 'Quick cleaning hack', description: 'One tip that makes a common cleaning task easier.', platform: 'Pinterest' },
      { title: 'How often should you deep clean your oven?', description: 'Educational timeline that builds trust in your expertise.', platform: 'Facebook' },
      { title: 'DIY vs professional clean', description: 'Explain when it makes sense to call in the pros.', platform: 'Facebook' },
      { title: 'Stain removal tip', description: 'Share a go-to method for a common household stain.', platform: 'Pinterest' },
    ],
    thursday: [
      { title: 'What\'s your least favorite cleaning task?', description: 'Relatable question that always gets responses.', platform: 'Facebook' },
      { title: 'Rate this transformation 1-10', description: 'Post a dramatic before/after and ask for ratings.', platform: 'Instagram' },
      { title: 'Cleaning pet peeve?', description: 'Ask followers what cleaning task they dread most.', platform: 'Facebook' },
      { title: 'Tag someone who needs this', description: 'Post a satisfying clean and invite tagging.', platform: 'Instagram' },
    ],
    friday: [
      { title: 'Book your weekend clean', description: 'Remind followers you have weekend availability.', platform: 'Facebook' },
      { title: 'First-time client discount', description: 'Special offer for new customers.', platform: 'Instagram' },
      { title: 'Gift a clean home', description: 'Promote gift certificates for cleaning services.', platform: 'Facebook' },
      { title: 'Move-in/move-out special', description: 'Target people who are moving — they always need a deep clean.', platform: 'Instagram' },
    ],
  },
  photography: {
    monday: [
      { title: 'Recent session highlight', description: 'Share a standout image from your latest shoot.', platform: 'Instagram' },
      { title: 'Portfolio piece of the week', description: 'Feature one of your best shots with the story behind it.', platform: 'Instagram' },
      { title: 'Editing before & after', description: 'Show the raw shot vs. the final edit — people love seeing the process.', platform: 'Instagram' },
      { title: 'Client gallery preview', description: 'Tease a few images from a recent delivery.', platform: 'Instagram' },
    ],
    tuesday: [
      { title: 'Behind the camera at a shoot', description: 'Show your setup, lighting, and the scene from your perspective.', platform: 'Instagram' },
      { title: 'Gear in my bag today', description: 'Quick photo of the equipment you\'re bringing to a shoot.', platform: 'Instagram' },
      { title: 'Location scouting', description: 'Share a beautiful spot you found for upcoming sessions.', platform: 'Instagram' },
      { title: 'Editing workflow peek', description: 'Screen recording of your Lightroom or editing process.', platform: 'Instagram' },
    ],
    wednesday: [
      { title: 'Photography tip: golden hour magic', description: 'Explain why timing matters and how to use natural light.', platform: 'Pinterest' },
      { title: 'How to prepare for your photo session', description: 'Help clients feel confident with outfit and location tips.', platform: 'Facebook' },
      { title: 'Posing tip for couples', description: 'Share a go-to pose that always looks natural.', platform: 'Instagram' },
      { title: 'Phone photography tip', description: 'Quick tip anyone can use to take better photos at home.', platform: 'Instagram' },
    ],
    thursday: [
      { title: 'Which edit style do you prefer?', description: 'Show two different edits of the same shot and ask followers to pick.', platform: 'Instagram' },
      { title: 'Sunrise or sunset sessions?', description: 'Fun poll that also helps you understand booking preferences.', platform: 'Instagram' },
      { title: 'What would you want photographed?', description: 'Ask followers what kind of session they dream of.', platform: 'Facebook' },
      { title: 'Caption this photo', description: 'Post a fun or dramatic shot and let followers get creative.', platform: 'Instagram' },
    ],
    friday: [
      { title: 'Mini session openings', description: 'Announce limited-time mini sessions at a special rate.', platform: 'Instagram' },
      { title: 'Holiday booking reminder', description: 'Encourage early booking for upcoming seasonal sessions.', platform: 'Facebook' },
      { title: 'Print sale this weekend', description: 'Promote discounts on prints or albums.', platform: 'Instagram' },
      { title: 'Referral bonus reminder', description: 'Remind followers about your referral incentive program.', platform: 'Facebook' },
    ],
  },
  landscaping: {
    monday: [
      { title: 'Project of the week', description: 'Show a completed yard transformation with a great photo.', platform: 'Instagram' },
      { title: 'Before & after curb appeal', description: 'Side-by-side of a lawn or garden makeover.', platform: 'Instagram' },
      { title: 'Seasonal planting showcase', description: 'Show what you\'re planting this time of year.', platform: 'Pinterest' },
      { title: 'Clean edges and fresh mulch', description: 'A simple mow-and-edge that looks like a million bucks.', platform: 'Instagram' },
    ],
    tuesday: [
      { title: 'Crew at work', description: 'Action shot of your team transforming a property.', platform: 'Instagram' },
      { title: 'Equipment spotlight', description: 'Show a piece of equipment and explain what it does.', platform: 'Facebook' },
      { title: 'Loading up for the day', description: 'Show your truck and trailer ready to roll.', platform: 'Instagram' },
      { title: 'Planting in progress', description: 'Share the process of laying out and planting a new bed.', platform: 'Instagram' },
    ],
    wednesday: [
      { title: 'Lawn care tip for this season', description: 'Share timely advice: when to fertilize, water, or seed.', platform: 'Facebook' },
      { title: 'How to keep your lawn green in summer', description: 'Simple watering and mowing tips.', platform: 'Pinterest' },
      { title: 'Best plants for low maintenance yards', description: 'Help homeowners who want beauty without the fuss.', platform: 'Pinterest' },
      { title: 'When to call a pro vs DIY', description: 'Be honest about what homeowners can handle and what needs expertise.', platform: 'Facebook' },
    ],
    thursday: [
      { title: 'Which design do you prefer?', description: 'Post two different landscape designs and let followers vote.', platform: 'Instagram' },
      { title: 'What\'s your biggest yard challenge?', description: 'Ask homeowners about their struggles — great for content planning.', platform: 'Facebook' },
      { title: 'Favorite flower for this season?', description: 'Post a few options and let followers pick.', platform: 'Instagram' },
      { title: 'Backyard goals: show us your dream yard', description: 'Invite followers to share inspiration photos.', platform: 'Facebook' },
    ],
    friday: [
      { title: 'Free estimate this weekend', description: 'Drive leads with a no-obligation estimate offer.', platform: 'Facebook' },
      { title: 'Spring cleanup special', description: 'Seasonal service promotion with clear pricing.', platform: 'Instagram' },
      { title: 'Refer a neighbor discount', description: 'Neighbors talk — reward the referrals.', platform: 'Facebook' },
      { title: 'Book now before we\'re full', description: 'Create urgency around your schedule filling up.', platform: 'Instagram' },
    ],
  },
  boutique: {
    monday: [
      { title: 'New arrival spotlight', description: 'Feature the latest item to hit your shelves with a styled photo.', platform: 'Instagram' },
      { title: 'Styled outfit of the week', description: 'Put together a complete look from your inventory.', platform: 'Instagram' },
      { title: 'Flat lay arrangement', description: 'Lay out a curated collection of items with a cohesive aesthetic.', platform: 'Pinterest' },
      { title: 'Restock alert', description: 'Let followers know a popular item is back in stock.', platform: 'Instagram' },
    ],
    tuesday: [
      { title: 'Unboxing new inventory', description: 'Share the excitement of opening new shipments.', platform: 'Instagram' },
      { title: 'How we curate our collection', description: 'Show the thoughtful process behind what you stock.', platform: 'Instagram' },
      { title: 'Shop setup and merchandising', description: 'Show how you arrange displays to inspire shoppers.', platform: 'Facebook' },
      { title: 'Packing an online order', description: 'Show the care you put into wrapping and shipping.', platform: 'Instagram' },
    ],
    wednesday: [
      { title: 'How to style this piece 3 ways', description: 'Show versatility — same item, three different looks.', platform: 'Pinterest' },
      { title: 'Seasonal trend guide', description: 'Help followers know what\'s trending this season.', platform: 'Pinterest' },
      { title: 'Care instructions for your favorite piece', description: 'Teach customers how to keep their purchases looking new.', platform: 'Facebook' },
      { title: 'Why shop small matters', description: 'Share the real impact of supporting local boutiques.', platform: 'Facebook' },
    ],
    thursday: [
      { title: 'This or that: two styles', description: 'Post two items and let followers pick their favorite.', platform: 'Instagram' },
      { title: 'What should we stock next?', description: 'Get input on future inventory — followers love having a voice.', platform: 'Instagram' },
      { title: 'Style quiz: what\'s your vibe?', description: 'Fun personality prompt that relates to your products.', platform: 'Facebook' },
      { title: 'Tag a friend who\'d love this', description: 'Feature a standout piece and encourage tagging.', platform: 'Instagram' },
    ],
    friday: [
      { title: 'Weekend sale preview', description: 'Tease what\'s going on sale starting Friday.', platform: 'Instagram' },
      { title: 'Shop small Saturday reminder', description: 'Encourage in-store or online shopping this weekend.', platform: 'Facebook' },
      { title: 'Gift guide: items under $50', description: 'Curated picks that make gift shopping easy.', platform: 'Pinterest' },
      { title: 'Flash sale: 24 hours only', description: 'Create urgency with a one-day deal.', platform: 'Instagram' },
    ],
  },
};

// Fallback templates for any business type not specifically listed above
const GENERAL_TEMPLATES: TemplateMap = {
  monday: [
    { title: 'Close-up detail shot of your work', description: 'Show the craftsmanship and quality that sets you apart.', platform: 'Instagram' },
    { title: 'New product or service spotlight', description: 'Feature something new with a clean, well-lit photo.', platform: 'Instagram' },
    { title: 'Customer favorite showcase', description: 'Highlight your best-seller with a fresh photo angle.', platform: 'Pinterest' },
    { title: 'Flat lay arrangement', description: 'Arrange your products in a styled flat lay that tells a story.', platform: 'Pinterest' },
  ],
  tuesday: [
    { title: 'Show your process', description: 'Give followers a peek at how the magic happens.', platform: 'Instagram' },
    { title: 'Workspace tour', description: 'Let people see where you create or work — it builds connection.', platform: 'Instagram' },
    { title: 'Day in the life', description: 'Quick snapshot series showing what a typical day looks like.', platform: 'Facebook' },
    { title: 'Tools of the trade', description: 'Show the tools, materials, or supplies you use every day.', platform: 'Instagram' },
  ],
  wednesday: [
    { title: 'Quick tip from your expertise', description: 'Share one useful piece of knowledge your audience can use today.', platform: 'Facebook' },
    { title: 'Did you know?', description: 'Share a surprising fact related to your industry or craft.', platform: 'Instagram' },
    { title: 'How to care for your purchase', description: 'Help customers get the most out of what they buy from you.', platform: 'Pinterest' },
    { title: 'Common mistakes to avoid', description: 'Position yourself as the expert by sharing what NOT to do.', platform: 'Facebook' },
  ],
  thursday: [
    { title: 'This or that?', description: 'Post two options and ask your followers to pick — simple engagement gold.', platform: 'Instagram' },
    { title: 'Ask a question', description: 'Invite followers to share their opinions or preferences in the comments.', platform: 'Facebook' },
    { title: 'Customer spotlight', description: 'Share a customer photo or testimonial (with permission).', platform: 'Instagram' },
    { title: 'Would you try this?', description: 'Show something new or bold and gauge interest.', platform: 'Instagram' },
  ],
  friday: [
    { title: 'Weekend special offer', description: 'Give followers a reason to buy or book this weekend.', platform: 'Instagram' },
    { title: 'Limited-time deal', description: 'Create urgency with a deal that ends Sunday.', platform: 'Facebook' },
    { title: 'Gift idea spotlight', description: 'Position your products as the perfect gift for someone.', platform: 'Pinterest' },
    { title: 'Thank your community', description: 'Genuine gratitude post — highlight a milestone or just say thanks.', platform: 'Facebook' },
  ],
};

/** Pick a random entry from an array. */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Core Logic ---

/**
 * Generate a fresh weekly plan using templates appropriate for the business type.
 */
export function generatePlan(businessType?: string, businessName?: string): WeeklyPlan {
  const templates = BUSINESS_TEMPLATES[businessType as BusinessType] || GENERAL_TEMPLATES;

  const items: PlanItem[] = DAY_META.map(({ slot, dayOfWeek, dayName, type }) => {
    const slotTemplates = templates[slot] || GENERAL_TEMPLATES[slot];
    const template = pickRandom(slotTemplates);

    // Personalize descriptions with business name where natural
    let description = template.description;
    if (businessName && Math.random() > 0.7) {
      description = description.replace(
        /your (audience|followers|customers)/i,
        `${businessName}'s $1`
      );
    }

    return {
      id: uid(),
      dayOfWeek,
      dayName,
      title: template.title,
      description,
      type,
      platform: template.platform,
      completed: false,
    };
  });

  return {
    id: 'wp-' + Date.now().toString(36),
    weekStart: getWeekStartISO(),
    items,
    generatedAt: new Date().toISOString(),
    businessType,
  };
}

/**
 * Get the current week's plan from localStorage, or generate a new one.
 * Automatically refreshes when a new week (Monday) starts.
 */
export function getOrCreateWeeklyPlan(businessType?: string, businessName?: string): WeeklyPlan {
  if (typeof window === 'undefined') {
    return generatePlan(businessType, businessName);
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const plan: WeeklyPlan = JSON.parse(stored);
      // Check if the plan is still for the current week
      const currentWeekStart = getWeekStartISO();
      const planWeekStart = new Date(plan.weekStart);
      const thisWeekStart = new Date(currentWeekStart);

      // Same week = same Monday date (compare date only, not time)
      const sameWeek =
        planWeekStart.getFullYear() === thisWeekStart.getFullYear() &&
        planWeekStart.getMonth() === thisWeekStart.getMonth() &&
        planWeekStart.getDate() === thisWeekStart.getDate();

      // Regenerate if business type was set/changed after plan was generated
      const typeChanged = businessType && plan.businessType !== businessType;

      if (sameWeek && !typeChanged) {
        return plan;
      }
    } catch {
      // Corrupted data — fall through to generate new
    }
  }

  const newPlan = generatePlan(businessType, businessName);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlan));
  return newPlan;
}

/**
 * Toggle an item's completed status and persist.
 */
export function markPlanItemComplete(planId: string, itemId: string): WeeklyPlan | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const plan: WeeklyPlan = JSON.parse(stored);
    if (plan.id !== planId) return null;

    const item = plan.items.find(i => i.id === itemId);
    if (item) {
      item.completed = !item.completed;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    }
    return plan;
  } catch {
    return null;
  }
}

/**
 * Force-regenerate the plan for the current week and persist.
 */
export function regenerateWeeklyPlan(businessType?: string, businessName?: string): WeeklyPlan {
  const newPlan = generatePlan(businessType, businessName);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlan));
  }
  return newPlan;
}
