# Toombos Frontend

AI-powered content generation platform dashboard built with Next.js 14, TypeScript, and Tailwind CSS.

## Overview

This is the **standalone dashboard** for the Content Generator product. It provides a user-friendly interface for:

- Content generation and management
- Job queue monitoring
- Template management
- System health monitoring
- Cache management

## Architecture

**Backend API**: `halcytone-content-generator` (FastAPI)
**Dashboard**: This repository (Next.js 14)

The dashboard communicates with the backend API via REST endpoints and WebSocket for real-time updates.

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+ with `bpsai-pair` installed
- Running Content Generator API (backend)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.local` and update with your API endpoint:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Start Backend API (Required)

In the backend repository:

```bash
cd ../halcytone-content-generator
python -m uvicorn src.halcytone_content_generator.main:app --reload
```

Backend will be available at [http://localhost:8000](http://localhost:8000)

## Tech Stack

### Core Framework

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework

### State Management & API

- **@tanstack/react-query** - Server state management
- **Axios** - HTTP client
- **WebSocket** - Real-time updates

### Forms & Validation

- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Visualization

- **Recharts** - Charts and graphs

### Development Tools

- **ESLint** - Code linting
- **bpsai-pair** - AI pair programming assistant

## Project Structure

```
toombos-frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   ├── generate/          # Content generation pages
│   ├── jobs/              # Job management pages
│   ├── templates/         # Template management pages
│   └── settings/          # Settings pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── features/         # Feature-specific components
│       ├── CacheStats.tsx
│       ├── ContentGenerationForm.tsx
│       ├── ContentGeneratorHealth.tsx
│       ├── JobsList.tsx
│       ├── JobStatusCard.tsx
│       └── TemplateSelector.tsx
├── lib/                  # Utilities and helpers
│   ├── api/             # API client
│   │   ├── api-client.ts
│   │   └── client.ts
│   └── utils/           # Utility functions
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
│   ├── content-generator.ts
│   └── index.ts
├── public/              # Static assets
├── .bpsai/              # BPS AI Pair configuration
└── .env.local          # Environment variables (not in git)
```

## Migrated Components

The following components were migrated from the backend's `frontend/` directory:

### 1. **ContentGeneratorHealth** (`components/features/ContentGeneratorHealth.tsx`)

- Displays API health status
- Shows system metrics and uptime
- Real-time health check monitoring
- Component health breakdown

### 2. **ContentGenerationForm** (`components/features/ContentGenerationForm.tsx`)

- Content creation interface
- Template selection
- Channel configuration (email, social, web)
- Tone/style settings

### 3. **JobsList** & **JobStatusCard** (`components/features/Jobs*.tsx`)

- Job queue management
- Real-time status updates via WebSocket
- Job filtering and sorting
- Status tracking (pending, running, completed, failed)

### 4. **CacheStats** (`components/features/CacheStats.tsx`)

- Cache statistics visualization
- Cache hit rate monitoring
- Cache management controls
- Invalidation history

### 5. **TemplateSelector** (`components/features/TemplateSelector.tsx`)

- Template browsing and selection
- Template preview
- Category filtering

### 6. **Advanced Job Filters** (`components/features/AdvancedJobFilters.tsx`)

- Multi-criteria job filtering (status, channels, date range)
- Search by job ID or document ID
- Filter presets (save and reuse filter combinations)
- Active filter badges with one-click removal

### 7. **Batch Job Operations** (`components/features/BatchJobOperations.tsx`)

- Multi-job selection
- Batch retry/cancel operations
- Export jobs (CSV/JSON)
- Floating action toolbar

### 8. **Analytics Components** (`components/features/analytics-*.tsx`)

- MetricsCard: Display KPIs with trends
- AnalyticsCharts: Line, pie, and bar charts
- TimelineView: Chronological job history
- Job success rates and channel distribution
- Performance metrics and trends

### 9. **User Preferences** (`context/preferences-context.tsx`)

- Notification preferences
- Display settings (table density, page size)
- Persistent preferences (localStorage)
- Filter preset management

## API Integration

### Using the API Client

```typescript
import { apiClient } from '@/lib/api/client';

// Health check
const health = await apiClient.healthCheck();

// Generate content
const result = await apiClient.generateContent({
  living_doc_id: 'doc-123',
  channel: 'email',
  tone: 'professional',
});

// Get job status
const job = await apiClient.getJobStatus('job-123');
```

### WebSocket Integration

```typescript
import { getWebSocketUrl } from '@/lib/api/client';

const ws = new WebSocket(getWebSocketUrl('/ws/content/client-123'));

ws.onmessage = event => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

## Development Guidelines

### BPS AI Pair Configuration

This project uses `bpsai-pair` for AI-assisted development. Configuration is in `.bpsai/config.yaml`.

