# Sprint 10: Strategic Test Coverage Plan
**Created**: 2025-10-08
**Target**: 33.36% → 70% coverage (+36.64 percentage points)
**Estimated Duration**: 18-24 hours (4-5 sessions)
**Status**: Planning Phase

---

## 📊 Current Coverage Assessment

### Overall Metrics (Baseline)
- **Statements**: 33.36% (target: 70%, gap: -36.64%)
- **Branches**: 29.5% (target: 70%, gap: -40.5%)
- **Functions**: 36.67% (target: 70%, gap: -33.33%)
- **Lines**: 33.82% (target: 70%, gap: -36.18%)
- **Tests**: 311 passing, 40 failing, 2 skipped (353 total)

### Coverage by Area
| Area | Current | Target | Priority | Est. Lines |
|------|---------|--------|----------|------------|
| **Pages** | 0-10% | 70% | 🔴 High | ~2,800 |
| **Contexts** | 37.4% | 70% | 🔴 High | ~442 |
| **Hooks** | 58% | 70% | 🟡 Medium | ~282 |
| **Components/Features** | 34.64% | 70% | 🟠 Medium | ~3,500 |
| **UI Components** | 37.93% | 70% | 🟡 Medium | ~242 |
| **API Client** | 67.74% | 70% | 🟢 Low | ~46 |
| **Utilities** | 44.15% | 70% | 🟡 Medium | ~668 |

---

## 🎯 Strategic Priorities

### Priority Matrix (Impact vs Effort)

```
High Impact, Low Effort (DO FIRST):
├── Core Pages (generate, jobs, settings) - High user visibility
├── Auth Context - Critical for all authenticated flows
└── Preferences Context - Used across all pages

High Impact, Medium Effort (DO SECOND):
├── Use-websocket Hook - Real-time updates
├── Error Boundary - App-wide error handling
└── Remaining Pages (history, templates, campaigns)

Medium Impact, Medium Effort (DO THIRD):
├── Feature Components (50% done already)
├── Job Analytics Utility
└── API Client (nearly at 70%, quick win)

Low Priority (DEFER OR SKIP):
├── Mock Campaigns Utility (dev-only)
└── Advanced features (batch ops, timeline, job-detail-modal)
```

---

## 📋 Phase 1: Core User Flow Pages (8-10 hours)
**Target**: +15% coverage (33% → 48%)
**Focus**: Critical user-facing pages with high LOC count

### 1.1 Generate Page (2-3 hours)
**File**: `app/generate/page.tsx` (203 lines, 0% coverage)
**Priority**: 🔴 Critical
**Estimated Tests**: 25-30 tests

**Test Coverage**:
- ✅ Page rendering and layout
- ✅ Form component integration
- ✅ API key validation from context
- ✅ Content generation workflow
- ✅ Success/error state handling
- ✅ Navigation and routing
- ✅ Loading states
- ✅ Empty state handling

**Dependencies**:
- Requires ContentGenerationForm (78% covered already)
- Requires AuthContext mock

**Expected Gain**: +3-4% overall coverage

### 1.2 Jobs Page (2-3 hours)
**File**: `app/jobs/page.tsx` (613 lines, 0% coverage)
**Priority**: 🔴 Critical
**Estimated Tests**: 35-40 tests

**Test Coverage**:
- ✅ Page rendering with jobs list
- ✅ Real-time WebSocket updates
- ✅ Job filtering and search
- ✅ Job status filtering
- ✅ Pagination and infinite scroll
- ✅ Job actions (retry, cancel)
- ✅ Empty state and error handling
- ✅ Job detail modal integration
- ✅ Batch operations integration

**Dependencies**:
- Requires JobsList component (55% covered)
- Requires useWebSocket hook (0% covered - may need to test first)
- Requires JobDetailModal component

**Expected Gain**: +4-5% overall coverage

### 1.3 Settings Page (2-3 hours)
**File**: `app/settings/page.tsx` (540 lines, 0% coverage)
**Priority**: 🔴 Critical
**Estimated Tests**: 30-35 tests

