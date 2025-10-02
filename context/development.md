# Development Context - Content Generator Dashboard

**Last Updated**: 2025-10-02 (Documentation Suite Complete)
**Project**: Content Generator Dashboard
**Repository**: https://github.com/fivedollarfridays/content-generator-dashboard

---

## 🎯 Context Loop (Update After Every Change)

### Overall goal is:

Build a production-ready dashboard for the Content Generator product that provides an intuitive, accessible interface for content creation and management.

### Last action was:

Completed comprehensive documentation suite including:

- All context/ files (CLAUDE.md, agents.md, development.md, project_tree.md)
- Complete docs/ directory (ARCHITECTURE.md, DEVELOPMENT.md, TESTING.md, DEPLOYMENT.md, API-INTEGRATION.md, COMPONENTS.md, TROUBLESHOOTING.md)
- CONVENTIONS.md and CONTRIBUTING.md with comprehensive guidelines
- .env.example with environment variable documentation
- Committed and pushed documentation migration package (commit a54da37)
- Committed and pushed complete documentation suite

### Next action will be:

Dashboard is ready for Phase 2 feature development. Waiting for backend test coverage to reach 70% before starting dashboard feature implementation (pages, authentication, WebSocket integration).

### Blockers/Risks:

- **Blocker**: Phase 2 feature development blocked by backend test coverage requirement (currently 39%, targeting 70%).
- **Risk**: None currently. All Phase 1 deliverables complete and documentation comprehensive.
- **Timeline**: Ready to start Phase 2 immediately after backend coverage target met.

---

## 📊 Project Status

### Current Phase: Phase 1 Complete ✅ - Documentation & Setup Complete

**Progress**: 100% Complete - Ready for Phase 2

**Version**: 0.1.0
**Build Status**: ✅ Passing (0 errors)
**Test Coverage**: 0% (tests pending in Phase 3)
**Deployment**: Local development only

---

## 🏗️ Architecture Overview

### Tech Stack

**Framework**: Next.js 15.5.4 with App Router
**Language**: TypeScript 5.x (strict mode)
**Styling**: Tailwind CSS 3.x
**State Management**: @tanstack/react-query 5.x
**Forms**: React Hook Form 7.x + Zod 3.x
**HTTP Client**: Axios 1.x
**Charts**: Recharts 2.x
**Date Handling**: date-fns 4.x

### Backend Integration

**Backend Repository**: halcytone-content-generator (FastAPI)
**API URL**: http://localhost:8000 (development)
**WebSocket URL**: ws://localhost:8000 (development)
**API Docs**: http://localhost:8000/docs

### Deployment Target

**Platform**: Vercel (recommended)
**Alternative**: Netlify, AWS Amplify, Docker
**Domain**: TBD
**SSL**: Automatic via Vercel

---

## 📁 Repository Structure

```
content-generator-dashboard/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout with navigation
│   ├── page.tsx               # Home page
│   ├── globals.css            # Global styles
│   ├── dashboard/             # Dashboard page
│   ├── generate/              # Content generation (Phase 2)
│   ├── jobs/                  # Job management (Phase 2)
│   ├── templates/             # Template management (Phase 2)
│   └── settings/              # Settings (Phase 2)
│
├── components/                 # React components
│   ├── ui/                    # Generic UI components
│   │   └── Navigation.tsx     # Main navigation
│   │
│   └── features/              # Feature-specific components
│       ├── CacheStats.tsx
│       ├── ContentGenerationForm.tsx
│       ├── ContentGeneratorHealth.tsx
│       ├── JobsList.tsx
│       ├── JobStatusCard.tsx
│       └── TemplateSelector.tsx
│
├── lib/                       # Utilities and helpers
│   ├── api/                   # API client
│   │   ├── api-client.ts     # Main API client class
│   │   └── client.ts         # Configured instance + exports
│   └── utils/                # Utility functions
│
├── hooks/                     # Custom React hooks
│
├── types/                     # TypeScript definitions
│   ├── content-generator.ts  # API types
│   └── index.ts              # Type exports
│
├── public/                    # Static assets
│
├── context/                   # PairCoder context
│   ├── agents.md             # AI pairing playbook
│   ├── development.md        # This file
│   └── project_tree.md       # File structure
│
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md       # Architecture overview
│   ├── CONTRIBUTING.md       # Contribution guidelines
│   ├── DEVELOPMENT.md        # Development guide
│   ├── TESTING.md            # Testing guide
│   ├── DEPLOYMENT.md         # Deployment guide
│   ├── API-INTEGRATION.md    # API integration docs
│   ├── COMPONENTS.md         # Component documentation
│   └── TROUBLESHOOTING.md    # Common issues
│
├── .bpsai/                    # BPS AI Pair config
│   └── config.yaml
│
├── .claude/                   # Claude Code config
│   └── settings.local.json
│
├── CLAUDE.md                  # Claude root pointer
├── CONVENTIONS.md             # Coding standards
├── CONTRIBUTING.md            # How to contribute
├── README.md                  # Project overview
├── SETUP-SUMMARY.md           # Setup guide
│
├── .env.local                 # Environment variables (not in git)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── postcss.config.js
├── jest.config.js             # Testing config
├── jest.setup.js
├── .prettierrc.json
└── .prettierignore
```

