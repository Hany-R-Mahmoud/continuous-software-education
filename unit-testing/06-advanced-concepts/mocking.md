# Mocking in Tests

## What is Mocking?

**Mocking** is creating fake versions of functions, modules, or dependencies so you can:
- Test your code in isolation
- Control what dependencies return
- Avoid real API calls, databases, etc.
- Make tests faster and more reliable

**Think of it as**: Using a stunt double instead of the real actor.

## Why Mock?

### Problems Without Mocking

```typescript
// Without mocking - makes real API call
test('fetches user', async () => {
  const user = await fetchUserFromAPI('123'); // Real network call!
  expect(user.name).toBe('John');
});
```

**Issues**:
- Slow (network calls take time)
- Unreliable (network might be down)
- Expensive (uses real API quota)
- Hard to test error cases

### Solution: Mocking

```typescript
// With mocking - fast and reliable
jest.mock('./api');
const mockFetchUser = jest.fn();
mockFetchUser.mockResolvedValue({ name: 'John' });

test('fetches user', async () => {
  const user = await fetchUser('123');
  expect(user.name).toBe('John');
});
```

**Benefits**:
- Fast (no network calls)
- Reliable (always works)
- Free (no API costs)
- Easy to test errors

## Types of Mocks

### 1. Mock Functions

Create a fake function:

```typescript
const mockFn = jest.fn();

// Use it
mockFn('arg1', 'arg2');

// Check how it was called
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(1);
```

### 2. Mock Return Values

Make a function return a specific value:

```typescript
const mockFn = jest.fn();

// Return value
mockFn.mockReturnValue('result');
expect(mockFn()).toBe('result');

// Return different values on each call
mockFn
  .mockReturnValueOnce('first')
  .mockReturnValueOnce('second');
expect(mockFn()).toBe('first');
expect(mockFn()).toBe('second');
```

### 3. Mock Promises

Mock async functions:

```typescript
const mockFetch = jest.fn();

// Resolve (success)
mockFetch.mockResolvedValue({ data: 'success' });
const result = await mockFetch();
expect(result.data).toBe('success');

// Reject (error)
mockFetch.mockRejectedValue(new Error('Failed'));
await expect(mockFetch()).rejects.toThrow('Failed');
```

## Mocking Modules

### Mock an Entire Module

```typescript
// api.ts
export const fetchUser = async (id: string) => {
  // Real API call
};

// api.test.ts
jest.mock('./api');
import { fetchUser } from './api';

test('uses mocked fetchUser', async () => {
  (fetchUser as jest.Mock).mockResolvedValue({ name: 'John' });
  const user = await fetchUser('123');
  expect(user.name).toBe('John');
});
```

### Mock with Implementation

```typescript
jest.mock('./api', () => ({
  fetchUser: jest.fn(() => Promise.resolve({ name: 'Mock User' })),
}));
```

## Common Mocking Scenarios

### Scenario 1: Mocking API Calls

```typescript
// api.ts
export const fetchUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};

// api.test.ts
jest.mock('./api');

describe('fetchUser', () => {
  test('fetches user successfully', async () => {
    const mockUser = { id: '123', name: 'John' };
    (fetchUser as jest.Mock).mockResolvedValue(mockUser);

    const user = await fetchUser('123');

    expect(user).toEqual(mockUser);
    expect(fetchUser).toHaveBeenCalledWith('123');
  });

  test('handles API error', async () => {
    (fetchUser as jest.Mock).mockRejectedValue(new Error('API Error'));

    await expect(fetchUser('123')).rejects.toThrow('API Error');
  });
});
```

### Scenario 2: Mocking React Native Modules

```typescript
// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

test('saves data to storage', async () => {
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

  await saveData('key', 'value');

  expect(AsyncStorage.setItem).toHaveBeenCalledWith('key', 'value');
});
```

### Scenario 3: Mocking Component Props

```typescript
// Component
const UserProfile = ({ fetchUser, userId }) => {
  // Uses fetchUser prop
};

// Test
test('displays user data', async () => {
  const mockFetchUser = jest.fn().mockResolvedValue({ name: 'John' });

  render(<UserProfile fetchUser={mockFetchUser} userId="123" />);

  expect(mockFetchUser).toHaveBeenCalledWith('123');
});
```

## Jest Mock Functions API

### Creating Mocks

```typescript
const mockFn = jest.fn();                    // Create mock
const mockFn = jest.fn(() => 'return');     // With implementation
```

### Setting Return Values

```typescript
mockFn.mockReturnValue('value');            // Always return this
mockFn.mockReturnValueOnce('value');        // Return once
mockFn.mockResolvedValue('value');          // Resolve promise
mockFn.mockRejectedValue(new Error());      // Reject promise
```

### Checking Calls

```typescript
expect(mockFn).toHaveBeenCalled();          // Was called
expect(mockFn).toHaveBeenCalledTimes(2);    // Called 2 times
expect(mockFn).toHaveBeenCalledWith('arg'); // Called with args
expect(mockFn).toHaveBeenLastCalledWith('arg'); // Last call args
```

### Clearing Mocks

```typescript
mockFn.mockClear();                         // Clear call history
jest.clearAllMocks();                       // Clear all mocks
```

## Best Practices

### 1. Mock at the Module Level

```typescript
// ✅ Good: Mock at top of file
jest.mock('./api');

describe('MyComponent', () => {
  // Tests use mocked api
});
```

### 2. Reset Mocks Between Tests

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 3. Only Mock What You Need

```typescript
// ✅ Good: Mock only external dependencies
jest.mock('./api');
jest.mock('@react-native-async-storage/async-storage');

// ❌ Bad: Don't mock your own code unnecessarily
jest.mock('./utils'); // Only if utils has side effects
```

### 4. Use Realistic Mock Data

```typescript
// ✅ Good: Realistic data
const mockUser = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
};

// ❌ Bad: Unrealistic data
const mockUser = { a: 1, b: 2 };
```

## Common Patterns

### Pattern 1: Mock Function with Return Value

```typescript
const calculate = jest.fn();
calculate.mockReturnValue(42);

expect(calculate()).toBe(42);
```

### Pattern 2: Mock Async Function

```typescript
const fetchData = jest.fn();
fetchData.mockResolvedValue({ data: 'result' });

const result = await fetchData();
expect(result.data).toBe('result');
```

### Pattern 3: Mock Module

```typescript
jest.mock('./api', () => ({
  fetchUser: jest.fn(),
}));
```

### Pattern 4: Partial Mock

```typescript
// Mock only specific functions
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  expensiveFunction: jest.fn(),
}));
```

## Quick Reference

**Creating mocks**:
- `jest.fn()` - Create mock function
- `jest.mock('./module')` - Mock module

**Setting behavior**:
- `mockReturnValue()` - Return value
- `mockResolvedValue()` - Resolve promise
- `mockRejectedValue()` - Reject promise

**Checking calls**:
- `toHaveBeenCalled()` - Was called
- `toHaveBeenCalledWith()` - Called with args
- `toHaveBeenCalledTimes()` - Number of calls

## Next Steps

Now let's learn about [async testing](./async-testing.md).

