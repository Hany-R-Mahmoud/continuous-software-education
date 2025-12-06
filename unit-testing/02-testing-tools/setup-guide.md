# Complete Setup Guide

## Step-by-Step Installation

Follow these steps to set up unit testing in your TypeScript React Native project.

## Prerequisites

- Node.js installed (v14 or higher)
- A React Native project (Expo or bare React Native)
- npm or yarn package manager

## Step 1: Install Dependencies

### For React Native Projects

```bash
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  @testing-library/react-native \
  react-test-renderer
```

**What each package does**:
- `jest`: Testing framework
- `@types/jest`: TypeScript types for Jest
- `ts-jest`: TypeScript transformer for Jest
- `@testing-library/react-native`: Testing utilities for React Native
- `react-test-renderer`: Required by React Native Testing Library

### For Expo Projects

Expo includes Jest by default, but you may need to add:

```bash
npm install --save-dev \
  @types/jest \
  @testing-library/react-native
```

## Step 2: Configure Jest

### Option A: Configuration in package.json (Recommended)

Add this to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "preset": "react-native",
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "testMatch": [
      "**/__tests__/**/*.test.ts?(x)",
      "**/?(*.)+(spec|test).ts?(x)"
    ],
    "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    },
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/*.stories.{ts,tsx}"
    ]
  }
}
```

**Breaking it down**:
- `preset: "react-native"`: Uses React Native's Jest preset
- `transform`: Transforms TypeScript files with ts-jest
- `testMatch`: Which files Jest considers tests
- `moduleFileExtensions`: File types Jest understands
- `moduleNameMapper`: Map path aliases (if you use `@/` imports)
- `collectCoverageFrom`: Which files to include in coverage reports

### Option B: Separate jest.config.js File

Create `jest.config.js` in your project root:

```javascript
module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
```

## Step 3: Configure TypeScript

Ensure your `tsconfig.json` includes test files:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["esnext"],
    "jsx": "react-native",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": [
    "src/**/*",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/__tests__/**/*"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

## Step 4: Create Your First Test

Create a test file to verify everything works:

### Create a Simple Function

`src/utils/math.ts`:
```typescript
export function add(a: number, b: number): number {
  return a + b;
}
```

### Create a Test File

`src/utils/math.test.ts`:
```typescript
import { add } from './math';

describe('add function', () => {
  test('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('adds negative numbers', () => {
    expect(add(-2, -3)).toBe(-5);
  });

  test('adds zero', () => {
    expect(add(5, 0)).toBe(5);
  });
});
```

## Step 5: Run Your First Test

```bash
npm test
```

**Expected output**:
```
PASS  src/utils/math.test.ts
  add function
    ✓ adds two positive numbers (2ms)
    ✓ adds negative numbers (1ms)
    ✓ adds zero (1ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

**If you see this**: ✅ Setup is working!

## Step 6: Test a React Native Component

### Create a Simple Component

`src/components/Button.tsx`:
```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
}

export const Button: React.FC<ButtonProps> = ({ onPress, title }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  text: {
    color: 'white',
    textAlign: 'center',
  },
});
```

### Create Component Test

`src/components/Button.test.tsx`:
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button component', () => {
  test('renders title correctly', () => {
    const { getByText } = render(<Button onPress={jest.fn()} title="Click me" />);
    expect(getByText('Click me')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button onPress={onPressMock} title="Click me" />);
    
    fireEvent.press(getByText('Click me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
```

### Run Component Test

```bash
npm test Button.test.tsx
```

**Expected output**: Tests pass ✅

## Step 7: Configure Test Scripts (Optional but Recommended)

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

**What each does**:
- `test`: Run all tests once
- `test:watch`: Watch mode - reruns tests on file changes
- `test:coverage`: Run tests with coverage report
- `test:ci`: Optimized for CI/CD (continuous integration)

## Troubleshooting

### Issue: "Cannot find module '@testing-library/react-native'"

**Solution**: Make sure you installed it:
```bash
npm install --save-dev @testing-library/react-native
```

### Issue: "SyntaxError: Unexpected token"

**Solution**: Check Jest is transforming TypeScript files. Verify `transform` in Jest config:
```json
"transform": {
  "^.+\\.tsx?$": "ts-jest"
}
```

### Issue: "TypeError: Cannot read property 'render' of undefined"

**Solution**: Make sure `react-test-renderer` is installed:
```bash
npm install --save-dev react-test-renderer
```

### Issue: Tests run but can't find components

**Solution**: Check `moduleNameMapper` if using path aliases:
```json
"moduleNameMapper": {
  "^@/(.*)$": "<rootDir>/src/$1"
}
```

### Issue: TypeScript errors in test files

**Solution**: Ensure `tsconfig.json` includes test files:
```json
"include": ["**/*.test.ts", "**/*.test.tsx"]
```

## Verification Checklist

After setup, verify:

- [ ] `npm test` runs without errors
- [ ] Simple function test passes
- [ ] Component test passes
- [ ] TypeScript types work in tests
- [ ] Watch mode works (`npm test -- --watch`)
- [ ] Coverage report works (`npm test -- --coverage`)

## Project Structure

Your project should look like:

```
my-app/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   └── utils/
│       ├── math.ts
│       └── math.test.ts
├── package.json
├── tsconfig.json
└── jest.config.js (optional)
```

## Next Steps

Congratulations! Your testing environment is set up. Now you're ready to:

1. Learn about [testing utility functions](../03-testing-utilities/testing-pure-functions.md)
2. Practice writing tests
3. Build your testing methodology

## Quick Reference

**Run tests**: `npm test`
**Watch mode**: `npm test -- --watch`
**Coverage**: `npm test -- --coverage`
**Single file**: `npm test -- filename.test.ts`

**Test file naming**: `*.test.ts` or `*.test.tsx`
**Test location**: Next to source files or in `__tests__` folder

