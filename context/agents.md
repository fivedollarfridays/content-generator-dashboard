# AI Agents Playbook - Toombos Frontend

This playbook guides AI agents working on the Toombos Frontend - a standalone Next.js application providing the UI for the Content Generator product.

## Context Loop Discipline (MANDATORY)

Always maintain these fields in `/context/development.md`:

- **Overall goal is:** Build a production-ready dashboard for Content Generator
- **Last action was:** What just completed (include commit SHA if applicable)
- **Next action will be:** The immediate next step
- **Blockers/Risks:** Any technical issues, dependencies, or concerns

**After every change:**

```bash
git add -A && git commit -m "feat: [component] - description" && git push
```

## 🎯 DASHBOARD ROADMAP

### CURRENT STATUS: Sprints 1-3 Complete - Sprint 4 In Progress

**Repository**: https://github.com/fivedollarfridays/toombos-frontend
**Progress**: Phase 2 - 60% Complete (3 of 6 sprints done)

**Tech Stack**:

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: @tanstack/react-query
- **Forms**: React Hook Form + Zod
- **API Client**: Axios
- **Real-time**: WebSocket

**Backend API**: `halcytone-content-generator` repository (FastAPI)

- **Local**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## Development Phases

### Phase 1: MVP - Components Migrated ✅ (COMPLETE)

**Duration**: 2 hours | **Completed**: 2025-10-02

**Achievements**:

- [x] Repository created and on GitHub
- [x] Next.js 15.5.4 setup with TypeScript and Tailwind
- [x] 6 components migrated from backend repo
- [x] API client configured with environment variables
- [x] Build passing (0 errors)
- [x] BPS AI Pair configured
- [x] Comprehensive README and documentation

**Components Migrated**:

1. ContentGeneratorHealth.tsx
2. ContentGenerationForm.tsx
3. JobsList.tsx
4. JobStatusCard.tsx
5. CacheStats.tsx
6. TemplateSelector.tsx

---

### Phase 2: Feature Development 🚧 (IN PROGRESS)

**Duration**: 2 weeks | **Status**: ✅ Sprints 1-3 Complete | 🚧 Sprint 4 In Progress

**Goals**: Build out complete dashboard pages with authentication and real-time updates

#### Sprint 1: BPS AI Convention Compliance ✅ COMPLETE

**Tasks**:

- [x] Restructure components to app/components/ with kebab-case
- [x] Convert all functions to arrow functions with explicit return types
- [x] Install prettier, jest, testing-library
- [x] Achieve 100% bpsai convention compliance
- [x] Build passing (0 errors)

#### Sprint 2: Route Pages Implementation ✅ COMPLETE

**Tasks**:

- [x] Build `/generate` page with ContentGenerationForm
- [x] Build `/jobs` page with JobsList and real-time updates
- [x] Build `/templates` page with TemplateSelector
- [x] Build `/settings` page for API keys and configuration
- [x] Add loading states and error handling
- [x] Implement responsive mobile design
- [x] Comprehensive session log created

#### Sprint 3: API Client Testing ✅ COMPLETE

**Tasks**:

- [x] Create comprehensive API client test suite (30 test cases)
- [x] Achieve 97.61% code coverage (target: 70%)
- [x] Global fetch mocking strategy
- [x] All tests passing
- [x] Comprehensive session log created

#### Sprint 4: Custom Hooks & JSDoc 🚧 IN PROGRESS

**Tasks**:

- [ ] Create app/hooks/use-websocket.ts
- [ ] Create app/hooks/use-api.ts
- [ ] Create app/hooks/use-local-storage.ts
- [ ] Add comprehensive JSDoc to API client methods
- [ ] Create component tests for ContentGenerationForm
- [ ] Create component tests for JobsList
- [ ] Document utility functions

#### Sprint 5: Authentication & Real-time 📋 PLANNED

**Tasks**:

- [ ] Implement API key management UI enhancement
- [ ] Add authentication flow
- [ ] WebSocket integration for real-time job updates
- [ ] React Query setup for server state
- [ ] Optimistic UI updates
- [ ] Error boundary implementation

#### Sprint 6: Advanced Features 📋 PLANNED

**Tasks**:

- [ ] Content history view
- [ ] Analytics dashboard
- [ ] Batch operations UI
- [ ] Advanced filtering and search
- [ ] Export functionality
- [ ] User preferences persistence

---

### Phase 3: Testing & Quality 🧪 (PLANNED)

**Duration**: 1 week | **Status**: Planned

**Tasks**:

- [ ] Unit tests with Jest and Testing Library
- [ ] Component testing
- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] Accessibility testing (WCAG 2.1)
- [ ] Performance optimization
- [ ] Lighthouse score >90

---

### Phase 4: Production Deployment 🚀 (PLANNED)

**Duration**: 1 week | **Status**: Planned

**Tasks**:

- [ ] Vercel deployment configuration
- [ ] Environment variable setup
- [ ] Custom domain configuration
- [ ] SSL certificates
- [ ] Production backend integration
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics or similar)
- [ ] Performance monitoring

---

## Component Development Guidelines

### File Structure

```
components/
├── ui/                 # Generic UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── Navigation.tsx
│
├── features/          # Feature-specific components
│   ├── ContentGeneratorHealth.tsx
│   ├── ContentGenerationForm.tsx
│   ├── JobsList.tsx
│   ├── JobStatusCard.tsx
│   ├── CacheStats.tsx
│   └── TemplateSelector.tsx
│
└── layouts/           # Layout components
    ├── DashboardLayout.tsx
    └── PublicLayout.tsx
```

### Component Template

```typescript
'use client';

import React from 'react';

interface ComponentNameProps {
  // Props interface
  id: string;
  onAction?: () => void;
}

/**
 * ComponentName - Brief description
 *
 * @param props - Component props
 * @returns React component
 */
export default function ComponentName({ id, onAction }: ComponentNameProps) {
  // State
  const [state, setState] = React.useState(false);

  // Effects
  React.useEffect(() => {
    // Side effects
  }, []);

  // Handlers
  const handleAction = () => {
    onAction?.();
  };

  // Render
  return (
    <div className="component-name">
      {/* Component JSX */}
    </div>
  );
}
```

---

## API Integration Guidelines

### Using the API Client

```typescript
import { apiClient } from '@/lib/api/client';
import { useQuery, useMutation } from '@tanstack/react-query';

// Query example
function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.healthCheck(),
    refetchInterval: 10000, // Refetch every 10s
  });
}

// Mutation example
function useGenerateContent() {
  return useMutation({
    mutationFn: data => apiClient.generateContent(data),
    onSuccess: data => {
      // Handle success
    },
    onError: error => {
      // Handle error
    },
  });
}
```

### WebSocket Integration

```typescript
import { getWebSocketUrl } from '@/lib/api/client';
import { useEffect, useState } from 'react';

function useJobUpdates(clientId: string) {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(getWebSocketUrl(`/ws/content/${clientId}`));

    ws.onmessage = event => {
      const data = JSON.parse(event.data);
      setJobs(prev => [...prev, data]);
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }, [clientId]);

  return jobs;
}
```

---

## Coding Standards

### TypeScript

- **Strict mode enabled**: No `any` types
- **Explicit return types**: Always specify function return types
- **Interface over type**: Use `interface` for object shapes
- **Const assertions**: Use `as const` for literal values

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  return apiClient.getUser(id);
}

// Bad
function getUser(id) {
  return apiClient.getUser(id);
}
```

### React

- **Functional components only**: No class components
- **Hooks**: Use hooks for state and side effects
- **Client components**: Use `'use client'` directive when needed
- **Prop destructuring**: Destructure props in function signature

```typescript
// Good
'use client';

