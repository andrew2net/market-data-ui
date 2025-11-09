# Login Page Tests

This directory contains comprehensive tests for the login page component.

## Test Setup

The testing setup includes:

- **Jest**: Testing framework
- **React Testing Library**: For component testing
- **@testing-library/user-event**: For simulating user interactions
- **@testing-library/jest-dom**: For additional Jest matchers

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The login page tests achieve **100% code coverage** and include:

### Component Rendering Tests
- ✅ Renders form elements correctly
- ✅ Displays proper form structure
- ✅ Shows validation attributes

### User Interaction Tests
- ✅ Updates email input when user types
- ✅ Updates password input when user types
- ✅ Handles form submission

### API Integration Tests
- ✅ Submits form with correct data on successful login
- ✅ Stores token in localStorage on success
- ✅ Redirects to dashboard on success
- ✅ Displays error message on login failure
- ✅ Displays generic error message when no specific error provided
- ✅ Handles network errors gracefully
- ✅ Handles unexpected errors

### State Management Tests
- ✅ Clears error message when form is resubmitted
- ✅ Maintains form state correctly

## Test Files

- `page.test.tsx` - Main test file for the login page component
- `../../test-utils.ts` - Shared testing utilities and helpers

## Mocks

The tests use the following mocks:

- **Next.js Router**: Mocked to test navigation
- **localStorage**: Mocked to test token storage
- **fetch API**: Mocked to test API calls
- **Environment Variables**: Mocked API URL

## Test Utilities

Custom test utilities are available in `src/test-utils.ts`:

- `mockLocalStorage()` - Creates localStorage mock
- `mockFetch()` - Creates fetch mock
- `createMockResponse()` - Helper for API response mocking
- `waitForApiCall()` - Helper for async API testing

## Best Practices

- Tests are isolated and don't affect each other
- All external dependencies are mocked
- Tests cover both success and error scenarios
- User interactions are tested realistically
- Async operations are properly awaited
