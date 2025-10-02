# Component Library - Content Generator Dashboard

**Last Updated**: 2025-10-02

---

## Overview

This document catalogs all components in the dashboard, organized by category.

**Component Structure**:
- `components/ui/` - Generic, reusable UI components
- `components/features/` - Feature-specific components
- `components/layouts/` - Page layout components

---

## UI Components

### Navigation

**Location**: `components/ui/Navigation.tsx`

**Description**: Main navigation bar with responsive design

**Props**: None (uses Next.js usePathname hook)

**Usage**:
```typescript
import Navigation from '@/components/ui/Navigation';

<Navigation />
```

**Features**:
- Active link highlighting
- Responsive design
- API URL display

---

## Feature Components

### ContentGeneratorHealth

**Location**: `components/features/ContentGeneratorHealth.tsx`

**Description**: Health monitoring dashboard with real-time status

**Props**:
```typescript
interface ContentGeneratorHealthProps {
  refreshInterval?: number;  // Default: 10000 (10s)
}
```

**Usage**:
```typescript
import ContentGeneratorHealth from '@/components/features/ContentGeneratorHealth';

<ContentGeneratorHealth refreshInterval={5000} />
```

**Features**:
- Real-time health checks
- Component status breakdown
- Uptime display
- Automatic refresh

**API**:
- `GET /health` - Health check endpoint

---

### ContentGenerationForm

**Location**: `components/features/ContentGenerationForm.tsx`

**Description**: Content creation interface with template selection

**Props**:
```typescript
interface ContentGenerationFormProps {
  onSuccess?: (jobId: string) => void;
}
```

**Usage**:
```typescript
import ContentGenerationForm from '@/components/features/ContentGenerationForm';

<ContentGenerationForm
  onSuccess={(jobId) => router.push(`/jobs/${jobId}`)}
/>
```

**Features**:
- Form validation
- Template selection
- Channel configuration (email, social, web)
- Tone/style settings
- Loading states

**API**:
- `POST /api/v2/generate-content` - Content generation

---

### JobsList

**Location**: `components/features/JobsList.tsx`

**Description**: Job queue management with real-time updates

**Props**:
```typescript
interface JobsListProps {
  filter?: {
    status?: 'pending' | 'running' | 'completed' | 'failed';
  };
  onJobClick?: (jobId: string) => void;
}
```

**Usage**:
```typescript
import JobsList from '@/components/features/JobsList';

<JobsList
  filter={{ status: 'completed' }}
  onJobClick={(id) => console.log(id)}
/>
```

**Features**:
- Real-time job updates (WebSocket)
- Status filtering
- Sorting
- Pagination
- Auto-refresh

**API**:
- `GET /api/v2/jobs` - List jobs
- `WS /ws/content/{client_id}` - Real-time updates

---

### JobStatusCard

**Location**: `components/features/JobStatusCard.tsx`

**Description**: Individual job status display

**Props**:
```typescript
interface JobStatusCardProps {
  jobId: string;
  autoRefresh?: boolean;  // Default: true
  refreshInterval?: number;  // Default: 5000
}
```

**Usage**:
```typescript
import JobStatusCard from '@/components/features/JobStatusCard';

<JobStatusCard jobId="job-123" autoRefresh={true} />
```

**Features**:
- Job status visualization
- Progress indicator
- Timestamp display
- Result preview
- Error messages

**API**:
- `GET /api/v2/jobs/{id}` - Get job status

---

### CacheStats

**Location**: `components/features/CacheStats.tsx`

**Description**: Cache statistics and management

**Props**:
```typescript
interface CacheStatsProps {
  refreshInterval?: number;  // Default: 30000 (30s)
}
```

**Usage**:
```typescript
import CacheStats from '@/components/features/CacheStats';

<CacheStats refreshInterval={60000} />
```

**Features**:
- Cache hit rate visualization
- Cache size display
- Cache invalidation controls
- Performance metrics

**API**:
- `GET /api/v2/cache/stats` - Cache statistics
- `POST /api/v2/cache/invalidate` - Invalidate cache

---

### TemplateSelector