import React from 'react';

interface Props {
  title: string;
  onClick: () => void;
}

export default function Button({ title, onClick }: Props) {
  return <button onClick={onClick}>{title}</button>;
}

// Bad
export default function Button(props) {
  return <button onClick={props.onClick}>{props.title}</button>;
}
```

### Styling

- **Tailwind utility classes**: Prefer Tailwind over custom CSS
- **Responsive design**: Mobile-first approach
- **Dark mode**: Support dark mode with Tailwind's dark: prefix
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation

```tsx
// Good
<button
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
  aria-label="Submit form"
>
  Submit
</button>

// Bad
<div
  className="button"
  onClick={handleClick}
>
  Submit
</div>
```

---

## Testing Guidelines

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button title="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button title="Click me" onClick={onClick} />);

    screen.getByText('Click me').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### Component Tests

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import JobsList from './JobsList';

const queryClient = new QueryClient();

describe('JobsList', () => {
  it('loads and displays jobs', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <JobsList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Job 1')).toBeInTheDocument();
    });
  });
});
```

---

## Performance Guidelines

### Code Splitting

```typescript
// Lazy load components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});
```

### Memoization

```typescript
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ data }) {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item));
  }, [data]);

  // Memoize callbacks
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return <div>{/* ... */}</div>;
}
```

---

## Error Handling

### Error Boundaries

```typescript
'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Accessibility (A11y)

### Guidelines

- **Semantic HTML**: Use correct HTML elements (`<button>`, `<nav>`, `<main>`)
- **ARIA labels**: Add `aria-label` for icon buttons and links
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible
- **Focus management**: Visible focus indicators, logical tab order
- **Color contrast**: WCAG AA minimum (4.5:1 for normal text)
- **Screen reader testing**: Test with NVDA/JAWS/VoiceOver

```tsx
// Good accessibility
<button
  aria-label="Close modal"
  onClick={onClose}
  className="focus:ring-2 focus:ring-blue-500"
>
  <CloseIcon aria-hidden="true" />
</button>

<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/generate">Generate</a></li>
  </ul>
</nav>
```

---

## Git Workflow

### Commit Messages

Follow Conventional Commits:

```bash
# Features
git commit -m "feat: add job filtering to JobsList component"

# Bug fixes
git commit -m "fix: resolve WebSocket connection issue in production"

# Documentation
git commit -m "docs: add API integration examples to README"

# Refactoring
git commit -m "refactor: simplify authentication logic"

# Tests
git commit -m "test: add unit tests for TemplateSelector"

# Styling
git commit -m "style: update button hover states"
```

### Branch Strategy

```bash
# Feature branches
git checkout -b feature/job-filtering

# Bug fix branches
git checkout -b fix/websocket-connection

# Documentation branches
git checkout -b docs/api-integration
```

---

## Development Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests

# Type checking
npm run type-check       # Check TypeScript types

# Formatting
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
```

---

## Environment Setup

### Required Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Optional Environment Variables

```bash
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Error tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_BATCH_OPERATIONS=false
```

---

## Success Criteria

### Phase 2 Complete When:

- [ ] All dashboard pages built and functional
- [ ] Authentication flow implemented
- [ ] WebSocket real-time updates working
- [ ] React Query state management in place
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Loading and error states handled
- [ ] Basic tests written

### Production Ready When:

- [ ] Test coverage >80%
- [ ] Lighthouse score >90
- [ ] WCAG 2.1 AA compliance
- [ ] All pages load <2s (P95)
- [ ] Error tracking configured
- [ ] Analytics implemented
- [ ] Deployed to production

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Query Docs**: https://tanstack.com/query/latest
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Backend API Docs**: http://localhost:8000/docs (when running)
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

**MISSION:** Build a production-ready, accessible, performant dashboard for the Content Generator product that provides an excellent user experience and serves as the primary interface for content creation and management.
