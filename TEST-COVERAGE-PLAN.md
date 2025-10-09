# Test Coverage Plan - Reaching 70% DoD Target

**Date**: October 8, 2025
**Current Coverage**: 21%
**Target Coverage**: 70%
**Gap**: 49 percentage points

---

## Executive Summary

### Current State
- **Total Tests**: 238 (190 passing, 48 failing)
- **Coverage**: 21.02% statements (Target: 70%)
- **Untested Code**: ~4,770 lines
- **Status**: ❌ Not meeting DoD

### Coverage Breakdown by Area

| Area | Current | Target | Priority | Lines Untested |
|------|---------|--------|----------|----------------|
| Pages | 0% | 70% | 🔴 CRITICAL | ~2,460 |
| Contexts | 0% | 70% | 🔴 CRITICAL | ~770 |
| Hooks | 0% | 70% | 🔴 CRITICAL | ~944 |
| Components (gaps) | 0-46% | 70% | 🟡 HIGH | ~596 |
| API Client | 68% | 70% | 🟢 LOW | ~50 |
| UI Components | 96% | 70% | ✅ DONE | 0 |

---

## Strategic Approach

### Phase 1: Stabilization (Fix Failing Tests)
**Goal**: Get to 100% passing tests
**Estimated Time**: 2-3 hours
**Impact**: Establishes stable baseline

#### Failing Test Breakdown
1. **ContentGenerationForm** (12 failures) - Form refactored, tests outdated
2. **AnalyticsPage** (20 failures) - Switched to mock data
3. **JobsList** (14 failures) - Component refactored
4. **TimelineView** (2 failures) - Date handling edge cases

### Phase 2: High-Impact Coverage (Pages)
**Goal**: Pages 0% → 70%
**Estimated Time**: 4-5 hours
**Impact**: +35-40 percentage points

#### Page Testing Priority
1. **Dashboard** (181 lines) - Main entry point
2. **Jobs** (613 lines) - Core functionality
3. **Analytics** (323 lines) - Already has tests, need fixes
4. **History** (269 lines) - Medium complexity
5. **Settings** (540 lines) - Complex state management
6. **Generate** (203 lines) - Form validation
7. **Templates** (331 lines) - Has some tests

### Phase 3: Foundation Coverage (Contexts & Hooks)
**Goal**: Contexts & Hooks 0% → 70%
**Estimated Time**: 3-4 hours
**Impact**: +10-15 percentage points

#### Context Testing Priority
1. **auth-context** (301 lines) - Critical auth logic
2. **toast-context** (328 lines) - User feedback system
3. **preferences-context** (141 lines) - User settings

#### Hook Testing Priority
1. **use-websocket** (282 lines) - Real-time features
2. **use-local-storage** (336 lines) - Data persistence
3. **use-api** (326 lines) - API interactions
4. **use-job-updates** (243 lines) - NEW, needs tests

### Phase 4: Component Gaps
**Goal**: Fill remaining component gaps
**Estimated Time**: 2-3 hours
**Impact**: +5-10 percentage points

#### Component Testing Priority
1. **error-boundary** (242 lines) - Error handling
2. **template-selector** (354 lines) - Template management

---

## Detailed Task Breakdown

### Phase 1: Fix Failing Tests (48 tests)

#### Task 1.1: Fix ContentGenerationForm Tests (12 tests)
**Files**: `app/components/features/__tests__/content-generation-form.test.tsx`
**Issues**:
- Form structure changed
- CSS classes changed
- Button text/accessibility changed

**Actions**:
1. Update form control selectors
2. Update CSS class expectations
3. Update button text expectations
4. Re-test form submission logic

#### Task 1.2: Fix AnalyticsPage Tests (20 tests)
**Files**: `app/analytics/__tests__/page.test.tsx`
**Issues**:
- Switched from API calls to mock data
- Mock data structure different from expectations

**Actions**:
1. Update tests to use mockDataStore instead of API mocks
2. Update data structure expectations
3. Update async behavior (mock data is synchronous)

#### Task 1.3: Fix JobsList Tests (14 tests)
**Files**: `app/components/features/__tests__/jobs-list.test.tsx`
**Issues**:
- Component refactored/replaced
- Text expectations changed
- Status display changed

**Actions**:
1. Update component selectors
2. Update text expectations
3. Update status display tests

#### Task 1.4: Fix TimelineView Tests (2 tests)
**Files**: `app/components/features/__tests__/timeline-view.test.tsx`
**Issues**:
- Date grouping logic changed
- Job ID rendering changed

**Actions**:
1. Update date grouping expectations
2. Update job ID selector

---

### Phase 2: Add Page Tests

#### Task 2.1: Dashboard Page Tests
**File**: Create `app/dashboard/__tests__/page.test.tsx`
**Coverage Goal**: 70% of 181 lines = ~127 lines