**Test Coverage**:
- ✅ Page rendering with all sections
- ✅ API key management (add, update, remove)
- ✅ Preferences management
- ✅ Theme settings
- ✅ Notification preferences
- ✅ Cache management controls
- ✅ Form validation
- ✅ Save/reset functionality
- ✅ Success/error feedback

**Dependencies**:
- Requires PreferencesContext (0% covered - should test first)
- Requires AuthContext mock
- Requires localStorage functionality

**Expected Gain**: +3-4% overall coverage

### 1.4 Home Page (1-2 hours)
**File**: `app/page.tsx` (77 lines, 0% coverage)
**Priority**: 🟡 Medium
**Estimated Tests**: 15-20 tests

**Test Coverage**:
- ✅ Landing page rendering
- ✅ Call-to-action buttons
- ✅ Navigation to other pages
- ✅ Marketing content display
- ✅ Feature highlights
- ✅ Authentication state awareness

**Dependencies**: Minimal (mostly static content)

**Expected Gain**: +1-2% overall coverage

---

## 📋 Phase 2: Critical Infrastructure (4-6 hours)
**Target**: +10% coverage (48% → 58%)
**Focus**: Core contexts and hooks that power the application

### 2.1 Auth Context (2-3 hours)
**File**: `app/contexts/auth-context.tsx` (301 lines, 0% coverage)
**Priority**: 🔴 Critical
**Estimated Tests**: 35-40 tests

**Test Coverage**:
- ✅ Provider rendering
- ✅ API key storage and retrieval
- ✅ Login/logout functionality
- ✅ API key validation
- ✅ Authentication state management
- ✅ localStorage persistence
- ✅ Context hook (useAuth)
- ✅ Error handling
- ✅ Cross-tab synchronization

**Dependencies**:
- Requires localStorage mock
- Requires API client mock

**Expected Gain**: +4-5% overall coverage
**Note**: This is a blocker for many page tests - do early!

### 2.2 Preferences Context (1-2 hours)
**File**: `app/context/preferences-context.tsx` (141 lines, 0% coverage)
**Priority**: 🔴 Critical
**Estimated Tests**: 20-25 tests

**Test Coverage**:
- ✅ Provider rendering
- ✅ Preferences CRUD operations
- ✅ Default preferences
- ✅ localStorage persistence
- ✅ Theme management
- ✅ Notification settings
- ✅ Context hook (usePreferences)
- ✅ Cross-tab sync

**Dependencies**:
- Similar pattern to toast-context (already tested)

**Expected Gain**: +2-3% overall coverage

### 2.3 Use-websocket Hook (1-2 hours)
**File**: `app/hooks/use-websocket.ts` (282 lines, 0% coverage)
**Priority**: 🟡 Medium-High
**Estimated Tests**: 25-30 tests

**Test Coverage**:
- ✅ WebSocket connection lifecycle
- ✅ Auto-reconnection logic
- ✅ Message sending/receiving
- ✅ Connection state management
- ✅ Error handling
- ✅ Message queue for offline
- ✅ Event callbacks (onOpen, onClose, onError, onMessage)
- ✅ Cleanup on unmount

**Dependencies**:
- Requires WebSocket mock
- Complex async testing

**Expected Gain**: +3-4% overall coverage
**Note**: Required for Jobs page real-time updates

---

## 📋 Phase 3: Remaining Pages (4-6 hours)
**Target**: +8% coverage (58% → 66%)
**Focus**: Complete page coverage for all routes

### 3.1 History Page (1-2 hours)
**File**: `app/history/page.tsx` (269 lines, 0% coverage)
**Priority**: 🟡 Medium
**Estimated Tests**: 25-30 tests

**Test Coverage**:
- ✅ Page rendering with timeline
- ✅ Historical job data loading
- ✅ Date filtering and grouping
- ✅ Search functionality
- ✅ Timeline view integration
- ✅ Export functionality
- ✅ Empty state
- ✅ Pagination

**Expected Gain**: +2-3% overall coverage

### 3.2 Templates Page (1-2 hours)
**File**: `app/templates/page.tsx` (331 lines, 0% coverage)
**Priority**: 🟡 Medium
**Estimated Tests**: 25-30 tests

