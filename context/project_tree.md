# Project Structure - Content Generator Dashboard

**Last Updated**: 2025-10-02
**Repository**: https://github.com/fivedollarfridays/content-generator-dashboard

---

## Complete File Tree

```
content-generator-dashboard/
│
├── app/                                    # Next.js App Router
│   ├── layout.tsx                         # Root layout with Inter font & navigation
│   ├── page.tsx                           # Home page (landing)
│   ├── globals.css                        # Global Tailwind CSS + custom styles
│   │
│   ├── dashboard/                         # Dashboard page
│   │   └── page.tsx                       # Dashboard overview
│   │
│   ├── generate/                          # Content generation (Phase 2)
│   │   └── page.tsx                       # Content creation interface
│   │
│   ├── jobs/                              # Job management (Phase 2)
│   │   ├── page.tsx                       # Jobs list view
│   │   └── [id]/                          # Individual job details
│   │       └── page.tsx
│   │
│   ├── templates/                         # Template management (Phase 2)
│   │   ├── page.tsx                       # Templates gallery
│   │   └── [id]/                          # Template details
│   │       └── page.tsx
│   │
│   └── settings/                          # Settings (Phase 2)
│       ├── page.tsx                       # Settings overview
│       ├── api-keys/                      # API key management
│       │   └── page.tsx
│       └── preferences/                   # User preferences
│           └── page.tsx
│
├── components/                            # React components
│   │
│   ├── ui/                               # Generic reusable UI components
│   │   ├── Navigation.tsx                # Main navigation bar
│   │   ├── Button.tsx                    # Button component (planned)
│   │   ├── Input.tsx                     # Input component (planned)
│   │   ├── Card.tsx                      # Card container (planned)
│   │   ├── Badge.tsx                     # Status badge (planned)
│   │   ├── Modal.tsx                     # Modal dialog (planned)
│   │   └── Spinner.tsx                   # Loading spinner (planned)
│   │
│   ├── features/                         # Feature-specific components
│   │   ├── CacheStats.tsx                # Cache statistics display (358 lines)
│   │   ├── ContentGenerationForm.tsx     # Content creation form (325 lines)
│   │   ├── ContentGeneratorHealth.tsx    # Health monitoring dashboard (285 lines)
│   │   ├── JobsList.tsx                  # Job queue list view (317 lines)
│   │   ├── JobStatusCard.tsx             # Individual job status card (308 lines)
│   │   └── TemplateSelector.tsx          # Template browsing/selection (322 lines)
│   │
│   └── layouts/                          # Layout components (planned)
│       ├── DashboardLayout.tsx           # Dashboard page layout
│       ├── PublicLayout.tsx              # Public pages layout
│       └── AuthLayout.tsx                # Authentication pages layout
│
├── lib/                                   # Utilities and helpers
│   │
│   ├── api/                              # API integration
│   │   ├── api-client.ts                 # ContentGeneratorAPI class
│   │   └── client.ts                     # Configured apiClient instance + exports
│   │
│   └── utils/                            # Utility functions (planned)
│       ├── format.ts                     # Formatting utilities
│       ├── validation.ts                 # Validation helpers
│       └── date.ts                       # Date formatting (using date-fns)
│
├── hooks/                                 # Custom React hooks (planned)
│   ├── useApi.ts                         # API interaction hooks
│   ├── useWebSocket.ts                   # WebSocket connection hook
│   ├── useAuth.ts                        # Authentication hook
│   └── useLocalStorage.ts                # Local storage hook
│
├── types/                                 # TypeScript type definitions
│   ├── content-generator.ts              # API types and interfaces
│   └── index.ts                          # Type re-exports
│
├── public/                                # Static assets
│   ├── favicon.ico                       # Favicon
│   ├── logo.svg                          # Logo (planned)
│   └── images/                           # Image assets (planned)
│
├── context/                               # PairCoder context files
│   ├── agents.md                         # AI agents playbook
│   ├── development.md                    # Development context & progress tracking
│   └── project_tree.md                   # This file
│
├── docs/                                  # Comprehensive documentation
│   ├── ARCHITECTURE.md                   # Architecture overview
│   ├── CONTRIBUTING.md                   # Contribution guidelines
│   ├── DEVELOPMENT.md                    # Development setup & workflow
│   ├── TESTING.md                        # Testing guidelines
│   ├── DEPLOYMENT.md                     # Deployment guide
│   ├── API-INTEGRATION.md                # Backend API integration
│   ├── COMPONENTS.md                     # Component library documentation
│   └── TROUBLESHOOTING.md                # Common issues & solutions
│
├── .bpsai/                                # BPS AI Pair configuration
│   └── config.yaml                       # AI coding conventions
│
├── .claude/                               # Claude Code configuration
│   └── settings.local.json               # Claude Code settings
│
├── node_modules/                          # npm dependencies (not in git)
│
├── .next/                                 # Next.js build output (not in git)
│
├── .git/                                  # Git repository
│
├── .github/                               # GitHub configuration (planned)
│   └── workflows/                        # GitHub Actions
│       ├── ci.yml                        # CI workflow
│       ├── deploy.yml                    # Deployment workflow
│       └── test.yml                      # Test workflow
│
├── tests/                                 # Test files (planned - Phase 3)
│   ├── unit/                             # Unit tests
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   │
│   ├── integration/                      # Integration tests
│   │   └── api/
│   │
│   └── e2e/                              # E2E tests (Playwright)
│       ├── auth.spec.ts
│       ├── generate.spec.ts
│       └── jobs.spec.ts
│
├── CLAUDE.md                              # Claude AI root pointer
├── CONVENTIONS.md                         # Coding standards
├── CONTRIBUTING.md                        # Contribution guide
├── README.md                              # Project overview
├── SETUP-SUMMARY.md                       # Setup guide
│
├── .env.local                             # Environment variables (not in git)
├── .env.example                           # Example environment variables (planned)
├── .gitignore                            # Git ignore rules
│
├── package.json                           # npm dependencies & scripts
├── package-lock.json                      # npm lock file
│
├── tsconfig.json                          # TypeScript configuration
├── next.config.js                         # Next.js configuration
├── tailwind.config.js                     # Tailwind CSS configuration
├── postcss.config.js                      # PostCSS configuration
│
├── jest.config.js                         # Jest testing configuration
├── jest.setup.js                          # Jest setup file
├── playwright.config.ts                   # Playwright E2E config (planned)
│
├── .prettierrc.json                       # Prettier formatting rules
├── .prettierignore                        # Prettier ignore patterns
│
├── .eslintrc.json                         # ESLint configuration
└── .eslintignore                          # ESLint ignore patterns (planned)
```

