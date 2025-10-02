# Architecture - Content Generator Dashboard

**Last Updated**: 2025-10-02
**Status**: Production Architecture

---

## Overview

The Content Generator Dashboard is a standalone Next.js application that provides the user interface for the Content Generator product. It communicates with a FastAPI backend via REST API and WebSocket.

###

 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│          Content Generator Dashboard (This Repository)       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Next.js 15.5.4 + App Router                  │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │   Pages    │  │  Components  │  │   API Client │  │  │
│  │  │ (App Dir)  │  │  (React)     │  │   (Axios)    │  │  │
│  │  └────────────┘  └──────────────┘  └──────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ React Query│  │  WebSocket   │  │   Tailwind   │  │  │
│  │  │ (Caching)  │  │ (Real-time)  │  │    (CSS)     │  │  │
│  │  └────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬────────────────────┬──────────────────┘
                      │                    │
                REST API              WebSocket
          (http://localhost:8000)  (ws://localhost:8000)
                      │                    │
                      ▼                    ▼
┌──────────────────────────────────────────────────────────────┐
│         Content Generator Backend (FastAPI)                  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    FastAPI App                        │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  REST API  │  │   WebSocket  │  │   Services   │  │  │
│  │  │ Endpoints  │  │   Handlers   │  │  (Business)  │  │  │
│  │  └────────────┘  └──────────────┘  └──────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  Database  │  │    Redis     │  │   AI/ML      │  │  │
│  │  │ (Postgres) │  │   (Cache)    │  │  Services    │  │  │
│  │  └────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Design Principles

### 1. Separation of Concerns
- **Backend**: Business logic, data processing, AI/ML
- **Dashboard**: UI, user interaction, presentation
- **Clear API contract**: REST + WebSocket

### 2. Component-Based Architecture
- Reusable UI components (`components/ui/`)
- Feature-specific components (`components/features/`)
- Layout components (`components/layouts/`)
- Single Responsibility Principle

### 3. Type Safety
- TypeScript strict mode
- Shared type definitions with backend
- No `any` types
- Runtime validation with Zod

### 4. Performance First
- Code splitting with dynamic imports
- React Query for caching
- Memoization where needed
- Optimistic UI updates
- Bundle size optimization

### 5. Accessibility
- WCAG 2.1 AA compliance
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support

---

## Technology Stack

### Core Framework
- **Next.js 15.5.4**: React framework with App Router
- **React 18**: UI library
- **TypeScript 5.x**: Type-safe JavaScript
- **Tailwind CSS 3.x**: Utility-first CSS

### State Management
- **@tanstack/react-query 5.x**: Server state (API data)
- **React hooks**: Client state (useState, useReducer)
- **React Hook Form 7.x**: Form state

### Data & API
- **Axios 1.x**: HTTP client
- **WebSocket API**: Real-time updates
- **Zod 3.x**: Schema validation
- **date-fns 4.x**: Date manipulation

### UI & Visualization
- **Recharts 2.x**: Charts and graphs
- **Tailwind CSS**: Styling
- **next/font**: Font optimization

### Development
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **Testing Library**: Component testing
- **Playwright**: E2E testing

---

## Application Structure

### Next.js App Router

The dashboard uses Next.js 15's App Router (not Pages Router):

**Benefits**:
- File-based routing
- Layouts and nested routing
- Server and client components
- Built-in loading states
- Improved performance

**Structure**:
```
app/
├── layout.tsx           # Root layout (navigation, providers)
├── page.tsx             # Home page (/)
├── globals.css          # Global styles
├── dashboard/
│   └── page.tsx         # /dashboard
├── generate/
│   └── page.tsx         # /generate
├── jobs/
│   ├── page.tsx         # /jobs
│   └── [id]/
│       └── page.tsx     # /jobs/[id]
├── templates/
│   └── page.tsx         # /templates
└── settings/
    └── page.tsx         # /settings
```

### Component Architecture

**Three-layer component structure**:

1. **UI Layer** (`components/ui/`)
   - Generic, reusable components
   - No business logic
   - Accept data via props
   - Examples: Button, Input, Card, Modal

2. **Feature Layer** (`components/features/`)
   - Feature-specific components
   - Connected to API/state
   - Business logic included
   - Examples: JobsList, TemplateSelector

3. **Layout Layer** (`components/layouts/`)
   - Page layout components
   - Provide structure and navigation
   - Examples: DashboardLayout, AuthLayout

---

## Data Flow

### REST API Flow

```
User Action
    ↓
Component Event Handler
    ↓
React Query Mutation/Query
    ↓
API Client (Axios)
    ↓
HTTP Request → Backend API
    ↓
Backend Processing
    ↓
HTTP Response ← Backend API
    ↓
React Query Cache Update
    ↓
Component Re-render
    ↓
UI Update
```

### WebSocket Flow

```
Component Mount
    ↓
WebSocket Connection
    ↓
Subscribe to Events
    ↓
Backend Event Occurs
    ↓
WebSocket Message
    ↓
Event Handler
    ↓
State Update (useState)
    ↓
Component Re-render
    ↓
Real-time UI Update
```

---

## API Integration

### REST API

**Base URL**: `NEXT_PUBLIC_API_URL` (env variable)

**Endpoints Used**:
- `GET /health` - Health check
- `POST /api/v2/generate-content` - Generate content
- `GET /api/v2/jobs` - List jobs
- `GET /api/v2/jobs/{id}` - Get job status
- `GET /api/v2/templates` - List templates
- `POST /api/v2/cache/invalidate` - Invalidate cache

**Authentication**:
- API Key in `X-API-Key` header
- Stored in environment variables or user settings

**Error Handling**:
- HTTP status codes
- Structured error responses
- React Query error boundaries
- User-friendly error messages

### WebSocket

**Base URL**: `NEXT_PUBLIC_WS_URL` (env variable)

**Endpoints**:
- `/ws/content/{client_id}` - Job updates
- `/ws/health/{client_id}` - Health updates

**Message Format**:
```typescript
{
  type: 'job_update' | 'health_update',
  data: {
    // Event-specific data
  },
  timestamp: string
}
```

**Connection Management**:
- Automatic reconnection on disconnect
- Heartbeat/ping to keep alive
- Error handling and logging

---

## State Management Strategy

### Server State (React Query)

**Queries** (Read operations):
```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

const { data, isLoading, error } = useQuery({
  queryKey: ['jobs'],
  queryFn: () => apiClient.listJobs(),
  staleTime: 5000,
  refetchInterval: 10000,
});
```

**Mutations** (Write operations):
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (data) => apiClient.generateContent(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  },
});
```

**Benefits**:
- Automatic caching
- Background refetching
- Optimistic updates
- Deduplication
- Error retry logic

### Client State (React Hooks)

**useState** - Simple local state:
```typescript
const [isOpen, setIsOpen] = useState(false);
const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
```

**useReducer** - Complex state logic:
```typescript
const [state, dispatch] = useReducer(reducer, initialState);
```

**Context API** - Global client state:
```typescript
const ThemeContext = createContext<Theme>('light');
```

### Form State (React Hook Form)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1),
  content: z.string().min(10),
});

const { register, handleSubmit, formState } = useForm({
  resolver: zodResolver(schema),
});
```

