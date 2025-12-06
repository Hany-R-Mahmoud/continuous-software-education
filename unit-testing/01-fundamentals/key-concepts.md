# Key Concepts in Unit Testing

## Essential Terminology

Before diving into writing tests, let's understand the fundamental concepts you'll use every day.

## 1. Test

A **test** is a single scenario that verifies one specific behavior of your code.

```typescript
// This is ONE test
test("adds two numbers correctly", () => {
  expect(add(2, 3)).toBe(5);
});
```

**Think of it as**: A single question you're asking: "Does this code do what I expect?"

## 2. Test Suite

A **test suite** is a collection of related tests, usually grouped together.

```typescript
// This is a test suite for the "add" function
describe("add function", () => {
  test("adds two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  test("adds negative numbers", () => {
    expect(add(-2, -3)).toBe(-5);
  });

  test("adds zero", () => {
    expect(add(5, 0)).toBe(5);
  });
});
```

**Think of it as**: A folder containing related tests about the same topic.

## 3. Assertion

An **assertion** is a statement that checks if something is true.

```typescript
expect(add(2, 3)).toBe(5);
//     ^^^^^^^^^^  ^^^^  ^^
//     actual      matcher expected
```

**Breaking it down**:

- `expect(...)`: What you're checking
- `.toBe(...)`: How you're checking it (the matcher)
- `5`: What you expect the result to be

**Common assertions**:

```typescript
expect(result).toBe(5); // Exact equality
expect(result).toEqual({ a: 1 }); // Deep equality for objects
expect(result).toBeTruthy(); // Is truthy
expect(result).toBeFalsy(); // Is falsy
expect(result).toContain("text"); // Contains value
expect(result).toBeDefined(); // Is not undefined
```

**Think of it as**: The "check" step - verifying the result matches expectations.

## 4. Isolation

**Isolation** means each test runs independently and doesn't affect other tests.

```typescript
// Test 1
test("test A", () => {
  // This test doesn't know about test B
});

// Test 2
test("test B", () => {
  // This test doesn't know about test A
  // Both can run in any order
});
```

**Why it matters**: Tests should be able to run in any order without affecting each other.

**Think of it as**: Each test is in its own bubble.

## 5. Mock

A **mock** is a fake version of something your code depends on.

```typescript
// Real API call (slow, requires network)
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Mock version (fast, no network needed)
jest.mock("./api");
const mockFetchUser = jest.fn(() => Promise.resolve({ name: "John" }));

// Now you can test without making real API calls
test("handles user data", async () => {
  const user = await mockFetchUser("123");
  expect(user.name).toBe("John");
});
```

**Why use mocks**:

- Speed up tests (no network calls)
- Make tests reliable (no external dependencies)
- Test error cases easily

**Think of it as**: A stunt double for your dependencies.

## 6. Test Coverage

**Test coverage** measures how much of your code is tested.

```
Coverage: 80%
- 80% of your code has tests
- 20% of your code is not tested
```

**Important**: 100% coverage doesn't mean perfect tests. Focus on testing important behavior.

**Think of it as**: A percentage showing how much of your code is verified.

## 7. Test Runner

A **test runner** is the tool that executes your tests.

**Jest** is the test runner we'll use:

- Finds test files
- Runs tests
- Reports results
- Provides assertions and mocking

```bash
npm test
# Jest finds all .test.ts files
# Runs them
# Shows you results
```

**Think of it as**: The engine that runs your tests.

## 8. Matcher

A **matcher** is a function that checks if a value matches your expectation.

```typescript
expect(value).toBe(5); // toBe is a matcher
expect(value).toEqual({}); // toEqual is a matcher
expect(value).toBeTruthy(); // toBeTruthy is a matcher
```

**Common matchers**:

- `toBe()`: Exact equality (===)
- `toEqual()`: Deep equality for objects/arrays
- `toBeTruthy()`: Checks if value is truthy
- `toBeFalsy()`: Checks if value is falsy
- `toContain()`: Checks if array/string contains value
- `toThrow()`: Checks if function throws error

**Think of it as**: Different ways to check if something matches.

## 9. Setup and Teardown

**Setup**: Code that runs before tests (preparing the environment)
**Teardown**: Code that runs after tests (cleaning up)

