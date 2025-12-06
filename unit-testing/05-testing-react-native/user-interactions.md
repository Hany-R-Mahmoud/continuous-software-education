# Testing User Interactions

## What are User Interactions?

**User interactions** are actions users perform:
- Pressing buttons
- Typing in inputs
- Scrolling lists
- Tapping on elements
- Swiping gestures

**Goal**: Test that components respond correctly to user actions.

## The `fireEvent` API

React Native Testing Library provides `fireEvent` to simulate user interactions:

```typescript
import { fireEvent } from '@testing-library/react-native';

fireEvent.press(element);        // Button press
fireEvent.changeText(input, 'text'); // Text input
fireEvent.scroll(scrollView, {...});  // Scroll
```

## Testing Button Presses

### Basic Button Press

```typescript
// Component
const Button = ({ onPress, title }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>{title}</Text>
  </TouchableOpacity>
);

// Test
test('calls onPress when button is pressed', () => {
  // Arrange
  const onPressMock = jest.fn();
  const { getByText } = render(<Button onPress={onPressMock} title="Click me" />);

  // Act
  fireEvent.press(getByText('Click me'));

  // Assert
  expect(onPressMock).toHaveBeenCalledTimes(1);
});
```

### Testing Button with State Change

```typescript
// Component
const Counter = () => {
  const [count, setCount] = React.useState(0);
  return (
    <View>
      <Text testID="count">{count}</Text>
      <TouchableOpacity onPress={() => setCount(count + 1)}>
        <Text>Increment</Text>
      </TouchableOpacity>
    </View>
  );
};

// Test
test('increments count when button is pressed', () => {
  const { getByText, getByTestId } = render(<Counter />);
  
  expect(getByTestId('count').props.children).toBe(0);
  
  fireEvent.press(getByText('Increment'));
  
  expect(getByTestId('count').props.children).toBe(1);
});
```

## Testing Text Input

### Basic Input Change

```typescript
// Component
const TextInput = ({ onChangeText, placeholder }) => (
  <TextInput
    onChangeText={onChangeText}
    placeholder={placeholder}
  />
);

// Test
test('calls onChangeText when user types', () => {
  // Arrange
  const onChangeTextMock = jest.fn();
  const { getByPlaceholderText } = render(
    <TextInput onChangeText={onChangeTextMock} placeholder="Enter name" />
  );
  const input = getByPlaceholderText('Enter name');

  // Act
  fireEvent.changeText(input, 'John');

  // Assert
  expect(onChangeTextMock).toHaveBeenCalledWith('John');
  expect(onChangeTextMock).toHaveBeenCalledTimes(1);
});
```

### Testing Input with Controlled Component

```typescript
// Component
const SearchInput = () => {
  const [value, setValue] = React.useState('');
  return (
    <TextInput
      value={value}
      onChangeText={setValue}
      placeholder="Search"
    />
  );
};

// Test
test('updates input value when user types', () => {
  const { getByPlaceholderText } = render(<SearchInput />);
  const input = getByPlaceholderText('Search');

  fireEvent.changeText(input, 'React Native');

  expect(input.props.value).toBe('React Native');
});
```

## Testing Forms

### Complete Form Example

```typescript
// Component
const LoginForm = ({ onSubmit }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = () => {
    onSubmit({ email, password });
  };

  return (
    <View>
      <TextInput
        testID="email-input"
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TextInput
        testID="password-input"
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <TouchableOpacity onPress={handleSubmit} testID="submit-button">
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

// Test
test('submits form with email and password', () => {
  // Arrange
  const onSubmitMock = jest.fn();
  const { getByTestId } = render(<LoginForm onSubmit={onSubmitMock} />);

  // Act
  fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
  fireEvent.changeText(getByTestId('password-input'), 'password123');
  fireEvent.press(getByTestId('submit-button'));

  // Assert
  expect(onSubmitMock).toHaveBeenCalledWith({
    email: 'user@example.com',
    password: 'password123',
  });
});
```

## Testing Multiple Interactions

### Example: Todo List

```typescript
// Component
const TodoList = () => {
  const [todos, setTodos] = React.useState([]);
  const [input, setInput] = React.useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, input]);
      setInput('');
    }
  };

  return (
    <View>
      <TextInput
        testID="todo-input"
        value={input}
        onChangeText={setInput}
        placeholder="Add todo"
      />
      <TouchableOpacity onPress={addTodo} testID="add-button">
        <Text>Add</Text>
      </TouchableOpacity>
      {todos.map((todo, index) => (
        <Text key={index} testID={`todo-${index}`}>{todo}</Text>
      ))}
    </View>
  );
};

// Test
test('adds todo when user types and presses add', () => {
  const { getByTestId, getByText } = render(<TodoList />);

  // Type todo
  fireEvent.changeText(getByTestId('todo-input'), 'Buy milk');

  // Press add
  fireEvent.press(getByTestId('add-button'));

  // Verify todo was added
  expect(getByText('Buy milk')).toBeTruthy();

  // Verify input was cleared
  expect(getByTestId('todo-input').props.value).toBe('');
});
```