---

## Security

### Environment Variables

**Never commit sensitive data**:
- API keys
- Secrets
- Tokens

**Use environment variables**:
```bash
# .env.local (not in git)
NEXT_PUBLIC_API_URL=http://localhost:8000
API_SECRET_KEY=secret123  # Server-side only (no NEXT_PUBLIC_)
```

**Next.js rules**:
- `NEXT_PUBLIC_*` - Exposed to browser
- Others - Server-side only

### API Key Management

**Storage**:
- Environment variables (development)
- User settings (runtime)
- Encrypted storage (production)

**Transmission**:
- HTTPS only in production
- `X-API-Key` header
- Never in URL query params

### XSS Prevention

**React built-in protection**:
- Automatic escaping
- Avoid `dangerouslySetInnerHTML`
- Sanitize user input

**Content Security Policy** (future):
```
Content-Security-Policy: default-src 'self'; script-src 'self'
```

---

## Performance Optimization

### Code Splitting

**Dynamic imports**:
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false, // Skip server-side rendering if not needed
});
```

### Memoization

**useMemo** - Expensive calculations:
```typescript
const sortedJobs = useMemo(() => {
  return jobs.sort((a, b) => a.createdAt - b.createdAt);
}, [jobs]);
```

**useCallback** - Function references:
```typescript
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);
```

**React.memo** - Component memoization:
```typescript
const MemoizedComponent = React.memo(Component);
```

### Image Optimization

**Next.js Image component**:
```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // Load immediately
/>
```

### Bundle Size

**Analyze bundle**:
```bash
npm run build
# Check .next/static/ size
```

**Optimize**:
- Tree shaking (automatic)
- Remove unused dependencies
- Use ES modules
- Lazy load routes

---

## Accessibility (A11y)

### WCAG 2.1 AA Compliance

**Requirements**:
- Color contrast ≥4.5:1 (text)
- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management

**Implementation**:
```tsx
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
  </ul>
