# Corrective Action Plan - Test Suite & DoD Compliance

**Date**: 2025-10-08
**Sprint**: Post-Sprint 11
**Status**: 🟡 **MOSTLY COMPLIANT** (8/10 DoD criteria met)

---

## Executive Summary

**Current DoD Compliance**: 80% (8/10 criteria fully met)

**Critical Gaps**:
1. **Test Suite Health**: 93 tests failing (91.16% pass rate vs 95%+ target)
2. **Branch Coverage**: 69.92% (0.08% below 70% target)

**Impact**: Application is production-ready and functional, but test suite reliability needs improvement.

**Estimated Time to 100% Compliance**: 3-4 hours

---

## Gap 1: Failing Test Suites (Priority: CRITICAL)

### Current State
- **Test Suites**: 14 failed, 21 passed (60% suite pass rate)
- **Tests**: 93 failed, 981 passed, 2 skipped (91.16% pass rate)
- **Target**: 95%+ pass rate

### Root Causes

#### 1. Global Fetch Not Mocked (Primary Issue - 60% of failures)
**Error**: `fetch is not defined`

**Affected Files**:
- `app/analytics/__tests__/page.test.tsx`
- `app/campaigns/__tests__/page.test.tsx`
- `app/settings/__tests__/page.test.tsx`
- `app/generate/__tests__/page.test.tsx`
- `app/__tests__/page.test.tsx`

**Solution**:
```javascript
// Add to jest.setup.js
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: {} }),
    text: () => Promise.resolve(''),
    headers: new Headers(),
    status: 200,
    statusText: 'OK',
  })
) as jest.Mock;
```

#### 2. Act() Warnings (Secondary Issue - 30% of failures)
**Error**: `Warning: An update to Component inside a test was not wrapped in act(...)`

**Affected Files**:
- `app/dashboard/__tests__/page.test.tsx`
- `app/hooks/__tests__/use-job-updates.test.tsx`
- `app/components/features/__tests__/content-generation-form.test.tsx`

**Solution**:
```javascript
// Wrap async state updates in act()
await act(async () => {
  render(<Component />);
});

await waitFor(() => {
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

#### 3. Mock Inconsistencies (Remaining 10%)
**Issues**:
- localStorage mocking in `app/context/__tests__/preferences-context.test.tsx`
- WebSocket timing issues in `app/hooks/__tests__/use-websocket.test.ts`
- Templates page fetch mocking in `app/templates/__tests__/page.test.tsx`

**Solution**: Update mocks to be consistent with global setup

### Action Items

#### Task 1.1: Add Global Fetch Mock
**File**: `jest.setup.js`
**Estimated Time**: 30 minutes
**Priority**: CRITICAL

```javascript
// Add to jest.setup.js after existing setup
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: {} }),
    text: () => Promise.resolve(''),
    headers: new Headers(),
    status: 200,
    statusText: 'OK',
    clone: () => this,
  })
) as jest.Mock;