**Test Coverage**:
- ✅ Template list rendering
- ✅ Template filtering
- ✅ Template preview
- ✅ Template selection
- ✅ Custom template creation
- ✅ Template CRUD operations
- ✅ Template selector integration

**Expected Gain**: +2-3% overall coverage

### 3.3 Campaigns Page (2 hours)
**File**: `app/campaigns/page.tsx` (333 lines, 0% coverage)
**Priority**: 🟢 Low
**Estimated Tests**: 25-30 tests

**Test Coverage**:
- ✅ Campaign list rendering
- ✅ Campaign creation
- ✅ Campaign management
- ✅ Bulk job scheduling
- ✅ Campaign analytics
- ✅ Status tracking

**Expected Gain**: +2% overall coverage

---

## 📋 Phase 4: Components & Utilities (4-6 hours)
**Target**: +5-8% coverage (66% → 71-74%)
**Focus**: Fill remaining gaps to exceed 70% target

### 4.1 Error Boundary (1 hour)
**File**: `app/components/ui/error-boundary.tsx` (242 lines, 0% coverage)
**Estimated Tests**: 15-20 tests

**Test Coverage**:
- ✅ Error catching and display
- ✅ Error logging
- ✅ Reset functionality
- ✅ Development vs production modes
- ✅ Fallback UI rendering

**Expected Gain**: +1-2% overall coverage

### 4.2 Remaining Feature Components (2-3 hours)
**Files**: 10 components at 0% coverage
**Estimated Tests**: 40-50 tests total

**Components**:
- advanced-job-filters.tsx (304 lines)
- analytics-metrics.tsx (302 lines)
- batch-job-operations.tsx (261 lines)
- cache-stats.tsx (411 lines)
- content-generator-health.tsx (284 lines)
- job-charts.tsx (242 lines)
- job-detail-modal.tsx (338 lines)
- job-status-card.tsx (364 lines)
- job-timeline.tsx (335 lines)
- template-selector.tsx (354 lines)

**Strategy**: Focus on components with highest ROI
- Skip or defer low-priority components
- Test critical paths only (happy path + error case)
- Target 50-60% coverage per component (not 95%)

**Expected Gain**: +3-4% overall coverage

### 4.3 Utilities (1-2 hours)
**Files**:
- lib/utils/job-analytics.ts (253 lines, 0% coverage)
- lib/api/client.ts (46 lines, 0% coverage)

**Estimated Tests**: 20-25 tests

**Expected Gain**: +1-2% overall coverage

---

## 🔧 Technical Strategy

### Testing Approach

**1. Consistent Mocking Strategy**
```typescript
// Standard mock setup for pages
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(() => ({
    apiKey: 'test-api-key',
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

jest.mock('@/lib/api/api-client');
jest.mock('@/lib/utils/mock-data-generator');
```

**2. Page Test Template**
```typescript
describe('PageName', () => {
  // Setup/teardown
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Critical path tests (always include)
  describe('Rendering', () => {
    it('should render page with title', () => {});
    it('should render main components', () => {});
  });

  describe('Authentication', () => {
    it('should load API key from context', () => {});
    it('should redirect if not authenticated', () => {});
  });

  describe('Data Loading', () => {
    it('should show loading state', () => {});
    it('should display data when loaded', () => {});
    it('should handle errors gracefully', () => {});
  });

  describe('User Interactions', () => {
    it('should handle primary action', () => {});
    it('should navigate correctly', () => {});
  });

  // Edge cases (optional, add if time permits)
  describe('Edge Cases', () => {});
});
```

**3. Context Test Template**
```typescript
// Based on successful toast-context pattern
describe('ContextName', () => {
  describe('Provider', () => {
    it('should render children', () => {});
    it('should provide default values', () => {});
  });

  describe('Hook', () => {
    it('should throw error outside provider', () => {});
    it('should return context value', () => {});
  });

  describe('State Management', () => {
    it('should update state correctly', () => {});
    it('should persist to localStorage', () => {});
    it('should synchronize across tabs', () => {});
  });
});
```

