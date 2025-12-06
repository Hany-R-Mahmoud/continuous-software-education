/**
 * Example: Testing a Custom Hook
 * 
 * This demonstrates how to test a custom React hook using renderHook.
 */

import { renderHook, act } from '@testing-library/react-native';
import { useState, useEffect } from 'react';

// Custom hook to test
export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);
  const setValue = (value: number) => setCount(value);

  return { count, increment, decrement, reset, setValue };
}

// Another custom hook: useToggle
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue(!value);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);

  return { value, toggle, setTrue, setFalse };
}

// Custom hook with effect: useLocalStorage
export function useLocalStorage(key: string, initialValue: string) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // In real implementation, this would read from AsyncStorage
      return initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: string) => {
    try {
      setStoredValue(value);
      // In real implementation, this would save to AsyncStorage
    } catch (error) {
      // Handle error
    }
  };

  return [storedValue, setValue] as const;
}

// Tests for useCounter
describe('useCounter', () => {
  test('initializes with default value of 0', () => {
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

  test('resets count to initial value', () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(10);
  });

  test('sets count to specific value', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.setValue(42);
    });

    expect(result.current.count).toBe(42);
  });

  test('handles multiple increments', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(3);
  });

  test('handles negative values', () => {
    const { result } = renderHook(() => useCounter(-5));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(-4);
  });
});

// Tests for useToggle
describe('useToggle', () => {
  test('initializes with false by default', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current.value).toBe(false);
  });

  test('initializes with custom value', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current.value).toBe(true);
  });

  test('toggles value from false to true', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current.toggle();
    });

    expect(result.current.value).toBe(true);
  });

  test('toggles value from true to false', () => {
    const { result } = renderHook(() => useToggle(true));

    act(() => {
      result.current.toggle();
    });

    expect(result.current.value).toBe(false);
  });

  test('sets value to true', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current.setTrue();
    });

    expect(result.current.value).toBe(true);
  });

  test('sets value to false', () => {
    const { result } = renderHook(() => useToggle(true));

    act(() => {
      result.current.setFalse();
    });

    expect(result.current.value).toBe(false);
  });

  test('handles multiple toggles', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current.toggle(); // false -> true
      result.current.toggle(); // true -> false
      result.current.toggle(); // false -> true
    });

    expect(result.current.value).toBe(true);
  });
});

// Tests for useLocalStorage
describe('useLocalStorage', () => {
  test('initializes with initial value', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  test('updates value', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
  });

  test('maintains value across updates', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));

    act(() => {
      result.current[1]('first');
      result.current[1]('second');
      result.current[1]('third');
    });

    expect(result.current[0]).toBe('third');
  });
});

