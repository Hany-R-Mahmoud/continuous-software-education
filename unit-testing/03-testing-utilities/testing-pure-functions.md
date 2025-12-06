# Testing Pure Functions

## What is a Pure Function?

A **pure function** is a function that:
1. Always returns the same output for the same input
2. Has no side effects (doesn't modify external state, make API calls, etc.)

**Example of a pure function**:
```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

**Example of an impure function**:
```typescript
let counter = 0;
function increment() {
  counter++; // Modifies external state
  return counter;
}
```

## Why Start with Pure Functions?

Pure functions are the **easiest to test** because:
- ✅ No setup needed (no mocks, no dependencies)
- ✅ Predictable (same input = same output)
- ✅ Fast (no network calls, no database)
- ✅ Simple (just test inputs and outputs)

**Perfect for learning!**

## The Testing Pattern

For pure functions, the pattern is simple:

1. **Call the function** with specific inputs
2. **Check the output** matches what you expect

```typescript
test('function does what it should', () => {
  const result = myFunction(input);
  expect(result).toBe(expectedOutput);
});
```

## Example 1: Math Functions

### The Function

```typescript
// math.ts
export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}
```

### The Tests

```typescript
// math.test.ts
import { multiply, divide } from './math';

describe('multiply', () => {
  test('multiplies two positive numbers', () => {
    expect(multiply(3, 4)).toBe(12);
  });

  test('multiplies by zero', () => {
    expect(multiply(5, 0)).toBe(0);
  });

  test('multiplies negative numbers', () => {
    expect(multiply(-2, 3)).toBe(-6);
  });
});

describe('divide', () => {
  test('divides two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  test('throws error when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
  });

  test('handles decimal results', () => {
    expect(divide(7, 2)).toBe(3.5);
  });
});
```

**Key points**:
- Test normal cases (positive numbers)
- Test edge cases (zero, negatives)
- Test error cases (division by zero)

## Example 2: String Functions

### The Function

```typescript
// string-utils.ts
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
```

### The Tests

```typescript
// string-utils.test.ts
import { capitalize, truncate } from './string-utils';

describe('capitalize', () => {
  test('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  test('handles already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  test('handles all uppercase', () => {
    expect(capitalize('HELLO')).toBe('Hello');
  });

  test('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });

  test('handles single character', () => {
    expect(capitalize('a')).toBe('A');
  });
});

describe('truncate', () => {
  test('truncates long strings', () => {
    expect(truncate('This is a long string', 10)).toBe('This is a ...');
  });

  test('does not truncate short strings', () => {
    expect(truncate('Short', 10)).toBe('Short');
  });

  test('handles exact length', () => {
    expect(truncate('Exactly ten', 11)).toBe('Exactly ten');
  });
});
```

**Key points**:
- Test various input cases
- Test edge cases (empty string, exact length)
- Test different string formats

## Example 3: Validation Functions

### The Function

```typescript
// validation.ts
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}
```

### The Tests

```typescript
// validation.test.ts
import { isValidEmail, isStrongPassword } from './validation';

describe('isValidEmail', () => {
  test('validates correct email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  test('rejects email without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  test('rejects email without domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  test('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isStrongPassword', () => {
  test('accepts strong password', () => {
    expect(isStrongPassword('StrongPass123')).toBe(true);
  });

  test('rejects short password', () => {
    expect(isStrongPassword('Short1')).toBe(false);
  });

  test('rejects password without uppercase', () => {
    expect(isStrongPassword('lowercase123')).toBe(false);
  });

  test('rejects password without lowercase', () => {
    expect(isStrongPassword('UPPERCASE123')).toBe(false);
  });

  test('rejects password without numbers', () => {
    expect(isStrongPassword('NoNumbers')).toBe(false);
  });
});
```

**Key points**:
- Test valid cases (should return true)
- Test invalid cases (should return false)
- Test each validation rule separately

## What to Test in Pure Functions

### 1. Normal Cases
Test the function with typical inputs:
```typescript
test('adds two numbers', () => {
  expect(add(2, 3)).toBe(5);
});
```

### 2. Edge Cases
Test boundary conditions:
```typescript
test('handles zero', () => {
  expect(add(5, 0)).toBe(5);
});

test('handles negative numbers', () => {
  expect(add(-2, -3)).toBe(-5);
});
```

### 3. Error Cases
Test what happens with invalid inputs:
```typescript
test('throws error for invalid input', () => {
  expect(() => divide(10, 0)).toThrow();
});
```

### 4. Empty/Null Cases
Test with empty or null values:
```typescript
test('handles empty string', () => {
  expect(formatName('')).toBe('');
});
```

## Testing Checklist for Pure Functions

When testing a pure function, ask:

- [ ] Does it work with normal inputs?
- [ ] Does it handle edge cases (zero, empty, null)?
- [ ] Does it handle invalid inputs correctly?
- [ ] Does it return the correct type?
- [ ] Are there any special cases to test?

## Common Patterns

### Pattern 1: Multiple Test Cases

```typescript
describe('function name', () => {
  test('case 1', () => {
    expect(function(input1)).toBe(output1);
  });

  test('case 2', () => {
    expect(function(input2)).toBe(output2);
  });
});
```

### Pattern 2: Testing Errors

```typescript
test('throws error for invalid input', () => {
  expect(() => function(invalidInput)).toThrow('Error message');
});
```

### Pattern 3: Testing Arrays/Objects

```typescript
test('returns correct array', () => {
  expect(function(input)).toEqual([1, 2, 3]);
});

test('returns correct object', () => {
  expect(function(input)).toEqual({ key: 'value' });
});
```

## Quick Summary

- **Pure functions**: Easiest to test - no setup needed
- **Pattern**: Call function → Check output
- **Test**: Normal cases, edge cases, error cases
- **Benefits**: Fast, simple, predictable

## Next Steps

Now let's see [practical examples](./examples/) of testing common utility functions.

