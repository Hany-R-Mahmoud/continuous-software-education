# React Native Testing Library

## What is React Native Testing Library?

**React Native Testing Library** is a library that helps you test React Native components by focusing on **how users interact with your app**, not implementation details.

**Philosophy**: Test your components the way users use them.

## Core Philosophy

### Test Behavior, Not Implementation

**❌ Don't test implementation details:**
```typescript
// Bad: Testing internal state
test('button has disabled state', () => {
  const button = render(<Button />);
  expect(button.instance().state.disabled).toBe(true);
});
```

**✅ Test user-visible behavior:**
```typescript
// Good: Testing what user sees/does
test('button is disabled when loading', () => {
  const { getByRole } = render(<Button loading />);
  const button = getByRole('button');
  expect(button).toBeDisabled();
});
```

**Why**: Implementation can change, but user behavior should stay the same.

## Key Concepts

### 1. Queries - Finding Elements

React Native Testing Library provides different ways to find elements:

#### `getBy*` - Must Exist (Throws if Not Found)

```typescript
const { getByText } = render(<Button>Click me</Button>);
const button = getByText('Click me');
```

**Use when**: You're sure the element exists. Throws error if not found.

#### `queryBy*` - May Not Exist (Returns null)

```typescript
const { queryByText } = render(<Button>Click me</Button>);
const button = queryByText('Click me'); // null if not found
```

**Use when**: Testing if something is NOT present.

#### `findBy*` - Async (Waits for Element)

```typescript
const { findByText } = render(<AsyncComponent />);
const element = await findByText('Loaded!');
```

**Use when**: Element appears after async operation (API call, timeout, etc.).

### 2. Common Queries

| Query | What It Finds | Example |
|-------|--------------|---------|
| `getByText` | Text content | `getByText('Submit')` |
| `getByTestId` | Test ID | `getByTestId('submit-button')` |
| `getByPlaceholderText` | Placeholder text | `getByPlaceholderText('Enter name')` |
| `getByRole` | Accessibility role | `getByRole('button')` |
| `getByLabelText` | Label text | `getByLabelText('Email')` |

**Most common**: `getByText` and `getByTestId`

### 3. User Interactions

Simulate what users do:

```typescript
import { fireEvent } from '@testing-library/react-native';

// Press a button
fireEvent.press(getByText('Submit'));

// Type in input
fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');

// Scroll
fireEvent.scroll(getByTestId('scroll-view'), { nativeEvent: { contentOffset: { y: 100 } } });
```

**Think of it as**: Simulating user actions in your tests.

## Basic Example

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

test('calls onPress when button is pressed', () => {
  // Arrange: Set up the test
  const onPressMock = jest.fn();
  const { getByText } = render(<Button onPress={onPressMock}>Click me</Button>);

  // Act: Simulate user action
  fireEvent.press(getByText('Click me'));

  // Assert: Verify the result
  expect(onPressMock).toHaveBeenCalledTimes(1);
});
```

**Breaking it down**:
1. **Arrange**: Create mock function, render component
2. **Act**: Simulate button press
3. **Assert**: Check if function was called

## Testing Philosophy: User-Centric

### What Users Care About

Users care about:
- ✅ Can I see the button?
- ✅ Can I press it?
- ✅ Does it do what I expect?
- ✅ Is the text readable?

Users DON'T care about:
- ❌ Internal component state
- ❌ Which hooks are used
- ❌ Implementation details
- ❌ Private methods

### Example: Testing a Login Form

**❌ Implementation-focused test:**
```typescript
test('form has email state', () => {
  const form = render(<LoginForm />);
  expect(form.instance().state.email).toBe('');
});
```

**✅ User-focused test:**
```typescript
test('user can enter email and submit', () => {
  const onSubmit = jest.fn();
  const { getByPlaceholderText, getByText } = render(
    <LoginForm onSubmit={onSubmit} />
  );

  // User types email
  fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');

  // User presses submit
  fireEvent.press(getByText('Submit'));

  // Verify form was submitted
  expect(onSubmit).toHaveBeenCalledWith({ email: 'user@example.com' });
});
```

**Why the second is better**: Tests what users actually do, not internal details.

## Common Patterns

### Pattern 1: Testing Button Press

```typescript
test('button calls onPress', () => {
  const onPress = jest.fn();
  const { getByText } = render(<Button onPress={onPress}>Click</Button>);
  
  fireEvent.press(getByText('Click'));
  expect(onPress).toHaveBeenCalled();
});
```

### Pattern 2: Testing Input Changes

```typescript
test('input updates value', () => {
  const { getByPlaceholderText } = render(<TextInput placeholder="Name" />);
  const input = getByPlaceholderText('Name');
  
  fireEvent.changeText(input, 'John');
  expect(input.props.value).toBe('John');
});
```

### Pattern 3: Testing Conditional Rendering

```typescript
test('shows loading state', () => {
  const { getByText } = render(<Button loading>Submit</Button>);
  expect(getByText('Loading...')).toBeTruthy();
});
```

### Pattern 4: Testing Async Updates

```typescript
test('shows data after loading', async () => {
  const { findByText } = render(<DataComponent />);
  const data = await findByText('Data loaded');
  expect(data).toBeTruthy();
});
```

## Best Practices

### 1. Use Test IDs Sparingly

**Prefer**: Finding by text, role, or label
```typescript
// Good: Find by text (what user sees)
getByText('Submit')
```

**Use test IDs**: When text/role doesn't work
```typescript
// OK: When text changes or is dynamic
getByTestId('submit-button')
```

### 2. Test User Flows, Not Components in Isolation

**Better**: Test complete user interactions
```typescript
test('user can complete login flow', () => {
  // Test the entire flow, not just one component
});
```

### 3. Use Descriptive Queries

**Good**: Clear what you're looking for
```typescript
getByText('Submit Form')
getByPlaceholderText('Enter your email')
```

**Bad**: Vague or implementation-focused
```typescript
getByTestId('btn-1')
getByText('Click')
```

## Installation

```bash
npm install --save-dev @testing-library/react-native
```

**Note**: React Native Testing Library requires:
- `react-test-renderer` (usually included with React Native)
- Jest (for running tests)

## Quick Reference

### Import
```typescript
import { render, fireEvent } from '@testing-library/react-native';
```

### Render Component
```typescript
const { getByText } = render(<MyComponent />);
```

### Find Elements
```typescript
getByText('Text')           // Must exist
queryByText('Text')         // May not exist
findByText('Text')          // Async
```

### User Interactions
```typescript
fireEvent.press(element)           // Button press
fireEvent.changeText(input, 'text') // Input change
fireEvent.scroll(scrollView, {...}) // Scroll
```

## Quick Summary

- **Philosophy**: Test like a user, not like a developer
- **Queries**: `getBy*`, `queryBy*`, `findBy*` to find elements
- **Interactions**: `fireEvent` to simulate user actions
- **Focus**: Test behavior, not implementation
- **Goal**: Write tests that give confidence your app works for users

## Next Steps

Now let's learn about [TypeScript configuration](./typescript-configuration.md) for testing.

