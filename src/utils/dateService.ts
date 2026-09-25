import { useState, useEffect } from 'react';

/**
 * Real-time Date Service for Reberwet Junior Secondary School Portal
 * Automatically updates dates in real-time and advances past midnight (00:00:00).
 */
export const DateService = {
  /**
   * Returns current Date in 'YYYY-MM-DD' local format
   */
  getCurrentDateISO(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Returns formatted human-readable date, e.g. "Thursday, September 24, 2026"
   */
  getFormattedCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('en-KE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Returns current academic term based on month
   */
  getCurrentTerm(): 'Term 1' | 'Term 2' | 'Term 3' {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 1 && month <= 4) return 'Term 1';
    if (month >= 5 && month <= 8) return 'Term 2';
    return 'Term 3';
  },

  /**
   * Returns current academic year
   */
  getCurrentYear(): string {
    return String(new Date().getFullYear());
  },

  /**
   * Calculates milliseconds remaining until the next midnight (00:00:00)
   */
  getMsUntilNextMidnight(): number {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      100
    );
    return Math.max(1000, nextMidnight.getTime() - now.getTime());
  },
};

/**
 * Custom React hook that automatically updates the date when midnight strikes
 * or if device clock changes, keeping the portal live in real-time.
 */
export function useRealtimeDate() {
  const [currentDateISO, setCurrentDateISO] = useState<string>(() =>
    DateService.getCurrentDateISO()
  );
  const [formattedDate, setFormattedDate] = useState<string>(() =>
    DateService.getFormattedCurrentDate()
  );

  useEffect(() => {
    let midnightTimer: ReturnType<typeof setTimeout>;

    const scheduleMidnightUpdate = () => {
      const ms = DateService.getMsUntilNextMidnight();
      midnightTimer = setTimeout(() => {
        // Update at midnight
        setCurrentDateISO(DateService.getCurrentDateISO());
        setFormattedDate(DateService.getFormattedCurrentDate());
        // Re-schedule for the next midnight
        scheduleMidnightUpdate();
      }, ms);
    };

    scheduleMidnightUpdate();

    // Secondary interval check every 30 seconds to catch system wake / tab activation
    const intervalTimer = setInterval(() => {
      const newISO = DateService.getCurrentDateISO();
      if (newISO !== currentDateISO) {
        setCurrentDateISO(newISO);
        setFormattedDate(DateService.getFormattedCurrentDate());
      }
    }, 30000);

    return () => {
      clearTimeout(midnightTimer);
      clearInterval(intervalTimer);
    };
  }, [currentDateISO]);

  return { currentDateISO, formattedDate };
}
