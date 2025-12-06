# Snapshot Testing

## What is Snapshot Testing?

**Snapshot testing** captures the output of a component and saves it as a "snapshot". Future test runs compare the current output to the snapshot.

**Think of it as**: Taking a photo of your component and checking if it changed.

## How It Works

1. **First run**: Creates a snapshot file
2. **Subsequent runs**: Compares current output to snapshot
3. **If different**: Test fails (you decide if change is intentional)

## Basic Snapshot Test

### Component

```typescript
// Button.tsx
const Button = ({ title }) => (
  <TouchableOpacity>
    <Text>{title}</Text>
  </TouchableOpacity>
);
```

### Snapshot Test

```typescript
// Button.test.tsx
import renderer from 'react-test-renderer';

test('matches snapshot', () => {
  const tree = renderer.create(<Button title="Click me" />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

**First run**: Creates `__snapshots__/Button.test.tsx.snap`
**Next runs**: Compares to snapshot

## When to Use Snapshots

### ✅ Good Use Cases

1. **UI Components**: Verify component structure doesn't change unexpectedly
2. **Configuration Objects**: Ensure config structure stays consistent
3. **Error Messages**: Check error format doesn't change
4. **Serialized Data**: Verify data structure

### ❌ Bad Use Cases

1. **Large Snapshots**: Hard to review changes
2. **Frequently Changing UI**: Too many updates
3. **Implementation Details**: Should test behavior instead
4. **Third-Party Components**: They have their own tests

## Snapshot Example

### Component

```typescript
// UserCard.tsx
const UserCard = ({ user }) => (
  <View testID="user-card">
    <Text testID="name">{user.name}</Text>
    <Text testID="email">{user.email}</Text>
  </View>
);
```

### Test

```typescript
// UserCard.test.tsx
import renderer from 'react-test-renderer';

test('matches snapshot', () => {
  const user = { name: 'John Doe', email: 'john@example.com' };
  const tree = renderer.create(<UserCard user={user} />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

### Generated Snapshot

```javascript
// __snapshots__/UserCard.test.tsx.snap
exports[`matches snapshot 1`] = `
<View
  testID="user-card"
>
  <Text
    testID="name"
  >
    John Doe
  </Text>
  <Text
    testID="email"
  >
    john@example.com
  </Text>
</View>
`;
```

## Updating Snapshots

### When Test Fails

If component changes, snapshot test fails:

```
Snapshot test failed: Component output changed
```

### Update Snapshot

```bash
# Update all snapshots
npm test -- -u

# Update specific file
npm test -- Button.test.tsx -u
```

**Important**: Review changes before updating!

## Snapshot Best Practices

### 1. Use Sparingly

```typescript
// ✅ Good: Snapshot for stable component
test('UserCard matches snapshot', () => {
  const tree = renderer.create(<UserCard user={mockUser} />).toJSON();
  expect(tree).toMatchSnapshot();
});

// ❌ Bad: Snapshot for frequently changing component
test('DynamicList matches snapshot', () => {
  // This changes often - not good for snapshot
});
```

### 2. Keep Snapshots Small

```typescript
// ✅ Good: Small, focused snapshot
test('Button matches snapshot', () => {
  const tree = renderer.create(<Button title="Click" />).toJSON();
  expect(tree).toMatchSnapshot();
});

// ❌ Bad: Large snapshot
test('EntireApp matches snapshot', () => {
  // Too large - hard to review
});
```

### 3. Test Multiple States

```typescript
test('Button matches snapshot when enabled', () => {
  const tree = renderer.create(<Button title="Click" disabled={false} />).toJSON();
  expect(tree).toMatchSnapshot();
});

test('Button matches snapshot when disabled', () => {
  const tree = renderer.create(<Button title="Click" disabled={true} />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

### 4. Don't Rely Only on Snapshots

```typescript
// ✅ Good: Snapshot + behavior tests
test('matches snapshot', () => {
  const tree = renderer.create(<Button />).toJSON();
  expect(tree).toMatchSnapshot();
});

test('calls onPress when pressed', () => {
  const onPress = jest.fn();
  const { getByText } = render(<Button onPress={onPress} />);
  fireEvent.press(getByText('Click'));
  expect(onPress).toHaveBeenCalled();
});

// ❌ Bad: Only snapshot, no behavior tests
test('matches snapshot', () => {
  // Only testing structure, not behavior
});
```

## Snapshot vs Regular Tests

### Snapshot Test

```typescript
test('matches snapshot', () => {
  const tree = renderer.create(<Component />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

**Pros**:
- Catches unexpected changes
- Easy to write
- Shows what changed

**Cons**:
- Can be brittle
- Hard to review large changes
- Doesn't test behavior

### Regular Test

```typescript
test('renders correctly', () => {
  const { getByText } = render(<Component />);
  expect(getByText('Hello')).toBeTruthy();
});
```

**Pros**:
- Tests behavior
- More maintainable
- Clearer intent

**Cons**:
- More code to write
- Might miss structural changes

**Recommendation**: Use both - snapshots for structure, regular tests for behavior.

## Snapshot Testing with React Native Testing Library

React Native Testing Library doesn't use snapshots by default, but you can:

```typescript
import { render } from '@testing-library/react-native';

test('matches snapshot', () => {
  const { toJSON } = render(<Component />);
  expect(toJSON()).toMatchSnapshot();
});
```

## Common Patterns

### Pattern 1: Multiple Props

```typescript
test.each([
  { title: 'Click', disabled: false },
  { title: 'Submit', disabled: true },
])('matches snapshot with %o', (props) => {
  const tree = renderer.create(<Button {...props} />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

### Pattern 2: Different States

```typescript
test('matches snapshot when loading', () => {
  const tree = renderer.create(<Component loading />).toJSON();
  expect(tree).toMatchSnapshot();
});

test('matches snapshot when error', () => {
  const tree = renderer.create(<Component error="Failed" />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

## When NOT to Use Snapshots

### ❌ Don't Use For:

1. **Frequently changing UI**: Too many updates
2. **Large components**: Hard to review
3. **Third-party components**: They have tests
4. **Implementation details**: Test behavior instead
5. **Dynamic content**: Content changes often

### ✅ Use For:

1. **Stable UI components**: Structure rarely changes
2. **Error messages**: Format should be consistent
3. **Configuration**: Structure should stay the same
4. **Small components**: Easy to review changes

## Quick Reference

**Snapshot testing**:
- `toMatchSnapshot()` - Create/compare snapshot
- `-u` flag - Update snapshots
- Use sparingly for stable components
- Combine with behavior tests

**Best practices**:
- Keep snapshots small
- Review changes before updating
- Don't rely only on snapshots
- Test multiple states

## Next Steps

Now let's learn about [test coverage](./test-coverage.md).

