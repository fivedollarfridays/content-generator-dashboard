# Contributing to Content Generator Dashboard

Thank you for your interest in contributing to the Content Generator Dashboard! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Code Review](#code-review)

---

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Git** for version control
- **Backend API** running (see backend repository)
- **Code editor** (VS Code recommended)

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:

   ```bash
   git clone https://github.com/YOUR_USERNAME/content-generator-dashboard.git
   cd content-generator-dashboard
   ```

3. **Add upstream remote**:

   ```bash
   git remote add upstream https://github.com/fivedollarfridays/content-generator-dashboard.git
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Configure environment**:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

6. **Start development server**:

   ```bash
   npm run dev
   ```

7. **Verify setup**:
   - Open http://localhost:3000
   - Ensure backend API is running at http://localhost:8000

---

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update main branch
git checkout master
git pull upstream master

# Create feature branch
git checkout -b feature/my-feature

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch naming convention**:

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Adding tests

### 2. Make Changes

Follow the coding standards in [CONVENTIONS.md](CONVENTIONS.md):

- Use TypeScript strict mode
- Follow component structure guidelines
- Use Tailwind CSS for styling
- Add tests for new features
- Update documentation

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Run tests
npm run test

# Build to verify
npm run build
```

### 4. Commit Your Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat(jobs): add job filtering by status"
```

**Commit message format**:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples**:

```bash
feat(dashboard): add analytics widget
fix(websocket): resolve reconnection logic
docs(readme): update installation steps
style(button): apply consistent spacing
refactor(api): simplify error handling
test(jobs): add JobsList component tests
chore(deps): update React to 18.3.1
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/my-feature

# Create PR on GitHub
# Go to https://github.com/fivedollarfridays/content-generator-dashboard
# Click "New Pull Request"
```

---

## Coding Standards

### TypeScript

**✅ Required**:

- Strict mode enabled
- No `any` types
- Explicit return types
- Interface for props

**Example**:

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ label, onClick, variant = 'primary' }: ButtonProps): JSX.Element {
  return <button onClick={onClick}>{label}</button>;
}
```

### React

**✅ Required**:

- Functional components only
- Use hooks (no class components)
- `'use client'` directive when needed
- Prop destructuring

### Styling

**✅ Required**:

- Tailwind CSS utilities
- Mobile-first responsive design
- Accessibility (ARIA labels, semantic HTML)

### File Naming

- **Components**: `PascalCase.tsx` (e.g., `JobsList.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `formatDate.ts`)
- **Hooks**: `useCamelCase.ts` (e.g., `useApi.ts`)
- **Tests**: `FileName.test.tsx`

### Imports

Use `@/` path alias:

```typescript
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import type { Job } from '@/types';
```

---

## Pull Request Process

### Before Submitting PR

**Checklist**:

- [ ] Code follows conventions in [CONVENTIONS.md](CONVENTIONS.md)
- [ ] Tests added for new features
- [ ] All tests passing (`npm run test`)
- [ ] Lint passing (`npm run lint`)
- [ ] Build successful (`npm run build`)
- [ ] Documentation updated
- [ ] Conventional commit messages
- [ ] No console errors/warnings
- [ ] Accessibility considered

### PR Title

Follow Conventional Commits format:

```
feat(scope): add feature description
fix(scope): fix bug description
docs(scope): update documentation
```

### PR Description

Include:

1. **What** - What does this PR do?
2. **Why** - Why is this change needed?
3. **How** - How does it work?
4. **Testing** - How was it tested?
5. **Screenshots** - If UI changes

**Template**:

```markdown
## Description

Brief description of the changes

## Motivation

Why is this change needed?

## Changes

- Change 1
- Change 2
- Change 3

## Testing

- [ ] Unit tests added
- [ ] Manual testing completed
- [ ] Accessibility tested

## Screenshots

[If applicable]

## Checklist

- [ ] Code follows conventions
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Accessibility considered
```

### PR Size

Keep PRs focused and small:

- **Ideal**: <300 lines changed
- **Maximum**: <500 lines changed
- Break large changes into multiple PRs

---

## Testing Requirements

### Unit Tests

**Required for**:

- New utility functions
- Custom hooks
- Complex component logic

**Example**:

```typescript
import { render, screen } from '@testing-library/react';
import Button from './Button';

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

### Component Tests

**Required for**:

- New components
- Modified component behavior

**Example**:

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

### Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Specific file
npm run test Button.test.tsx
```

---

## Documentation

### Code Documentation

**JSDoc for public functions**:

```typescript
/**
 * Formats a date string into a readable format
 *
 * @param date - ISO date string
 * @param format - Optional format string
 * @returns Formatted date string
 *
 * @example
 * formatDate('2025-10-02') // => 'Oct 2, 2025'
 */
export function formatDate(date: string, format?: string): string {
  // ...
}
```

### README Updates

Update README.md if:

- Adding new features
- Changing setup instructions
- Modifying commands
- Adding dependencies

### Documentation Files

Update `/docs` if:

- Changing architecture
- Adding new patterns
- Updating workflows
- New deployment steps

---

## Code Review

### Review Process

1. **Automated checks** run on PR
2. **Reviewer assigned** (maintainer)
3. **Review feedback** provided
4. **Changes requested** (if needed)
5. **Approval** and merge

### Review Checklist

Reviewers will check:

- [ ] Code quality and conventions
- [ ] Test coverage
- [ ] Documentation
- [ ] Accessibility
- [ ] Performance
- [ ] Security
- [ ] No breaking changes

### Responding to Feedback

- **Be responsive** to review comments
- **Ask questions** if unclear
- **Make requested changes** promptly
- **Resolve conversations** when addressed
- **Thank reviewers** for their time

---

## Development Guidelines

### Context Loop

Update `/context/development.md` after significant changes:

```markdown
### Last action was:

Added job filtering feature

### Next action will be:

Add job sorting functionality

### Blockers/Risks:

None
```

### Component Development

1. **Create component** in appropriate directory
   - UI components → `components/ui/`
   - Feature components → `components/features/`

2. **Define TypeScript interface**

   ```typescript
   interface ComponentProps {
     // Props definition
   }
   ```

3. **Implement component**

   ```typescript
   export default function Component({ ...props }: ComponentProps) {
     // Implementation
   }
   ```

4. **Add tests**

   ```typescript
   describe('Component', () => {
     it('works', () => {
       // Test
     });
   });
   ```

5. **Document**
   - JSDoc comments
   - Update component documentation

### API Integration

1. **Add types** in `types/content-generator.ts`
2. **Add method** to `lib/api/api-client.ts`
3. **Use React Query** for data fetching
4. **Handle errors** appropriately
5. **Add loading states**

---

## Getting Help

### Resources

- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Conventions**: [CONVENTIONS.md](CONVENTIONS.md)
- **Development**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- **Testing**: [docs/TESTING.md](docs/TESTING.md)

### Questions

- **GitHub Issues**: Ask questions in issues
- **Pull Requests**: Ask in PR comments
- **Email**: Contact project maintainers

---

## Common Issues

### Build Errors

**TypeScript errors**:

```bash
npm run type-check
```

**Linting errors**:

```bash
npm run lint:fix
```

**Import errors**:

- Use `@/` alias for imports
- Check `tsconfig.json` path mapping

### Test Failures

**Clear test cache**:

```bash
npm run test -- --clearCache
```

**Update snapshots**:

```bash
npm run test -- -u
```

---

## Code of Conduct

### Our Standards

- **Be respectful** and professional
- **Be inclusive** and welcoming
- **Be constructive** in feedback
- **Be patient** with others
- **Be collaborative** and helpful

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing private information
- Other unprofessional conduct

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

## Thank You!

Thank you for contributing to the Content Generator Dashboard! Your contributions help make this project better for everyone.

**Questions?** Open an issue or contact the maintainers.

---

**Last Updated**: 2025-10-02
**Maintainers**: Content Generator Team
