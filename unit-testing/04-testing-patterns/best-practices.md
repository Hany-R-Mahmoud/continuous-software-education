# Best Practices for Unit Testing

## Core Principles

These best practices will help you write better, more maintainable tests.

## 1. Test Behavior, Not Implementation

### ❌ Don't Test Implementation Details

```typescript
// Bad: Testing internal state
test('component has loading state', () => {
  const component = render(<MyComponent />);
  expect(component.instance().state.isLoading).toBe(true);
});
```

### ✅ Test User-Visible Behavior

```typescript
// Good: Testing what user sees
test('shows loading spinner when data is fetching', () => {
  const { getByTestId } = render(<MyComponent isLoading />);
  expect(getByTestId('loading-spinner')).toBeTruthy();
});
```

**Why**: Implementation can change, but behavior should stay the same.

## 2. Keep Tests Independent

### ❌ Don't Make Tests Depend on Each Other

```typescript
let counter = 0;

test('increments counter', () => {
  counter++;
  expect(counter).toBe(1);
});

test('counter is 2', () => {
  expect(counter).toBe(2); // Depends on previous test!
});
```

### ✅ Each Test Should Work Alone

```typescript
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

**Why**: Tests should run in any order and not affect each other.

## 3. One Assertion Per Test (When Possible)

### ❌ Don't Test Multiple Unrelated Things

```typescript
// Bad: Testing multiple things
test('user data', () => {
  expect(formatName(user)).toBe('John Doe');
  expect(formatEmail(user)).toBe('john@example.com');
  expect(formatPhone(user)).toBe('123-456-7890');
});
```

### ✅ Test One Thing Per Test

```typescript
// Good: One thing per test
test('formats user name correctly', () => {
  expect(formatName(user)).toBe('John Doe');
});

test('formats user email correctly', () => {
  expect(formatEmail(user)).toBe('john@example.com');
});

test('formats user phone correctly', () => {
  expect(formatPhone(user)).toBe('123-456-7890');
});
```

**Exception**: Multiple assertions are OK if checking the same result:

```typescript
// OK: All checking the same formatted user object
test('formats user data correctly', () => {
  const formatted = formatUser(user);
  expect(formatted.name).toBe('John Doe');
  expect(formatted.email).toBe('john@example.com');
  expect(formatted.phone).toBe('123-456-7890');
});
```

**Why**: Easier to identify what failed, clearer test purpose.

## 4. Use Descriptive Test Names

### ❌ Don't Use Vague Names

```typescript
test('works', () => { ... });
test('test 1', () => { ... });
test('function', () => { ... });
```

### ✅ Use Clear, Descriptive Names

```typescript
test('formats currency with dollar sign', () => { ... });
test('returns error when email is invalid', () => { ... });
test('displays loading spinner when isLoading is true', () => { ... });
```

**Why**: Test names serve as documentation.

## 5. Keep Tests Simple

### ❌ Don't Over-Complicate Tests

```typescript
// Bad: Too complex
test('processes data', () => {
  const data = fetchData();
  const processed = processData(data);
  const formatted = formatData(processed);
  const validated = validateData(formatted);
  const result = finalizeData(validated);
  expect(result).toBe(expected);
});
```

### ✅ Keep Tests Focused

```typescript
// Good: Simple and focused
test('formats processed data correctly', () => {
  const processed = { value: 100 };
  const result = formatData(processed);
  expect(result).toBe('$100.00');
});
```

**Why**: Simple tests are easier to understand and maintain.

## 6. Test Edge Cases

### ✅ Test Boundary Conditions

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

  test('handles very large number', () => {
    expect(formatCurrency(999999999)).toBe('$999,999,999.00');
  });
});
```

**Why**: Edge cases are where bugs often hide.

## 7. Use Realistic Test Data

### ❌ Don't Use Unrealistic Data

```typescript
// Bad: Unrealistic
const user = { name: 'a', email: 'b', age: 1 };
```

### ✅ Use Realistic Data

```typescript
// Good: Realistic
const user = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 30,
};
```

