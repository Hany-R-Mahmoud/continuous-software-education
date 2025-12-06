# Component Testing Basics

## What is Component Testing?

**Component testing** verifies that React Native components:
- Render correctly
- Display the right content
- Respond to user interactions
- Handle props correctly
- Manage state properly

**Goal**: Test components the way users interact with them.

## Philosophy: Test Behavior, Not Implementation

### ❌ Don't Test Implementation

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
test('shows loading spinner when loading', () => {
  const { getByTestId } = render(<MyComponent isLoading />);
  expect(getByTestId('loading-spinner')).toBeTruthy();
});
```

## Basic Component Test

### Simple Component

```typescript
// Button.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
}

export const Button: React.FC<ButtonProps> = ({ onPress, title }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};
```

### Basic Test

```typescript
// Button.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { Button } from './Button';

test('renders button with title', () => {
  const { getByText } = render(<Button onPress={jest.fn()} title="Click me" />);
  expect(getByText('Click me')).toBeTruthy();
});
```

**Breaking it down**:
1. **Import**: `render` from React Native Testing Library
2. **Render**: Component with props
3. **Query**: Find element by text
4. **Assert**: Element exists

## Rendering Components

### The `render` Function

```typescript
const { getByText, getByTestId, ... } = render(<Component />);
```

**What it returns**: Object with query functions to find elements.

### Common Queries

```typescript
const { 
  getByText,        // Find by text (must exist)
  getByTestId,      // Find by testID (must exist)
  getByPlaceholderText, // Find by placeholder (must exist)
  queryByText,      // Find by text (may not exist)
  findByText,       // Find by text (async)
} = render(<Component />);
```

## Finding Elements

### By Text (Most Common)

```typescript
test('finds element by text', () => {
  const { getByText } = render(<Button title="Submit" />);
  const button = getByText('Submit');
  expect(button).toBeTruthy();
});
```

### By Test ID

```typescript
// Component
<TouchableOpacity testID="submit-button">
  <Text>Submit</Text>
</TouchableOpacity>

// Test
test('finds element by testID', () => {
  const { getByTestId } = render(<Button />);
  const button = getByTestId('submit-button');
  expect(button).toBeTruthy();
});
```

**When to use testID**: When text is dynamic or you need a stable identifier.

### By Placeholder Text

```typescript
// Component
<TextInput placeholder="Enter email" />

// Test
test('finds input by placeholder', () => {
  const { getByPlaceholderText } = render(<TextInput placeholder="Enter email" />);
  const input = getByPlaceholderText('Enter email');
  expect(input).toBeTruthy();
});
```

## Testing Component Rendering

### Test 1: Component Renders

```typescript
test('renders component', () => {
  const { getByText } = render(<Button title="Click" />);
  expect(getByText('Click')).toBeTruthy();
});
```

### Test 2: Renders with Props

```typescript
test('renders with custom title', () => {
  const { getByText } = render(<Button title="Custom Title" />);
  expect(getByText('Custom Title')).toBeTruthy();
});
```

### Test 3: Renders Conditionally

```typescript
// Component
const Message = ({ show, text }) => {
  if (!show) return null;
  return <Text>{text}</Text>;
};

// Test
test('does not render when show is false', () => {
  const { queryByText } = render(<Message show={false} text="Hello" />);
  expect(queryByText('Hello')).toBeNull();
});

test('renders when show is true', () => {
  const { getByText } = render(<Message show={true} text="Hello" />);
  expect(getByText('Hello')).toBeTruthy();
});
```

## Testing Props

### Test Props Are Passed Correctly

```typescript
// Component
const UserCard = ({ name, email }) => (
  <View>
    <Text>{name}</Text>
    <Text>{email}</Text>
  </View>
);

// Test
test('displays user name and email', () => {
  const { getByText } = render(
    <UserCard name="John Doe" email="john@example.com" />
  );
  expect(getByText('John Doe')).toBeTruthy();
  expect(getByText('john@example.com')).toBeTruthy();
});
```

### Test Default Props

```typescript
// Component
const Button = ({ title = 'Default' }) => (
  <TouchableOpacity>
    <Text>{title}</Text>
  </TouchableOpacity>
);

// Test
test('uses default title when not provided', () => {
  const { getByText } = render(<Button />);
  expect(getByText('Default')).toBeTruthy();
});
```

## Testing Conditional Rendering

### Example: Loading State

```typescript
// Component
const DataDisplay = ({ isLoading, data }) => {
  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  return <Text>{data}</Text>;
};

// Test
test('shows loading when isLoading is true', () => {
  const { getByText } = render(<DataDisplay isLoading={true} data="Hello" />);
  expect(getByText('Loading...')).toBeTruthy();
});

test('shows data when not loading', () => {
  const { getByText } = render(<DataDisplay isLoading={false} data="Hello" />);
  expect(getByText('Hello')).toBeTruthy();
});
```

## Complete Example

### Component

```typescript
// UserProfile.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  showEmail?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  showEmail = true 
}) => {
  return (
    <View testID="user-profile">
      {user.avatar && <Image source={{ uri: user.avatar }} testID="avatar" />}
      <Text testID="user-name">{user.name}</Text>
      {showEmail && <Text testID="user-email">{user.email}</Text>}
    </View>
  );
};
```

### Tests

```typescript
// UserProfile.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  test('renders user name', () => {
    const { getByTestId } = render(<UserProfile user={mockUser} />);
    expect(getByTestId('user-name').props.children).toBe('John Doe');
  });

  test('renders user email by default', () => {
    const { getByTestId } = render(<UserProfile user={mockUser} />);
    expect(getByTestId('user-email').props.children).toBe('john@example.com');
  });

  test('hides email when showEmail is false', () => {
    const { queryByTestId } = render(
      <UserProfile user={mockUser} showEmail={false} />
    );
    expect(queryByTestId('user-email')).toBeNull();
  });

  test('renders avatar when provided', () => {
    const userWithAvatar = {
      ...mockUser,
      avatar: 'https://example.com/avatar.jpg',
    };
    const { getByTestId } = render(<UserProfile user={userWithAvatar} />);
    expect(getByTestId('avatar')).toBeTruthy();
  });

  test('does not render avatar when not provided', () => {
    const { queryByTestId } = render(<UserProfile user={mockUser} />);
    expect(queryByTestId('avatar')).toBeNull();
  });
});
```

## Key Concepts

### 1. Query Functions

- `getBy*`: Element must exist (throws if not found)
- `queryBy*`: Element may not exist (returns null)
- `findBy*`: Element appears asynchronously (returns promise)

### 2. When to Use Each

```typescript
// Use getBy* when element should exist
const button = getByText('Submit');

// Use queryBy* when testing absence
const error = queryByText('Error'); // null if not found
expect(error).toBeNull();

// Use findBy* for async content
const data = await findByText('Data loaded');
```

### 3. Test IDs vs Text

**Use text queries** when:
- Text is static and meaningful
- Testing what users see

**Use testID** when:
- Text is dynamic
- Need stable identifier
- Testing structure, not content

## Quick Summary

- **Component testing**: Test what users see and do
- **Render**: Use `render()` from React Native Testing Library
- **Query**: Use `getBy*`, `queryBy*`, `findBy*` to find elements
- **Assert**: Check if elements exist and have correct content
- **Focus**: Test behavior, not implementation

## Next Steps

Now let's learn about [testing user interactions](./user-interactions.md).