**Location**: `components/features/TemplateSelector.tsx`

**Description**: Template browsing and selection

**Props**:
```typescript
interface TemplateSelectorProps {
  category?: string;
  onSelect: (templateId: string) => void;
  selected?: string;
}
```

**Usage**:
```typescript
import TemplateSelector from '@/components/features/TemplateSelector';

<TemplateSelector
  category="email"
  onSelect={(id) => setSelectedTemplate(id)}
  selected={selectedTemplate}
/>
```

**Features**:
- Template gallery
- Category filtering
- Template preview
- Search functionality

**API**:
- `GET /api/v2/templates` - List templates

---

## Layout Components

### DashboardLayout (Planned - Phase 2)

**Description**: Standard dashboard layout with sidebar

**Props**:
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}
```

**Usage**:
```typescript
import DashboardLayout from '@/components/layouts/DashboardLayout';

<DashboardLayout sidebar={<Sidebar />}>
  <PageContent />
</DashboardLayout>
```

---

## Component Guidelines

### Creating New UI Components

1. **Create file** in `components/ui/`:
   ```bash
   touch components/ui/MyComponent.tsx
   ```

2. **Define props interface**:
   ```typescript
   interface MyComponentProps {
     title: string;
     onClick?: () => void;
   }
   ```

3. **Implement component**:
   ```typescript
   export default function MyComponent({ title, onClick }: MyComponentProps) {
     return (
       <div className="my-component">
         <h2>{title}</h2>
         {onClick && <button onClick={onClick}>Action</button>}
       </div>
     );
   }
   ```

4. **Add tests**:
   ```bash
   touch components/ui/MyComponent.test.tsx
   ```

5. **Document**:
   - JSDoc comments
   - Update this file (COMPONENTS.md)

### Creating Feature Components

1. **Create file** in `components/features/`

2. **Add React Query hooks** for data fetching:
   ```typescript
   const { data, isLoading } = useQuery({
     queryKey: ['myData'],
     queryFn: () => apiClient.getMyData(),
   });
   ```

3. **Implement loading/error states**:
   ```typescript
   if (isLoading) return <Spinner />;
   if (error) return <ErrorMessage />;
   ```

4. **Add WebSocket** (if real-time updates needed):
   ```typescript
   const { data: liveData } = useWebSocket('/ws/my-data');
   ```

---

## Styling Guidelines

### Tailwind CSS

**Use utility classes**:
```tsx
<div className="flex flex-col space-y-4 p-6 bg-white rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
  <p className="text-gray-600">Description</p>
</div>
```

### Responsive Design

**Mobile-first**:
```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  Content
</div>
```

### Dark Mode

**Support dark mode**:
```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Content
</div>
```

---

## Accessibility

### Semantic HTML

**Use correct elements**:
```tsx
<button onClick={handleClick}>Click</button>  // Not <div onClick>
<nav>...</nav>  // For navigation
<main>...</main>  // For main content
```

### ARIA Labels

**Add labels**:
```tsx
<button aria-label="Close modal" onClick={onClose}>
  <XIcon aria-hidden="true" />
</button>

<input aria-label="Search" placeholder="Search..." />
```

### Keyboard Navigation

**Ensure keyboard accessibility**:
```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Clickable
</div>
```

---

## Performance

### Memoization

**Memoize expensive operations**:
```typescript
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);
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

## Testing

### Component Testing

**Test user interactions**:
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders and handles click', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<MyComponent onClick={onClick} />);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

---

## Component Catalog Summary

### UI Components (1)
- **Navigation** - Main navigation bar

### Feature Components (6)
- **ContentGeneratorHealth** - Health monitoring dashboard
- **ContentGenerationForm** - Content creation interface
- **JobsList** - Job queue management
- **JobStatusCard** - Individual job status
- **CacheStats** - Cache statistics
- **TemplateSelector** - Template browsing

### Layout Components (Planned)
- **DashboardLayout** - Dashboard page layout
- **AuthLayout** - Authentication page layout
- **PublicLayout** - Public page layout

---

**Last Updated**: 2025-10-02
**Next Review**: After Phase 2 (feature development) completion