---

## 🎯 Development Phases

### Phase 1: MVP - Components Migrated ✅ COMPLETE

**Duration**: 2 hours
**Completed**: 2025-10-02
**Status**: ✅ Complete

**Deliverables**:

- [x] Repository created on GitHub
- [x] Next.js 15.5.4 setup with TypeScript
- [x] Tailwind CSS configured
- [x] 6 components migrated from backend repo
- [x] API client with environment variables
- [x] Build passing (0 errors)
- [x] BPS AI Pair configured
- [x] Basic README and SETUP-SUMMARY
- [x] Comprehensive documentation migration (this update)

**Components Migrated**:

1. ContentGeneratorHealth.tsx (285 lines) - Health monitoring dashboard
2. ContentGenerationForm.tsx (325 lines) - Content creation interface
3. JobsList.tsx (317 lines) - Job queue management
4. JobStatusCard.tsx (308 lines) - Individual job status
5. CacheStats.tsx (358 lines) - Cache statistics
6. TemplateSelector.tsx (322 lines) - Template browsing

### Phase 2: Feature Development 🚧 PENDING

**Duration**: 2 weeks
**Status**: ⏸️ Pending (after backend reaches 70% test coverage)
**Estimated Start**: Week 4-5 of backend development

**Goals**: Build complete dashboard with authentication and real-time features

**Sprint 2.1: Page Development** (Week 1)

- [ ] Build `/generate` page with ContentGenerationForm
- [ ] Build `/jobs` page with JobsList and real-time updates
- [ ] Build `/templates` page with TemplateSelector
- [ ] Build `/settings` page for API keys
- [ ] Implement loading states and error handling
- [ ] Responsive design for mobile/tablet

**Sprint 2.2: Authentication & Real-time** (Week 2)

- [ ] API key management UI
- [ ] Authentication flow
- [ ] WebSocket integration for job updates
- [ ] React Query setup for server state
- [ ] Optimistic UI updates
- [ ] Error boundary implementation

**Sprint 2.3: Advanced Features** (Week 2)

- [ ] Content history view
- [ ] Analytics dashboard
- [ ] Batch operations UI
- [ ] Advanced filtering
- [ ] Export functionality
- [ ] User preferences

**Definition of Done**:

- All pages built and functional
- Authentication working
- WebSocket real-time updates
- React Query state management
- Responsive on all devices
- Error handling complete
- Basic tests written

### Phase 3: Testing & Quality 🧪 PLANNED

**Duration**: 1 week
**Status**: ⏸️ Planned
**Estimated Start**: After Phase 2 completion

**Tasks**:

- [ ] Unit tests with Jest + Testing Library
- [ ] Component integration tests
- [ ] E2E tests with Playwright
- [ ] Accessibility testing (WCAG 2.1 AA)
- [ ] Performance optimization
- [ ] Lighthouse score >90
- [ ] Code coverage >80%

**Definition of Done**:

- Test coverage >80%
- All tests passing
- Lighthouse score >90 (all categories)
- WCAG 2.1 AA compliant
- Performance budget met
- No console errors/warnings

### Phase 4: Production Deployment 🚀 PLANNED

**Duration**: 1 week
**Status**: ⏸️ Planned
**Estimated Start**: After Phase 3 completion

**Tasks**:

- [ ] Vercel deployment configuration
- [ ] Production environment variables
- [ ] Custom domain setup
- [ ] SSL certificate configuration
- [ ] Backend production integration
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Performance monitoring
- [ ] Deployment documentation

**Definition of Done**:

- Deployed to production
- Custom domain configured
- SSL working
- Monitoring active
- Error tracking configured
- Analytics implemented
- Production docs complete

---

## 🔄 Timeline & Milestones

