# Testing Guide - Content Generator Dashboard

**Last Updated**: 2025-10-02

---

## Table of Contents

- [Overview](#overview)
- [Testing Strategy](#testing-strategy)
- [Setup](#setup)
- [Unit Testing](#unit-testing)
- [Component Testing](#component-testing)
- [Integration Testing](#integration-testing)
- [E2E Testing](#e2e-testing)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)
- [Continuous Integration](#continuous-integration)

---

## Overview

### Testing Philosophy

**Goals**:

- Catch bugs before production
- Enable confident refactoring
- Document expected behavior
- Improve code quality

**Principles**:

- Write tests first (TDD when practical)
- Test behavior, not implementation
- Keep tests simple and focused
- Maintain test independence

### Testing Pyramid

```
      /\
     /E2E\      10% - Full user workflows
    /------\
   /Integration\ 30% - Component integration
  /------------\
 /    Unit      \ 60% - Functions, hooks, utilities
-----------------
```

**Target Coverage**: >80% overall

---

## Testing Strategy

### What to Test

**✅ Do Test**:

- Public APIs and interfaces
- User interactions
- Edge cases and error states
- Business logic
- Data transformations
- Accessibility

**❌ Don't Test**:

- Implementation details
- Third-party libraries
- Trivial code (getters/setters)
- Static content

### Testing Levels

**Unit Tests** (60%):

- Pure functions
- Custom hooks
- Utility functions
- Simple components

**Integration Tests** (30%):

- Component interactions
- API integration
- Form submissions
- State management

**E2E Tests** (10%):

- Critical user flows
- Happy paths
- Error scenarios

---

## Setup

### Test Environment

**Installed** (already in package.json):

- **Jest** - Test runner
- **@testing-library/react** - Component testing
- **@testing-library/jest-dom** - DOM matchers
- **@testing-library/user-event** - User interactions
- **@types/jest** - TypeScript types

### Configuration

**jest.config.js**:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

**jest.setup.js**:

```javascript
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000';
process.env.NEXT_PUBLIC_WS_URL = 'ws://localhost:8000';
```

---

## Unit Testing

### Testing Pure Functions

**Example utility function**:

```typescript
// lib/utils/formatDate.ts
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
```

**Test**:

```typescript
// lib/utils/formatDate.test.ts
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats ISO date string correctly', () => {
    expect(formatDate('2025-10-02')).toBe('Oct 2, 2025');
  });

  it('handles different date formats', () => {
    expect(formatDate('2025-01-01')).toBe('Jan 1, 2025');
    expect(formatDate('2025-12-31')).toBe('Dec 31, 2025');
  });

  it('handles invalid dates', () => {
    expect(() => formatDate('invalid')).toThrow();
  });
});
```

### Testing Custom Hooks

**Example hook**:

```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

**Test**:

```typescript
// hooks/useLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns initial value when no stored value', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('stores value in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(window.localStorage.getItem('test')).toBe('"updated"');
    expect(result.current[0]).toBe('updated');
  });

  it('retrieves stored value on mount', () => {
    window.localStorage.setItem('test', '"stored"');

    const { result } = renderHook(() => useLocalStorage('test', 'initial'));
    expect(result.current[0]).toBe('stored');
  });
});
```

---

## Component Testing

### Testing UI Components

**Example component**:

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export default function Button({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      aria-label={label}
    >
      {label}
    </button>
  );
}
```

**Test**:

```typescript
// components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button label="Click me" onClick={onClick} />);

    await user.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant className', () => {
    render(<Button label="Test" onClick={() => {}} variant="secondary" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-secondary');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button label="Test" onClick={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button label="Test" onClick={onClick} disabled />);

    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('has accessible label', () => {
    render(<Button label="Submit form" onClick={() => {}} />);
    expect(screen.getByLabelText('Submit form')).toBeInTheDocument();
  });
});
```

### Testing Feature Components

**Example component with API**:

```typescript
// components/features/JobsList.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export default function JobsList() {
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => apiClient.listJobs(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading jobs</div>;
  if (!jobs || jobs.length === 0) return <div>No jobs found</div>;

  return (
    <ul>
      {jobs.map(job => (
        <li key={job.id}>{job.title}</li>
      ))}
    </ul>
  );
}
```

**Test**:

```typescript
// components/features/JobsList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import JobsList from './JobsList';
import { apiClient } from '@/lib/api/client';

// Mock API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    listJobs: jest.fn(),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

describe('JobsList', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state', () => {
    (apiClient.listJobs as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <QueryClientProvider client={queryClient}>
        <JobsList />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('loads and displays jobs', async () => {
    const mockJobs = [
      { id: '1', title: 'Job 1' },
      { id: '2', title: 'Job 2' },
    ];

    (apiClient.listJobs as jest.Mock).mockResolvedValue(mockJobs);

    render(
      <QueryClientProvider client={queryClient}>
        <JobsList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Job 1')).toBeInTheDocument();
      expect(screen.getByText('Job 2')).toBeInTheDocument();
    });
  });

  it('shows error state', async () => {
    (apiClient.listJobs as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    render(
      <QueryClientProvider client={queryClient}>
        <JobsList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading jobs')).toBeInTheDocument();
    });
  });

  it('shows empty state when no jobs', async () => {
    (apiClient.listJobs as jest.Mock).mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <JobsList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No jobs found')).toBeInTheDocument();
    });
  });
});
```

### Testing Forms

**Example form**:

```typescript
// components/features/LoginForm.tsx
'use client';

import { useState } from 'react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(email, password);
    } catch (err) {
      setError('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        aria-label="Email"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        aria-label="Password"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
      {error && <div role="alert">{error}</div>}
    </form>
  );
}
```

**Test**:

```typescript
// components/features/LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  it('renders form fields', () => {
    render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('submits form with email and password', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(onSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('shows validation error when fields are empty', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email and password are required'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows error when submission fails', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockRejectedValue(new Error('API Error'));

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Login failed');
  });

  it('disables button while loading', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

---

## Integration Testing

### Testing Component Integration

**Example integrated component**:

```typescript
// Test JobsList with JobStatusCard integration
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import JobsPage from '@/app/jobs/page';
import { apiClient } from '@/lib/api/client';

jest.mock('@/lib/api/client');

describe('Jobs Page Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it('displays jobs and allows filtering', async () => {
    const user = userEvent.setup();
    const mockJobs = [
      { id: '1', title: 'Job 1', status: 'completed' },
      { id: '2', title: 'Job 2', status: 'pending' },
    ];

    (apiClient.listJobs as jest.Mock).mockResolvedValue(mockJobs);

    render(
      <QueryClientProvider client={queryClient}>
        <JobsPage />
      </QueryClientProvider>
    );

    // Wait for jobs to load
    await waitFor(() => {
      expect(screen.getByText('Job 1')).toBeInTheDocument();
      expect(screen.getByText('Job 2')).toBeInTheDocument();
    });

    // Filter by status
    await user.click(screen.getByRole('button', { name: /filter/i }));
    await user.click(screen.getByText('Completed'));

    // Only completed job should show
    expect(screen.getByText('Job 1')).toBeInTheDocument();
    expect(screen.queryByText('Job 2')).not.toBeInTheDocument();
  });
});
```

---

## E2E Testing

### Setup (Playwright)

**Install** (when implementing E2E tests in Phase 3):

```bash
npm install -D @playwright/test
npx playwright install
```

**playwright.config.ts**:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Example

```typescript
// tests/e2e/generate-content.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Content Generation Flow', () => {
  test('user can generate content', async ({ page }) => {
    // Navigate to generate page
    await page.goto('/generate');

    // Fill form
    await page.fill('[name="title"]', 'Test Content');
    await page.fill('[name="description"]', 'This is a test');
    await page.selectOption('[name="template"]', 'newsletter');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.job-id')).toContainText('job-');
  });

  test('shows validation errors', async ({ page }) => {
    await page.goto('/generate');

    // Submit without filling
    await page.click('button[type="submit"]');

    // Verify errors
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('required');
  });
});
```

---

## Test Coverage

### Running Coverage

```bash
# Generate coverage report
npm run test:coverage

