/**
 * SIRI Birthday Experience - Complete Email Automation & Design System
 * 
 * 15 Scheduled/Special Experiences:
 * - Advance 01 to Advance 11 (Unique emotional storytelling progression)
 * - Final 11:58 PM Emotional Climax Email
 * - Midnight Official Birthday Email (Sep 28, 12:00 AM IST)
 * - Birth Moment Genesis Email (Sep 28, 08:00 AM IST)
 * - Divine Tithi Birthday Blessing Email (14 Oct 2026, 08:00 AM IST)
 */

export interface EmailItem {
  id: string;
  name: string;
  type: 'TEST' | 'ADVANCE' | 'BIRTHDAY' | 'BIRTH MOMENT' | 'TITHI' | 'CUSTOM' | string;
  subject: string;
  recipient: string;
  emailDisplayName?: string;
  heading: string;
  topLabel?: string;
  message: string;
  websiteUrl: string;
  linkAlias?: string;
  buttonText: string;
  scheduleDate: string; // YYYY-MM-DD
  scheduleTime: string; // HH:mm
  status: 'DRAFT' | 'SCHEDULED' | 'PENDING' | 'MISSED' | 'READY' | 'SENDING' | 'SENT' | 'FAILED' | 'SKIPPED' | 'DISABLED';
  enabled: boolean;
  useGlobalEmailDisplayName?: boolean; // Default true
  customDisplayName?: string;          // Optional per-email override
  createdAt?: string;
  updatedAt?: string;
  lastSentAt?: string;
}

export interface ReferenceSnapshot {
  id: string;
  emailId: string;
  name: string;
  type: string;
  subject: string;
  recipient: string;
  emailDisplayName?: string;
  heading: string;
  topLabel?: string;
  body: string;
  renderedHtml: string;
  ctaText: string;
  websiteUrl: string;
  linkAlias: string;
  designVersion: string;
  scheduledSendTime: string; // e.g. "2026-09-26 11:00 AM IST"
  referenceCapturedTime: string; // ISO string
  snapshotStatus: 'CAPTURED' | 'READY';
  sentStatus: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
  sentAt?: string | null;
  createdAt: string;
}

export interface CustomEmailTemplateConfig {
  subject: string;
  heading: string;
  topLabel?: string;
  message: string;
  buttonText?: string;
  linkAlias?: string;
  websiteUrl?: string;
  scheduleDate?: string;
  scheduleTime?: string;
  status?: 'DRAFT' | 'SCHEDULED' | 'READY' | 'SENDING' | 'SENT' | 'FAILED' | 'DISABLED';
  enabled?: boolean;
}

export interface AllEmailTemplates {
  test: CustomEmailTemplateConfig;
  advance: CustomEmailTemplateConfig;
  birthday_midnight: CustomEmailTemplateConfig;
  birth_moment: CustomEmailTemplateConfig;
  tithi: CustomEmailTemplateConfig;
  items?: EmailItem[];
}

export const DEFAULT_WEBSITE_URL = 'https://siri-birthday-brown.vercel.app/';
export const DEFAULT_LINK_ALIAS = 'ENTER YOUR STORY →';

