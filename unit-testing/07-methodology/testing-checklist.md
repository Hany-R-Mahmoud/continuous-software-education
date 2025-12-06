# Testing Checklist

## Your Testing Checklist

Use this checklist whenever you write tests. It ensures you cover all important aspects.

## Before Writing Tests

- [ ] Understand what the code does
- [ ] Identify what should be tested
- [ ] Determine test approach (unit, integration, etc.)
- [ ] Set up test file next to source file

## Writing Tests

### Structure

- [ ] Use `describe` to group related tests
- [ ] Use descriptive test names
- [ ] Follow AAA pattern (Arrange, Act, Assert)
- [ ] Keep tests independent (no dependencies between tests)

### Test Cases

- [ ] Test normal/typical cases
- [ ] Test edge cases (empty, null, zero, boundaries)
- [ ] Test error cases (invalid input, failures)
- [ ] Test different states (loading, success, error)

### Code Quality

- [ ] Tests are simple and focused
- [ ] One assertion per test (or related assertions)
- [ ] Test behavior, not implementation
- [ ] Use realistic test data

## For Functions/Utilities

- [ ] Test with normal inputs
- [ ] Test with edge cases (empty, null, zero)
- [ ] Test with invalid inputs
- [ ] Test return values
- [ ] Test error handling (if applicable)

## For React Native Components

- [ ] Test component renders
- [ ] Test props are used correctly
- [ ] Test user interactions (press, type, scroll)
- [ ] Test conditional rendering
- [ ] Test different states (loading, error, success)
- [ ] Test accessibility (if applicable)

## For Custom Hooks

- [ ] Test initial state
- [ ] Test state updates
- [ ] Test return values
- [ ] Test side effects (if applicable)
- [ ] Use `renderHook` and `act`

## For Async Code

- [ ] Use `async/await` in tests
- [ ] Mock external dependencies (API, storage)
- [ ] Test success cases
- [ ] Test error cases
- [ ] Use `waitFor` or `findBy*` for async elements

## After Writing Tests

- [ ] Run tests (`npm test`)
- [ ] All tests pass
- [ ] Check test coverage (aim for 80%+)
- [ ] Review test names (are they clear?)
- [ ] Ensure tests are maintainable

## Code Review Checklist

When reviewing tests:

- [ ] Tests are easy to understand
- [ ] Test names describe what's being tested
- [ ] Tests are independent
- [ ] Edge cases are covered
- [ ] Error cases are tested
- [ ] No unnecessary mocks
- [ ] Tests are fast
- [ ] Coverage is adequate

## Quick Checklist by Type

### Pure Function

- [ ] Normal inputs → expected output
- [ ] Edge cases (empty, null, zero)
- [ ] Invalid inputs → error handling
- [ ] Return type is correct

### Component

- [ ] Renders correctly
- [ ] Props work as expected
- [ ] User interactions work
- [ ] Different states render correctly
- [ ] Error states handled

### Hook

- [ ] Initial state correct
- [ ] State updates work
- [ ] Return values correct
- [ ] Side effects work (if any)

### Async Function

- [ ] Success case works
- [ ] Error case handled
- [ ] Loading state (if applicable)
- [ ] Dependencies mocked

## Common Mistakes to Avoid

- [ ] Testing implementation details
- [ ] Tests depend on each other
- [ ] Vague test names
- [ ] Missing edge cases
- [ ] Not testing error cases
- [ ] Over-mocking
- [ ] Testing third-party code
- [ ] Slow tests (real network calls)

## Quick Reference

**Always test**:
- Normal cases
- Edge cases
- Error cases
- Different states

**Always check**:
- Tests pass
- Tests are independent
- Test names are clear
- Coverage is adequate

## Next Steps

Use this checklist with the [decision tree](./decision-tree.md) to approach any testing task.