</nav>
```

**Testing**:
- jest-axe (automated)
- Manual keyboard testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Lighthouse accessibility audit

---

## Error Handling

### Error Boundaries

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
try {
  const data = await apiClient.generateContent(payload);
} catch (error) {
  if (axios.isAxiosError(error)) {
    // HTTP error
    const status = error.response?.status;
    const message = error.response?.data?.message;
    // Show user-friendly error
  } else {
    // Network error
    // Show offline message
  }
}
```

### React Query Error Handling

```typescript
const { data, error } = useQuery({
  queryKey: ['jobs'],
  queryFn: () => apiClient.listJobs(),
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (error) {
  return <ErrorMessage error={error} />;
}
```

---

## Testing Strategy

### Unit Tests (60%)

**Test pure functions and hooks**:
```typescript
describe('formatDate', () => {
  it('formats date correctly', () => {
    expect(formatDate('2025-10-02')).toBe('Oct 2, 2025');
  });
});
```

### Integration Tests (30%)

**Test component interactions**:
```typescript
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

### E2E Tests (10%)

**Test user workflows**:
```typescript
test('user can generate content', async ({ page }) => {
  await page.goto('/generate');
  await page.fill('[name="title"]', 'Test Content');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.success-message');
});
```

---

## Deployment Architecture

### Development

```
Local Machine
├── Dashboard (localhost:3000)
└── Backend API (localhost:8000)
```

### Production

```
Vercel (Dashboard)
    ↓ HTTPS
User Browser
    ↓ HTTPS/WSS
Production API (api.content-generator.com)
```

**Vercel Features**:
- Automatic deployments
- Preview deployments for PRs
- Edge network (global CDN)
- Automatic SSL
- Environment variables
- Analytics

---

## Future Architecture Considerations

### Scalability
- CDN for static assets
- API rate limiting
- WebSocket connection pooling
- Database read replicas

### Monitoring
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- User analytics (Google Analytics)
- Custom metrics dashboard

### Multi-tenancy
- Tenant isolation
- Subdomain routing
- Tenant-specific theming
- Usage quotas

---

## Architecture Decision Records (ADRs)

### ADR-001: Next.js App Router
**Decision**: Use App Router instead of Pages Router
**Rationale**: Modern approach, better performance, nested layouts
**Status**: Accepted

### ADR-002: React Query for State
**Decision**: Use React Query for server state
**Rationale**: Best practice, automatic caching, excellent DX
**Status**: Accepted

### ADR-003: Tailwind CSS
**Decision**: Use Tailwind for styling
**Rationale**: Rapid development, consistent design, mobile-first
**Status**: Accepted

### ADR-004: TypeScript Strict Mode
**Decision**: Enable TypeScript strict mode
**Rationale**: Catch errors early, better code quality
**Status**: Accepted

---

## Summary

The Content Generator Dashboard is a modern, performant, accessible Next.js application following industry best practices. It provides a clean separation from the backend API while delivering an excellent user experience through thoughtful architecture and technology choices.

**Key Strengths**:
- Type-safe with TypeScript
- Fast with React Query caching
- Accessible (WCAG 2.1 AA)
- Testable architecture
- Production-ready deployment

---

**Last Updated**: 2025-10-02
**Next Review**: After Phase 2 completion
