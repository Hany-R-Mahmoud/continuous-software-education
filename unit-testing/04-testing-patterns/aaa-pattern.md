# The AAA Pattern: Arrange, Act, Assert

## What is the AAA Pattern?

The **AAA Pattern** is a simple, memorable structure for writing tests. Every test follows three steps:

1. **Arrange**: Set up the test (prepare inputs, mocks, etc.)
2. **Act**: Execute the code you're testing
3. **Assert**: Verify the result matches expectations

**Think of it as**: Prepare → Execute → Verify

## Why Use AAA?

- ✅ **Clear structure**: Every test follows the same pattern
- ✅ **Easy to read**: Anyone can understand what's happening
- ✅ **Easy to write**: Just follow the three steps
- ✅ **Memorable**: AAA is easy to remember

## The Pattern in Detail

### 1. Arrange (Setup)

Prepare everything needed for the test:
- Create test data
- Set up mocks
- Initialize variables
- Configure the environment

### 2. Act (Execute)

Run the code you're testing:
- Call the function
- Trigger the component action
- Execute the behavior

### 3. Assert (Verify)

Check if the result is correct:
- Compare actual vs expected
- Verify function was called
- Check state changes

## Example 1: Testing a Function

```typescript
// Function to test
function calculateTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Test using AAA pattern
test('calculates total correctly', () => {
  // Arrange: Set up test data
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 },
  ];

  // Act: Execute the function
  const result = calculateTotal(items);

  // Assert: Verify the result
  expect(result).toBe(35);
});
```

**Breaking it down**:
- **Arrange**: Created test data (items array)
- **Act**: Called `calculateTotal(items)`
- **Assert**: Checked result equals 35

## Example 2: Testing a Component

```typescript
// Component to test
const Button = ({ onPress, title }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>{title}</Text>
  </TouchableOpacity>
);

// Test using AAA pattern
test('calls onPress when button is pressed', () => {
  // Arrange: Set up mocks and render component
  const onPressMock = jest.fn();
  const { getByText } = render(<Button onPress={onPressMock} title="Click me" />);

  // Act: Simulate user interaction
  fireEvent.press(getByText('Click me'));

  // Assert: Verify the callback was called
  expect(onPressMock).toHaveBeenCalledTimes(1);
});
```

**Breaking it down**:
- **Arrange**: Created mock function, rendered component
- **Act**: Simulated button press
- **Assert**: Verified mock was called

## Example 3: Testing with Multiple Assertions

```typescript
test('formats user data correctly', () => {
  // Arrange
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  // Act
  const formatted = formatUserDisplay(user);

  // Assert: Multiple checks
  expect(formatted.name).toBe('John Doe');
  expect(formatted.email).toBe('john@example.com');
  expect(formatted.initials).toBe('JD');
});
```

**Note**: Multiple assertions are OK if they're all checking the same result.

## Visual Structure

Every test should look like this:

```typescript
test('test description', () => {
  // ========== ARRANGE ==========
  // All setup code here
  // Create data, mocks, etc.
  
  // ========== ACT ==========
  // Execute the code being tested
  // Usually one line
  
  // ========== ASSERT ==========
  // Verify the result
  // Check expectations
});
```

## When to Use Comments

### Option 1: Use Comments (Recommended for Learning)

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

**Good for**: Learning, complex tests, team consistency

### Option 2: No Comments (When Pattern is Clear)

```typescript
test('calculates total', () => {
  const items = [{ price: 10, quantity: 2 }];
  const result = calculateTotal(items);
  expect(result).toBe(20);
});
```

**Good for**: Simple tests, experienced teams

**Recommendation**: Use comments while learning, remove them when the pattern becomes natural.

## Common Mistakes

### Mistake 1: Mixing Arrange and Act

```typescript
// ❌ Bad: Arrange and Act mixed together
test('calculates total', () => {
  const items = [{ price: 10, quantity: 2 }];
  expect(calculateTotal(items)).toBe(20); // Act and Assert together
});
```

```typescript
// ✅ Good: Clear separation
test('calculates total', () => {
  // Arrange
  const items = [{ price: 10, quantity: 2 }];
  
  // Act
  const result = calculateTotal(items);
  
  // Assert
  expect(result).toBe(20);
});
```

### Mistake 2: Asserting in Arrange

```typescript
// ❌ Bad: Assertion in Arrange section
test('processes data', () => {
  const data = getData();
  expect(data).toBeDefined(); // This is an assertion, not arrangement!
  
  const result = process(data);
  expect(result).toBe(expected);
});
```

```typescript
// ✅ Good: Only setup in Arrange
test('processes data', () => {
  // Arrange
  const data = getData();
  
  // Act
  const result = process(data);
  
  // Assert
  expect(result).toBe(expected);
});
```

### Mistake 3: Multiple Acts

```typescript
// ❌ Bad: Multiple actions
test('handles multiple actions', () => {
  const component = render(<MyComponent />);
  fireEvent.press(getByText('Button 1')); // Act 1
  fireEvent.press(getByText('Button 2')); // Act 2
  expect(...).toBe(...);
});
```

```typescript
// ✅ Good: One action per test (usually)
test('handles button 1 press', () => {
  // Arrange
  const component = render(<MyComponent />);
  
  // Act
  fireEvent.press(getByText('Button 1'));
  
  // Assert
  expect(...).toBe(...);
});
```

**Note**: Sometimes multiple acts are OK if testing a sequence, but prefer one act per test.

## AAA in Different Scenarios

### Scenario 1: Simple Function Test

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

### Scenario 2: Component with User Interaction

```typescript
test('updates input value', () => {
  // Arrange
  const { getByPlaceholderText } = render(<TextInput placeholder="Name" />);
  const input = getByPlaceholderText('Name');
  
  // Act
  fireEvent.changeText(input, 'John');
  
  // Assert
  expect(input.props.value).toBe('John');
});
```

### Scenario 3: Async Function Test

```typescript
test('fetches user data', async () => {
  // Arrange
  const userId = '123';
  const mockUser = { id: '123', name: 'John' };
  jest.spyOn(api, 'fetchUser').mockResolvedValue(mockUser);
  
  // Act
  const user = await fetchUser(userId);
  
  // Assert
  expect(user).toEqual(mockUser);
});
```

## Benefits of AAA Pattern

1. **Consistency**: All tests follow the same structure
2. **Readability**: Easy to understand what each part does
3. **Maintainability**: Easy to modify tests
4. **Debugging**: Easy to identify which part failed
5. **Teaching**: Easy to explain to others

## Quick Reference

```
AAA Pattern:
├── Arrange: Set up test data, mocks, environment
├── Act: Execute the code being tested
└── Assert: Verify the result matches expectations
```

## Memory Aid

**AAA = Always Arrange, then Act, then Assert**

Or think of it as:
- **A**rrange = **A**ll setup
- **A**ct = **A**ction (do it)
- **A**ssert = **A**ssess (check it)

## Next Steps

Now that you understand the AAA pattern, let's learn about [test structure and organization](./test-structure.md).

