# Naming Conventions for Tests

## Why Good Names Matter

Good test names:
- ✅ Explain what is being tested
- ✅ Make failures easy to understand
- ✅ Serve as documentation
- ✅ Help others understand your code

**Bad test names** make debugging harder and code less maintainable.

## Test Name Structure

### Pattern: "should [expected behavior] when [condition]"

```typescript
test('should return formatted currency when given positive number', () => {
  // Test code
});
```

### Pattern: "[action] [expected result]"

```typescript
test('formats currency with dollar sign', () => {
  // Test code
});
```

### Pattern: "[condition] [expected behavior]"

```typescript
test('when button is disabled, does not call onPress', () => {
  // Test code
});
```

**Recommendation**: Use the pattern that's clearest for your team. Be consistent.

## Good Test Names

### ✅ Descriptive and Clear

```typescript
test('formats 100 as $100.00', () => { ... });
test('returns error when email is invalid', () => { ... });
test('calls onPress when button is tapped', () => { ... });
test('displays loading spinner when isLoading is true', () => { ... });
```

**Why good**: Immediately clear what's being tested.

### ✅ Specific About Conditions

```typescript
test('handles empty string input', () => { ... });
test('validates email with correct format', () => { ... });
test('calculates total for multiple items', () => { ... });
```

**Why good**: Specifies the condition being tested.

### ✅ Describes Expected Behavior

```typescript
test('returns true for valid password', () => { ... });
test('throws error when dividing by zero', () => { ... });
test('disables submit button when form is invalid', () => { ... });
```

**Why good**: Clear about what should happen.

## Bad Test Names

### ❌ Too Vague

```typescript
test('works', () => { ... });
test('test', () => { ... });
test('function', () => { ... });
```

**Problem**: Doesn't tell you what's being tested.

### ❌ Implementation-Focused

```typescript
test('calls setState', () => { ... });
test('uses useEffect hook', () => { ... });
test('renders div element', () => { ... });
```

**Problem**: Tests implementation, not behavior.

### ❌ Unclear Conditions

```typescript
test('handles input', () => { ... });
test('processes data', () => { ... });
test('works correctly', () => { ... });
```

**Problem**: Doesn't specify what input or what "correctly" means.

## Examples by Category

### Testing Functions

```typescript
// ✅ Good
test('adds two positive numbers correctly', () => { ... });
test('returns zero when both inputs are zero', () => { ... });
test('throws error when dividing by zero', () => { ... });

// ❌ Bad
test('add function', () => { ... });
test('works', () => { ... });
test('test 1', () => { ... });
```

### Testing Components

```typescript
// ✅ Good
test('displays user name when user is provided', () => { ... });
test('shows loading spinner when data is fetching', () => { ... });
test('calls onSubmit when form is submitted', () => { ... });
test('disables button when form is invalid', () => { ... });

// ❌ Bad
test('Button component', () => { ... });
test('renders', () => { ... });
test('onPress works', () => { ... });
```

### Testing Edge Cases

```typescript
// ✅ Good
test('handles empty array input', () => { ... });
test('returns default value when input is null', () => { ... });
test('handles very large numbers', () => { ... });
test('works with special characters in string', () => { ... });

// ❌ Bad
test('edge case', () => { ... });
test('handles null', () => { ... });
test('special input', () => { ... });
```

### Testing Error Cases

```typescript
// ✅ Good
test('throws error when email format is invalid', () => { ... });
test('returns false when password is too short', () => { ... });
test('handles network error gracefully', () => { ... });

// ❌ Bad
test('error handling', () => { ... });
test('invalid input', () => { ... });
test('throws', () => { ... });
```

## Describe Block Names

### Good Describe Names

```typescript
// Name the function/component being tested
describe('formatCurrency', () => {
  // Tests for formatCurrency
});

describe('Button component', () => {
  // Tests for Button component
});

// Group by feature
describe('user authentication', () => {
  describe('login function', () => {
    // Login tests
  });

  describe('logout function', () => {
    // Logout tests
  });
});
```

### Bad Describe Names

```typescript
// ❌ Too generic
describe('tests', () => { ... });
describe('functions', () => { ... });

// ❌ Implementation-focused
describe('utils', () => { ... });
describe('components', () => { ... });
```

## Naming Patterns

### Pattern 1: Behavior-Focused

```typescript
describe('formatCurrency', () => {
  test('formats positive numbers with dollar sign', () => { ... });
  test('formats zero as $0.00', () => { ... });
  test('formats negative numbers with minus sign', () => { ... });
});
```

**Use when**: Testing what the function does (output).

### Pattern 2: Condition-Focused

```typescript
describe('isValidEmail', () => {
  test('returns true for valid email format', () => { ... });
  test('returns false when @ symbol is missing', () => { ... });
  test('returns false when domain is missing', () => { ... });
});
```

**Use when**: Testing different input conditions.

### Pattern 3: User-Focused (Components)

```typescript
describe('LoginForm', () => {
  test('user can enter email and password', () => { ... });
  test('user sees error when email is invalid', () => { ... });
  test('user can submit form with valid data', () => { ... });
});
```

**Use when**: Testing user interactions.

## Quick Checklist

When naming a test, ask:

- [ ] Can someone understand what's being tested without reading the code?
- [ ] Does it describe the expected behavior?
- [ ] Does it specify the condition (if applicable)?
- [ ] Is it specific enough to be useful when the test fails?
- [ ] Does it avoid implementation details?

## Examples: Before and After

### Example 1: Function Test

```typescript
// ❌ Before
test('formatCurrency', () => { ... });

// ✅ After
test('formats 100 as $100.00', () => { ... });
```

### Example 2: Component Test

```typescript
// ❌ Before
test('Button', () => { ... });

// ✅ After
test('calls onPress when button is pressed', () => { ... });
```

### Example 3: Edge Case Test

```typescript
// ❌ Before
test('edge case', () => { ... });

// ✅ After
test('handles empty string input gracefully', () => { ... });
```

## Quick Reference

**Good test names**:
- Describe what is tested
- Specify conditions
- Focus on behavior, not implementation
- Are specific and clear

**Bad test names**:
- Too vague ("works", "test")
- Implementation-focused ("calls setState")
- Unclear conditions ("handles input")

**Patterns**:
- `"[action] [expected result]"`
- `"should [behavior] when [condition]"`
- `"[condition] [expected behavior]"`

## Next Steps

Now let's learn about [best practices](./best-practices.md) for writing tests.