# Output
 PASS  components/ui/Button.test.tsx
 PASS  lib/utils/formatDate.test.ts

-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |   85.23 |    82.14 |   87.50 |   85.12 |
 components/ui/    |   92.31 |    88.89 |   90.00 |   92.00 |
  Button.tsx       |   95.00 |    90.00 |  100.00 |   94.44 |
 lib/utils/        |   88.24 |    85.71 |   90.00 |   87.50 |
  formatDate.ts    |   90.00 |    87.50 |   90.00 |   89.47 |
-------------------|---------|----------|---------|---------|
```

### Coverage Reports

**HTML Report**:

```bash
npm run test:coverage
# Open coverage/lcov-report/index.html
```

**VS Code Coverage**:

- Install Coverage Gutters extension
- Run coverage
- View inline coverage

### Coverage Thresholds

**Configured in jest.config.js**:

```javascript
coverageThresholds: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

**Enforce on CI**:

```bash
npm run test:coverage -- --ci
```

---

## Best Practices

### Writing Good Tests

**✅ Do**:

- Test user-facing behavior
- Use descriptive test names
- Arrange-Act-Assert pattern
- Test edge cases
- Clean up after tests

**❌ Don't**:

- Test implementation details
- Mock everything
- Write fragile tests
- Duplicate tests
- Ignore failing tests

### Test Structure

**AAA Pattern**:

```typescript
it('formats date correctly', () => {
  // Arrange
  const date = '2025-10-02';

  // Act
  const result = formatDate(date);

  // Assert
  expect(result).toBe('Oct 2, 2025');
});
```

### Test Naming

**Good names**:

```typescript
it('calls onSubmit with form data when submitted');
it('shows error message when API call fails');
it('disables button when form is invalid');
```

**Bad names**:

```typescript
it('works'); // Too vague
it('test1'); // Not descriptive
it('should work correctly'); // Meaningless
```

### Mocking

**Mock sparingly**:

```typescript
// ✅ Good - Mock external dependencies
jest.mock('@/lib/api/client');

// ❌ Bad - Mocking internal logic
jest.mock('./utils', () => ({
  calculateTotal: () => 100, // Testing mock, not real code
}));
```

**Mock API calls**:

```typescript
(apiClient.getData as jest.Mock).mockResolvedValue({ data: 'test' });
(apiClient.getData as jest.Mock).mockRejectedValue(new Error('API Error'));
```

### Async Testing

**Always use async/await**:

```typescript
// ✅ Good
it('loads data', async () => {
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});

// ❌ Bad
it('loads data', () => {
  render(<Component />);
  // Missing await - test passes before data loads
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

---

## Continuous Integration

### GitHub Actions

**`.github/workflows/test.yml`**:

```yaml
name: Tests

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Pre-commit Hooks

**Install Husky**:

```bash
npm install -D husky lint-staged
npx husky install
```

**`.husky/pre-commit`**:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**package.json**:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

---

## Summary

- **60% Unit Tests** - Functions, hooks, utilities
- **30% Integration Tests** - Component interactions
- **10% E2E Tests** - Critical user flows
- **Target: >80% Coverage** - Enforced in CI
- **Test behavior, not implementation**
- **Keep tests simple and focused**

---

**Last Updated**: 2025-10-02
**Next**: Read [DEPLOYMENT.md](DEPLOYMENT.md) for deployment testing