**Test Cases**:
1. ✅ Renders dashboard with all sections
2. ✅ Displays metrics cards
3. ✅ Shows health status
4. ✅ Fetches jobs on mount
5. ✅ Handles API errors gracefully
6. ✅ Updates metrics on data refresh
7. ✅ Displays loading state
8. ✅ Shows empty state when no data

#### Task 2.2: Jobs Page Tests
**File**: Create `app/jobs/__tests__/page.test.tsx`
**Coverage Goal**: 70% of 613 lines = ~429 lines

**Test Cases**:
1. ✅ Renders jobs list
2. ✅ WebSocket connection established
3. ✅ Real-time updates work
4. ✅ Job filtering works
5. ✅ Job search works
6. ✅ Batch operations work
7. ✅ Export to CSV works
8. ✅ Export to JSON works
9. ✅ Handles WebSocket disconnection
10. ✅ Shows connection status

#### Task 2.3: History Page Tests
**File**: Create `app/history/__tests__/page.test.tsx`
**Coverage Goal**: 70% of 269 lines = ~188 lines

**Test Cases**:
1. ✅ Renders history timeline
2. ✅ Fetches jobs on mount
3. ✅ Search functionality works
4. ✅ Filter by status works
5. ✅ Job detail modal opens
6. ✅ Retry job works
7. ✅ Cancel job works
8. ✅ Handles empty history

#### Task 2.4: Settings Page Tests
**File**: Create `app/settings/__tests__/page.test.tsx`
**Coverage Goal**: 70% of 540 lines = ~378 lines

**Test Cases**:
1. ✅ Renders settings page
2. ✅ API key management works
3. ✅ Notification preferences work
4. ✅ Display preferences work
5. ✅ Cache stats display
6. ✅ Cache invalidation works
7. ✅ Settings persistence works
8. ✅ Form validation works

#### Task 2.5: Generate Page Tests
**File**: Create `app/generate/__tests__/page.test.tsx`
**Coverage Goal**: 70% of 203 lines = ~142 lines

**Test Cases**:
1. ✅ Renders generation form
2. ✅ Form submission works
3. ✅ Validation works
4. ✅ Template selection works
5. ✅ Channel selection works
6. ✅ Handles API errors
7. ✅ Redirects after success

#### Task 2.6: Templates Page Tests
**File**: `app/templates/__tests__/page.test.tsx` (already exists, may need updates)
**Coverage Goal**: 70% of 331 lines = ~232 lines

**Actions**:
1. Review existing tests
2. Add missing coverage
3. Update for current implementation

---

### Phase 3: Add Context Tests

#### Task 3.1: AuthContext Tests
**File**: Create `app/contexts/__tests__/auth-context.test.tsx`
**Coverage Goal**: 70% of 301 lines = ~211 lines

**Test Cases**:
1. ✅ Provides auth context
2. ✅ API key storage works
3. ✅ API key validation works
4. ✅ Login/logout works
5. ✅ isAuthenticated state correct
6. ✅ Handles localStorage errors
7. ✅ Context updates propagate

#### Task 3.2: ToastContext Tests
**File**: Create `app/contexts/__tests__/toast-context.test.tsx`
**Coverage Goal**: 70% of 328 lines = ~230 lines

**Test Cases**:
1. ✅ Provides toast context
2. ✅ Success toast works
3. ✅ Error toast works
4. ✅ Warning toast works
5. ✅ Info toast works
6. ✅ Toast auto-dismiss works
7. ✅ Multiple toasts work
8. ✅ Toast removal works

#### Task 3.3: PreferencesContext Tests
**File**: Create `app/context/__tests__/preferences-context.test.tsx`
**Coverage Goal**: 70% of 141 lines = ~99 lines

**Test Cases**:
1. ✅ Provides preferences context
2. ✅ Notification preferences work
3. ✅ Display preferences work
4. ✅ Preferences persistence works
5. ✅ Reset to defaults works
6. ✅ Context updates propagate

---

### Phase 4: Add Hook Tests

#### Task 4.1: useWebSocket Tests
**File**: Create `app/hooks/__tests__/use-websocket.test.tsx`
**Coverage Goal**: 70% of 282 lines = ~197 lines

**Test Cases**:
1. ✅ Establishes connection
2. ✅ Sends messages
3. ✅ Receives messages
4. ✅ Handles disconnection
5. ✅ Auto-reconnect works
6. ✅ Connection state tracking
7. ✅ Error handling

#### Task 4.2: useLocalStorage Tests
**File**: Create `app/hooks/__tests__/use-local-storage.test.tsx`
**Coverage Goal**: 70% of 336 lines = ~235 lines

