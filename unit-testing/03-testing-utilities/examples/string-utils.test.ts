/**
 * Example: Testing String Utility Functions
 * 
 * This file demonstrates how to test common string manipulation functions.
 * These are pure functions - easy to test with no setup needed.
 */

// String utility functions to test
function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function reverse(str: string): string {
  return str.split('').reverse().join('');
}

// Tests
describe('capitalize', () => {
  test('capitalizes first letter of lowercase string', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  test('handles already capitalized string', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  test('handles all uppercase string', () => {
    expect(capitalize('HELLO')).toBe('Hello');
  });

  test('handles mixed case', () => {
    expect(capitalize('hELLo')).toBe('Hello');
  });

  test('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });

  test('handles single character', () => {
    expect(capitalize('a')).toBe('A');
  });

  test('handles string with numbers', () => {
    expect(capitalize('hello123')).toBe('Hello123');
  });
});

describe('truncate', () => {
  test('truncates string longer than maxLength', () => {
    expect(truncate('This is a long string', 10)).toBe('This is a ...');
  });

  test('does not truncate short strings', () => {
    expect(truncate('Short', 10)).toBe('Short');
  });

  test('handles exact length', () => {
    expect(truncate('Exactly ten', 11)).toBe('Exactly ten');
  });

  test('handles zero maxLength', () => {
    expect(truncate('Hello', 0)).toBe('...');
  });

  test('handles very long string', () => {
    const longString = 'a'.repeat(100);
    expect(truncate(longString, 10)).toBe('aaaaaaaaaa...');
  });

  test('handles empty string', () => {
    expect(truncate('', 10)).toBe('');
  });
});

describe('slugify', () => {
  test('converts string to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  test('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  test('handles multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });

  test('handles underscores', () => {
    expect(slugify('Hello_World')).toBe('hello-world');
  });

  test('handles already slugified string', () => {
    expect(slugify('hello-world')).toBe('hello-world');
  });

  test('handles string with numbers', () => {
    expect(slugify('Hello World 123')).toBe('hello-world-123');
  });

  test('trims leading and trailing hyphens', () => {
    expect(slugify('-Hello World-')).toBe('hello-world');
  });
});

describe('reverse', () => {
  test('reverses normal string', () => {
    expect(reverse('hello')).toBe('olleh');
  });

  test('handles empty string', () => {
    expect(reverse('')).toBe('');
  });

  test('handles single character', () => {
    expect(reverse('a')).toBe('a');
  });

  test('handles palindrome', () => {
    expect(reverse('racecar')).toBe('racecar');
  });

  test('handles string with spaces', () => {
    expect(reverse('hello world')).toBe('dlrow olleh');
  });
});