```
Week 1:     Phase 1 Complete ✅ (MVP components migrated)
Week 2-3:   Backend test coverage work (targeting 70%)
Week 4-5:   Phase 2 (Dashboard feature development)
Week 6:     Phase 3 (Testing & quality)
Week 7:     Phase 4 (Production deployment)
Week 8:     Go-live 🚀
```

**Current Week**: Week 1
**Next Milestone**: Backend 70% coverage → Start Phase 2

---

## 📈 Success Metrics

### Current Status

| Metric              | Current    | Target     | Status |
| ------------------- | ---------- | ---------- | ------ |
| Build Status        | ✅ Passing | ✅ Passing | ✅     |
| TypeScript Errors   | 0          | 0          | ✅     |
| Components Migrated | 6/6        | 6/6        | ✅     |
| Test Coverage       | 0%         | 80%        | ⏸️     |
| Lighthouse Score    | N/A        | >90        | ⏸️     |
| WCAG Compliance     | Unknown    | AA         | ⏸️     |
| Page Load Time      | N/A        | <2s        | ⏸️     |
| Bundle Size         | ~500KB     | <1MB       | ✅     |

### Phase 2 Targets

- All dashboard pages functional
- Authentication working
- Real-time updates via WebSocket
- React Query caching
- Responsive design
- Error handling complete

### Phase 3 Targets

- Test coverage >80%
- Lighthouse score >90
- WCAG 2.1 AA compliant
- Performance optimized

### Phase 4 Targets

- Production deployment successful
- Monitoring active
- Error tracking configured
- Analytics implemented

---

## 🚨 Current Issues & Blockers

### Blockers

- **None** - Dashboard is ready for feature development
- Backend test coverage at 39% (targeting 70% before Phase 2)

### Known Issues

- None currently

### Technical Debt

- Tests need to be added (Phase 3)
- Error tracking not yet configured (Phase 4)
- Analytics not yet implemented (Phase 4)

---

## 🔑 Key Decisions & Architecture

### Decision Log

**2025-10-02**: Migrated components from backend to dashboard repository

- **Decision**: Create standalone dashboard repository
- **Rationale**: Cleaner architecture, independent deployment, better separation of concerns
- **Impact**: Backend and frontend now completely separated

**2025-10-02**: Selected Next.js 15.5.4 with App Router

- **Decision**: Use Next.js App Router (not Pages Router)
- **Rationale**: Modern Next.js best practice, better performance, improved developer experience
- **Impact**: File-based routing in `app/` directory

**2025-10-02**: Selected @tanstack/react-query for state management

- **Decision**: Use React Query for server state
- **Rationale**: Industry standard, automatic caching, optimistic updates, excellent DX
- **Impact**: No need for Redux or similar

**2025-10-02**: Selected Tailwind CSS for styling

- **Decision**: Use Tailwind utility classes
- **Rationale**: Rapid development, consistent design, excellent mobile support
- **Impact**: Minimal custom CSS needed

### Architecture Patterns

**API Integration**: Centralized API client pattern

- Single `apiClient` instance exported from `lib/api/client.ts`
- Environment variables for configuration
- TypeScript types imported from `types/content-generator.ts`

**State Management**: Server state vs Client state

- **Server state**: React Query for API data
- **Client state**: React hooks (useState, useReducer)
- **Form state**: React Hook Form

**Component Organization**: Features vs UI

- **UI components**: Generic, reusable (buttons, inputs, cards)
- **Feature components**: Specific to features (JobsList, TemplateSelector)
- **Layout components**: Page layouts (DashboardLayout, PublicLayout)

**Real-time Updates**: WebSocket pattern

- WebSocket connection per feature (jobs, content generation)
- Automatic reconnection on disconnect
- React hooks for WebSocket management

---

## 🧪 Testing Strategy

### Testing Pyramid

```
     /\
    /E2E\      <- 10% - Full user flows (Playwright)
   /------\
  /Integration\ <- 30% - Component integration (Testing Library)
 /-----------\
/    Unit     \ <- 60% - Pure functions, hooks (Jest)
---------------
```

### Coverage Targets

- **Overall**: >80%
- **Components**: >75%
- **Utilities**: >90%
- **Hooks**: >85%
- **API Client**: >80%

### Testing Tools

- **Unit/Integration**: Jest + @testing-library/react
- **E2E**: Playwright
- **Accessibility**: jest-axe
- **Visual Regression**: TBD (Chromatic or Percy)

---

## 📚 Documentation

### Documentation Structure

