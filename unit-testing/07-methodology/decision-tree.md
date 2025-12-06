# Testing Decision Tree

## How to Approach Any Testing Task

Use this decision tree to determine how to test any piece of code.

## Start Here

```
What are you testing?
│
├─ Function/Utility?
│  │
│  ├─ Pure function? (no side effects)
│  │  └─ Test inputs → outputs
│  │     • Normal cases
│  │     • Edge cases (empty, null, zero)
│  │     • Error cases
│  │
│  └─ Has side effects? (API, storage, etc.)
│     └─ Mock dependencies
│        • Test with mocked dependencies
│        • Test success and error cases
│
├─ React Native Component?
│  │
│  ├─ Simple component? (just renders)
│  │  └─ Test rendering
│  │     • Renders correctly
│  │     • Props work
│  │     • Conditional rendering
│  │
│  ├─ Interactive component? (buttons, forms)
│  │  └─ Test interactions
│  │     • User actions (press, type)
│  │     • State changes
│  │     • Callbacks called
│  │
│  └─ Async component? (loads data)
│     └─ Test async behavior
│        • Loading state
│        • Success state
│        • Error state
│        • Mock API calls
│
└─ Custom Hook?
   │
   ├─ State hook?
   │  └─ Test state management
   │     • Initial state
   │     • State updates
   │     • Use renderHook + act
   │
   └─ Effect hook? (side effects)
      └─ Test side effects
         • Effect runs
         • Cleanup works
         • Mock dependencies
```

## Detailed Decision Paths

### Path 1: Testing a Function

```
Is it a pure function?
│
├─ Yes → Test directly
│  • Call function with inputs
│  • Check output
│  • Test edge cases
│
└─ No → Mock dependencies
   • Mock external calls
   • Test with mocks
   • Test error cases
```

**Example**:
```typescript
// Pure function - test directly
function add(a: number, b: number): number {
  return a + b;
}

// Has dependencies - mock them
async function fetchUser(id: string) {
  const response = await api.get(`/users/${id}`);
  return response.data;
}
```

### Path 2: Testing a Component

```
What does the component do?
│
├─ Just renders? → Test rendering
│  • Does it render?
│  • Are props used correctly?
│  • Conditional rendering?
│
├─ User interactions? → Test interactions
│  • Can user press button?
│  • Can user type in input?
│  • Do callbacks fire?
│
└─ Loads data? → Test async
   • Loading state?
   • Success state?
   • Error state?
   • Mock API calls
```

**Example**:
```typescript
// Just renders
const Title = ({ text }) => <Text>{text}</Text>;
// Test: Does it render text?

// Interactive
const Button = ({ onPress }) => <TouchableOpacity onPress={onPress}>Click</TouchableOpacity>;
// Test: Does onPress fire when pressed?

// Async
const UserList = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => { fetchUsers().then(setUsers); }, []);
  return users.map(u => <Text>{u.name}</Text>);
};
// Test: Does it show users after loading?
```

### Path 3: Testing a Hook

```
What type of hook?
│
├─ State hook? → Test state
│  • Initial state
│  • State updates
│  • Use renderHook + act
│
└─ Effect hook? → Test effects
   • Effect runs
   • Dependencies work
   • Cleanup works
   • Mock side effects
```

**Example**:
```typescript
// State hook
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, increment: () => setCount(c => c + 1) };
}
// Test: Does count increment?

// Effect hook
function useUser(id) {
  const [user, setUser] = useState(null);
  useEffect(() => { fetchUser(id).then(setUser); }, [id]);
  return user;
}
// Test: Does it fetch user?
```

## Quick Decision Guide

### What to Test?

| Code Type | What to Test | How to Test |
|-----------|-------------|-------------|
| **Pure function** | Inputs → Outputs | Call function, check result |
| **Function with deps** | Behavior with mocks | Mock dependencies, test behavior |
| **Simple component** | Rendering | Render, check elements exist |
| **Interactive component** | User actions | Simulate interactions, check results |
| **Async component** | Loading/Success/Error | Mock API, test states |
| **State hook** | State management | Use renderHook, test state |
| **Effect hook** | Side effects | Mock dependencies, test effects |

### How to Test?

| Scenario | Approach |
|----------|----------|
| **No dependencies** | Test directly |
| **Has API calls** | Mock API, test with mocks |
| **Has storage** | Mock storage, test with mocks |
| **Has timers** | Use fake timers |
| **Has async** | Use async/await, waitFor |
| **Has state** | Use renderHook, act |

## Decision Examples

### Example 1: Format Currency Function

```
What is it? → Pure function
What to test? → Inputs → Outputs
How to test? → Call function, check result

Test cases:
- formatCurrency(100) → "$100.00"
- formatCurrency(0) → "$0.00"
- formatCurrency(-50) → "-$50.00"
```

### Example 2: Login Form Component

```
What is it? → Interactive component
What to test? → User interactions
How to test? → Simulate user actions

Test cases:
- User can type email
- User can type password
- User can submit form
- Form validates input
- Form calls onSubmit with data
```

### Example 3: useCounter Hook

```
What is it? → State hook
What to test? → State management
How to test? → renderHook + act

Test cases:
- Initial count is 0
- Increment increases count
- Decrement decreases count
- Reset sets count to initial
```

## Quick Reference

**Ask yourself**:
1. What am I testing? (function, component, hook)
2. What does it do? (pure, interactive, async)
3. What should I test? (behavior, not implementation)
4. How do I test it? (direct, mock, renderHook)

**Then**:
- Write test following AAA pattern
- Test normal, edge, and error cases
- Keep tests simple and focused
- Run tests and verify they pass

## Next Steps

Use this decision tree with the [common patterns](./common-patterns.md) to write tests efficiently.

