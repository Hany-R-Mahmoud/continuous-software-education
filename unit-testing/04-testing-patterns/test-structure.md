# Test Structure and Organization

## How to Organize Your Tests

Good test organization makes tests:
- Easy to find
- Easy to understand
- Easy to maintain

## Basic Test Structure

### Single Test

```typescript
test('description of what is tested', () => {
  // Test code here
});
```

### Test Suite (Group of Tests)

```typescript
describe('function or component name', () => {
  test('test case 1', () => {
    // Test code
  });

  test('test case 2', () => {
    // Test code
  });
});
```

**Why use `describe`**: Groups related tests together, makes output clearer.

## File Organization

### Option 1: Test File Next to Source (Recommended)

```
src/
├── utils/
│   ├── math.ts
│   └── math.test.ts        ← Test next to source
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx    ← Test next to source
```

**Benefits**:
- Easy to find tests
- Clear relationship between code and tests
- Easy to maintain

### Option 2: Separate Test Directory

```
src/
├── utils/
│   └── math.ts
└── __tests__/
    └── math.test.ts        ← Tests in separate folder
```

**Benefits**:
- All tests in one place
- Source files stay clean

**Recommendation**: Use Option 1 (test next to source) - it's more common and easier to maintain.

## Test File Naming

### Common Patterns

- `filename.test.ts` or `filename.test.tsx` (Most common)
- `filename.spec.ts` or `filename.spec.tsx`
- `__tests__/filename.test.ts` (If using separate folder)

**Example**:
- Source: `Button.tsx`
- Test: `Button.test.tsx`

**Recommendation**: Use `.test.ts` or `.test.tsx` - it's the most widely recognized pattern.

## Organizing Tests Within a File

### Structure Template

```typescript
// Imports at the top
import { functionToTest } from './file';

// Main describe block for the function/component
describe('functionName', () => {
  // Group related tests
  describe('normal cases', () => {
    test('case 1', () => { ... });
    test('case 2', () => { ... });
  });

  describe('edge cases', () => {
    test('case 1', () => { ... });
    test('case 2', () => { ... });
  });

  describe('error cases', () => {
    test('case 1', () => { ... });
  });
});
```

### Example: Well-Organized Test File

```typescript
import { formatCurrency, parseCurrency } from './currency-utils';

describe('formatCurrency', () => {
  describe('normal cases', () => {
    test('formats positive number', () => {
      expect(formatCurrency(100)).toBe('$100.00');
    });

    test('formats decimal number', () => {
      expect(formatCurrency(99.99)).toBe('$99.99');
    });
  });

  describe('edge cases', () => {
    test('handles zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    test('handles negative number', () => {
      expect(formatCurrency(-50)).toBe('-$50.00');
    });
  });

  describe('error cases', () => {
    test('handles invalid input', () => {
      expect(() => formatCurrency(NaN)).toThrow();
    });
  });
});

describe('parseCurrency', () => {
  // Tests for parseCurrency...
});
```

## Nested Describe Blocks

Use nested `describe` blocks to group related tests:

```typescript
describe('Calculator', () => {
  describe('add function', () => {
    test('adds positive numbers', () => { ... });
    test('adds negative numbers', () => { ... });
  });

  describe('subtract function', () => {
    test('subtracts numbers', () => { ... });
  });
});
```

**Output**:
```
Calculator
  add function
    ✓ adds positive numbers
    ✓ adds negative numbers
  subtract function
    ✓ subtracts numbers
```

**When to use nested describes**:
- Grouping related functionality
- Testing different scenarios of the same feature
- Making test output clearer

## Setup and Teardown

### beforeEach - Runs Before Each Test

```typescript
describe('MyComponent', () => {
  beforeEach(() => {
    // Setup code - runs before each test
    // Example: Reset mocks, create test data
  });

  test('test 1', () => {
    // Uses setup from beforeEach
  });

  test('test 2', () => {
    // Uses fresh setup from beforeEach
  });
});
```

**Use case**: Prepare test data, reset mocks, set up environment.

### afterEach - Runs After Each Test

```typescript
describe('MyComponent', () => {
  afterEach(() => {
    // Cleanup code - runs after each test
    // Example: Clear mocks, reset state
  });

  test('test 1', () => { ... });
});
```

**Use case**: Clean up after tests, reset global state.

### beforeAll / afterAll - Run Once

```typescript
describe('Database tests', () => {
  beforeAll(() => {
    // Runs once before all tests
    // Example: Connect to database
  });

  afterAll(() => {
    // Runs once after all tests
    // Example: Close database connection
  });
});
```

**Use case**: Expensive setup/teardown that only needs to happen once.

## Example: Complete Test File Structure

```typescript
// ========== IMPORTS ==========
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

// ========== SETUP ==========
// Global setup if needed
beforeEach(() => {
  // Reset mocks, etc.
});

// ========== TESTS ==========
describe('Button component', () => {
  describe('rendering', () => {
    test('renders title correctly', () => {
      // Test code
    });

    test('renders with custom style', () => {
      // Test code
    });
  });

  describe('user interactions', () => {
    test('calls onPress when pressed', () => {
      // Test code
    });

    test('does not call onPress when disabled', () => {
      // Test code
    });
  });

  describe('edge cases', () => {
    test('handles missing onPress', () => {
      // Test code
    });
  });
});
```

## Best Practices

### 1. One Describe Per Function/Component

```typescript
// Good: One describe per function
describe('formatCurrency', () => {
  // All formatCurrency tests
});

describe('parseCurrency', () => {
  // All parseCurrency tests
});
```

### 2. Group Related Tests

```typescript
describe('Button', () => {
  describe('rendering', () => {
    // All rendering tests
  });

  describe('interactions', () => {
    // All interaction tests
  });
});
```

### 3. Keep Tests Independent

Each test should work on its own:

```typescript
// ❌ Bad: Tests depend on each other
let counter = 0;
test('increments counter', () => {
  counter++;
  expect(counter).toBe(1);
});

test('counter is 2', () => {
  expect(counter).toBe(2); // Depends on previous test!
});

// ✅ Good: Tests are independent
test('increments counter', () => {
  let counter = 0;
  counter++;
  expect(counter).toBe(1);
});

test('counter increments correctly', () => {
  let counter = 0;
  counter++;
  expect(counter).toBe(1);
});
```

### 4. Use Descriptive Test Names

```typescript
// ❌ Bad: Vague
test('works', () => { ... });
test('test 1', () => { ... });

// ✅ Good: Descriptive
test('formats currency with dollar sign', () => { ... });
test('handles zero amount correctly', () => { ... });
```

## Quick Reference

**File Organization**:
- Test file: `filename.test.ts` or `filename.test.tsx`
- Location: Next to source file (recommended)

**Test Structure**:
- `describe()`: Group related tests
- `test()` or `it()`: Individual test
- `beforeEach()`: Setup before each test
- `afterEach()`: Cleanup after each test

**Organization**:
- One describe per function/component
- Group related tests with nested describes
- Keep tests independent

## Next Steps

Now let's learn about [naming conventions](./naming-conventions.md) for tests.

