# Unit Testing Summary Notes

## Complete Reference Guide

This document summarizes everything you've learned about unit testing in TypeScript and React Native. Save this for quick reference.

---

## Table of Contents

1. [Fundamentals](#fundamentals)
2. [Tools & Setup](#tools--setup)
3. [Testing Patterns](#testing-patterns)
4. [Testing Utilities](#testing-utilities)
5. [Testing Components](#testing-components)
6. [Advanced Concepts](#advanced-concepts)
7. [Your Methodology](#your-methodology)
8. [Quick Reference](#quick-reference)

---

## Fundamentals

### What is Unit Testing?

- Testing individual pieces of code in isolation
- Automated verification that code works correctly
- Fast, repeatable, and reliable

### Why Test?

- **Early bug detection**: Catch issues before users do
- **Safe refactoring**: Change code with confidence
- **Documentation**: Tests show how code should work
- **Better design**: Forces you to write testable code
- **Confidence**: Deploy knowing code works

### Key Concepts

- **Test**: Single scenario verifying one behavior
- **Test Suite**: Group of related tests (`describe`)
- **Assertion**: Check if result matches expectation (`expect`)
- **Isolation**: Tests don't affect each other
- **Mock**: Fake version of dependency
- **Coverage**: How much code is tested

---

## Tools & Setup

### Tools

- **Jest**: Test runner and assertion library
- **React Native Testing Library**: Component testing utilities
- **TypeScript**: Type safety in tests

### Setup

```bash
npm install --save-dev jest @types/jest ts-jest @testing-library/react-native react-test-renderer
```

### Jest Configuration

```json
{
  "jest": {
    "preset": "react-native",
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "testMatch": ["**/__tests__/**/*.test.ts?(x)"]
  }
}
```

### Running Tests

```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage
npm test filename.test.ts   # Single file
```

---

## Testing Patterns

### AAA Pattern

Every test follows three steps:

1. **Arrange**: Set up test (data, mocks, environment)
2. **Act**: Execute the code being tested
3. **Assert**: Verify the result matches expectations

```typescript
test('adds two numbers', () => {
  // Arrange
  const a = 2;
  const b = 3;
  
  // Act
  const result = add(a, b);
  
  // Assert
  expect(result).toBe(5);
});
```

### Test Structure

```typescript
describe('functionName', () => {
  test('test case 1', () => { ... });
  test('test case 2', () => { ... });
});
```

### Naming Conventions

- ✅ **Good**: `'formats currency with dollar sign'`
- ❌ **Bad**: `'works'` or `'test 1'`

**Pattern**: Describe what is being tested and expected behavior

---

## Testing Utilities

### Pure Functions

Easiest to test - no setup needed:

```typescript
test('formats currency', () => {
  expect(formatCurrency(100)).toBe('$100.00');
});
```

### What to Test

- Normal cases (typical inputs)
- Edge cases (empty, null, zero, boundaries)
- Error cases (invalid inputs)

### Example

```typescript
describe('formatCurrency', () => {
  test('formats positive number', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });
  
  test('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
  
  test('handles negative number', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });
});
```

---

## Testing Components

### Basic Component Test

```typescript
import { render, fireEvent } from '@testing-library/react-native';

test('renders button with title', () => {
  const { getByText } = render(<Button title="Click" onPress={jest.fn()} />);
  expect(getByText('Click')).toBeTruthy();
});
```

### User Interactions

```typescript
test('calls onPress when button is pressed', () => {
  const onPress = jest.fn();
  const { getByText } = render(<Button onPress={onPress} title="Click" />);
  
  fireEvent.press(getByText('Click'));
  
  expect(onPress).toHaveBeenCalled();
});
```

### Queries

- `getByText('text')` - Must exist (throws if not)
- `queryByText('text')` - May not exist (returns null)
- `findByText('text')` - Async (waits for element)

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react-native';

test('increments count', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

---

## Advanced Concepts

### Mocking

Create fake versions of dependencies:

```typescript
jest.mock('./api');
const mockFetch = jest.fn().mockResolvedValue({ data: 'result' });
```

**Why**: Isolate code, make tests fast, test error cases easily

### Async Testing

```typescript
test('fetches data', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});

// For components
test('displays data after loading', async () => {
  const { findByText } = render(<AsyncComponent />);
  expect(await findByText('Loaded')).toBeTruthy();
});
```

### Snapshot Testing

```typescript
test('matches snapshot', () => {
  const tree = renderer.create(<Component />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

**Use sparingly**: For stable UI components, not frequently changing code

### Test Coverage

```bash
npm test -- --coverage
```

**Goal**: 80%+ coverage, but focus on important code, not 100%

---

## Your Methodology

### Testing Checklist

Before writing tests:
- [ ] Understand what the code does
- [ ] Identify what should be tested
- [ ] Determine test approach

When writing tests:
- [ ] Use AAA pattern
- [ ] Test normal, edge, and error cases
- [ ] Test behavior, not implementation
- [ ] Keep tests independent
- [ ] Use descriptive names

After writing tests:
- [ ] Run tests
- [ ] Check coverage
- [ ] Review test names

### Decision Tree

**What are you testing?**
- Function → Test inputs/outputs
- Component → Test rendering and interactions
- Hook → Test state with renderHook
- Async → Mock dependencies, use async/await

### Common Patterns

See `07-methodology/common-patterns.md` for reusable test templates.

---

## Quick Reference

### Jest Matchers

```typescript
expect(value).toBe(5);                    // Exact equality
expect(value).toEqual({ a: 1 });          // Deep equality
expect(value).toBeTruthy();               // Truthy
expect(value).toContain('text');          // Contains
expect(() => fn()).toThrow();             // Throws error
```

### React Native Testing Library

```typescript
// Render
const { getByText } = render(<Component />);

// Queries
getByText('text');
queryByText('text');
findByText('text');

// Interactions
fireEvent.press(element);
fireEvent.changeText(input, 'text');
```

### Mock Functions

```typescript
const mockFn = jest.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('value');
expect(mockFn).toHaveBeenCalled();
```

### File Organization

```
src/
├── utils/
│   ├── math.ts
│   └── math.test.ts        ← Test next to source
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx     ← Test next to source
```

---

## Best Practices

### Do

- ✅ Test behavior, not implementation
- ✅ Keep tests independent
- ✅ Use descriptive test names
- ✅ Test edge cases
- ✅ Mock external dependencies
- ✅ Follow AAA pattern
- ✅ Keep tests simple

### Don't

- ❌ Test implementation details
- ❌ Make tests depend on each other
- ❌ Use vague test names
- ❌ Test third-party code
- ❌ Make real network calls
- ❌ Over-complicate tests
- ❌ Skip edge cases

---

## What to Test

### Always Test

- Normal/typical cases
- Edge cases (empty, null, zero, boundaries)
- Error cases (invalid input, failures)
- Different states (loading, success, error)

### Don't Test

- Third-party libraries
- Implementation details
- Trivial getters/setters
- Framework features

---

## Common Mistakes

1. **Testing implementation**: Test what code does, not how
2. **Dependent tests**: Tests should work in any order
3. **Vague names**: Test names should be descriptive
4. **Missing edge cases**: Test boundaries and special values
5. **Not mocking**: Mock external dependencies
6. **Testing third-party code**: They have their own tests

---

## Learning Path Summary

1. **Fundamentals**: What, why, and key concepts
2. **Tools**: Jest, React Native Testing Library, setup
3. **Utilities**: Testing pure functions
4. **Patterns**: AAA pattern, structure, naming
5. **Components**: Rendering, interactions, hooks
6. **Advanced**: Mocking, async, snapshots, coverage
7. **Methodology**: Checklist, decision tree, patterns

---

## Resources

- **Jest Documentation**: https://jestjs.io/
- **React Native Testing Library**: https://callstack.github.io/react-native-testing-library/
- **This Guide**: See other files in `unit-testing/` folder

---

## Your Personal Testing Method

### Step-by-Step Process

1. **Understand**: What does this code do?
2. **Decide**: What should I test? (Use decision tree)
3. **Write**: Follow AAA pattern
4. **Test Cases**: Normal, edge, error
5. **Run**: Verify tests pass
6. **Review**: Check coverage, improve if needed

### Quick Decision Guide

| Code Type | What to Test | How to Test |
|-----------|-------------|-------------|
| Pure function | Inputs → Outputs | Call function, check result |
| Component | Rendering, interactions | Render, simulate actions |
| Hook | State management | renderHook, act |
| Async | Success, error, loading | Mock, async/await |

---

## Final Notes

- **Start simple**: Test normal cases first
- **Build up**: Add edge cases and error cases
- **Practice**: Write tests regularly
- **Review**: Learn from test failures
- **Improve**: Refactor tests as you learn

**Remember**: Good tests give you confidence to change code. They're an investment that pays off every day.

---

## Quick Commands

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Update snapshots
npm test -- -u
```

---

**Save this document** and refer to it whenever you need to write tests. The more you practice, the more natural testing becomes!