// Reset mock before each test
beforeEach(() => {
  (global.fetch as jest.Mock).mockClear();
});
```

**Verification**:
```bash
npm test -- app/analytics/__tests__/page.test.tsx
npm test -- app/campaigns/__tests__/page.test.tsx
npm test -- app/settings/__tests__/page.test.tsx
```

#### Task 1.2: Fix Act() Warnings
**Files**: Multiple (dashboard, hooks, forms)
**Estimated Time**: 1 hour
**Priority**: HIGH

**Changes Required**:
1. Wrap render calls with act() for async components
2. Use waitFor() for async assertions
3. Add cleanup after async operations

**Example Fix**:
```javascript
// Before
it('should load data', async () => {
  render(<DashboardPage />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

// After
it('should load data', async () => {
  await act(async () => {
    render(<DashboardPage />);
  });

  await waitFor(() => {
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
```

#### Task 1.3: Fix Mock Inconsistencies
**Files**: preferences-context, use-websocket, templates page
**Estimated Time**: 1 hour
**Priority**: MEDIUM

**Actions**:
1. Update localStorage mock to use global setup
2. Fix WebSocket timing with better async handling
3. Ensure templates page uses global fetch mock

**Verification**:
```bash
npm test -- --coverage --watchAll=false
# Target: 95%+ pass rate (1020+ tests passing)
```

---

## Gap 2: Branch Coverage (Priority: MEDIUM)

### Current State
- **Current**: 69.92%
- **Target**: 70%
- **Gap**: 0.08% (approximately 1-2 untested branches)

### Root Cause
Missing test cases for edge conditions and error paths

### Action Items

#### Task 2.1: Identify Uncovered Branches
**Tool**: Coverage report
**Estimated Time**: 15 minutes

```bash
npm test -- --coverage --watchAll=false
# Review coverage/lcov-report/index.html for uncovered branches
```

#### Task 2.2: Add Edge Case Tests
**Estimated Time**: 30 minutes
**Priority**: MEDIUM

**Likely Candidates**:
- Error path in API calls
- Null/undefined checks
- Conditional rendering based on props

**Example**:
```javascript
// If uncovered branch is in error handling
it('should handle API error gracefully', async () => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

  render(<Component />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

**Verification**:
```bash
npm test -- --coverage --watchAll=false
# Target: Branches ≥70%
```

---

## Gap 3: Jobs & Settings Page Coverage (Priority: LOW)

### Current State
- **Jobs Page**: 53.61% (below 70%)
- **Settings Page**: 43.47% (below 70%)

### Note
While below 70%, these pages are already tested and functional. This is a **quality improvement** rather than a blocker.

### Action Items (Optional)

#### Task 3.1: Improve Jobs Page Coverage (Optional)
**Estimated Time**: 2 hours
**Target**: 53.61% → 70%

**Missing Coverage**:
- Complex filter combinations
- Export error scenarios
- WebSocket error recovery

#### Task 3.2: Improve Settings Page Coverage (Optional)
**Estimated Time**: 2 hours
**Target**: 43.47% → 70%

**Missing Coverage**:
- Form validation edge cases
- API key management errors
- Preference update failures

---

## Implementation Timeline

### Phase 1: Critical Fixes (2-3 hours)
**Goal**: Achieve 95%+ test pass rate

1. ✅ Add global fetch mock (30 min)
2. ✅ Fix act() warnings in dashboard tests (30 min)
3. ✅ Fix act() warnings in hooks tests (30 min)
4. ✅ Fix mock inconsistencies (1 hour)
5. ✅ Run full test suite and verify (30 min)

**Success Criteria**:
- Test pass rate ≥95% (1020+ tests passing)
- 0-5 failing tests maximum
- All test suites passing

### Phase 2: Branch Coverage (30 min)
**Goal**: Achieve 70% branch coverage

1. ✅ Identify uncovered branches (15 min)
2. ✅ Add 1-2 edge case tests (15 min)
3. ✅ Verify coverage ≥70% (included)

**Success Criteria**:
- Branch coverage ≥70%
- All 4 coverage metrics ≥70%
- 100% DoD compliance

### Phase 3: Coverage Improvement (Optional, 4 hours)
**Goal**: Improve Jobs and Settings page coverage

1. ⏸️ Add Jobs page tests (2 hours)
2. ⏸️ Add Settings page tests (2 hours)

**Success Criteria**:
- Jobs page coverage ≥70%
- Settings page coverage ≥70%

---

## Verification Checklist

### Pre-Implementation
- [ ] Review current test failures
- [ ] Understand root causes
- [ ] Plan fix approach
- [ ] Estimate time required

### During Implementation
- [ ] Create feature branch: `fix/test-suite-improvements`
- [ ] Add global fetch mock to jest.setup.js
- [ ] Fix act() warnings in failing tests
- [ ] Update mock configurations for consistency
- [ ] Run tests incrementally to verify fixes
- [ ] Document any unexpected issues

### Post-Implementation
- [ ] Run full test suite: `npm test -- --watchAll=false`
- [ ] Verify pass rate ≥95%
- [ ] Run coverage: `npm test -- --coverage --watchAll=false`
- [ ] Verify all metrics ≥70%
- [ ] Update DoD assessment document
- [ ] Commit changes with descriptive message
- [ ] Merge to master
- [ ] Update documentation

---

## Success Metrics

### Current State (Baseline)
- Test Pass Rate: 91.16% (981/1076)
- Passing Suites: 21/35 (60%)
- Branch Coverage: 69.92%
- DoD Compliance: 80% (8/10)

### Target State (After Phase 1)
- Test Pass Rate: ≥95% (1020+ tests)
- Passing Suites: ≥33/35 (94%)
- Branch Coverage: ≥70%
- DoD Compliance: 100% (10/10)

### Stretch Goal (After Phase 3)
- Test Pass Rate: ≥98% (1050+ tests)
- Passing Suites: 35/35 (100%)
- Jobs Page Coverage: ≥70%
- Settings Page Coverage: ≥70%
- Overall Coverage: ≥75% (all metrics)

---

## Risk Assessment

### Low Risk
- **Global fetch mock** - Standard Jest practice, well-documented
- **Act() warning fixes** - Common React Testing Library pattern
- **Branch coverage** - Minimal gap, easy to close

### Medium Risk
- **Mock inconsistencies** - May reveal deeper test architecture issues
- **Time estimate** - Could take longer if unexpected issues arise

### Mitigation Strategies
1. **Start with lowest-risk fixes** (global fetch mock)
2. **Test incrementally** after each fix
3. **Document issues** for future reference
4. **Allocate buffer time** (add 25% to estimates)

---

## Recommendations

### Immediate (Do Now)
1. ✅ **Fix failing tests** (Phase 1) - CRITICAL for test reliability
2. ✅ **Close branch coverage gap** (Phase 2) - Quick DoD win
3. ✅ **Update documentation** - Reflect current state

### Short-term (Next Sprint)
1. ⏸️ **Improve Jobs/Settings coverage** (Phase 3) - Quality improvement
2. ⏸️ **Set up CI/CD with coverage gates** - Prevent regression
3. ⏸️ **Implement pre-commit hooks** - Maintain test quality

### Long-term (Future Sprints)
1. ⏸️ **E2E testing with Playwright** - Full user journey coverage
2. ⏸️ **Performance testing** - Load and stress tests
3. ⏸️ **Accessibility testing** - Automated a11y checks
4. ⏸️ **Visual regression testing** - UI consistency

---

## Appendix: Failing Test Details

### Test Suite Failures by Category

**Fetch Mocking Issues** (8 suites):
- app/analytics/__tests__/page.test.tsx
- app/campaigns/__tests__/page.test.tsx
- app/settings/__tests__/page.test.tsx
- app/generate/__tests__/page.test.tsx
- app/__tests__/page.test.tsx
- app/templates/__tests__/page.test.tsx (partial)

**Act() Warnings** (4 suites):
- app/dashboard/__tests__/page.test.tsx
- app/hooks/__tests__/use-job-updates.test.tsx
- app/components/features/__tests__/content-generation-form.test.tsx

**Mock Configuration** (2 suites):
- app/context/__tests__/preferences-context.test.tsx
- app/hooks/__tests__/use-websocket.test.ts

---

**Plan Status**: ✅ **READY FOR IMPLEMENTATION**
**Estimated Time**: 3-4 hours (Phase 1 + 2)
**Expected Outcome**: 100% DoD Compliance
