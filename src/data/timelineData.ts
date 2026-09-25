import { type TithiDateRecord } from '../lib/supabase';

export interface TimelineEntry {
  year: number;
  tithiDate: string; // e.g. "14 October" or "Date yet to be revealed"
  fixedDate: string; // "28 September"
  day?: number;
  month?: number;
  monthName?: string;
  isPublished: boolean;
  notes?: string;
}

export const BIRTH_DETAILS = {
  name: "SIRI",
  subTitle: "A JOURNEY WRITTEN IN THE STARS",
  blessing: "Born under the divine blessings of Sharan Navaratri",
  birthDate: "28 September 2003",
  birthTime: "08:00 AM",
  fixedDayMonth: "28 September",
  fixedDay: 28,
  fixedMonth: 9,
  birthYear: 2003,
  rashi: "Tula Rashi",
  rashiSanskrit: "तुला राशि (Libra)",
  nakshatra: "Swati Nakshatra — 1st Pada",
  nakshatraSanskrit: "स्वाती नक्षत्र (प्रथम चरण)",
  tithi: "Ashwayuja Shukla Tritiya",
  tithiSanskrit: "आश्वयुज शुक्ल तृतीया",
  rashiLord: "Venus (Shukra)",
  rashiLordSanskrit: "शुक्र (Venus)",
  deityBlessing: "Goddess Durga / Sharan Navaratri",
  startYear: 2003,
  endYear: 2103,
  totalSpanYears: 101,
};

// The 6 Continuous Era Divisions across 2003 – 2103
export const TIMELINE_ERAS = [
  { label: "2003 – 2020", start: 2003, end: 2020, subtitle: "Youth & Starlight" },
  { label: "2021 – 2040", start: 2021, end: 2040, subtitle: "Ascendance & Radiance" },
  { label: "2041 – 2060", start: 2041, end: 2060, subtitle: "Golden Horizon" },
  { label: "2061 – 2080", start: 2061, end: 2080, subtitle: "Luminous Wisdom" },
  { label: "2081 – 2100", start: 2081, end: 2100, subtitle: "Eternal Constellation" },
  { label: "2101 – 2103", start: 2101, end: 2103, subtitle: "Centennial Grace" },
];

/**
 * Builds the complete 101-year timeline (2003–2103) merging published records
 * from Supabase/service, and marking unpublished future years as "Date yet to be revealed".
 */
export function buildCompleteTimeline(publishedRecords: TithiDateRecord[]): TimelineEntry[] {
  const publishedMap = new Map<number, TithiDateRecord>();
  publishedRecords.forEach((rec) => {
    if (rec.status === 'published') {
      publishedMap.set(rec.year, rec);
    }
  });

  const entries: TimelineEntry[] = [];

  for (let yr = 2003; yr <= 2103; yr++) {
    const published = publishedMap.get(yr);

    if (published) {
      const parts = published.date.split(' ');
      const day = parseInt(parts[0], 10) || 1;
      const monthName = parts[1] || 'October';
      const month = monthName.toLowerCase().startsWith('sep') ? 9 : 10;

      entries.push({
        year: yr,
        tithiDate: published.date,
        fixedDate: "28 September",
        day,
        month,
        monthName,
        isPublished: true,
        notes: published.notes || undefined,
      });
    } else {
      // Future or unpublished year (Zero fake dates)
      entries.push({
        year: yr,
        tithiDate: "Date yet to be revealed",
        fixedDate: "28 September",
        isPublished: false,
      });
    }
  }

  return entries;
}

/**
 * Dynamic Current Year Analysis
 */
export function getCurrentYearDetails(timelineEntries: TimelineEntry[]) {
  const currentYear = new Date().getFullYear();
  const matched = timelineEntries.find((e) => e.year === currentYear);

  if (matched && matched.isPublished) {
    return {
      currentYear,
      isRevealed: true,
      tithiDate: matched.tithiDate,
      fixedDate: `28 September ${currentYear}`,
      fullTithiDate: `${matched.tithiDate} ${currentYear}`,
      statusMessage: null,
    };
  }

  return {
    currentYear,
    isRevealed: false,
    tithiDate: "Yet to be revealed",
    fixedDate: `28 September ${currentYear}`,
    fullTithiDate: "Date to be revealed",
    statusMessage: "This year's Tithi date is yet to be revealed. The corresponding Tithi date will appear here once it is updated.",
  };
}

/**
 * Calculate Admin & Living Timeline Dashboard Statistics
 */
export function calculateTimelineStats(allRecords: TithiDateRecord[]) {
  const currentYear = new Date().getFullYear();
  const published = allRecords.filter((r) => r.status === 'published').sort((a, b) => a.year - b.year);
  const drafts = allRecords.filter((r) => r.status === 'draft');
  const unpub = allRecords.filter((r) => r.status === 'unpublished');

  const latestPublishedYear = published.length > 0 ? published[published.length - 1].year : 2003;
  const nextUnpublishedYear = latestPublishedYear + 1;

  const currentYearRecord = published.find((r) => r.year === currentYear);

  return {
    publishedCount: published.length,
    draftsCount: drafts.length,
    unpublishedCount: unpub.length,
    totalRecords: allRecords.length,
    latestPublishedYear,
    nextUnpublishedYear,
    currentYear,
    isCurrentYearPublished: Boolean(currentYearRecord),
    currentYearTithi: currentYearRecord ? currentYearRecord.date : null,
  };
}
