# Coding Conventions - Content Generator Dashboard

**Last Updated**: 2025-10-02
**Applies To**: All code in this repository

---

## TypeScript Conventions

### Strict Mode

**Always use strict mode** (enabled in `tsconfig.json`):

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Type Definitions

**✅ Good**:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  return apiClient.getUser(id);
}

const users: User[] = [];
```

**❌ Bad**:

```typescript
function getUser(id) {
  // No type
  return apiClient.getUser(id);
}

const users = []; // No type
```

### No `any`

**✅ Good**:

```typescript
function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  return '';
}
```

**❌ Bad**:

```typescript
function processData(data: any): string {
  // Avoid any
  return data.toUpperCase();
}
```

### Interface vs Type

**Prefer `interface` for object shapes**:

```typescript
// ✅ Good
interface Props {
  title: string;
  onClose: () => void;
}

// ⚠️ OK for unions
type Status = 'pending' | 'success' | 'error';
```

---

## React Conventions

### Functional Components

**Always use functional components** (no class components):

**✅ Good**:

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export default function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

**❌ Bad**:

```typescript
class Button extends React.Component {  // No class components
  render() {
    return <button>...</button>;
  }
}
```

### Client Components

**Use `'use client'` directive when needed**:

```typescript
'use client';  // Required for hooks, event handlers

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Prop Destructuring

**✅ Good**:

```typescript
interface Props {
  title: string;
  onClick: () => void;
}

export default function Button({ title, onClick }: Props) {
  return <button onClick={onClick}>{title}</button>;
}
```

**❌ Bad**:

```typescript
export default function Button(props) {
  return <button onClick={props.onClick}>{props.title}</button>;
}
```

### Hooks

**Follow React hooks rules**:

1. Only call at top level
2. Only call from React functions
3. Use `use` prefix for custom hooks

**✅ Good**:

```typescript
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}
```

---

## Naming Conventions

### Files

- **Components**: `PascalCase.tsx`
  - `Button.tsx`, `JobsList.tsx`

- **Utilities**: `camelCase.ts`
  - `formatDate.ts`, `validateEmail.ts`

- **Hooks**: `useCamelCase.ts`
  - `useApi.ts`, `useWebSocket.ts`

- **Types**: `kebab-case.ts`
  - `content-generator.ts`, `api-types.ts`

- **Tests**: `FileName.test.tsx`
  - `Button.test.tsx`, `formatDate.test.ts`

### Variables

**camelCase** for variables and functions:

```typescript
const userName = 'John';
const isLoading = false;

function getUserName() {
  return userName;
}
```

### Constants

**SCREAMING_SNAKE_CASE** for constants:

```typescript
const MAX_RETRIES = 3;
const API_TIMEOUT = 30000;
const DEFAULT_PAGE_SIZE = 20;
```

### Components

**PascalCase** for components:

```typescript
function UserProfile() {}
function JobStatusCard() {}
function ContentGenerationForm() {}
```

### Types/Interfaces

**PascalCase** for types and interfaces:

```typescript
interface User {}
interface JobStatus {}
type ContentType = 'blog' | 'newsletter';
```

---

## Styling Conventions

### Tailwind CSS

**Use Tailwind utility classes**:

**✅ Good**:

```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Submit
</button>
```

**❌ Bad**:

```tsx
<button style={{ padding: '8px 16px', background: 'blue' }}>Submit</button>
```

### Responsive Design

**Mobile-first approach**:

```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Full width on mobile, half on tablet, third on desktop */}
</div>
```

### Class Organization

**Order classes logically**:

1. Layout (flex, grid)
2. Sizing (w-, h-)
3. Spacing (p-, m-)
4. Typography (text-, font-)
5. Colors (bg-, text-)
6. Borders (border-, rounded-)
7. Effects (shadow-, opacity-)
8. States (hover:, focus:)

```tsx
<div className="flex flex-col w-full p-4 text-lg font-semibold bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg">
  Content
</div>
```

---

## Import Conventions

### Import Order

1. React
2. External libraries
3. Internal modules (with @ alias)
4. Types
5. Styles

```typescript
// 1. React
import React, { useState, useEffect } from 'react';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// 3. Internal modules
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui';

// 4. Types
import type { User, Job } from '@/types';

// 5. Styles (if any)
import './styles.css';
```

### Path Aliases

**Always use `@/` alias** (not relative paths):

**✅ Good**:

```typescript
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import type { Job } from '@/types';
```

**❌ Bad**:

```typescript
import { apiClient } from '../../../lib/api/client';
import { Button } from '../../components/ui/Button';
```

---

## Function Conventions

### Arrow Functions

**Prefer arrow functions**:

**✅ Good**:

```typescript
const handleClick = () => {
  console.log('Clicked');
};

const users = data.map(user => user.name);
```

### Async/Await

**Use async/await** (not `.then()`):

**✅ Good**:

```typescript
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await apiClient.getUser(id);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}
```

**❌ Bad**:

```typescript
function fetchUser(id: string) {
  return apiClient
    .getUser(id)
    .then(response => response.data)
    .catch(error => console.error(error));
}
```

### Return Types

**Always specify return types**:

**✅ Good**:

```typescript
function add(a: number, b: number): number {
  return a + b;
}

async function fetchData(): Promise<Data> {
  return await apiClient.getData();
}
```

**❌ Bad**:

