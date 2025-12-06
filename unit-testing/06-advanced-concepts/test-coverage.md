# Test Coverage

## What is Test Coverage?

**Test coverage** measures how much of your code is tested:
- Which lines are executed by tests
- Which functions are called
- Which branches (if/else) are tested
- Which statements run

**Goal**: Ensure your tests exercise your code.

## Understanding Coverage Reports

### Coverage Metrics

1. **Statements**: Percentage of statements executed
2. **Branches**: Percentage of if/else branches tested
3. **Functions**: Percentage of functions called
4. **Lines**: Percentage of lines executed

### Example Coverage Report

```
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
utils.ts  |   85.71 |    66.67 |   100   |   85.71 |
math.ts   |  100    |   100    |   100   |  100    |
----------|---------|----------|---------|---------|
All files |   92.86 |    83.33 |   100   |   92.86 |
```

**Reading it**:
- `utils.ts`: 85.71% of statements tested, 66.67% of branches
- `math.ts`: 100% coverage (fully tested)

## Running Coverage

### Generate Coverage Report

```bash
npm test -- --coverage
```

### Coverage Output

```
PASS  src/utils.test.ts
  ✓ formats currency correctly

----------|---------|----------|---------|---------|
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
All files |   85.71 |    66.67 |   100   |   85.71 |
```

### HTML Coverage Report

```bash
npm test -- --coverage --coverageReporters=html
```

**Opens**: `coverage/index.html` - Visual coverage report

## What Coverage Means

### 100% Coverage

```typescript
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}

// math.test.ts
test('adds numbers', () => {
  expect(add(2, 3)).toBe(5);
});
```

**Result**: 100% coverage - all code is tested.

### Partial Coverage

```typescript
// utils.ts
export function formatCurrency(amount: number): string {
  if (amount < 0) {
    return `-$${Math.abs(amount).toFixed(2)}`;
  }
  return `$${amount.toFixed(2)}`;
}

// utils.test.ts
test('formats positive amount', () => {
  expect(formatCurrency(100)).toBe('$100.00');
});
```

**Coverage**: ~50% - only positive case tested, negative case not tested.

### Improving Coverage

```typescript
// Add test for negative case
test('formats negative amount', () => {
  expect(formatCurrency(-50)).toBe('-$50.00');
});
```

**Coverage**: 100% - both branches tested.

## Coverage Goals

### Common Targets

- **80%+**: Good coverage
- **90%+**: Excellent coverage
- **100%**: Perfect (but not always necessary)

**Important**: High coverage doesn't mean good tests. Focus on testing important behavior.

## Coverage Configuration

### Jest Configuration

```json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/*.stories.{ts,tsx}",
      "!src/**/__tests__/**"
    ],
    "coverageThreshold": {
      "global": {
        "statements": 80,
        "branches": 80,
        "functions": 80,
        "lines": 80
      }
    }
  }
}
```

**What it does**:
- `collectCoverageFrom`: Which files to include
- `coverageThreshold`: Minimum coverage required

## Reading Coverage Reports

### Statement Coverage

```typescript
// utils.ts
export function process(value: number): string {
  const doubled = value * 2;        // ✓ Covered
  if (doubled > 10) {              // ✓ Covered
    return 'large';                // ✓ Covered
  }
  return 'small';                  // ✗ Not covered
}

// Test only covers doubled > 10 case
test('handles large values', () => {
  expect(process(10)).toBe('large');
});
```

**Coverage**: 75% statements (3 of 4 lines)

### Branch Coverage

```typescript
// utils.ts
export function check(value: number): string {
  if (value > 10) {        // Branch 1: true ✓, false ✗
    return 'high';
  } else if (value < 0) {  // Branch 2: true ✗, false ✓
    return 'negative';
  }
  return 'normal';         // ✓ Covered
}

// Test only covers value > 10
test('handles high values', () => {
  expect(check(20)).toBe('high');
});
```

**Coverage**: 33% branches (1 of 3 branches tested)

## Improving Coverage

### Identify Untested Code

1. Run coverage report
2. Find files with low coverage
3. Identify untested branches/statements
4. Write tests for missing cases

### Example: Improving Coverage

```typescript
// Current: 50% coverage
export function validateEmail(email: string): boolean {
  if (!email) return false;        // ✗ Not tested
  return email.includes('@');      // ✓ Tested
}

// Test
test('validates email', () => {
  expect(validateEmail('user@example.com')).toBe(true);
});

// Add missing test
test('returns false for empty email', () => {
  expect(validateEmail('')).toBe(false);
});

// Now: 100% coverage
```

## Coverage Best Practices

### 1. Don't Obsess Over 100%

```typescript
// ❌ Bad: Testing trivial code just for coverage
test('getter returns value', () => {
  expect(obj.getValue()).toBe('value');
});

// ✅ Good: Focus on important behavior
test('validates user input correctly', () => {
  // Test important logic
});
```

### 2. Focus on Critical Code

**High priority**:
- Business logic
- Validation
- Error handling
- User-facing features

**Lower priority**:
- Simple getters/setters
- Trivial utilities
- Third-party wrappers

### 3. Use Coverage to Find Gaps

Coverage helps identify:
- Untested error cases
- Missing edge cases
- Unused code paths

### 4. Review Coverage Regularly

- Run coverage in CI/CD
- Review reports periodically
- Improve coverage gradually

## Coverage Tools

### Jest Coverage

Built into Jest:
```bash
npm test -- --coverage
```

### Coverage Reports

- **Terminal**: Quick overview
- **HTML**: Detailed visual report
- **LCOV**: For CI/CD integration

## Common Coverage Scenarios

### Scenario 1: Missing Edge Cases

```typescript
// Low coverage: Missing edge cases
export function divide(a: number, b: number): number {
  return a / b;  // Missing: b === 0 case
}

// Improve: Add edge case test
test('throws error when dividing by zero', () => {
  expect(() => divide(10, 0)).toThrow();
});
```

### Scenario 2: Untested Error Handling

```typescript
// Low coverage: Error path not tested
export async function fetchData() {
  try {
    return await api.get();
  } catch (error) {  // ✗ Not tested
    throw new Error('Failed');
  }
}

// Improve: Test error case
test('handles API error', async () => {
  jest.spyOn(api, 'get').mockRejectedValue(new Error());
  await expect(fetchData()).rejects.toThrow('Failed');
});
```

## Quick Reference

**Coverage metrics**:
- Statements: Lines executed
- Branches: If/else paths tested
- Functions: Functions called
- Lines: Lines executed

**Running coverage**:
- `npm test -- --coverage` - Generate report
- `--coverageReporters=html` - HTML report

**Best practices**:
- Aim for 80%+ coverage
- Focus on important code
- Use coverage to find gaps
- Don't obsess over 100%

## Summary

You've learned:
- What coverage measures
- How to read coverage reports
- How to improve coverage
- Best practices for coverage

**Remember**: High coverage is good, but good tests are better than high coverage numbers.

## Next Steps

You've completed the advanced concepts! Ready to build your methodology? Let's move to [Step 7: Your Solid Methodology](../07-methodology/testing-checklist.md).

