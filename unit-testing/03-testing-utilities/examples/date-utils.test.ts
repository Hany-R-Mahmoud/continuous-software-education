/**
 * Example: Testing Date Utility Functions
 * 
 * This file demonstrates how to test date manipulation and formatting functions.
 * Note: Date testing can be tricky due to timezones - these examples use simple cases.
 */

// Date utility functions to test
function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  if (format === 'long') {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[date.getMonth()]} ${day}, ${year}`;
  }

  return `${month}/${day}/${year}`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getDaysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Tests
describe('formatDate', () => {
  test('formats date in short format', () => {
    const date = new Date(2024, 0, 15); // January 15, 2024
    expect(formatDate(date, 'short')).toBe('1/15/2024');
  });

  test('formats date in long format', () => {
    const date = new Date(2024, 0, 15); // January 15, 2024
    expect(formatDate(date, 'long')).toBe('January 15, 2024');
  });

  test('defaults to short format', () => {
    const date = new Date(2024, 0, 15);
    expect(formatDate(date)).toBe('1/15/2024');
  });

  test('handles single digit day and month', () => {
    const date = new Date(2024, 0, 5); // January 5, 2024
    expect(formatDate(date, 'short')).toBe('1/5/2024');
  });

  test('handles different months', () => {
    const date = new Date(2024, 11, 25); // December 25, 2024
    expect(formatDate(date, 'long')).toBe('December 25, 2024');
  });
});

describe('isToday', () => {
  test('returns true for today', () => {
    const today = new Date();
    expect(isToday(today)).toBe(true);
  });

  test('returns false for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday)).toBe(false);
  });

  test('returns false for tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isToday(tomorrow)).toBe(false);
  });

  test('returns false for different year', () => {
    const lastYear = new Date(2023, 0, 15);
    expect(isToday(lastYear)).toBe(false);
  });
});

describe('getDaysBetween', () => {
  test('calculates days between two dates', () => {
    const date1 = new Date(2024, 0, 1); // January 1
    const date2 = new Date(2024, 0, 8); // January 8
    expect(getDaysBetween(date1, date2)).toBe(7);
  });

  test('returns same result regardless of order', () => {
    const date1 = new Date(2024, 0, 1);
    const date2 = new Date(2024, 0, 8);
    expect(getDaysBetween(date1, date2)).toBe(getDaysBetween(date2, date1));
  });

  test('returns 0 for same date', () => {
    const date = new Date(2024, 0, 15);
    expect(getDaysBetween(date, date)).toBe(0);
  });

  test('handles dates in different months', () => {
    const date1 = new Date(2024, 0, 15); // January 15
    const date2 = new Date(2024, 1, 15); // February 15
    expect(getDaysBetween(date1, date2)).toBe(31);
  });

  test('handles dates in different years', () => {
    const date1 = new Date(2023, 11, 31); // December 31, 2023
    const date2 = new Date(2024, 0, 1); // January 1, 2024
    expect(getDaysBetween(date1, date2)).toBe(1);
  });
});

describe('addDays', () => {
  test('adds positive number of days', () => {
    const date = new Date(2024, 0, 15); // January 15
    const result = addDays(date, 5);
    expect(result.getDate()).toBe(20);
  });

  test('adds negative number of days (subtracts)', () => {
    const date = new Date(2024, 0, 15);
    const result = addDays(date, -5);
    expect(result.getDate()).toBe(10);
  });

  test('handles adding zero days', () => {
    const date = new Date(2024, 0, 15);
    const result = addDays(date, 0);
    expect(result.getTime()).toBe(date.getTime());
  });

  test('handles month boundaries', () => {
    const date = new Date(2024, 0, 30); // January 30
    const result = addDays(date, 5);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(4); // February 4
  });

  test('does not modify original date', () => {
    const date = new Date(2024, 0, 15);
    const originalTime = date.getTime();
    addDays(date, 5);
    expect(date.getTime()).toBe(originalTime);
  });
});

