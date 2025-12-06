# Async Testing

## What is Async Testing?

**Async testing** is testing code that involves:
- Promises
- Async/await
- Timers (setTimeout, setInterval)
- API calls
- Event handlers

**Challenge**: Tests need to wait for async operations to complete.

## Testing Promises

### Basic Promise Test

```typescript
// Function that returns a promise
function fetchData(): Promise<string> {
  return Promise.resolve('data');
}

// Test
test('resolves with data', async () => {
  const result = await fetchData();
  expect(result).toBe('data');
});
```

**Key**: Use `async` and `await` in your test.

### Testing Promise Rejection

```typescript
function fetchData(): Promise<string> {
  return Promise.reject(new Error('Failed'));
}

// Test
test('rejects with error', async () => {
  await expect(fetchData()).rejects.toThrow('Failed');
});
```

## Testing Async Functions

### Example: Async Function

```typescript
// utils.ts
export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}
```

### Test: Success Case

```typescript
// utils.test.ts
import { fetchUser } from './utils';

jest.mock('global', () => ({
  fetch: jest.fn(),
}));

test('fetches user successfully', async () => {
  const mockUser = { id: '123', name: 'John' };
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => mockUser,
  });

  const user = await fetchUser('123');

  expect(user).toEqual(mockUser);
  expect(global.fetch).toHaveBeenCalledWith('/api/users/123');
});
```

### Test: Error Case

```typescript
test('throws error when fetch fails', async () => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: false,
  });

  await expect(fetchUser('123')).rejects.toThrow('Failed to fetch user');
});
```

## Using `waitFor`

`waitFor` waits for an assertion to pass (useful for components with async updates):

```typescript
import { waitFor } from '@testing-library/react-native';

test('displays data after loading', async () => {
  const { getByText } = render(<DataComponent />);

  await waitFor(() => {
    expect(getByText('Data loaded')).toBeTruthy();
  });
});
```

**Use when**: Element appears after async operation.

## Testing with `findBy*` Queries

`findBy*` queries automatically wait for elements:

```typescript
test('displays user name after fetch', async () => {
  const { findByText } = render(<UserProfile userId="123" />);
  
  const nameElement = await findByText('John Doe');
  expect(nameElement).toBeTruthy();
});
```

**Benefits**: Simpler than `waitFor` for finding elements.

## Testing Timers

### Using Fake Timers

```typescript
// Function with timer
function delayedMessage(message: string, delay: number): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(message), delay);
  });
}

// Test
test('returns message after delay', async () => {
  jest.useFakeTimers();
  
  const promise = delayedMessage('Hello', 1000);
  
  jest.advanceTimersByTime(1000);
  
  const result = await promise;
  expect(result).toBe('Hello');
  
  jest.useRealTimers();
});
```

### Pattern: Setup and Cleanup

```typescript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('timer test', () => {
  // Test code
  jest.advanceTimersByTime(1000);
});
```

## Common Async Patterns

### Pattern 1: Async Function with Mock

```typescript
test('async function works', async () => {
  const mockFn = jest.fn().mockResolvedValue('result');
  
  const result = await mockFn();
  
  expect(result).toBe('result');
});
```

### Pattern 2: Component with Async Data

```typescript
test('component loads data', async () => {
  jest.mock('./api', () => ({
    fetchData: jest.fn().mockResolvedValue({ data: 'loaded' }),
  }));

  const { findByText } = render(<DataComponent />);
  
  expect(await findByText('loaded')).toBeTruthy();
});
```

### Pattern 3: Multiple Async Operations

```typescript
test('handles multiple async operations', async () => {
  const promise1 = fetchData1();
  const promise2 = fetchData2();
  
  const [result1, result2] = await Promise.all([promise1, promise2]);
  
  expect(result1).toBeDefined();
  expect(result2).toBeDefined();
});
```

## Testing React Native Components with Async

### Example: Component with Async Data Fetching

```typescript
// UserProfile.tsx
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Text>Loading...</Text>;
  return <Text>{user.name}</Text>;
};

// Test
test('displays user after loading', async () => {
  jest.mock('./api', () => ({
    fetchUser: jest.fn().mockResolvedValue({ name: 'John' }),
  }));

  const { findByText, queryByText } = render(<UserProfile userId="123" />);

  // Initially shows loading
  expect(queryByText('Loading...')).toBeTruthy();

  // Wait for user to load
  const nameElement = await findByText('John');
  expect(nameElement).toBeTruthy();
  expect(queryByText('Loading...')).toBeNull();
});
```

## Common Mistakes

### Mistake 1: Forgetting `await`

```typescript
// ❌ Bad: Test finishes before promise resolves
test('fetches data', () => {
  const result = fetchData(); // Missing await!
  expect(result).toBe('data'); // Fails - result is a Promise
});

// ✅ Good: Wait for promise
test('fetches data', async () => {
  const result = await fetchData();
  expect(result).toBe('data');
});
```

### Mistake 2: Not Waiting for Component Updates

```typescript
// ❌ Bad: Element not found yet
test('shows data', () => {
  render(<AsyncComponent />);
  expect(getByText('Data')).toBeTruthy(); // Element not loaded yet!
});

// ✅ Good: Wait for element
test('shows data', async () => {
  render(<AsyncComponent />);
  expect(await findByText('Data')).toBeTruthy();
});
```

### Mistake 3: Not Cleaning Up Timers

```typescript
// ❌ Bad: Timers leak between tests
test('timer test', () => {
  jest.useFakeTimers();
  // Test code
  // Forgot to restore real timers!
});

// ✅ Good: Clean up
afterEach(() => {
  jest.useRealTimers();
});
```

## Best Practices

### 1. Always Use `async/await`

```typescript
// ✅ Good
test('async test', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### 2. Use `findBy*` for Async Elements

```typescript
// ✅ Good: Automatically waits
const element = await findByText('Loaded');

// Less ideal: Manual waiting
await waitFor(() => {
  expect(getByText('Loaded')).toBeTruthy();
});
```

### 3. Mock External Dependencies

```typescript
// ✅ Good: Mock API calls
jest.mock('./api');
const mockFetch = jest.fn().mockResolvedValue({ data: 'result' });
```

### 4. Set Timeout for Slow Operations

```typescript
test('slow operation', async () => {
  const result = await slowOperation();
  expect(result).toBeDefined();
}, 10000); // 10 second timeout
```

## Quick Reference

**Async testing**:
- Use `async/await` in tests
- Use `findBy*` queries for async elements
- Use `waitFor` for custom async assertions
- Mock async dependencies

**Timers**:
- `jest.useFakeTimers()` - Use fake timers
- `jest.advanceTimersByTime(ms)` - Advance time
- `jest.useRealTimers()` - Restore real timers

**Promises**:
- `await promise` - Wait for resolution
- `await expect(promise).rejects.toThrow()` - Test rejection

## Next Steps

Now let's learn about [snapshot testing](./snapshot-testing.md).