```typescript
function add(a: number, b: number) {
  // No return type
  return a + b;
}
```

---

## Component Conventions

### Component Structure

**Standard structure**:

```typescript
'use client';  // If needed

import React from 'react';
import type { ComponentProps } from './types';

/**
 * ComponentName - Brief description
 *
 * @param props - Component props
 * @returns React component
 */
export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks
  const [state, setState] = React.useState(false);
  const { data } = useQuery(...);

  // 2. Effects
  React.useEffect(() => {
    // Side effects
  }, []);

  // 3. Event handlers
  const handleClick = () => {
    setState(true);
  };

  // 4. Computed values
  const computedValue = state ? 'Yes' : 'No';

  // 5. Render
  return (
    <div className="component">
      {/* JSX */}
    </div>
  );
}
```

### Props Interface

**Define props interface**:

```typescript
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
  // ...
}
```

---

## Error Handling

### Try-Catch

**Always handle errors**:

```typescript
try {
  const data = await apiClient.fetchData();
  setData(data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('API error:', error.response?.data);
  } else {
    console.error('Unexpected error:', error);
  }
  setError('Failed to fetch data');
}
```

### Error Types

**Use typed errors**:

```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validate(data: unknown): void {
  if (!data) {
    throw new ValidationError('Data is required');
  }
}
```

---

## Comments & Documentation

### JSDoc

**Document public functions and components**:

```typescript
/**
 * Formats a date string into a readable format
 *
 * @param date - ISO date string (e.g., '2025-10-02')
 * @param format - Optional format string
 * @returns Formatted date string
 *
 * @example
 * formatDate('2025-10-02') // => 'Oct 2, 2025'
 */
function formatDate(date: string, format?: string): string {
  // ...
}
```

### Inline Comments

**Use inline comments sparingly**:

**✅ Good** (explains why):

```typescript
// Retry with exponential backoff to handle rate limiting
const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
```

**❌ Bad** (explains what - code is self-explanatory):

```typescript
// Add 1 to count
const newCount = count + 1;
```

---

## Testing Conventions

### Test File Names

**Match source file**:

- `Button.tsx` → `Button.test.tsx`
- `formatDate.ts` → `formatDate.test.ts`

### Test Structure

**Use describe/it blocks**:

```typescript
describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button label="Click" onClick={onClick} />);

    screen.getByText('Click').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## Git Conventions

### Commit Messages

**Follow Conventional Commits**:

Format: `<type>(<scope>): <description>`

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:

```bash
feat(jobs): add job filtering by status
fix(websocket): resolve connection timeout issue
docs(readme): update installation instructions
style(button): format button component
refactor(api): simplify error handling
test(jobs): add unit tests for JobsList
chore(deps): update dependencies
```

### Branch Names

**Format**: `<type>/<description>`

**Examples**:

```bash
feature/job-filtering
fix/websocket-timeout
docs/api-integration
refactor/error-handling
```

---

## Accessibility Conventions

### Semantic HTML

**Use correct HTML elements**:

**✅ Good**:

```tsx
<button onClick={handleClick}>Click me</button>
<nav aria-label="Main navigation">...</nav>
<main>...</main>
```

**❌ Bad**:

```tsx
<div onClick={handleClick}>Click me</div>  // Use <button>
<div>...</div>  // Use semantic elements
```

### ARIA Labels

**Add labels for accessibility**:

```tsx
<button aria-label="Close modal" onClick={onClose}>
  <XIcon aria-hidden="true" />
</button>

<input
  type="text"
  aria-label="Search jobs"
  placeholder="Search..."
/>
```

### Keyboard Navigation

**Ensure keyboard accessibility**:

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={e => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Clickable div
</div>
```

---

## Performance Conventions

### Memoization

**Use memoization when appropriate**:

```typescript
// Expensive calculations
const sortedJobs = useMemo(() => {
  return jobs.sort((a, b) => a.createdAt - b.createdAt);
}, [jobs]);

// Function references
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);

// Component memoization
const MemoizedComponent = React.memo(ExpensiveComponent);
```

### Code Splitting

**Lazy load heavy components**:

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false,
});
```

---

## Security Conventions

### Environment Variables

**Never commit secrets**:

**✅ Good**:

```bash
# .env.local (not in git)
NEXT_PUBLIC_API_URL=http://localhost:8000
API_SECRET=secret123
```

**❌ Bad**:

```typescript
// Hardcoded secrets in code
const apiKey = 'sk-1234567890abcdef';
```

### XSS Prevention

**Avoid dangerouslySetInnerHTML**:

**✅ Good**:

```tsx
<div>{userInput}</div> // Automatically escaped
```

**❌ Bad** (only if absolutely necessary and sanitized):

```tsx
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

---

## Summary Checklist

Before committing code, verify:

- [ ] TypeScript strict mode (no `any`, all types defined)
- [ ] Functional components with hooks
- [ ] Proper file naming conventions
- [ ] Tailwind CSS for styling
- [ ] `@/` path aliases for imports
- [ ] JSDoc for public functions
- [ ] Accessibility (semantic HTML, ARIA labels)
- [ ] Error handling (try-catch)
- [ ] Tests written
- [ ] Conventional commit message
- [ ] No secrets in code

---

**Last Updated**: 2025-10-02
**Enforcement**: ESLint + Prettier + TypeScript compiler