export const DEFAULT_EMAIL_ITEMS: EmailItem[] = [
  // 1. ADVANCE 01 — SEP 26, 11:00 AM (Gentle)
  {
    id: 'advance-01',
    name: 'Advance 01 — Something Beautiful is Near',
    type: 'ADVANCE',
    subject: 'Something beautiful is getting closer ✨',
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    heading: 'SOMETHING BEAUTIFUL IS DRAWING NEAR',
    topLabel: 'ADVANCE BIRTHDAY DISPATCH · I',
    message: `Some days quietly pass by without notice, while some special dates arrive with a gentle reminder that life is filled with wonder.

As September 28 draws closer, this little message comes with a quiet wish for your peace and happiness. May the coming days unfold with gentle warmth, peaceful thoughts, and reasons to look forward to every sunrise.

May you always have reasons to smile, <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'A LITTLE SOMETHING FOR YOU →',
    buttonText: 'A LITTLE SOMETHING FOR YOU →',
    scheduleDate: '2026-09-26',
    scheduleTime: '11:00',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 2. ADVANCE 02 — SEP 26, 12:00 PM (Warm)
  {
    id: 'advance-02',
    name: 'Advance 02 — Keep Smiling',
    type: 'ADVANCE',
    subject: 'Keep smiling, SIRI 💫',
    heading: 'A SMILE THAT BRIGHTENS THE WORLD',
    topLabel: 'ADVANCE BIRTHDAY DISPATCH · II',
    message: `There is something truly remarkable about a genuine smile. It softens the world, makes ordinary afternoons memorable, and brings warmth to everyone around.

Today, as your special day approaches, this is just a gentle reminder to keep that beautiful smile glowing. 

May life always be kind to you, and may you never run out of reasons to laugh, to hope, and to celebrate the person you are, <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'KEEP THE SMILE GLOWING →',
    buttonText: 'KEEP THE SMILE GLOWING →',
    scheduleDate: '2026-09-26',
    scheduleTime: '12:00',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 3. ADVANCE 03 — SEP 26, 06:00 PM (Nostalgic)
  {
    id: 'advance-03',
    name: 'Advance 03 — Beautiful Memories',
    type: 'ADVANCE',
    subject: 'The journey of beautiful memories ✨',
    heading: 'FOOTPRINTS ACROSS BEAUTIFUL YEARS',
    topLabel: 'ADVANCE BIRTHDAY DISPATCH · III',
    message: `Every year of life is a tapestry woven with stories, laughter, quiet lessons, and cherished milestones. 

As the sun sets this evening, think back to every step of the journey that brought you to where you stand today. Every memory carries its own light.

May the coming year bring you even more unforgettable moments, meaningful journeys, and stories worth holding close forever, <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'REVISIT YOUR JOURNEY →',
    buttonText: 'REVISIT YOUR JOURNEY →',
    scheduleDate: '2026-09-26',
    scheduleTime: '18:00',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 4. ADVANCE 04 — SEP 26, 10:30 PM (Grateful)
  {
    id: 'advance-04',
    name: 'Advance 04 — An Evening of Gratitude',
    type: 'ADVANCE',
    subject: 'An evening note of gratitude 🌙',
    heading: 'PAUSING FOR A MOMENT OF GRATITUDE',
    topLabel: 'ADVANCE BIRTHDAY DISPATCH · IV',
    message: `As the quiet of the night settles in, it is a wonderful moment to pause and appreciate the beauty of this journey.

Gratitude for the people who have walked beside you, the experiences that shaped your strength, and the quiet moments that brought peace to your heart.

May your night be restful and calm, knowing that tomorrow brings you one step closer to your special milestone, <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'A MOMENT OF GRATITUDE →',
    buttonText: 'A MOMENT OF GRATITUDE →',
    scheduleDate: '2026-09-26',
    scheduleTime: '22:30',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 5. ADVANCE 05 — SEP 27, 12:00 AM (Hopeful)
  {
    id: 'advance-05',
    name: 'Advance 05 — A New Chapter Approaching',
    type: 'ADVANCE',
    subject: 'A new chapter is almost here ✨',
    heading: 'AT THE THRESHOLD OF A NEW CHAPTER',
    topLabel: 'ADVANCE BIRTHDAY DISPATCH · V',
    message: `Midnight marks the beginning of September 27 — the final full day before your birthday arrives.

A new chapter of life is waiting at the doorway, filled with fresh possibilities, unwritten adventures, and new dreams ready to take flight.

May this upcoming year be gentle on your heart, kind to your spirit, and filled with doors opening to places you have always wanted to go, <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'OPEN THE NEXT CHAPTER →',
    buttonText: 'OPEN THE NEXT CHAPTER →',
    scheduleDate: '2026-09-27',
    scheduleTime: '00:00',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 6. ADVANCE 06 — SEP 27, 06:00 AM (Peaceful)
  {
    id: 'advance-06',
    name: 'Advance 06 — Peaceful Morning',
    type: 'ADVANCE',
    subject: 'A peaceful morning wish for you 🌅',
    heading: 'A MORNING FILLED WITH GENTLE LIGHT',
    topLabel: 'ADVANCE BIRTHDAY DISPATCH · VI',
    message: `Good morning. May the early light of this day bring a calm clarity to your mind and a genuine smile to your face.

Take a deep breath and step into this morning knowing you are celebrated and appreciated. 

May peace greet you in the smallest moments today, and may every hour bring a sense of joy and anticipation for what lies ahead, <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'BEGIN WITH A SMILE →',
    buttonText: 'BEGIN WITH A SMILE →',
    scheduleDate: '2026-09-27',
    scheduleTime: '06:00',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 7. ADVANCE 07 — SEP 27, 12:00 PM (Personal)
  {
    id: 'advance-07',
    name: 'Advance 07 — You Deserve Beautiful Things',
    type: 'ADVANCE',
    subject: 'You deserve all beautiful things, SIRI 🌸',
    heading: 'BECAUSE YOU DESERVE THE BEST OF LIFE',
    topLabel: 'ADVANCE BIRTHDAY DISPATCH · VII',
    message: `You deserve people in your life who genuinely value your presence, moments that make your soul feel at ease, and opportunities that honor your talents and dedication.

Never forget the worth of the goodness you bring into the lives around you.

This afternoon, we send you a heartfelt wish that all the kindness you give to others returns to you multiplied in countless ways, <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'A LITTLE WISH FOR YOU →',
    buttonText: 'A LITTLE WISH FOR YOU →',
    scheduleDate: '2026-09-27',
    scheduleTime: '12:00',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 8. ADVANCE 08 — SEP 27, 06:00 PM (Blessings)
  {
    id: 'advance-08',
    name: 'Advance 08 — Blessings for the Year Ahead',
    type: 'ADVANCE',
    subject: 'Blessings for the year ahead ✨',
    heading: 'BLESSINGS FOR EVERY STEP FORWARD',
    topLabel: 'ADVANCE BIRTHDAY DISPATCH · VIII',
    message: `As evening approaches on the eve of your birthday, we offer our deepest blessings for your {AGE}th year.

May you be blessed with good health, unbreakable inner peace, prosperous beginnings, and meaningful relationships that lift your spirit.

May every path you choose lead toward fulfillment, wisdom, and boundless joy, <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'A WISH FOR YOUR NEXT CHAPTER →',
    buttonText: 'A WISH FOR YOUR NEXT CHAPTER →',
    scheduleDate: '2026-09-27',
    scheduleTime: '18:00',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 9. ADVANCE 09 — SEP 27, 09:00 PM (Heartfelt)
  {
    id: 'advance-09',
    name: 'Advance 09 — A Quiet Reminder of Who You Are',
    type: 'ADVANCE',
    subject: 'A quiet reminder of how special you are 💫',
    heading: 'A QUIET CELEBRATION OF WHO YOU ARE',
    topLabel: 'ADVANCE BIRTHDAY DISPATCH · IX',
    message: `Some people have the rare gift of making life brighter simply by being themselves. Their presence is comforting, their thoughts are genuine, and their dignity is inspiring.

You are one of those rare souls. 

As tonight progresses and the hours grow shorter, take pride in everything you have overcome, achieved, and become. You are deeply respected and appreciated, <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'JUST FOR YOU →',
    buttonText: 'JUST FOR YOU →',
    scheduleDate: '2026-09-27',
    scheduleTime: '21:00',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 10. ADVANCE 10 — SEP 27, 11:11 PM (Magical)
  {
    id: 'advance-10',
    name: 'Advance 10 — 11:11 Make a Wish',
    type: 'ADVANCE',
    subject: '11:11 · Make a wish tonight, SIRI ✦',
    heading: 'A WHISPER TO THE STARS AT 11:11',
    topLabel: 'ADVANCE BIRTHDAY DISPATCH · X',
    message: `The clock has struck 11:11 on the eve of your birthday — the celestial moment where wishes carry a little extra magic.

Close your eyes for just a second. Make a wish for what you desire most in the year ahead.

May your cherished dreams find their time, may happiness stay longer than you ever expected, and may life surprise you with extraordinary blessings, <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'MAKE A WISH ✦ →',
    buttonText: 'MAKE A WISH ✦ →',
    scheduleDate: '2026-09-27',
    scheduleTime: '23:11',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 11. ADVANCE 11 — SEP 27, 11:45 PM (Anticipation)
  {
    id: 'advance-11',
    name: 'Advance 11 — Almost There…',
    type: 'ADVANCE',
    subject: 'Almost there… ⏳',
    heading: 'ONLY MINUTES REMAIN IN THIS CHAPTER',
    topLabel: 'ADVANCE BIRTHDAY DISPATCH · XI',
    message: `Almost there...

The final minutes of this year are ticking away. One beautiful chapter is about to turn, and a brand new dawn is standing right on the horizon.

Hold onto the anticipation. Just a little longer...

The countdown is almost complete, <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'WAIT FOR THE MOMENT →',
    buttonText: 'WAIT FOR THE MOMENT →',
    scheduleDate: '2026-09-27',
    scheduleTime: '23:45',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 12. FINAL PRE-BIRTHDAY — SEP 27, 11:58 PM (Two-Minute Emotional Climax)
  {
    id: 'final-pre-birthday',
    name: 'Advance 12 — Final Two Minutes Before Midnight',
    type: 'ADVANCE',
    subject: 'Just two minutes remain… See you on the other side of midnight ✨',
    heading: 'THE FINAL TWO MINUTES BEFORE SEPTEMBER 28',
    topLabel: 'FINAL COUNTDOWN DISPATCH · 11:58 PM',
    message: `Just two minutes remain...

In exactly one hundred and twenty seconds, the calendar returns to the date where a beautiful story began.

The countdown is ending. The stars are aligned. All the memories of the past make way for the brilliance of your special day.

Thank you for being the wonderful person you are. 

See you on the other side of midnight, <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'STEP INTO THE MOMENT →',
    buttonText: 'STEP INTO THE MOMENT →',
    scheduleDate: '2026-09-27',
    scheduleTime: '23:58',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 13. OFFICIAL BIRTHDAY — SEP 28, 12:00 AM (Celebration)
  {
    id: 'birthday-midnight',
    name: 'Official Birthday Midnight — Cosmic Milestone',
    type: 'BIRTHDAY',
    subject: 'The Day Has Arrived, SIRI 🎂 ✨',
    heading: 'HAPPY BIRTHDAY, SIRI',
    topLabel: 'MIDNIGHT CELESTIAL CELEBRATION',
    message: `Today isn't just another date on the calendar.

It is the day your remarkable journey began.

<span style="color: #D4AF37; font-weight: 700; font-size: 18px;">HAPPY BIRTHDAY, {NAME}!</span> 🎂 ✨

May this new chapter of your {AGE}th year bring boundless happiness, meaningful journeys, unbroken peace, and memories worth holding onto forever.

May every dream you hold in your heart find its path, and may your days always be filled with love and respect.`,
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'ENTER YOUR BIRTHDAY EXPERIENCE →',
    buttonText: 'ENTER YOUR BIRTHDAY EXPERIENCE →',
    scheduleDate: '2026-09-28',
    scheduleTime: '00:00',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 14. BIRTH-MOMENT EMAIL — SEP 28, 08:00 AM (Genesis Hour)
  {
    id: 'birth-moment',
    name: 'Birth Moment — 08:00 AM Genesis',
    type: 'BIRTH MOMENT',
    subject: 'At 8:00 AM — The Moment It All Began 🌅 ✨',
    heading: 'THE SACRED MOMENT YOUR STORY BEGAN',
    topLabel: 'GENESIS HOUR DISPATCH · 08:00 AM',
    message: `On 28 September 2003, at exactly 08:00 AM on a peaceful Sunday morning, a new light entered this world.

That was the precise moment your story began.

Twenty-three years ago, under the gentle morning sky, the universe welcomed a soul destined to bring joy, grace, and warmth to everyone around her.

As the clock strikes 08:00 AM today, we celebrate not just the date, but the exact sacred hour of your arrival, <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'REVISIT YOUR BEGINNING →',
    buttonText: 'REVISIT YOUR BEGINNING →',
    scheduleDate: '2026-09-28',
    scheduleTime: '08:00',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 15. SPECIAL TITHI BIRTHDAY EMAIL — OCT 14, 2026, 08:00 AM (Divine Blessing)
  {
    id: 'yearly-tithi',
    name: 'Yearly Tithi Birthday — Divine Lunar Return',
    type: 'TITHI',
    subject: 'A Divine Birthday Blessing ✨ (Ashwayuja Shukla Tritiya)',
    heading: 'DIVINE BLESSINGS OF ASHWAYUJA SHUKLA TRITIYA',
    topLabel: 'LUNAR SACRED RETURN · 2026',
    message: `Born under the auspicious and divine grace of Sharan Navaratri, today marks your sacred Lunar Tithi return — {TITHI_NAME}.

In our traditional Vedic calendar, this sacred alignment in Tula Rashi and Swati Nakshatra carries profound blessings for life and spiritual grace.

May the divine energies of this sacred season shower you with enduring peace, radiant health, prosperity, and wisdom for every chapter ahead, <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    recipient: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: "DISCOVER TODAY'S TITHI →",
    buttonText: "DISCOVER TODAY'S TITHI →",
    scheduleDate: '2026-10-14',
    scheduleTime: '08:00',
    status: 'SCHEDULED',
    enabled: true,
  },

  // 16. SYSTEM VERIFICATION TEST EMAIL (Ready for manual test send anytime)
  {
    id: 'system-test-email',
    name: 'System Verification Test Email',
    type: 'TEST',
    subject: 'System Verification Test — SIRI Experience ✦',
    heading: 'EMAIL AUTOMATION VERIFIED & READY',
    topLabel: 'SYSTEM INFRASTRUCTURE TEST',
    message: `This is a verified delivery test of the SIRI Birthday Automation System.

All visual styles, champagne gold highlights, dynamic variable replacements, and aliased link CTA buttons are functioning with 100% precision.

Greetings to <span style="color: #F3E5AB; font-weight: 700;">{NAME}</span>.`,
    recipient: 'lohithmedisetti1432004@gmail.com',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: 'OPEN THE EXPERIENCE →',
    buttonText: 'OPEN THE EXPERIENCE →',
    scheduleDate: '2026-09-26',
    scheduleTime: '10:00',
    status: 'READY',
    enabled: true,
  },
];

export const DEFAULT_EMAIL_TEMPLATES: AllEmailTemplates = {
  test: {
    subject: 'System Verification Test — SIRI Experience ✦',
    heading: 'EMAIL AUTOMATION VERIFIED & READY',
    topLabel: 'SYSTEM INFRASTRUCTURE TEST',
    message: 'This is a verified delivery test of the SIRI Birthday Automation System.',
    buttonText: 'OPEN THE EXPERIENCE →',
    linkAlias: 'OPEN THE EXPERIENCE →',
    websiteUrl: DEFAULT_WEBSITE_URL,
  },
  advance: {
    subject: 'Something beautiful is getting closer ✨',
    heading: 'SOMETHING BEAUTIFUL IS DRAWING NEAR',
    topLabel: 'ADVANCE BIRTHDAY DISPATCH',
    message: 'Some days quietly pass by without notice, while some special dates arrive with a gentle reminder that life is filled with wonder.',
    buttonText: 'A LITTLE SOMETHING FOR YOU →',
    linkAlias: 'A LITTLE SOMETHING FOR YOU →',
    websiteUrl: DEFAULT_WEBSITE_URL,
  },
  birthday_midnight: {
    subject: 'The Day Has Arrived, SIRI 🎂 ✨',
    heading: 'HAPPY BIRTHDAY, SIRI',
    topLabel: 'MIDNIGHT CELESTIAL CELEBRATION',
    message: "Today isn't just another date on the calendar. It is the day your remarkable journey began.",
    buttonText: 'ENTER YOUR BIRTHDAY EXPERIENCE →',
    linkAlias: 'ENTER YOUR BIRTHDAY EXPERIENCE →',
    websiteUrl: DEFAULT_WEBSITE_URL,
  },
  birth_moment: {
    subject: 'At 8:00 AM — The Moment It All Began 🌅 ✨',
    heading: 'THE SACRED MOMENT YOUR STORY BEGAN',
    topLabel: 'GENESIS HOUR DISPATCH · 08:00 AM',
    message: 'On 28 September 2003, at exactly 08:00 AM on a peaceful Sunday morning, a new light entered this world.',
    buttonText: 'REVISIT YOUR BEGINNING →',
    linkAlias: 'REVISIT YOUR BEGINNING →',
    websiteUrl: DEFAULT_WEBSITE_URL,
  },
  tithi: {
    subject: 'A Divine Birthday Blessing ✨ (Ashwayuja Shukla Tritiya)',
    heading: 'DIVINE BLESSINGS OF ASHWAYUJA SHUKLA TRITIYA',
    topLabel: 'LUNAR SACRED RETURN · 2026',
    message: 'Born under the auspicious and divine grace of Sharan Navaratri, today marks your sacred Lunar Tithi return — {TITHI_NAME}.',
    buttonText: "DISCOVER TODAY'S TITHI →",
    linkAlias: "DISCOVER TODAY'S TITHI →",
    websiteUrl: DEFAULT_WEBSITE_URL,
  },
};

/**
 * Replace dynamic placeholders in text
 */

export function formatGoldenName(name: string): string {
  if (!name) return '✦ S I R I ✦';
  const clean = name.trim().toUpperCase();
  const words = clean.split(/\s+/);
  return '✦ ' + words.map(w => w.split('').join(' ')).join('   ') + ' ✦';
}

export function replaceEmailVariables(
  text: string,
  context: {
    name?: string;
    year?: number;
    age?: number;
    tithiName?: string;
    scheduledDate?: string;
    websiteUrl?: string;
    linkAlias?: string;
  }
): string {
  const name = context.name || 'SIRI';
  const year = String(context.year || 2026);
  const age = String(context.age || (context.year ? context.year - 2003 : 23));
  const tithiName = context.tithiName || 'Ashwayuja Shukla Tritiya';
  const scheduledDate = context.scheduledDate || '28 September 2026';
  const linkAlias = context.linkAlias || DEFAULT_LINK_ALIAS;
  const websiteUrl = context.websiteUrl || DEFAULT_WEBSITE_URL;

  return text
    .replace(/\{NAME\}/g, name)
    .replace(/\{YEAR\}/g, year)
    .replace(/\{AGE\}/g, age)
    .replace(/\{TITHI_NAME\}/g, tithiName)
    .replace(/\{DATE\}/g, scheduledDate)
    .replace(/\{SCHEDULED_DATE\}/g, scheduledDate)
    .replace(/\{LINK_ALIAS\}/g, linkAlias)
    .replace(/\{WEBSITE_URL\}/g, websiteUrl)
    .replace(/\{LINK\}/g, `<a href="${websiteUrl}" target="_blank" style="color: #D4AF37; font-weight: 700; text-decoration: underline;">${linkAlias}</a>`);
}

/**
 * Generate Master Luxury HTML Email
 * 
 * DESIGN FEATURES:
 * - Deep black #060408 with #1c0d1e radial burgundy glow
 * - 1px solid #C5A059 champagne gold border with 0 25px 70px drop shadow
 * - Glowing ✦ SIRI bangaram ✦ signature title
 * - NO RAW URLs displayed anywhere: Buttons and links strictly display the configured buttonText / linkAlias
 */
export function generateEmailHtml(
  item: Partial<EmailItem> & {
    name?: string;
    subject?: string;
    heading?: string;
    topLabel?: string;
    message?: string;
    buttonText?: string;
    linkAlias?: string;
    websiteUrl?: string;
    type?: string;
    useGlobalEmailDisplayName?: boolean;
    customDisplayName?: string;
  },
  context: {
    name?: string;
    emailDisplayName?: string;
    year?: number;
    age?: number;
    tithiName?: string;
    scheduledDate?: string;
  } = {}
): string {
  // Determine effective email display name (per-email override vs global emailDisplayName)
  const effectiveEmailDisplayName = (item.useGlobalEmailDisplayName === false && item.customDisplayName && item.customDisplayName.trim())
    ? item.customDisplayName.trim()
    : (context.emailDisplayName || context.name || 'SIRI BANGARAM');

  const goldenHeaderName = formatGoldenName(effectiveEmailDisplayName);

  const websiteUrl = (item.websiteUrl || DEFAULT_WEBSITE_URL).trim();
  const rawAlias = item.linkAlias || item.buttonText || DEFAULT_LINK_ALIAS;
  const linkAlias = replaceEmailVariables(rawAlias, { ...context, name: effectiveEmailDisplayName });
  const rawButtonText = item.buttonText || item.linkAlias || 'ENTER YOUR STORY →';
  const buttonText = replaceEmailVariables(rawButtonText, { ...context, name: effectiveEmailDisplayName });

  const subject = replaceEmailVariables(item.subject || 'The Day Has Arrived, SIRI ✨', { ...context, name: effectiveEmailDisplayName, websiteUrl, linkAlias });
  const heading = replaceEmailVariables(item.heading || 'HAPPY BIRTHDAY, SIRI', { ...context, name: effectiveEmailDisplayName, websiteUrl, linkAlias });
  const topLabel = replaceEmailVariables(item.topLabel || 'CELESTIAL DISPATCH', { ...context, name: effectiveEmailDisplayName, websiteUrl, linkAlias });

  const rawMessage = item.message || '';
  const processedMessage = replaceEmailVariables(rawMessage, { ...context, name: effectiveEmailDisplayName, websiteUrl, linkAlias });

  // Format paragraphs with luxury styling
  const formattedParagraphs = processedMessage
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin: 0 0 16px 0; color: #E8E2D8; font-size: 15px; line-height: 1.85; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

  const signatureNameHtml = `
    <div style="font-family: 'Cinzel', Georgia, serif; font-size: 22px; font-weight: 900; letter-spacing: 5px; color: #F5E6B3; text-shadow: 0 0 15px rgba(212,175,55,0.7), 0 0 30px rgba(212,175,55,0.4); text-transform: uppercase;">
      ${goldenHeaderName}
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 12px !important; }
      .email-content { padding: 24px 20px !important; }
      .email-heading { font-size: 22px !important; }
      .signature-name { font-size: 20px !important; letter-spacing: 4px !important; }
      .panel-card { padding: 16px 16px !important; }
      .cta-button { padding: 14px 28px !important; font-size: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #060408; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #FAF8F5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060408; background-image: radial-gradient(circle at 50% 15%, #1c0d1e 0%, #060408 75%); padding: 35px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Frame -->
        <table role="presentation" class="email-container" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(175deg, #180c1a 0%, #0d0610 45%, #060408 100%); border: 1px solid #C5A059; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(197,160,89,0.14);">
          
          <!-- Top Emblem & Header -->
          <tr>
            <td align="center" style="padding: 42px 30px 24px 30px; border-bottom: 1px solid rgba(197,160,89,0.25);">
              <div style="width: 54px; height: 54px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 54px; text-align: center; color: #F3E5AB; font-size: 22px; font-weight: bold; margin-bottom: 18px; background: radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.05) 100%); box-shadow: 0 0 22px rgba(212,175,55,0.35);">
                👑
              </div>
              <p style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 4.5px; color: #D4AF37; text-transform: uppercase; font-weight: 700; font-family: 'Cinzel', Georgia, serif;">
                ${topLabel}
              </p>
              <h1 class="email-heading" style="margin: 0 0 14px 0; font-size: 26px; font-weight: 700; letter-spacing: 3px; color: #FAF8F5; text-transform: uppercase; font-family: 'Cinzel', Georgia, serif; line-height: 1.3;">
                ${heading}
              </h1>
              <div class="signature-name" style="margin-top: 6px;">
                ${signatureNameHtml}
              </div>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td class="email-content" style="padding: 32px 44px 24px 44px; text-align: center;">
              ${formattedParagraphs}
            </td>
          </tr>

          <!-- Premium CTA Button Section (No raw URL displayed anywhere!) -->
          <tr>
            <td align="center" style="padding: 16px 40px 14px 40px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #F5E6B3 0%, #D4AF37 50%, #997A26 100%); box-shadow: 0 10px 30px rgba(212,175,55,0.35); border: 1px solid #FFE594;">
                    <a href="${websiteUrl}" target="_blank" class="cta-button" style="display: inline-block; padding: 16px 36px; font-size: 13px; font-weight: 800; letter-spacing: 2px; text-decoration: none; color: #07060A; text-transform: uppercase; border-radius: 50px; font-family: 'Cinzel', Georgia, serif;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Elegant Alias Text Link (Raw URL stays hidden behind alias) -->
              <div style="margin-top: 14px; text-align: center;">
                <a href="${websiteUrl}" target="_blank" style="color: #D4AF37; font-size: 11.5px; font-family: 'Cinzel', Georgia, serif; font-weight: 700; text-decoration: underline; letter-spacing: 1.5px;">
                  ${linkAlias}
                </a>
              </div>
            </td>
          </tr>

          <!-- Celestial Separator -->
          <tr>
            <td align="center" style="padding: 22px 0 12px 0; color: #8F7745; font-size: 11px; letter-spacing: 8px;">
              ✦ &nbsp; ✧ &nbsp; ✵ &nbsp; ✧ &nbsp; ✦
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 30px; background-color: #060408; border-top: 1px solid rgba(197,160,89,0.22);">
              <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 2.5px; color: #C5A059; font-weight: 700; font-family: 'Cinzel', Georgia, serif; text-transform: uppercase;">
                SIRI — A JOURNEY WRITTEN IN THE STARS
              </p>
              <p style="margin: 0; font-size: 11px; letter-spacing: 1px; color: #8F8A82; line-height: 1.6; font-family: 'Montserrat', sans-serif;">
                A small experience created with love, admiration and respect.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Backward-compatible helper functions
export function generateAdvanceEmailHtml(customTemplate?: CustomEmailTemplateConfig, context: any = {}): string {
  return generateEmailHtml({
    ...DEFAULT_EMAIL_TEMPLATES.advance,
    ...customTemplate,
    type: 'ADVANCE',
  }, context);
}

export function generateBirthdayMidnightEmailHtml(customTemplate?: CustomEmailTemplateConfig, context: any = {}): string {
  return generateEmailHtml({
    ...DEFAULT_EMAIL_TEMPLATES.birthday_midnight,
    ...customTemplate,
    type: 'BIRTHDAY',
  }, context);
}

export function generateBirthMomentEmailHtml(customTemplate?: CustomEmailTemplateConfig, context: any = {}): string {
  return generateEmailHtml({
    ...DEFAULT_EMAIL_TEMPLATES.birth_moment,
    ...customTemplate,
    type: 'BIRTH MOMENT',
  }, context);
}

export function generateTithiEmailHtml(customTemplate?: CustomEmailTemplateConfig, context: any = {}): string {
  return generateEmailHtml({
    ...DEFAULT_EMAIL_TEMPLATES.tithi,
    ...customTemplate,
    type: 'TITHI',
  }, context);
}

export function generateTestEmailHtml(customTemplate?: CustomEmailTemplateConfig, context: any = {}): string {
  return generateEmailHtml({
    ...DEFAULT_EMAIL_TEMPLATES.test,
    ...customTemplate,
    type: 'TEST',
  }, context);
}

export function generateBirthdayEmailHtml(customTemplate?: CustomEmailTemplateConfig, context: any = {}): string {
  return generateBirthdayMidnightEmailHtml(customTemplate, context);
}