**Why**: Realistic data helps catch real-world issues.

## 8. Don't Test Third-Party Code

### ❌ Don't Test Libraries

```typescript
// Bad: Testing React Native itself
test('TouchableOpacity works', () => {
  // Don't test React Native components
});
```

### ✅ Test Your Code

```typescript
// Good: Testing your component
test('Button calls onPress when pressed', () => {
  const onPress = jest.fn();
  const { getByText } = render(<Button onPress={onPress} />);
  fireEvent.press(getByText('Click'));
  expect(onPress).toHaveBeenCalled();
});
```

**Why**: Libraries have their own tests. Test your code.

## 9. Mock External Dependencies

### ✅ Isolate Your Code

```typescript
// Mock API calls
jest.mock('./api');
const mockFetchUser = jest.fn();
mockFetchUser.mockResolvedValue({ name: 'John' });

test('displays user name', async () => {
  const { findByText } = render(<UserProfile userId="123" />);
  expect(await findByText('John')).toBeTruthy();
});
```

**Why**: Tests should be fast and not depend on external services.

## 10. Follow AAA Pattern

### ✅ Use Arrange-Act-Assert

```typescript
test('calculates total', () => {
  // Arrange
  const items = [{ price: 10, quantity: 2 }];
  
  // Act
  const result = calculateTotal(items);
  
  // Assert
  expect(result).toBe(20);
});
```

**Why**: Consistent structure makes tests easier to read and write.

## 11. Keep Tests Fast

### ✅ Avoid Slow Operations

```typescript
// Good: Fast test
test('formats currency', () => {
  const result = formatCurrency(100);
  expect(result).toBe('$100.00');
});
```

### ❌ Don't Make Real Network Calls

```typescript
// Bad: Slow test
test('fetches user', async () => {
  const user = await realApiCall(); // Don't do this!
  expect(user).toBeDefined();
});
```

**Why**: Fast tests encourage running them frequently.

## 12. Clean Up After Tests

### ✅ Reset State Between Tests

```typescript
describe('MyComponent', () => {
  beforeEach(() => {
    // Reset mocks, clear state
    jest.clearAllMocks();
  });

  test('test 1', () => { ... });
  test('test 2', () => { ... });
});
```

**Why**: Prevents tests from affecting each other.

## Quick Checklist

When writing a test, check:

- [ ] Does it test behavior, not implementation?
- [ ] Is it independent of other tests?
- [ ] Does it test one thing (or related things)?
- [ ] Is the test name descriptive?
- [ ] Is the test simple and focused?
- [ ] Does it test edge cases?
- [ ] Does it use realistic test data?
- [ ] Does it avoid testing third-party code?
- [ ] Does it mock external dependencies?
- [ ] Does it follow AAA pattern?
- [ ] Is it fast?
- [ ] Does it clean up after itself?

## Common Mistakes to Avoid

### Mistake 1: Testing Implementation

```typescript
// ❌ Bad
test('uses useState hook', () => { ... });

// ✅ Good
test('displays count when button is pressed', () => { ... });
```

### Mistake 2: Over-Mocking

```typescript
// ❌ Bad: Mocking everything
jest.mock('./utils');
jest.mock('./helpers');
jest.mock('./constants');

// ✅ Good: Only mock external dependencies
jest.mock('./api');
```

### Mistake 3: Testing Too Much

```typescript
// ❌ Bad: Testing entire flow
test('user can login and see dashboard', () => {
  // Too much for a unit test
});

// ✅ Good: Test one piece
test('login function validates credentials', () => {
  // Focused unit test
});
```

## Quick Reference

**Do**:
- Test behavior, not implementation
- Keep tests independent
- Use descriptive names
- Test edge cases
- Mock external dependencies
- Follow AAA pattern

**Don't**:
- Test implementation details
- Make tests depend on each other
- Test third-party code
- Make real network calls in tests
- Over-complicate tests

## Next Steps

You now understand the core patterns and best practices! Ready to test React Native components? Let's move to [Step 5: Testing React Native Components](../05-testing-react-native/component-testing-basics.md).

