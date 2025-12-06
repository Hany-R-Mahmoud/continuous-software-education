/**
 * Example: Testing Validation Utility Functions
 * 
 * This file demonstrates how to test validation functions.
 * Validation functions typically return boolean values (true/false).
 */

// Validation utility functions to test
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

function isValidPhone(phone: string): boolean {
  // Simple phone validation: 10 digits, optional formatting
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
}

function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

function isNotEmpty(str: string): boolean {
  return typeof str === 'string' && str.trim().length > 0;
}

// Tests
describe('isValidEmail', () => {
  test('validates correct email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.email@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  test('rejects invalid email addresses', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@example')).toBe(false);
    expect(isValidEmail('user space@example.com')).toBe(false);
  });

  test('handles empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  test('handles edge cases', () => {
    expect(isValidEmail('user@example')).toBe(false); // Missing TLD
    expect(isValidEmail('user.example.com')).toBe(false); // Missing @
  });
});

describe('isStrongPassword', () => {
  test('accepts strong passwords', () => {
    expect(isStrongPassword('StrongPass123')).toBe(true);
    expect(isStrongPassword('MyP@ssw0rd')).toBe(true);
    expect(isStrongPassword('Complex123')).toBe(true);
  });

  test('rejects short passwords', () => {
    expect(isStrongPassword('Short1')).toBe(false);
    expect(isStrongPassword('Abc123')).toBe(false);
  });

  test('rejects passwords without uppercase', () => {
    expect(isStrongPassword('lowercase123')).toBe(false);
    expect(isStrongPassword('alllowercase123')).toBe(false);
  });

  test('rejects passwords without lowercase', () => {
    expect(isStrongPassword('UPPERCASE123')).toBe(false);
    expect(isStrongPassword('ALLUPPER123')).toBe(false);
  });

  test('rejects passwords without numbers', () => {
    expect(isStrongPassword('NoNumbers')).toBe(false);
    expect(isStrongPassword('StrongPassword')).toBe(false);
  });

  test('rejects empty password', () => {
    expect(isStrongPassword('')).toBe(false);
  });

  test('rejects passwords missing multiple requirements', () => {
    expect(isStrongPassword('short')).toBe(false); // Missing length, uppercase, numbers
    expect(isStrongPassword('12345678')).toBe(false); // Missing uppercase, lowercase
  });
});

describe('isValidPhone', () => {
  test('validates phone numbers with 10 digits', () => {
    expect(isValidPhone('1234567890')).toBe(true);
    expect(isValidPhone('(123) 456-7890')).toBe(true);
    expect(isValidPhone('123-456-7890')).toBe(true);
    expect(isValidPhone('123.456.7890')).toBe(true);
  });

  test('rejects phone numbers with wrong length', () => {
    expect(isValidPhone('123456789')).toBe(false); // 9 digits
    expect(isValidPhone('12345678901')).toBe(false); // 11 digits
  });

  test('rejects phone numbers with letters', () => {
    expect(isValidPhone('123-456-ABCD')).toBe(false);
  });

  test('handles empty string', () => {
    expect(isValidPhone('')).toBe(false);
  });

  test('handles international format (if not supported)', () => {
    expect(isValidPhone('+1 1234567890')).toBe(false); // 11 digits with +
  });
});

describe('isPositiveNumber', () => {
  test('accepts positive numbers', () => {
    expect(isPositiveNumber(1)).toBe(true);
    expect(isPositiveNumber(100)).toBe(true);
    expect(isPositiveNumber(0.5)).toBe(true);
  });

  test('rejects zero', () => {
    expect(isPositiveNumber(0)).toBe(false);
  });

  test('rejects negative numbers', () => {
    expect(isPositiveNumber(-1)).toBe(false);
    expect(isPositiveNumber(-100)).toBe(false);
  });

  test('rejects NaN', () => {
    expect(isPositiveNumber(NaN)).toBe(false);
  });

  test('rejects non-numbers', () => {
    expect(isPositiveNumber('123' as any)).toBe(false);
    expect(isPositiveNumber(null as any)).toBe(false);
    expect(isPositiveNumber(undefined as any)).toBe(false);
  });
});

describe('isNotEmpty', () => {
  test('accepts non-empty strings', () => {
    expect(isNotEmpty('hello')).toBe(true);
    expect(isNotEmpty('  hello  ')).toBe(true); // Has content after trim
  });

  test('rejects empty string', () => {
    expect(isNotEmpty('')).toBe(false);
  });

  test('rejects whitespace-only string', () => {
    expect(isNotEmpty('   ')).toBe(false);
    expect(isNotEmpty('\t\n')).toBe(false);
  });

  test('handles edge cases', () => {
    expect(isNotEmpty('a')).toBe(true); // Single character
    expect(isNotEmpty('  a  ')).toBe(true); // Content with spaces
  });
});