**Test Cases**:
1. ✅ Reads from localStorage
2. ✅ Writes to localStorage
3. ✅ Updates on change
4. ✅ Handles JSON serialization
5. ✅ Handles invalid JSON
6. ✅ Default values work
7. ✅ SSR compatibility

#### Task 4.3: useApi Tests
**File**: Create `app/hooks/__tests__/use-api.test.tsx`
**Coverage Goal**: 70% of 326 lines = ~228 lines

**Test Cases**:
1. ✅ Makes API calls
2. ✅ Handles success responses
3. ✅ Handles error responses
4. ✅ Loading states work
5. ✅ Retry logic works
6. ✅ Cancellation works
7. ✅ Caching works

#### Task 4.4: useJobUpdates Tests
**File**: Create `app/hooks/__tests__/use-job-updates.test.tsx`
**Coverage Goal**: 70% of 243 lines = ~170 lines

**Test Cases**:
1. ✅ Subscribes to job updates
2. ✅ Handles job created events
3. ✅ Handles job updated events
4. ✅ Handles job completed events
5. ✅ Handles job failed events
6. ✅ Unsubscribes on unmount
7. ✅ Reconnects after disconnect

---

### Phase 5: Add Component Tests

#### Task 5.1: ErrorBoundary Tests
**File**: Create `app/components/ui/__tests__/error-boundary.test.tsx`
**Coverage Goal**: 70% of 242 lines = ~169 lines

**Test Cases**:
1. ✅ Renders children when no error
2. ✅ Catches errors and displays fallback
3. ✅ Displays error message
4. ✅ Displays error stack in dev
5. ✅ Reset error boundary works
6. ✅ Logs errors to console

#### Task 5.2: TemplateSelector Tests
**File**: Create `app/components/features/__tests__/template-selector.test.tsx`
**Coverage Goal**: 70% of 354 lines = ~248 lines

**Test Cases**:
1. ✅ Renders template list
2. ✅ Template selection works
3. ✅ Template preview works
4. ✅ Category filtering works
5. ✅ Search functionality works
6. ✅ Custom template creation
7. ✅ Template editing works

---

## Execution Strategy

### Parallel Execution Plan

**Team of 1 Developer**: Serial execution, prioritize by impact

#### Day 1: Stabilization + High Impact
1. Fix failing tests (3 hours)
2. Add Dashboard tests (1 hour)
3. Add Jobs page tests (2 hours)

#### Day 2: Pages + Contexts
1. Add History page tests (1 hour)
2. Add Settings page tests (2 hours)
3. Add Generate page tests (1 hour)
4. Add AuthContext tests (1.5 hours)

#### Day 3: Hooks + Components
1. Add ToastContext tests (1.5 hours)
2. Add PreferencesContext tests (1 hour)
3. Add useWebSocket tests (1.5 hours)
4. Add useLocalStorage tests (1.5 hours)
5. Add useApi tests (1 hour)

#### Day 4: Final Push
1. Add useJobUpdates tests (1 hour)
2. Add ErrorBoundary tests (1 hour)
3. Add TemplateSelector tests (1.5 hours)
4. Verify coverage target (0.5 hours)
5. Update documentation (1 hour)

**Total Estimated Time**: 24-26 hours over 4 days

---

## Success Criteria

### Coverage Targets
- ✅ Overall: ≥70% statements
- ✅ Overall: ≥70% branches
- ✅ Overall: ≥70% functions
- ✅ Overall: ≥70% lines

### Test Quality
- ✅ All tests passing (0 failures)
- ✅ No flaky tests
- ✅ Fast execution (<2 minutes total)
- ✅ Clear test descriptions
- ✅ Good assertions (not just smoke tests)

### Documentation
- ✅ Coverage report generated
- ✅ DoD report updated
- ✅ Test patterns documented
- ✅ CI/CD integration ready

---

## Risk Mitigation

### Potential Blockers
1. **Complex Component Logic**: Some components may be harder to test
   - **Mitigation**: Start with simple cases, build up complexity

2. **WebSocket Testing**: Async nature can cause flaky tests
   - **Mitigation**: Use proper mocking, fake timers, waitFor utilities

3. **Context Provider Nesting**: Complex provider hierarchies
   - **Mitigation**: Create test utilities for common provider setups

4. **Time Constraints**: 24-26 hours is significant effort
   - **Mitigation**: Prioritize by impact, aim for 70% not 100%

---

## Next Steps

1. ✅ **Immediate**: Start Phase 1 - Fix failing tests
2. ⏭️ **Next**: Phase 2 - Add page tests (highest impact)
3. ⏭️ **Then**: Phase 3 - Add context/hook tests
4. ⏭️ **Finally**: Phase 4 - Component gaps + verification

---

**Plan Created**: October 8, 2025
**Target Completion**: October 12, 2025
**Plan Owner**: Development Team
**Status**: 🚀 Ready to Execute