**Key conventions:**

- File naming: `kebab-case.tsx`
- Components: `PascalCase`
- Hooks: `useCamelCase`
- Utilities: `camelCase`

### TypeScript

- Use strict mode
- Avoid `any` types
- Prefer explicit return types
- Use interfaces for props

### React

- Functional components only
- Use hooks (no class components)
- Prefer arrow functions
- Keep components small and focused

### Styling

- Use Tailwind utility classes
- Avoid inline styles
- Mobile-first responsive design
- Follow accessibility guidelines (WCAG 2.1 AA compliant)
  - Skip links for keyboard navigation
  - Proper ARIA labels and landmarks
  - Enhanced focus indicators
  - Reduced motion support
  - High contrast mode support
  - Screen reader utilities

### API Calls

- Use React Query for data fetching
- Implement proper loading states
- Handle errors gracefully
- Use centralized API client

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Environment Variables

| Variable              | Description          | Default                 |
| --------------------- | -------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL`  | WebSocket base URL   | `ws://localhost:8000`   |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Set environment variables
4. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

The dashboard can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Docker
- Traditional hosting with Node.js

## Backend Requirements

The dashboard requires the Content Generator API to be running:

- **Repository**: `halcytone-content-generator`
- **Framework**: FastAPI (Python)
- **Default URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Starting the Backend

```bash
cd ../halcytone-content-generator
python -m uvicorn src.halcytone_content_generator.main:app --reload
```

## Features Roadmap

### Phase 1: MVP ✅ (Components Migrated)

- [x] Health monitoring
- [x] Content generation interface
- [x] Job queue management
- [x] Cache statistics
- [x] Template selection

### Phase 2: Enhancement ✅

- [x] Authentication flow (API key management)
- [x] User settings page
- [x] Analytics dashboard
- [x] Content history view
- [x] Advanced filtering and search
- [x] Filter presets (save/manage custom filters)
- [x] Batch job operations (retry, cancel, export)
- [x] User preferences management
- [x] Real-time WebSocket updates
- [x] Timeline view for job history
- [x] Comprehensive analytics charts
- [x] Accessibility (WCAG 2.1 AA compliance)

### Phase 3: Advanced Features

- [ ] Scheduled content generation
- [ ] Multi-user support
- [ ] Role-based access control
- [ ] Audit logs
- [ ] Performance monitoring dashboard
- [ ] Advanced analytics (custom date ranges, period comparison)
- [ ] Export analytics (PDF/CSV)

## Contributing

1. Follow BPS AI Pair conventions (`.bpsai/config.yaml`)
2. Use TypeScript strict mode
3. Write tests for new features
4. Update documentation
5. Follow existing code patterns

## Testing

This project uses Jest and @testing-library/react for testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- analytics-charts.test.tsx
```

### Test Coverage

- **Analytics Components**: 90-97% coverage
  - MetricsCard: 95% coverage
  - AnalyticsCharts: 90% coverage
  - TimelineView: 96% coverage
  - Analytics Page: 84% coverage
- **Accessibility**: Zero axe violations (WCAG 2.1 AA)
- **Filter Presets**: Comprehensive UI and integration tests

## Troubleshooting

### Cannot connect to backend API

**Solution**: Ensure the backend is running on http://localhost:8000

```bash
cd ../halcytone-content-generator
python -m uvicorn src.halcytone_content_generator.main:app --reload
```

### WebSocket connection failed

**Solution**: Check `NEXT_PUBLIC_WS_URL` in `.env.local` matches backend WebSocket URL.

### Component import errors

**Solution**: Imports should use the `@/` alias:

```typescript
import { ContentGeneratorHealth } from '@/components/features';
import { apiClient } from '@/lib/api/client';
import type { HealthStatus } from '@/types';
```

## Documentation

- **Architecture**: See `docs/ARCHITECTURE-STANDALONE-PRODUCT.md` in backend repo
- **Dashboard Setup**: See `docs/content-generator-dashboard.md` in backend repo
- **API Docs**: http://localhost:8000/docs (when backend running)

## Support

For issues and questions:

- Backend API issues: `halcytone-content-generator` repository
- Dashboard issues: This repository

## License

Proprietary - Halcytone

---

**Dashboard Version**: 0.2.0
**Backend API Version**: See backend repository
**Last Updated**: 2025-10-07

### Recent Updates (Sprint 8)

- ✅ **Filter Presets**: Save and manage custom filter combinations
- ✅ **Batch Operations**: Multi-job retry, cancel, and export
- ✅ **Analytics Testing**: 90-97% test coverage on analytics components
- ✅ **Accessibility**: WCAG 2.1 AA compliance with jest-axe validation
- ✅ **Production Polish**: ESLint fixes, code cleanup, documentation updates
