# Quick Reference Guide

## Your Testing Cheat Sheet

Quick reference for common testing tasks. Keep this handy while writing tests.

## Jest Basics

### Test Structure

```typescript
describe('group name', () => {
  test('test description', () => {
    // Test code
  });
});
```

### Common Matchers

```typescript
expect(value).toBe(5);                    // Exact equality
expect(value).toEqual({ a: 1 });          // Deep equality
expect(value).toBeTruthy();               // Truthy
expect(value).toBeFalsy();                 // Falsy
expect(value).toContain('text');          // Contains
expect(value).toHaveLength(3);             // Length
expect(() => fn()).toThrow();              // Throws error
expect(value).toBeDefined();               // Not undefined
expect(value).toBeNull();                  // Is null
```

### Mock Functions

```typescript
const mockFn = jest.fn();                 // Create mock
mockFn.mockReturnValue('value');          // Return value
mockFn.mockResolvedValue('value');        // Resolve promise
mockFn.mockRejectedValue(error);          // Reject promise
expect(mockFn).toHaveBeenCalled();        // Was called
expect(mockFn).toHaveBeenCalledWith('arg'); // Called with
expect(mockFn).toHaveBeenCalledTimes(2);  // Called N times
```

## React Native Testing Library

### Rendering

```typescript
import { render } from '@testing-library/react-native';

const { getByText, getByTestId, ... } = render(<Component />);
```

### Queries

```typescript
getByText('text');           // Must exist
queryByText('text');         // May not exist (returns null)
findByText('text');          // Async (returns promise)
getByTestId('id');           // By testID
getByPlaceholderText('...'); // By placeholder
```

### User Interactions

```typescript
import { fireEvent } from '@testing-library/react-native';

fireEvent.press(element);                    // Button press
fireEvent.changeText(input, 'text');        // Text input
fireEvent.scroll(scrollView, {...});        // Scroll
```

## Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react-native';

const { result } = renderHook(() => useMyHook());

act(() => {
  result.current.updateState();
});
```

## AAA Pattern

```typescript
test('description', () => {
  // Arrange: Set up test
  const input = 'value';
  
  // Act: Execute code
  const result = function(input);
  
  // Assert: Verify result
  expect(result).toBe('expected');
});
```

## Common Test Patterns

### Pure Function

```typescript
test('returns expected result', () => {
  expect(function(input)).toBe(output);
});
```

### Component Rendering

```typescript
test('renders correctly', () => {
  const { getByText } = render(<Component />);
  expect(getByText('Text')).toBeTruthy();
});
```

### User Interaction

```typescript
test('handles user action', () => {
  const onPress = jest.fn();
  const { getByText } = render(<Button onPress={onPress} />);
  fireEvent.press(getByText('Click'));
  expect(onPress).toHaveBeenCalled();
});
```

### Async Test

```typescript
test('handles async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Mock Module

```typescript
jest.mock('./module');
const mockFn = jest.fn().mockResolvedValue('value');
```

## File Organization

```
src/
├── utils/
│   ├── math.ts
│   └── math.test.ts        ← Test next to source
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx     ← Test next to source
```

## Running Tests

```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage
npm test filename.test.ts   # Single file
```

## Test Naming

```typescript
// ✅ Good
test('formats currency with dollar sign', () => { ... });
test('returns error when email is invalid', () => { ... });

// ❌ Bad
test('works', () => { ... });
test('test 1', () => { ... });
```

## What to Test

### Always Test
- Normal cases
- Edge cases (empty, null, zero)
- Error cases
- Different states

### Don't Test
- Third-party code
- Implementation details
- Trivial getters/setters
- Framework features

## Common Commands

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Update snapshots
npm test -- -u

# Single file
npm test -- filename.test.ts
```

## Quick Decision Guide

| What to Test | How to Test |
|-------------|-------------|
| Pure function | Call function, check result |
| Component | Render, check elements |
| User interaction | Simulate action, check result |
| Hook | Use renderHook, test state |
| Async | Mock, use async/await |
| Error | Test error case |

## Testing Checklist

- [ ] Test normal cases
- [ ] Test edge cases
- [ ] Test error cases
- [ ] Use AAA pattern
- [ ] Test behavior, not implementation
- [ ] Keep tests independent
- [ ] Use descriptive names
- [ ] Mock external dependencies

## Common Mistakes

- ❌ Testing implementation details
- ❌ Tests depend on each other
- ❌ Vague test names
- ❌ Missing edge cases
- ❌ Not mocking dependencies
- ❌ Testing third-party code

## Quick Tips

1. **Start simple**: Test normal cases first
2. **Add edge cases**: Test boundaries and special values
3. **Test errors**: Verify error handling
4. **Mock dependencies**: Isolate your code
5. **Use AAA**: Arrange, Act, Assert
6. **Keep it simple**: One thing per test
7. **Name clearly**: Test names should describe behavior

## Resources

- Jest Docs: https://jestjs.io/
- React Native Testing Library: https://callstack.github.io/react-native-testing-library/
- This guide: See other files in this folder

## Next Steps

You now have a complete testing methodology! Review the [summary notes](../summary-notes.md) to consolidate everything you've learned.

