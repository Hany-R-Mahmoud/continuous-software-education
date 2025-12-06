# Testing Utility Functions

## What are Utility Functions?

**Utility functions** are helper functions that perform common tasks:
- String manipulation
- Date formatting
- Data transformation
- Validation
- Calculations

**Characteristics**:
- Usually pure functions (same input = same output)
- Reusable across your app
- Small, focused on one task
- Perfect for unit testing

## Common Utility Categories

### 1. String Utilities
Functions that work with strings:
- Formatting, parsing, validation
- Examples: `capitalize()`, `truncate()`, `slugify()`

### 2. Date Utilities
Functions that work with dates:
- Formatting, parsing, calculations
- Examples: `formatDate()`, `getDaysBetween()`, `isToday()`

### 3. Number Utilities
Functions that work with numbers:
- Formatting, calculations, validation
- Examples: `formatCurrency()`, `round()`, `clamp()`

### 4. Validation Utilities
Functions that validate data:
- Email, phone, password validation
- Examples: `isValidEmail()`, `isValidPhone()`, `isStrongPassword()`

### 5. Array/Object Utilities
Functions that transform data:
- Filtering, mapping, sorting
- Examples: `groupBy()`, `unique()`, `sortBy()`

## Testing Strategy

### 1. Test Each Function Independently

Each utility function should have its own test suite:

```typescript
describe('formatCurrency', () => {
  // Tests for formatCurrency
});

describe('formatDate', () => {
  // Tests for formatDate
});
```

### 2. Test Multiple Scenarios

For each function, test:
- Normal cases
- Edge cases
- Error cases

### 3. Use Descriptive Test Names

```typescript
// Good: Clear what's being tested
test('formats 100 as $100.00', () => { ... });
test('handles zero correctly', () => { ... });

// Bad: Vague
test('works', () => { ... });
test('test 1', () => { ... });
```

## Example: Complete Utility Module

### The Utilities

```typescript
// utils/string-utils.ts
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
```

### The Tests

```typescript
// utils/string-utils.test.ts
import { capitalize, slugify, truncate } from './string-utils';

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

  test('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });

  test('handles single character', () => {
    expect(capitalize('a')).toBe('A');
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

  test('handles already slugified string', () => {
    expect(slugify('hello-world')).toBe('hello-world');
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
});
```

## Testing Patterns for Utilities

### Pattern 1: Test Normal Operation

```typescript
test('performs expected operation', () => {
  const result = utility(input);
  expect(result).toBe(expectedOutput);
});
```

### Pattern 2: Test Edge Cases

```typescript
test('handles empty input', () => {
  expect(utility('')).toBe('');
});

test('handles null/undefined', () => {
  expect(utility(null)).toBe(defaultValue);
});
```

### Pattern 3: Test Error Cases

```typescript
test('throws error for invalid input', () => {
  expect(() => utility(invalidInput)).toThrow();
});
```

### Pattern 4: Test Multiple Inputs

```typescript
test.each([
  ['input1', 'output1'],
  ['input2', 'output2'],
  ['input3', 'output3'],
])('handles %s correctly', (input, expected) => {
  expect(utility(input)).toBe(expected);
});
```

## Organizing Utility Tests

### Option 1: One Test File Per Utility File

```
utils/
├── string-utils.ts
├── string-utils.test.ts
├── date-utils.ts
└── date-utils.test.ts
```

### Option 2: Grouped Test Files

```
utils/
├── string-utils.ts
├── date-utils.ts
└── __tests__/
    ├── string-utils.test.ts
    └── date-utils.test.ts
```

**Recommendation**: Option 1 (test file next to source file) - easier to find and maintain.

## Common Utility Testing Scenarios

### Scenario 1: Formatting Functions

```typescript
// Format currency
test('formats positive number as currency', () => {
  expect(formatCurrency(100)).toBe('$100.00');
});

test('formats zero as currency', () => {
  expect(formatCurrency(0)).toBe('$0.00');
});

test('formats negative number as currency', () => {
  expect(formatCurrency(-50)).toBe('-$50.00');
});
```

### Scenario 2: Validation Functions

```typescript
// Validate email
test('accepts valid email', () => {
  expect(isValidEmail('user@example.com')).toBe(true);
});

test('rejects invalid email', () => {
  expect(isValidEmail('not-an-email')).toBe(false);
});
```

### Scenario 3: Transformation Functions

```typescript
// Transform data
test('transforms array correctly', () => {
  expect(transformArray([1, 2, 3])).toEqual([2, 4, 6]);
});

test('handles empty array', () => {
  expect(transformArray([])).toEqual([]);
});
```

## Quick Reference: What to Test

| Function Type | What to Test |
|--------------|--------------|
| **Formatting** | Normal values, edge cases (zero, negative), formatting rules |
| **Validation** | Valid inputs (true), invalid inputs (false), edge cases |
| **Transformation** | Normal transformation, empty/null inputs, edge cases |
| **Calculation** | Normal math, edge cases (zero, negative), error cases |
| **String manipulation** | Normal strings, empty strings, special characters |

## Key Takeaways

- **Utility functions**: Small, focused, reusable functions
- **Testing strategy**: Test each function independently with multiple scenarios
- **Test cases**: Normal, edge, and error cases
- **Organization**: Keep test files next to source files
- **Pattern**: Use consistent testing patterns for similar functions

## Next Steps

See [practical examples](./examples/) of testing common utility functions.

