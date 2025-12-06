# Jest Overview

## What is Jest?

**Jest** is a JavaScript testing framework created by Facebook. It's the most popular testing framework for React and React Native projects.

**Think of Jest as**: Your testing assistant that:
- Finds your test files
- Runs your tests
- Tells you which tests pass or fail
- Provides tools to write tests (assertions, mocks, etc.)

## Why Jest?

### Built for JavaScript/TypeScript
- Works seamlessly with TypeScript
- No extra configuration needed for most projects
- Understands modern JavaScript features

### Everything Included
- **Test Runner**: Executes your tests
- **Assertion Library**: Tools to check results (`expect`, `toBe`, etc.)
- **Mocking**: Built-in ability to create fake dependencies
- **Code Coverage**: See how much of your code is tested

### Great Developer Experience
- Fast execution
- Clear error messages
- Watch mode (automatically reruns tests when files change)
- Snapshot testing

## Key Features

### 1. Test Runner

Jest automatically:
- Finds files ending in `.test.ts`, `.test.tsx`, `.spec.ts`, etc.
- Runs them in parallel (faster)
- Reports results clearly

```bash
npm test
# Jest finds all test files and runs them
```

### 2. Assertions

Jest provides `expect()` for checking results:

```typescript
expect(2 + 2).toBe(4);
expect('hello').toContain('ell');
expect([1, 2, 3]).toHaveLength(3);
```

**We'll learn more about assertions later** - Jest has many built-in matchers.

### 3. Mocking

Jest can create fake versions of functions, modules, and dependencies:

```typescript
// Create a fake function
const mockFn = jest.fn();

// Use it in your tests
mockFn('test');
expect(mockFn).toHaveBeenCalledWith('test');
```

**Why mocking matters**: Test your code in isolation without real API calls, databases, etc.

### 4. Snapshot Testing

Jest can save "snapshots" of your component output and detect changes:

```typescript
expect(component).toMatchSnapshot();
```

**Use case**: Detect unexpected UI changes.

### 5. Code Coverage

Jest can show you how much of your code is tested:

```bash
npm test -- --coverage
```

**Output**: Shows percentage of code covered by tests.

## Jest API Basics

### `describe()` - Group Tests

Groups related tests together:

```typescript
describe('Calculator', () => {
  // All calculator tests go here
});
```

**Why use it**: Organizes tests, makes output clearer.

### `test()` or `it()` - Individual Test

Defines a single test:

```typescript
test('adds two numbers', () => {
  expect(add(2, 3)).toBe(5);
});

// 'it' is an alias - same thing
it('adds two numbers', () => {
  expect(add(2, 3)).toBe(5);
});
```

**Both work the same** - use whichever you prefer.

### `expect()` - Assertions

Checks if something matches your expectation:

```typescript
expect(actualValue).toBe(expectedValue);
```

**This is how you verify your code works correctly.**

### `beforeEach()` / `afterEach()` - Setup/Cleanup

Runs code before/after each test:

```typescript
beforeEach(() => {
  // Setup code - runs before each test
});

afterEach(() => {
  // Cleanup code - runs after each test
});
```

**Use case**: Prepare test data, clean up after tests.

## Common Jest Matchers

Matchers are functions that check if values match expectations:

| Matcher | What It Does | Example |
|---------|-------------|---------|
| `toBe()` | Exact equality (===) | `expect(2).toBe(2)` |
| `toEqual()` | Deep equality (objects/arrays) | `expect({a: 1}).toEqual({a: 1})` |
| `toBeTruthy()` | Checks if value is truthy | `expect(1).toBeTruthy()` |
| `toBeFalsy()` | Checks if value is falsy | `expect(0).toBeFalsy()` |
| `toContain()` | Array/string contains value | `expect([1,2]).toContain(1)` |
| `toHaveLength()` | Checks array/string length | `expect('hi').toHaveLength(2)` |
| `toThrow()` | Function throws error | `expect(() => throw Error()).toThrow()` |
| `toBeDefined()` | Value is not undefined | `expect(x).toBeDefined()` |
| `toBeNull()` | Value is null | `expect(null).toBeNull()` |
| `toBeUndefined()` | Value is undefined | `expect(undefined).toBeUndefined()` |

**Don't memorize all of them now** - you'll learn them as you use them.

## Jest Configuration

Jest can be configured in `package.json` or a separate `jest.config.js` file:

```json
// package.json
{
  "jest": {
    "preset": "react-native",
    "testMatch": ["**/__tests__/**/*.test.ts?(x)"],
    "moduleFileExtensions": ["ts", "tsx", "js", "jsx"]
  }
}
```

**For React Native**: Use `"preset": "react-native"` - it handles most configuration automatically.

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```
**Watch mode**: Automatically reruns tests when files change. Great for development!

### Run Specific Test File
```bash
npm test -- utils.test.ts
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## Jest Output Example

When you run tests, Jest shows:

```
PASS  src/utils.test.ts
  Calculator
    ✓ adds two numbers (2ms)
    ✓ subtracts two numbers (1ms)
    ✓ multiplies two numbers (1ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Time:        0.5s
```

**Green checkmarks** = Tests passed ✅
**Red X's** = Tests failed ❌

## Quick Summary

- **Jest**: Testing framework that runs your tests
- **Features**: Test runner, assertions, mocking, coverage
- **API**: `describe()`, `test()`, `expect()`, `beforeEach()`
- **Matchers**: `toBe()`, `toEqual()`, `toContain()`, etc.
- **Configuration**: Usually just `"preset": "react-native"` for React Native

## Next Steps

Now that you understand Jest, let's learn about [React Native Testing Library](./react-native-testing-library.md) - the tool for testing React Native components.

