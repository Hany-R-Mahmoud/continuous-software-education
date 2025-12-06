# TypeScript Configuration for Testing

## Why TypeScript in Tests?

TypeScript provides:
- **Type Safety**: Catch errors before running tests
- **Better Autocomplete**: IDE knows what methods are available
- **Documentation**: Types show what functions expect
- **Refactoring Safety**: Rename with confidence

## Basic Setup

### 1. Install TypeScript Dependencies

```bash
npm install --save-dev typescript @types/jest @types/react @types/react-native
```

**What each does**:
- `typescript`: TypeScript compiler
- `@types/jest`: Type definitions for Jest
- `@types/react`: Type definitions for React
- `@types/react-native`: Type definitions for React Native

### 2. Configure Jest for TypeScript

Jest needs to understand TypeScript. Use `ts-jest`:

```bash
npm install --save-dev ts-jest
```

**What it does**: Transforms TypeScript files so Jest can run them.

### 3. Jest Configuration

Add to `package.json`:

```json
{
  "jest": {
    "preset": "react-native",
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "testMatch": [
      "**/__tests__/**/*.test.ts?(x)",
      "**/?(*.)+(spec|test).ts?(x)"
    ],
    "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"]
  }
}
```

**Breaking it down**:
- `preset: "react-native"`: React Native-specific Jest config
- `transform`: Use ts-jest to transform `.ts` and `.tsx` files
- `testMatch`: Which files are test files
- `moduleFileExtensions`: File types Jest understands

## TypeScript Configuration (tsconfig.json)

Your `tsconfig.json` should include:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "jsx": "react-native",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*",
    "**/*.test.ts",
    "**/*.test.tsx"
  ]
}
```

**Key settings**:
- `jsx: "react-native"`: Handle React Native JSX
- `strict: true`: Enable strict type checking (recommended)
- `include`: Include test files in TypeScript compilation

## Writing Typed Tests

### Example: Typed Function Test

```typescript
// utils.ts
export function add(a: number, b: number): number {
  return a + b;
}

// utils.test.ts
import { add } from './utils';

test('adds two numbers', () => {
  const result: number = add(2, 3); // TypeScript knows result is number
  expect(result).toBe(5);
});
```

**Benefit**: TypeScript catches type errors:
```typescript
// TypeScript error: Argument of type 'string' is not assignable to parameter of type 'number'
add('2', 3); // ❌ Error caught before running test
```

### Example: Typed Component Test

```typescript
// Button.tsx
interface ButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ onPress, title, disabled }) => {
  // ...
};

// Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

test('calls onPress when pressed', () => {
  const onPress: () => void = jest.fn(); // TypeScript knows the type
  const { getByText } = render(
    <Button onPress={onPress} title="Click me" />
  );
  
  fireEvent.press(getByText('Click me'));
  expect(onPress).toHaveBeenCalled();
});
```

**Benefit**: TypeScript ensures you pass correct props:
```typescript
// TypeScript error: Property 'title' is missing
<Button onPress={jest.fn()} /> // ❌ Error caught
```

## Typing Jest Mocks

### Mock Functions

```typescript
// TypeScript knows this is a Jest mock function
const mockFn: jest.Mock = jest.fn();

// Or use jest.fn() directly (TypeScript infers the type)
const onPress = jest.fn();
```

### Mocking Modules

```typescript
// Mock a module with types
jest.mock('./api', () => ({
  fetchUser: jest.fn<Promise<User>, [string]>(),
  //              ^return type    ^parameters
}));

import { fetchUser } from './api';

test('fetches user', async () => {
  const mockUser: User = { id: '1', name: 'John' };
  (fetchUser as jest.Mock).mockResolvedValue(mockUser);
  
  const user = await fetchUser('1');
  expect(user).toEqual(mockUser);
});
```

## Common TypeScript Patterns in Tests

### Pattern 1: Typed Test Data

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const mockUser: User = {
  id: '1',
  name: 'John',
  email: 'john@example.com',
};

test('handles user data', () => {
  // TypeScript ensures mockUser matches User interface
  expect(processUser(mockUser)).toBeDefined();
});
```

### Pattern 2: Typed Event Handlers

```typescript
test('handles button press', () => {
  const handlePress = (): void => {
    // TypeScript knows this returns void
  };
  
  const { getByText } = render(<Button onPress={handlePress} />);
  fireEvent.press(getByText('Click'));
});
```

### Pattern 3: Typed Async Tests

```typescript
test('fetches data', async (): Promise<void> => {
  // TypeScript knows this is an async test
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

## Type Errors in Tests

TypeScript will catch errors in your tests:

```typescript
// ❌ Type error: Property 'invalidProp' does not exist
<Button invalidProp="test" />

// ❌ Type error: Argument of type 'string' is not assignable to type 'number'
expect(add('2', 3)).toBe(5);

// ❌ Type error: Property 'nonExistent' does not exist on type
expect(result.nonExistent).toBeDefined();
```

**Benefit**: Catch errors before running tests!

## IDE Support

With TypeScript configured, your IDE will:
- ✅ Autocomplete Jest methods (`expect`, `describe`, `test`)
- ✅ Autocomplete React Native Testing Library queries
- ✅ Show type errors in real-time
- ✅ Provide better refactoring support

## Quick Setup Checklist

- [ ] Install TypeScript dependencies
- [ ] Install `ts-jest`
- [ ] Configure Jest in `package.json`
- [ ] Ensure `tsconfig.json` includes test files
- [ ] Write typed tests
- [ ] Enjoy type safety!

## Common Issues

### Issue: "Cannot find module" in tests

**Solution**: Check `tsconfig.json` includes test files:
```json
{
  "include": ["**/*.test.ts", "**/*.test.tsx"]
}
```

### Issue: Type errors in Jest mocks

**Solution**: Type your mocks explicitly:
```typescript
const mockFn: jest.Mock = jest.fn();
```

### Issue: React Native types not found

**Solution**: Install `@types/react-native`:
```bash
npm install --save-dev @types/react-native
```

## Quick Summary

- **Setup**: Install `ts-jest` and configure Jest
- **Benefits**: Type safety, autocomplete, better refactoring
- **Patterns**: Type your mocks, test data, and handlers
- **Result**: Catch errors before running tests

## Next Steps

Ready to set up your project? Let's go through the [complete setup guide](./setup-guide.md).