## Testing Disabled States

```typescript
// Component
const SubmitButton = ({ disabled, onPress }) => (
  <TouchableOpacity 
    onPress={onPress} 
    disabled={disabled}
    testID="submit-button"
  >
    <Text>Submit</Text>
  </TouchableOpacity>
);

// Test
test('does not call onPress when disabled', () => {
  const onPressMock = jest.fn();
  const { getByTestId } = render(
    <SubmitButton disabled={true} onPress={onPressMock} />
  );

  fireEvent.press(getByTestId('submit-button'));

  expect(onPressMock).not.toHaveBeenCalled();
});

test('calls onPress when enabled', () => {
  const onPressMock = jest.fn();
  const { getByTestId } = render(
    <SubmitButton disabled={false} onPress={onPressMock} />
  );

  fireEvent.press(getByTestId('submit-button'));

  expect(onPressMock).toHaveBeenCalled();
});
```

## Testing Scroll

```typescript
// Component
const ScrollableList = ({ items }) => (
  <ScrollView testID="scroll-view">
    {items.map((item, index) => (
      <Text key={index} testID={`item-${index}`}>{item}</Text>
    ))}
  </ScrollView>
);

// Test
test('scrolls to bottom', () => {
  const items = Array.from({ length: 20 }, (_, i) => `Item ${i}`);
  const { getByTestId } = render(<ScrollableList items={items} />);
  const scrollView = getByTestId('scroll-view');

  fireEvent.scroll(scrollView, {
    nativeEvent: {
      contentOffset: { y: 1000 },
      contentSize: { height: 2000 },
      layoutMeasurement: { height: 500 },
    },
  });

  // Verify scroll happened (check scroll position, etc.)
  expect(scrollView).toBeTruthy();
});
```

## Common Interaction Patterns

### Pattern 1: Button Press with Callback

```typescript
test('calls callback when button is pressed', () => {
  const callback = jest.fn();
  const { getByText } = render(<Button onPress={callback} />);
  fireEvent.press(getByText('Click'));
  expect(callback).toHaveBeenCalled();
});
```

### Pattern 2: Input Change with Validation

```typescript
test('shows error when input is invalid', () => {
  const { getByPlaceholderText, queryByText } = render(<Form />);
  const input = getByPlaceholderText('Email');
  
  fireEvent.changeText(input, 'invalid-email');
  fireEvent.press(getByText('Submit'));
  
  expect(queryByText('Invalid email')).toBeTruthy();
});
```

### Pattern 3: Multiple Sequential Actions

```typescript
test('completes user flow', () => {
  const { getByTestId } = render(<MultiStepForm />);
  
  // Step 1
  fireEvent.changeText(getByTestId('step1-input'), 'value1');
  fireEvent.press(getByTestId('next-button'));
  
  // Step 2
  fireEvent.changeText(getByTestId('step2-input'), 'value2');
  fireEvent.press(getByTestId('submit-button'));
  
  // Verify completion
  expect(getByText('Success')).toBeTruthy();
});
```

## Best Practices

### 1. Test User Actions, Not Internal Methods

```typescript
// ❌ Bad: Testing internal method
test('calls handleClick', () => {
  // Don't test internal methods
});

// ✅ Good: Testing user action
test('calls onPress when button is pressed', () => {
  // Test what user does
});
```

### 2. Use Realistic User Flows

```typescript
// ✅ Good: Realistic flow
test('user can complete login', () => {
  // Type email
  // Type password
  // Press submit
  // Verify success
});
```

### 3. Test Edge Cases

```typescript
test('handles empty input', () => {
  // Test what happens with empty input
});

test('handles rapid button presses', () => {
  // Test multiple quick presses
});
```

## Quick Reference

**Common Interactions**:
- `fireEvent.press(element)` - Button/touch press
- `fireEvent.changeText(input, 'text')` - Text input
- `fireEvent.scroll(scrollView, {...})` - Scroll

**Testing Pattern**:
1. Arrange: Render component, get elements
2. Act: Simulate user interaction
3. Assert: Verify expected behavior

## Next Steps

Now let's learn about [testing hooks](./hooks-testing.md).