```typescript
// Setup: Runs before each test
beforeEach(() => {
  // Prepare test data
});

// Teardown: Runs after each test
afterEach(() => {
  // Clean up
});

test("test 1", () => {
  // Uses prepared data
});
```

**Why it matters**: Ensures each test starts with a clean state.

**Think of it as**: Setting the table before dinner, cleaning up after.

## 10. Test Case

A **test case** is a specific scenario you're testing.

```typescript
// Test case: "What happens when user passes two positive numbers?"
test("adds two positive numbers", () => {
  expect(add(2, 3)).toBe(5);
});

// Test case: "What happens when user passes zero?"
test("adds zero correctly", () => {
  expect(add(5, 0)).toBe(5);
});

// Test case: "What happens when user passes negative numbers?"
test("adds negative numbers", () => {
  expect(add(-2, -3)).toBe(-5);
});
```

**Think of it as**: Different scenarios to verify your code handles correctly.

## What to Test vs. What NOT to Test

### ✅ DO Test

1. **Business Logic**: The core functionality of your code

   ```typescript
   // Test this
   function calculateDiscount(price: number, percent: number): number {
     return price * (percent / 100);
   }
   ```

2. **Edge Cases**: Boundary conditions and unusual inputs

   ```typescript
   // Test these
   - Empty strings
   - Zero values
   - Negative numbers
   - Very large numbers
   - Null/undefined
   ```

3. **Error Handling**: How your code handles errors

   ```typescript
   // Test this
   function divide(a: number, b: number): number {
     if (b === 0) throw new Error("Cannot divide by zero");
     return a / b;
   }
   ```

4. **User Interactions**: What users can do with your components
   ```typescript
   // Test this
   - Button presses
   - Form submissions
   - Input changes
   ```

### ❌ DON'T Test

1. **Third-Party Code**: Don't test libraries you didn't write

   ```typescript
   // Don't test React, React Native, or other libraries
   // They have their own tests
   ```

2. **Implementation Details**: Don't test HOW code works, test WHAT it does

   ```typescript
   // Don't test internal variables or private methods
   // Test the public behavior instead
   ```

3. **Framework Features**: Don't test React Native itself

   ```typescript
   // Don't test if TouchableOpacity works
   // Test if YOUR component responds to presses
   ```

4. **Trivial Code**: Don't test simple getters/setters
   ```typescript
   // Probably don't need a test for this
   function getName(): string {
     return this.name;
   }
   ```

## Mental Model: The Testing Checklist

When writing a test, ask yourself:

1. **What** am I testing? (The function/component)
2. **What scenario** am I testing? (The specific case)
3. **What should happen**? (The expected result)
4. **How do I verify** it? (The assertion)

```typescript
// 1. What: formatCurrency function
// 2. Scenario: User passes 100
// 3. Expected: "$100.00"
// 4. Verify: expect(result).toBe('$100.00')

test("formats 100 as $100.00", () => {
  const result = formatCurrency(100);
  expect(result).toBe("$100.00");
});
```

## Quick Reference: Concept Cheat Sheet

| Concept            | What It Is                          | Example                         |
| ------------------ | ----------------------------------- | ------------------------------- |
| **Test**           | Single scenario verification        | `test('adds numbers', ...)`     |
| **Test Suite**     | Group of related tests              | `describe('add function', ...)` |
| **Assertion**      | Check if result matches expectation | `expect(result).toBe(5)`        |
| **Isolation**      | Tests don't affect each other       | Each test is independent        |
| **Mock**           | Fake version of dependency          | `jest.fn()`                     |
| **Coverage**       | How much code is tested             | 80% coverage                    |
| **Test Runner**    | Tool that runs tests                | Jest                            |
| **Matcher**        | Function that checks values         | `.toBe()`, `.toEqual()`         |
| **Setup/Teardown** | Prepare/clean up for tests          | `beforeEach()`, `afterEach()`   |
| **Test Case**      | Specific scenario to test           | "What if user passes zero?"     |

## Key Takeaways

1. **Test**: One scenario checking one behavior
2. **Assertion**: The check that verifies the result
3. **Isolation**: Tests should be independent
4. **Mock**: Fake dependencies for faster, reliable tests
5. **Focus**: Test behavior, not implementation

## Next Steps

You now understand the fundamentals! Ready to set up your testing environment? Let's move to [Step 2: Tools & Setup](../02-testing-tools/setup-guide.md).