All documentation lives in `/docs`:

- **ARCHITECTURE.md**: System design and architecture decisions
- **CONTRIBUTING.md**: How to contribute to the project
- **DEVELOPMENT.md**: Development setup and workflow
- **TESTING.md**: Testing guidelines and examples
- **DEPLOYMENT.md**: Deployment process and configuration
- **API-INTEGRATION.md**: How to integrate with backend API
- **COMPONENTS.md**: Component library documentation
- **TROUBLESHOOTING.md**: Common issues and solutions

### Documentation Standards

- **Markdown**: All docs in Markdown
- **Examples**: Include code examples
- **Links**: Cross-reference related docs
- **Updates**: Update docs with code changes
- **Clarity**: Write for developers joining the project

---

## 🔐 Environment Configuration

### Development

```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Production

```bash
# .env.production (Vercel)
NEXT_PUBLIC_API_URL=https://api.content-generator.com
NEXT_PUBLIC_WS_URL=wss://api.content-generator.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 🛠️ Development Workflow

### Daily Workflow

1. Pull latest changes: `git pull origin master`
2. Review Context Loop in this file
3. Create feature branch: `git checkout -b feature/my-feature`
4. Make changes with tests
5. Run tests: `npm run test`
6. Run linter: `npm run lint`
7. Build: `npm run build`
8. Commit: `git commit -m "feat: add my feature"`
9. Push: `git push origin feature/my-feature`
10. Create PR on GitHub
11. Update Context Loop

### Code Review Checklist

- [ ] TypeScript types defined
- [ ] Components follow conventions
- [ ] Tests written and passing
- [ ] Lint passing
- [ ] Build successful
- [ ] Accessibility considered
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Context Loop updated

---

## 🎨 Design System

### Colors

**Primary**: Blue (#3B82F6)
**Success**: Green (#10B981)
**Warning**: Yellow (#F59E0B)
**Error**: Red (#EF4444)
**Neutral**: Gray (#6B7280)

### Typography

**Font**: Inter (from next/font/google)
**Sizes**: text-sm, text-base, text-lg, text-xl, text-2xl
**Weights**: font-normal, font-medium, font-semibold, font-bold

### Spacing

**Scale**: 4px base unit (p-1 = 4px, p-2 = 8px, p-4 = 16px, etc.)
**Layout**: max-w-7xl for main content
**Gaps**: gap-4 for grids, gap-2 for tight spacing

### Components

**Buttons**: px-4 py-2, rounded, with hover states
**Cards**: p-6, shadow, rounded-lg
**Forms**: full-width inputs, clear labels, error states
**Navigation**: sticky top-0, shadow on scroll

---

## 📞 Support & Resources

### Internal Resources

- **Backend Repository**: https://github.com/fivedollarfridays/halcytone-content-generator
- **Backend Docs**: See backend repo `/docs` directory
- **API Documentation**: http://localhost:8000/docs (when backend running)

### External Resources

- **Next.js**: https://nextjs.org/docs
- **React Query**: https://tanstack.com/query/latest
- **Tailwind**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **React Hook Form**: https://react-hook-form.com/

### Getting Help

- **Issues**: Create GitHub issue in this repository
- **Backend Issues**: Create issue in backend repository
- **Questions**: Ask in project chat/email

---

## 🔄 Recent Updates

### 2025-10-02: Documentation Migration Package

- Created CLAUDE.md root pointer
- Created context/agents.md AI pairing playbook
- Created context/development.md (this file)
- Established PairCoder conventions
- Next: Create project_tree.md, docs/ directory, CONVENTIONS.md, CONTRIBUTING.md

### 2025-10-02: Dashboard Repository Created

- Created repository on GitHub
- Migrated 6 components from backend
- Setup Next.js 15.5.4 + TypeScript + Tailwind
- Build passing with 0 errors
- Comprehensive README created

---

## 🎯 Definition of Done

### Feature Complete When:

- Code written and reviewed
- Tests written and passing (>80% coverage)
- TypeScript types defined
- Lint passing
- Build successful
- Accessibility tested
- Performance optimized
- Documentation updated
- Context Loop updated
- PR approved and merged

### Release Ready When:

- All features complete
- All tests passing
- Lighthouse score >90
- WCAG 2.1 AA compliant
- Error tracking configured
- Analytics implemented
- Deployment successful
- Documentation complete

---

**Last Context Sync**: 2025-10-02
**Next Review**: After completing documentation migration package
**Project Health**: ✅ Excellent - On track for planned timeline
