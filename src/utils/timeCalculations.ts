/**
 * Precision Time Calculations for SIRI's Birthday Journey
 * Birth Moment: 28 September 2003, 08:00:00 AM IST (UTC+05:30)
 * Unlock Target: 28 September 2026, 00:00:00 AM IST
 */

export const BIRTH_TIMESTAMP = new Date('2003-09-28T08:00:00+05:30').getTime();

// Target unlock date for the 2026 birthday experience
export const UNLOCK_TARGET_TIMESTAMP = new Date('2026-09-28T00:00:00+05:30').getTime();

export const SECRET_PREVIEW_CODE = 'mendu';

export interface TimeSinceBirth {
  totalHours: number;
  totalDays: number;
  years: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedTotalHours: string;
}

export interface CountdownRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isUnlocked: boolean;
}

/**
 * Calculates live elapsed time since birth moment: 28 September 2003, 08:00 AM IST
 */
export function calculateTimeSinceBirth(currentDate: Date = new Date()): TimeSinceBirth {
  const now = currentDate.getTime();
  const diffMs = Math.max(0, now - BIRTH_TIMESTAMP);

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  // Exact Gregorian breakdown from 28 Sep 2003, 08:00 AM
  const birthDate = new Date('2003-09-28T08:00:00+05:30');
  
  let years = currentDate.getFullYear() - birthDate.getFullYear();
  let birthMonth = birthDate.getMonth(); // 8 (Sep)
  let birthDay = birthDate.getDate(); // 28
  
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();
  const currentHours = currentDate.getHours();
  
  // Adjust year if before 28 Sep 08:00 AM
  if (currentMonth < birthMonth || (currentMonth === birthMonth && (currentDay < birthDay || (currentDay === birthDay && currentHours < 8)))) {
    years--;
  }

  // Calculate remaining days since last birthday
  let lastBirthday = new Date(currentDate.getFullYear(), birthMonth, birthDay, 8, 0, 0);
  if (currentDate.getTime() < lastBirthday.getTime()) {
    lastBirthday = new Date(currentDate.getFullYear() - 1, birthMonth, birthDay, 8, 0, 0);
  }

  const diffSinceLastBirthday = Math.max(0, currentDate.getTime() - lastBirthday.getTime());
  const days = Math.floor(diffSinceLastBirthday / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffSinceLastBirthday / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffSinceLastBirthday / (1000 * 60)) % 60);
  const seconds = Math.floor((diffSinceLastBirthday / 1000) % 60);

  return {
    totalHours,
    totalDays,
    years: Math.max(0, years),
    days,
    hours,
    minutes,
    seconds,
    formattedTotalHours: totalHours.toLocaleString('en-US'),
  };
}

/**
 * Calculates live remaining countdown until target unlock date
 */
export function calculateUnlockCountdown(targetTimestamp: number = UNLOCK_TARGET_TIMESTAMP): CountdownRemaining {
  const now = Date.now();
  const diffMs = targetTimestamp - now;

  if (diffMs <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isUnlocked: true,
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  return {
    totalMs: diffMs,
    days,
    hours,
    minutes,
    seconds,
    isUnlocked: false,
  };
}

/**
 * Calculates exact dynamic age on any target date
 * e.g., On 25 Sep 2026 -> 22; On 28 Sep 2026 -> 23; On 28 Sep 2027 -> 24
 */
export function calculateDynamicAge(currentDate: Date = new Date()): number {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed: 8 is September
  const currentDay = currentDate.getDate();

  // If before Sep 28 of current year, age is (currentYear - 2003 - 1)
  if (currentMonth < 8 || (currentMonth === 8 && currentDay < 28)) {
    return currentYear - 2003 - 1;
  }
  // On or after Sep 28 of current year, age is (currentYear - 2003)
  return currentYear - 2003;
}

/**
 * Dynamic welcome age calculation for the target unlock milestone (2026 is 23)
 */
export function getUnlockedWelcomeAge(): number {
  const targetDate = new Date(UNLOCK_TARGET_TIMESTAMP);
  return calculateDynamicAge(targetDate);
}
