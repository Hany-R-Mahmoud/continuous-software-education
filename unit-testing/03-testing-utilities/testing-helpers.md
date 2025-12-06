# Testing Helper Functions

## What are Helper Functions?

**Helper functions** are utility functions that assist with specific tasks in your application. They're similar to utility functions but often more domain-specific.

**Examples**:
- Formatting user data for display
- Parsing API responses
- Calculating business logic
- Transforming data structures

## Difference: Utilities vs Helpers

**Utilities**: Generic, reusable across projects
- Examples: `capitalize()`, `formatDate()`, `isValidEmail()`

**Helpers**: Specific to your application
- Examples: `formatUserDisplayName()`, `parseApiResponse()`, `calculateOrderTotal()`

**Both are tested the same way!**

## Testing Approach

### 1. Test the Function's Purpose

Understand what the helper does, then test that behavior:

```typescript
// Helper: Formats user's full name for display
function formatUserDisplayName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

// Test: Does it format the name correctly?
test('formats user full name', () => {
  const user = { firstName: 'John', lastName: 'Doe' };
  expect(formatUserDisplayName(user)).toBe('John Doe');
});
```

### 2. Test Edge Cases

Helpers often need to handle edge cases:

```typescript
test('handles missing last name', () => {
  const user = { firstName: 'Madonna', lastName: '' };
  expect(formatUserDisplayName(user)).toBe('Madonna');
});
```

### 3. Test Business Logic

If the helper contains business rules, test them:

```typescript
// Helper: Calculates discount based on user tier
function calculateDiscount(price: number, userTier: 'bronze' | 'silver' | 'gold'): number {
  const discounts = { bronze: 0, silver: 0.1, gold: 0.2 };
  return price * discounts[userTier];
}

// Test business logic
test('applies correct discount for gold tier', () => {
  expect(calculateDiscount(100, 'gold')).toBe(20);
});

test('no discount for bronze tier', () => {
  expect(calculateDiscount(100, 'bronze')).toBe(0);
});
```

## Example: Complete Helper Module

### The Helpers

```typescript
// helpers/user-helpers.ts
interface User {
  firstName: string;
  lastName: string;
  email: string;
}

export function formatUserDisplayName(user: User): string {
  if (!user.firstName && !user.lastName) {
    return user.email;
  }
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getUserInitials(user: User): string {
  const first = user.firstName?.[0] || '';
  const last = user.lastName?.[0] || '';
  return (first + last).toUpperCase() || user.email[0].toUpperCase();
}

export function isUserActive(user: User & { lastActiveAt?: Date }): boolean {
  if (!user.lastActiveAt) return false;
  const daysSinceActive = (Date.now() - user.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceActive < 30;
}
```

### The Tests

```typescript
// helpers/user-helpers.test.ts
import { formatUserDisplayName, getUserInitials, isUserActive } from './user-helpers';

describe('formatUserDisplayName', () => {
  test('formats full name', () => {
    const user = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
    expect(formatUserDisplayName(user)).toBe('John Doe');
  });

  test('handles missing last name', () => {
    const user = { firstName: 'Madonna', lastName: '', email: 'madonna@example.com' };
    expect(formatUserDisplayName(user)).toBe('Madonna');
  });

  test('uses email when no name provided', () => {
    const user = { firstName: '', lastName: '', email: 'user@example.com' };
    expect(formatUserDisplayName(user)).toBe('user@example.com');
  });
});

describe('getUserInitials', () => {
  test('returns initials from name', () => {
    const user = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
    expect(getUserInitials(user)).toBe('JD');
  });

  test('handles single name', () => {
    const user = { firstName: 'Madonna', lastName: '', email: 'madonna@example.com' };
    expect(getUserInitials(user)).toBe('M');
  });

  test('uses email initial when no name', () => {
    const user = { firstName: '', lastName: '', email: 'user@example.com' };
    expect(getUserInitials(user)).toBe('U');
  });
});

describe('isUserActive', () => {
  test('returns true for recently active user', () => {
    const user = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      lastActiveAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    };
    expect(isUserActive(user)).toBe(true);
  });

  test('returns false for inactive user', () => {
    const user = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      lastActiveAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    };
    expect(isUserActive(user)).toBe(false);
  });

  test('returns false when lastActiveAt is missing', () => {
    const user = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };
    expect(isUserActive(user)).toBe(false);
  });
});
```

## Testing Patterns for Helpers

### Pattern 1: Test Main Functionality

```typescript
test('performs main task correctly', () => {
  const result = helper(input);
  expect(result).toBe(expectedOutput);
});
```

### Pattern 2: Test Conditional Logic

```typescript
test('handles condition A', () => {
  expect(helper(inputA)).toBe(outputA);
});

test('handles condition B', () => {
  expect(helper(inputB)).toBe(outputB);
});
```

### Pattern 3: Test Data Transformation

```typescript
test('transforms data correctly', () => {
  const input = { a: 1, b: 2 };
  const output = transformHelper(input);
  expect(output).toEqual({ transformed: { a: 1, b: 2 } });
});
```

### Pattern 4: Test with Realistic Data

```typescript
test('works with realistic user data', () => {
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  };
  expect(formatUser(user)).toBe('John Doe (john.doe@example.com)');
});
```

## Common Helper Testing Scenarios

### Scenario 1: Data Formatting Helpers

```typescript
// Format data for display
test('formats data correctly', () => {
  const data = { amount: 100, currency: 'USD' };
  expect(formatDisplay(data)).toBe('$100.00');
});
```

### Scenario 2: Data Parsing Helpers

```typescript
// Parse API response
test('parses API response correctly', () => {
  const apiResponse = { data: { users: [...] } };
  expect(parseApiResponse(apiResponse)).toEqual([...]);
});
```

### Scenario 3: Calculation Helpers

```typescript
// Calculate business logic
test('calculates total correctly', () => {
  const items = [{ price: 10, quantity: 2 }, { price: 5, quantity: 3 }];
  expect(calculateTotal(items)).toBe(35);
});
```

## Tips for Testing Helpers

### 1. Use Realistic Test Data

```typescript
// Good: Realistic data
const user = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };

// Less helpful: Unrealistic data
const user = { firstName: 'a', lastName: 'b', email: 'c' };
```

### 2. Test the "Why", Not Just the "What"

```typescript
// Good: Tests the purpose
test('formats name for display in user profile', () => {
  // ...
});

// Less helpful: Just describes the code
test('concatenates firstName and lastName', () => {
  // ...
});
```

### 3. Group Related Tests

```typescript
describe('formatUserDisplayName', () => {
  // All tests for this helper together
});

describe('getUserInitials', () => {
  // All tests for this helper together
});
```

## Quick Summary

- **Helper functions**: Application-specific utility functions
- **Testing approach**: Test purpose, edge cases, business logic
- **Patterns**: Main functionality, conditional logic, data transformation
- **Tips**: Use realistic data, test the "why", group related tests

## Next Steps

See [practical examples](./examples/) of testing utility and helper functions.