---

## Directory Descriptions

### `/app` - Next.js App Router

Next.js 15 uses file-based routing with the App Router. Each folder becomes a route, and `page.tsx` files define the page content.

**Key Files**:

- `layout.tsx`: Root layout applied to all pages (navigation, fonts, global providers)
- `globals.css`: Global styles with Tailwind directives
- `page.tsx`: Home page at `/`

**Route Structure**:

- `/` → `app/page.tsx` (Home)
- `/dashboard` → `app/dashboard/page.tsx`
- `/generate` → `app/generate/page.tsx`
- `/jobs` → `app/jobs/page.tsx`
- `/jobs/[id]` → `app/jobs/[id]/page.tsx` (dynamic route)
- `/templates` → `app/templates/page.tsx`
- `/settings` → `app/settings/page.tsx`

### `/components` - React Components

Organized into three categories:

**`ui/`** - Generic, reusable UI components

- Button, Input, Card, Modal, etc.
- No business logic
- Styled with Tailwind CSS
- Fully typed with TypeScript

**`features/`** - Feature-specific components

- Connected to API/state
- Contains business logic
- Domain-specific (jobs, templates, content)
- Uses UI components for presentation

**`layouts/`** - Page layout components

- DashboardLayout: Sidebar + main content
- PublicLayout: Header + footer
- AuthLayout: Centered auth forms

### `/lib` - Libraries and Utilities

Reusable code that doesn't fit elsewhere.

**`api/`** - API integration layer

- `api-client.ts`: ContentGeneratorAPI class with all methods
- `client.ts`: Configured instance + helper exports

**`utils/`** - Pure utility functions

- Format helpers (dates, numbers, text)
- Validation functions
- Date manipulation with date-fns

### `/hooks` - Custom React Hooks

Reusable stateful logic.

**Examples**:

- `useApi`: Wraps React Query for API calls
- `useWebSocket`: Manages WebSocket connections
- `useAuth`: Authentication state
- `useLocalStorage`: Persisted state

### `/types` - TypeScript Definitions

Centralized type definitions.

**Key Files**:

- `content-generator.ts`: All API types (HealthStatus, JobStatus, Template, etc.)
- `index.ts`: Re-export all types for easy importing

### `/public` - Static Assets

Files served directly by Next.js at `/filename`.

**Contents**:

- Images
- Fonts (if not using next/font)
- Icons
- Manifest files

### `/context` - PairCoder Context

Development context for AI pair programming.

**Files**:

- `agents.md`: AI agent instructions
- `development.md`: Current progress & goals
- `project_tree.md`: This file

### `/docs` - Documentation

Comprehensive project documentation.

**Files**:

- Architecture overview
- Development guide
- Testing guide
- Deployment guide
- API integration examples
- Component documentation
- Troubleshooting

---

## Important Files

### Configuration Files

**`package.json`**

- Dependencies list
- npm scripts (dev, build, start, test, lint)
- Project metadata

**`tsconfig.json`**

- TypeScript strict mode enabled
- Path mapping (`@/*` → `./`)
- Next.js plugin configuration

**`tailwind.config.js`**

- Theme customization
- Color palette
- Spacing scale
- Plugin configuration

**`next.config.js`**

- React strict mode
- Next.js configuration
- Build optimizations

**`jest.config.js`**

- Testing environment (jsdom)
- Module path mapping
- Coverage thresholds

**`.env.local`** (not in git)

- Environment variables for development
- API URL, WebSocket URL
- API keys (if needed)

### Documentation Files

**`README.md`**

- Project overview
- Quick start guide
- Tech stack
- Component list
- Development commands