**4. Hook Test Template**
```typescript
// Based on successful use-local-storage pattern
describe('useHookName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return initial value', () => {});
    it('should update value', () => {});
  });

  describe('Side Effects', () => {
    it('should trigger side effect', () => {});
    it('should cleanup on unmount', () => {});
  });

  describe('Error Handling', () => {
    it('should handle error case', () => {});
  });
});
```

### Quality Standards

**Coverage Targets by File Type**:
- **Critical Pages** (generate, jobs, settings): 70-80%
- **Other Pages**: 60-70%
- **Contexts**: 85-95% (high value, relatively small)
- **Hooks**: 80-90%
- **Components**: 60-70% (focus on critical paths)
- **Utilities**: 70-80%

**Test Quality Checklist**:
- ✅ Tests pass consistently (no flaky tests)
- ✅ Clear test descriptions
- ✅ Proper async handling (waitFor, act)
- ✅ Clean mocks (no leaking state)
- ✅ Edge cases covered
- ✅ Accessibility tests included
- ✅ User-centric testing (not implementation details)

---

## 📅 Execution Timeline

### Session 7: Phase 1A (4-5 hours)
**Target**: 33% → 42% (+9%)
- ✅ Auth Context (2-3h) - **MUST DO FIRST** (blocker)
- ✅ Preferences Context (1-2h)
- ✅ Generate Page (1-2h)

### Session 8: Phase 1B (4-5 hours)
**Target**: 42% → 52% (+10%)
- ✅ Jobs Page (2-3h)
- ✅ Settings Page (2-3h)

### Session 9: Phase 2 (4-5 hours)
**Target**: 52% → 62% (+10%)
- ✅ Use-websocket Hook (1-2h)
- ✅ History Page (1-2h)
- ✅ Templates Page (1-2h)
- ✅ Home Page (1h)

### Session 10: Phase 3 (4-5 hours)
**Target**: 62% → 71% (+9%)
- ✅ Error Boundary (1h)
- ✅ Campaigns Page (1-2h)
- ✅ Feature Components (high-priority) (2-3h)

### Session 11 (Optional): Phase 4 (2-3 hours)
**Target**: 71% → 75% (+4%)
- ✅ Utilities (1h)
- ✅ Remaining components (1-2h)
- ✅ Fix failing tests

---

## 🎯 Success Criteria

### Sprint 10 Definition of Done
1. **Test Coverage**: ≥ 70% (statements, branches, lines, functions)
2. **Tests Passing**: ≥ 95% pass rate (< 20 failing tests)
3. **Build Status**: 0 errors, 0 warnings
4. **Quality**: All critical paths tested
5. **Documentation**: All test strategies documented
6. **Maintainability**: Tests follow consistent patterns
7. **Performance**: Test suite runs in < 60 seconds
8. **CI/CD Ready**: Tests run reliably in CI environment

### Coverage Goals by Area (Post-Sprint 10)
| Area | Target | Stretch Goal |
|------|--------|--------------|
| Pages | 70% | 75% |
| Contexts | 85% | 90% |
| Hooks | 80% | 85% |
| Components | 65% | 70% |
| API Client | 70% | 75% |
| Utilities | 70% | 75% |

---

## 🚨 Risk Management

### Identified Risks

**1. Fake Timers Complexity**
- **Risk**: Dashboard tests failed due to setTimeout + fake timers conflicts
- **Mitigation**:
  - Use consistent timer strategy per file
  - Document timer patterns
  - Consider removing setTimeout from components in favor of useEffect

**2. WebSocket Testing Complexity**
- **Risk**: use-websocket may be difficult to test (async, connections, state)
- **Mitigation**:
  - Create comprehensive WebSocket mock
  - Test connection lifecycle in isolation
  - Use renderHook from @testing-library/react-hooks

**3. Time Estimates**
- **Risk**: 18-24 hour estimate may be optimistic
- **Mitigation**:
  - Break into small sessions (4-5h each)
  - Prioritize high-value tests first
  - Accept 65-70% as success threshold
  - Can defer Phase 4 if needed

**4. Test Flakiness**
- **Risk**: Async tests may become flaky over time
- **Mitigation**:
  - Use waitFor with reasonable timeouts
  - Avoid brittle selectors
  - Clean up mocks properly
  - Run tests multiple times to verify consistency

