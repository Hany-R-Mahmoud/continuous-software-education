# What is Unit Testing?

## Simple Definition

**Unit testing** is the practice of writing small, automated tests that verify individual pieces of your code work correctly in isolation.

Think of it like this: If your code is a car, unit tests check each part (engine, wheels, brakes) separately before testing the whole car.

## Breaking It Down

### What is a "Unit"?

A **unit** is the smallest testable part of your code:
- A single function
- A single method
- A single component (in React Native)
- A single utility function

**Key Point**: A unit is tested **alone**, without depending on other parts of your application.

### What is a "Test"?

A **test** is a piece of code that:
1. Sets up a scenario
2. Runs your code with specific inputs
3. Checks if the result matches what you expect

## Real-World Analogy

Imagine you're building a calculator app:

- **Unit Test**: Test the `add(2, 3)` function to make sure it returns `5`
- **NOT a Unit Test**: Testing the entire calculator app with all buttons and display

Unit tests focus on one small piece at a time.

## Example: Before Understanding Tests

```typescript
// utils.ts - A function you wrote
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// You manually test it in your app:
// - Open app
// - Navigate to screen
// - Enter amount
// - Check if it shows correctly
// - Repeat for different amounts
```

**Problem**: This is slow, error-prone, and you can't test everything.

## Example: With Unit Testing

```typescript
// utils.test.ts - Automated test
import { formatCurrency } from './utils';

test('formats currency correctly', () => {
  const result = formatCurrency(100);
  expect(result).toBe('$100.00');
});

test('formats decimal amounts', () => {
  const result = formatCurrency(99.9);
  expect(result).toBe('$99.90');
});

test('formats zero correctly', () => {
  const result = formatCurrency(0);
  expect(result).toBe('$0.00');
});
```

**Benefit**: Run all tests instantly with one command. Test many scenarios automatically.

## Key Characteristics of Unit Tests

1. **Fast**: Run in milliseconds, not seconds
2. **Isolated**: Don't depend on other tests or external systems
3. **Repeatable**: Same input always gives same result
4. **Automated**: Run with a command, no manual clicking
5. **Specific**: Test one thing at a time

## What Unit Tests Are NOT

- ❌ **Not integration tests**: Don't test how multiple parts work together
- ❌ **Not end-to-end tests**: Don't test the entire app flow
- ❌ **Not manual testing**: Don't require you to click through the app
- ❌ **Not debugging**: Don't help you find bugs (they help prevent them)

## Mental Model to Remember

```
Unit Test = Recipe Verification

1. You have a recipe (your function)
2. You follow the recipe with specific ingredients (inputs)
3. You check if the result matches what the recipe says (assertion)
4. If it matches → Test passes ✅
5. If it doesn't → Test fails ❌ (something is wrong with the recipe)
```

## Quick Summary

- **Unit**: Smallest testable piece of code
- **Test**: Code that verifies your code works correctly
- **Unit Test**: Automated verification of one small piece of code
- **Goal**: Catch bugs early, before users see them

## Next Steps

Now that you understand what unit testing is, let's explore [why we write tests](./why-test.md) and the benefits they provide.

