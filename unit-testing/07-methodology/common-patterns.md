# Common Testing Patterns

## Reusable Test Patterns

These patterns can be adapted for your specific needs. Copy and modify as needed.

## Pattern 1: Testing Pure Functions

### Template

```typescript
describe('functionName', () => {
  test('returns expected result for normal input', () => {
    // Arrange
    const input = normalValue;
    
    // Act
    const result = functionName(input);
    
    // Assert
    expect(result).toBe(expectedOutput);
  });

  test('handles edge case', () => {
    // Arrange
    const input = edgeCaseValue;
    
    // Act
    const result = functionName(input);
    
    // Assert
    expect(result).toBe(expectedOutput);
  });

  test('throws error for invalid input', () => {
    // Arrange
    const input = invalidValue;
    
    // Act & Assert
    expect(() => functionName(input)).toThrow();
  });
});
```

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

## Pattern 2: Testing Button Component

### Template

```typescript
describe('Button', () => {
  test('renders with title', () => {
    const { getByText } = render(<Button title="Click" onPress={jest.fn()} />);
    expect(getByText('Click')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Click" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Click'));
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  test('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Button title="Click" onPress={onPressMock} disabled />
    );
    
    fireEvent.press(getByTestId('button'));
    
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
```

## Pattern 3: Testing Form Component

### Template

```typescript
describe('Form', () => {
  test('updates input value when user types', () => {
    const { getByPlaceholderText } = render(<Form />);
    const input = getByPlaceholderText('Enter text');
    
    fireEvent.changeText(input, 'test');
    
    expect(input.props.value).toBe('test');
  });

  test('shows validation error', () => {
    const { getByTestId, queryByTestId } = render(<Form />);
    
    fireEvent.press(getByTestId('submit-button'));
    
    expect(queryByTestId('error-message')).toBeTruthy();
  });

  test('submits form with valid data', () => {
    const onSubmitMock = jest.fn();
    const { getByTestId } = render(<Form onSubmit={onSubmitMock} />);
    
    fireEvent.changeText(getByTestId('input'), 'valid');
    fireEvent.press(getByTestId('submit-button'));
    
    expect(onSubmitMock).toHaveBeenCalledWith({ value: 'valid' });
  });
});
```

## Pattern 4: Testing Custom Hook

### Template

```typescript
describe('useCustomHook', () => {
  test('initializes with default value', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe(defaultValue);
  });

  test('updates value', () => {
    const { result } = renderHook(() => useCustomHook());
    
    act(() => {
      result.current.updateValue('new');
    });
    
    expect(result.current.value).toBe('new');
  });
});
```

### Example

```typescript
describe('useCounter', () => {
  test('starts at 0', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  test('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

## Pattern 5: Testing Async Functions

### Template

```typescript
describe('asyncFunction', () => {
  test('resolves with data', async () => {
    // Arrange
    jest.mock('./api');
    const mockFetch = jest.fn().mockResolvedValue({ data: 'result' });
    
    // Act
    const result = await asyncFunction();
    
    // Assert
    expect(result).toEqual({ data: 'result' });
  });

  test('handles error', async () => {
    // Arrange
    jest.mock('./api');
    const mockFetch = jest.fn().mockRejectedValue(new Error('Failed'));
    
    // Act & Assert
    await expect(asyncFunction()).rejects.toThrow('Failed');
  });
});
```

## Pattern 6: Testing Component with Async Data

### Template

```typescript
describe('AsyncComponent', () => {
  test('shows loading state', () => {
    const { getByText } = render(<AsyncComponent loading />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  test('displays data after loading', async () => {
    jest.mock('./api', () => ({
      fetchData: jest.fn().mockResolvedValue({ data: 'result' }),
    }));

    const { findByText } = render(<AsyncComponent />);
    
    expect(await findByText('result')).toBeTruthy();
  });

  test('shows error on failure', async () => {
    jest.mock('./api', () => ({
      fetchData: jest.fn().mockRejectedValue(new Error('Failed')),
    }));

    const { findByText } = render(<AsyncComponent />);
    
    expect(await findByText('Error: Failed')).toBeTruthy();
  });
});
```

## Pattern 7: Testing Validation

### Template

```typescript
describe('validateInput', () => {
  test('returns true for valid input', () => {
    expect(validateInput('valid')).toBe(true);
  });

  test('returns false for invalid input', () => {
    expect(validateInput('invalid')).toBe(false);
  });

  test('handles empty input', () => {
    expect(validateInput('')).toBe(false);
  });

  test('handles null input', () => {
    expect(validateInput(null)).toBe(false);
  });
});
```

## Pattern 8: Testing Conditional Rendering

### Template

```typescript
describe('ConditionalComponent', () => {
  test('renders content when condition is true', () => {
    const { getByText } = render(<ConditionalComponent show />);
    expect(getByText('Content')).toBeTruthy();
  });

  test('does not render content when condition is false', () => {
    const { queryByText } = render(<ConditionalComponent show={false} />);
    expect(queryByText('Content')).toBeNull();
  });
});
```

## Pattern 9: Testing Lists

### Template

```typescript
describe('ListComponent', () => {
  test('renders all items', () => {
    const items = ['Item 1', 'Item 2', 'Item 3'];
    const { getByText } = render(<ListComponent items={items} />);
    
    items.forEach(item => {
      expect(getByText(item)).toBeTruthy();
    });
  });

  test('renders empty state when no items', () => {
    const { getByText } = render(<ListComponent items={[]} />);
    expect(getByText('No items')).toBeTruthy();
  });
});
```

## Pattern 10: Testing with Mocks

### Template

```typescript
describe('ComponentWithDependencies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses mocked dependency', () => {
    // Arrange
    jest.mock('./dependency');
    const mockFn = jest.fn().mockReturnValue('mocked');
    
    // Act
    const result = componentThatUsesDependency();
    
    // Assert
    expect(result).toBe('mocked');
    expect(mockFn).toHaveBeenCalled();
  });
});
```

## Quick Reference

**Common patterns**:
1. Pure function → Test inputs/outputs
2. Button → Test rendering and press
3. Form → Test input and submission
4. Hook → Test state with renderHook
5. Async → Test with mocks and await
6. Validation → Test valid/invalid cases
7. Conditional → Test true/false states
8. List → Test items and empty state
9. Mock → Mock dependencies

**Adapt these patterns** to your specific needs!

## Next Steps

Use these patterns with the [quick reference](./quick-reference.md) for fast test writing.