**`SETUP-SUMMARY.md`**

- Detailed setup guide
- Requirements
- Installation steps
- Configuration

**`CLAUDE.md`**

- Root pointer for Claude AI
- PairCoder entry point

**`CONVENTIONS.md`**

- Coding standards
- Naming conventions
- Best practices

**`CONTRIBUTING.md`**

- How to contribute
- Git workflow
- PR guidelines

---

## File Naming Conventions

### Components

- **PascalCase**: `ComponentName.tsx`
- **Example**: `ContentGenerationForm.tsx`, `JobsList.tsx`

### Utilities

- **camelCase**: `utilityName.ts`
- **Example**: `formatDate.ts`, `validateEmail.ts`

### Hooks

- **camelCase with `use` prefix**: `useHookName.ts`
- **Example**: `useApi.ts`, `useWebSocket.ts`

### Types

- **kebab-case**: `type-name.ts`
- **Example**: `content-generator.ts`, `api-types.ts`

### Pages (App Router)

- **lowercase**: `page.tsx`, `layout.tsx`
- **Dynamic routes**: `[param]/page.tsx`

### Tests

- **Match source file**: `ComponentName.test.tsx`
- **Example**: `JobsList.test.tsx`, `formatDate.test.ts`

---

## Import Path Aliases

TypeScript path mapping configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Usage**:

```typescript
// ✅ Good - Use @ alias
import { apiClient } from '@/lib/api/client';
import { ContentGeneratorHealth } from '@/components/features';
import type { HealthStatus } from '@/types';

// ❌ Bad - Avoid relative imports
import { apiClient } from '../../../lib/api/client';
import { ContentGeneratorHealth } from '../../components/features';
```

---

## Component Organization

### UI Components (`components/ui/`)

Generic, reusable components with no business logic.

**Characteristics**:

- Accept data via props
- No API calls or state management
- Styled with Tailwind CSS
- Fully typed
- Documented with JSDoc

**Example**:

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={...}>
      {label}
    </button>
  );
}
```

### Feature Components (`components/features/`)

Business logic components connected to API/state.

**Characteristics**:

- Use hooks (useQuery, useState, etc.)
- Make API calls
- Manage local state
- Use UI components for presentation
- Domain-specific

**Example**:

```typescript
// components/features/JobsList.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card } from '@/components/ui/Card';

export default function JobsList() {
  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => apiClient.listJobs(),
  });

  return (
    <div className="jobs-list">
      {jobs?.map(job => (
        <Card key={job.id}>{/* Job details */}</Card>
      ))}
    </div>
  );
}
```

---

## Testing Structure (Phase 3)

### Unit Tests

Test individual functions and components in isolation.

**Location**: `tests/unit/`

**Example**:

```
tests/unit/
├── components/
│   ├── Button.test.tsx
│   └── JobStatusCard.test.tsx
│
├── hooks/
│   ├── useApi.test.ts
│   └── useWebSocket.test.ts
│
└── utils/
    ├── formatDate.test.ts
    └── validation.test.ts
```

### Integration Tests

Test component interactions and API integration.

**Location**: `tests/integration/`

**Example**:

```
tests/integration/
└── api/
    ├── health-check.test.ts
    ├── job-creation.test.ts
    └── websocket.test.ts
```

### E2E Tests

Test complete user workflows.

**Location**: `tests/e2e/`

**Example**:

```
tests/e2e/
├── auth.spec.ts
├── generate-content.spec.ts
├── manage-jobs.spec.ts
└── template-selection.spec.ts
```

---

## Build Output

### `.next/` Directory

Next.js build output (not in git).

**Contents**:

- Compiled pages
- Optimized bundles
- Static assets
- Server chunks

**Size**: ~50-100MB (development), ~20-50MB (production)

### `node_modules/` Directory

npm packages (not in git).

**Size**: ~500MB-1GB

**Regenerate**: `npm install`

---

## Git Ignored Files

See `.gitignore` for complete list:

```
# Dependencies
/node_modules
/.pnp

# Build output
/.next
/out

# Production
/build

# Environment
.env*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
*.pem

# Testing
/coverage

# IDE
/.idea
/.vscode
*.swp
*.swo
```

---

## Future Additions (Planned)

### Phase 2

- Layout components (`components/layouts/`)
- Custom hooks (`hooks/`)
- Utility functions (`lib/utils/`)
- Additional UI components
- Settings pages
- Authentication pages

### Phase 3

- Test files (`tests/`)
- E2E test configuration (Playwright)
- Coverage reports

### Phase 4

- GitHub Actions workflows (`.github/workflows/`)
- Deployment scripts
- Environment examples (`.env.example`)
- Production configuration

---

## Summary

- **Total Directories**: ~15 (current), ~25 (planned)
- **Total Files**: ~30 (current), ~100+ (after Phase 4)
- **Lines of Code**: ~2,000 (current), ~10,000+ (after Phase 4)
- **Components**: 6 (migrated), ~30+ (planned)
- **Tests**: 0 (current), ~100+ (Phase 3)

**Last Updated**: 2025-10-02
**Next Update**: After Phase 2 completion
