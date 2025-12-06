# Testing Hooks

## What are Hooks?

**Hooks** are React functions that let you use state and other features in functional components:
- `useState` - Manage state
- `useEffect` - Side effects
- `useCallback` - Memoized callbacks
- Custom hooks - Your own reusable logic

**Goal**: Test hooks in isolation to verify they work correctly.

## Testing Custom Hooks

### Using `renderHook`

React Native Testing Library provides `renderHook` to test hooks:

```typescript
import { renderHook } from '@testing-library/react-native';

const { result } = renderHook(() => useMyHook());
```

## Example 1: Testing `useState` Hook

### The Hook

```typescript
// useCounter.ts
import { useState } from 'react';

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}
```

### The Test

```typescript
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  test('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  test('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  test('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  test('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });

  test('resets count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(5);
  });
});
```

**Key points**:
- Use `renderHook` to test hooks
- Use `act()` when updating state
- Access hook return value via `result.current`

## The `act` Function

**Why `act`?**: State updates must be wrapped in `act()` to ensure React processes them correctly.

```typescript
import { act } from '@testing-library/react-native';

act(() => {
  // State updates go here
  result.current.increment();
});
```

## Example 2: Testing Hook with Props

### The Hook

```typescript
// useToggle.ts
import { useState } from 'react';

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue(!value);
  return [value, toggle];
}
```

### The Test

```typescript
// useToggle.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useToggle } from './useToggle';

describe('useToggle', () => {
  test('initializes with false by default', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  test('initializes with custom value', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  test('toggles value', () => {
    const { result } = renderHook(() => useToggle(false));
    
    act(() => {
      result.current[1](); // Call toggle
    });
    
    expect(result.current[0]).toBe(true);
    
    act(() => {
      result.current[1](); // Toggle again
    });
    
    expect(result.current[0]).toBe(false);
  });
});
```

## Example 3: Testing Hook with `useEffect`

### The Hook

```typescript
// useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### The Test

```typescript
// useDebounce.test.ts
import { renderHook } from '@testing-library/react-native';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  test('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    );

    expect(result.current).toBe('hello');

    rerender({ value: 'world', delay: 500 });

    // Value hasn't changed yet
    expect(result.current).toBe('hello');

    // Fast-forward time
    jest.advanceTimersByTime(500);

    // Now value should be updated
    expect(result.current).toBe('world');
  });
});
```

**Key points**:
- Use `jest.useFakeTimers()` for time-based hooks
- Use `rerender` to update hook props
- Advance timers with `jest.advanceTimersByTime()`

## Example 4: Testing Hook with API Call

### The Hook

```typescript
// useUser.ts
import { useState, useEffect } from 'react';

export function useUser(userId: string) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}
```

### The Test

```typescript
// useUser.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useUser } from './useUser';
import { fetchUser } from './api';

jest.mock('./api');

describe('useUser', () => {
  test('loads user data', async () => {
    const mockUser = { id: '1', name: 'John' };
    (fetchUser as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useUser('1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBe(null);
  });

  test('handles error', async () => {
    const mockError = new Error('Failed to fetch');
    (fetchUser as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useUser('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBe(null);
    expect(result.current.error).toEqual(mockError);
  });
});
```

**Key points**:
- Mock external dependencies (API calls)
- Use `waitFor` for async operations
- Test loading, success, and error states

## Testing Hooks in Components

Sometimes it's easier to test hooks by testing the component that uses them:

```typescript
// Component using hook
const Counter = () => {
  const { count, increment } = useCounter();
  return (
    <View>
      <Text testID="count">{count}</Text>
      <TouchableOpacity onPress={increment}>
        <Text>Increment</Text>
      </TouchableOpacity>
    </View>
  );
};

// Test hook through component
test('counter hook works in component', () => {
  const { getByTestId, getByText } = render(<Counter />);
  
  expect(getByTestId('count').props.children).toBe(0);
  
  fireEvent.press(getByText('Increment'));
  
  expect(getByTestId('count').props.children).toBe(1);
});
```

## Common Patterns

### Pattern 1: Testing State Updates

```typescript
test('updates state', () => {
  const { result } = renderHook(() => useMyHook());
  
  act(() => {
    result.current.updateState('new value');
  });
  
  expect(result.current.state).toBe('new value');
});
```

### Pattern 2: Testing with Initial Props

```typescript
test('works with initial props', () => {
  const { result } = renderHook(
    (props) => useMyHook(props),
    { initialProps: { value: 'initial' } }
  );
  
  expect(result.current.value).toBe('initial');
});
```

### Pattern 3: Testing Prop Updates

```typescript
test('updates when props change', () => {
  const { result, rerender } = renderHook(
    ({ id }) => useMyHook(id),
    { initialProps: { id: '1' } }
  );
  
  rerender({ id: '2' });
  
  expect(result.current.id).toBe('2');
});
```

## Best Practices

### 1. Test Hooks in Isolation

```typescript
// ✅ Good: Test hook directly
const { result } = renderHook(() => useCounter());
```

### 2. Use `act` for State Updates

```typescript
// ✅ Good: Wrap state updates in act
act(() => {
  result.current.increment();
});
```

### 3. Test All Return Values

```typescript
// ✅ Good: Test all hook return values
expect(result.current.count).toBe(1);
expect(result.current.increment).toBeDefined();
expect(result.current.decrement).toBeDefined();
```

### 4. Test Edge Cases

```typescript
// ✅ Good: Test edge cases
test('handles negative numbers', () => {
  // Test edge case
});
```

## Quick Reference

**Testing Hooks**:
- Use `renderHook()` to test hooks
- Use `act()` for state updates
- Access return value via `result.current`
- Use `rerender()` to update props

**Common Scenarios**:
- State hooks: Test state updates
- Effect hooks: Test side effects
- Custom hooks: Test return values and behavior

## Next Steps

You've learned the basics of testing React Native components and hooks! Ready for advanced concepts? Let's move to [Step 6: Advanced Concepts](../06-advanced-concepts/mocking.md).