### Contingency Plans

**If behind schedule after Session 8**:
- ✅ Accept 55-60% coverage as "good enough"
- ✅ Deploy with monitoring
- ✅ Defer Phase 3 & 4 to post-production

**If tests are too flaky**:
- ✅ Focus on unit tests over integration tests
- ✅ Simplify component interactions
- ✅ Remove unnecessary timers/delays

**If coverage not improving**:
- ✅ Review coverage reports to find gaps
- ✅ Focus on high-LOC files first
- ✅ Reduce quality bar for low-priority components

---

## 📊 Progress Tracking

### Sprint 10 Scorecard

| Phase | Target Coverage | Estimated Hours | Status | Actual Coverage | Actual Hours |
|-------|----------------|-----------------|--------|-----------------|--------------|
| Baseline | 33.36% | - | ✅ Complete | 33.36% | - |
| Phase 1A | 42% | 4-5h | 📋 Planned | - | - |
| Phase 1B | 52% | 4-5h | 📋 Planned | - | - |
| Phase 2 | 62% | 4-5h | 📋 Planned | - | - |
| Phase 3 | 71% | 4-5h | 📋 Planned | - | - |
| Phase 4 | 75% | 2-3h | 📋 Optional | - | - |

### Test Count Tracking

| Metric | Baseline | Session 7 | Session 8 | Session 9 | Session 10 | Session 11 | Target |
|--------|----------|-----------|-----------|-----------|------------|------------|--------|
| Tests | 353 | - | - | - | - | - | 550+ |
| Passing | 311 | - | - | - | - | - | 520+ |
| Failing | 40 | - | - | - | - | - | < 20 |
| Pass Rate | 88.1% | - | - | - | - | - | > 95% |

---

## 🎓 Lessons Applied from Sprint 9

### What Worked Well (Continue)
1. ✅ **Phased approach**: Breaking work into clear phases with targets
2. ✅ **Comprehensive test suites**: 35-test suite caught critical bug
3. ✅ **Consistent patterns**: Reusing test templates speeds development
4. ✅ **Mock strategies**: Well-defined mocks reduce setup time

### What Didn't Work (Improve)
1. ❌ **Fake timers**: Need better strategy for setTimeout tests
2. ❌ **Time estimates**: Were too optimistic, 70% target took longer than expected
3. ❌ **Dashboard tests**: 50% failure rate due to async issues

### Improvements for Sprint 10
1. ✅ **Better time estimates**: 4-5h per session (not 2-3h)
2. ✅ **Test blockers first**: Auth context before page tests
3. ✅ **Lower quality bar**: 60-70% coverage per file (not 95%)
4. ✅ **Quick wins first**: API client (67% → 70%) is easy gain
5. ✅ **Skip low-value**: Mock campaigns, complex components can wait

---

## 📝 Next Steps

### Immediate Actions (Pre-Session 7)
1. ✅ Review and approve this plan
2. ✅ Update `context/development.md` with Sprint 10 status
3. ✅ Commit plan to repository
4. ✅ Set up Session 7 environment
5. ✅ Prepare mock strategies document

### Session 7 Kickoff
1. Start with Auth Context (blocker for all page tests)
2. Follow test template from this document
3. Aim for 85%+ coverage on contexts
4. Update progress tracking table after each file
5. Document any new patterns or issues

---

## 📚 References

### Related Documents
- `docs/SPRINT-9-SESSION-LOG.md` - Previous sprint learnings
- `docs/SPRINTS-ARCHIVE.md` - Historical sprint data
- `context/development.md` - Current project status
- `CONVENTIONS.md` - Testing standards

### Testing Resources
- Jest: https://jestjs.io/docs/getting-started
- Testing Library: https://testing-library.com/docs/react-testing-library/intro
- React Testing Patterns: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

---

**Plan Created**: 2025-10-08
**Next Review**: After Session 7
**Target Completion**: Session 10 (4-5 sessions)
**Success Metric**: ≥ 70% coverage, ≥ 95% pass rate, production-ready
