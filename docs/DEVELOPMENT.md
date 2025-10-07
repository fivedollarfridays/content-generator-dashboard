# Development Guide - Toombos Frontend

**Last Updated**: 2025-10-02

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Available Commands](#available-commands)
- [Environment Variables](#environment-variables)
- [Common Tasks](#common-tasks)
- [Debugging](#debugging)
- [Best Practices](#best-practices)

---

## Prerequisites

### Required Software

**Node.js and npm**:

- Node.js 18.x or higher
- npm 9.x or higher

```bash
# Check versions
node --version  # Should be v18.x.x or higher
npm --version   # Should be 9.x.x or higher
```

**Install Node.js**:

- Download from https://nodejs.org/
- Or use nvm: `nvm install 18 && nvm use 18`

**Git**:

```bash
git --version  # Should be 2.x.x or higher
```

**Code Editor**:

- VS Code (recommended)
- WebStorm
- Or any editor with TypeScript support

### Backend API

The dashboard requires the Content Generator backend API:

**Repository**: https://github.com/fivedollarfridays/halcytone-content-generator

**Setup**:

```bash
# Clone backend repository
cd ..
git clone https://github.com/fivedollarfridays/halcytone-content-generator.git
cd halcytone-content-generator

# Setup Python environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend
python run_dev.py
# Or: uvicorn src.halcytone_content_generator.main:app --reload
```

**Verify backend is running**:

- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

---

## Initial Setup

### 1. Clone Repository

```bash
# Via HTTPS
git clone https://github.com/fivedollarfridays/content-generator-dashboard.git

# Or via SSH
git clone git@github.com:fivedollarfridays/content-generator-dashboard.git

cd content-generator-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

**This installs**:

- Next.js 15.5.4
- React 18.3.1
- TypeScript 5.x
- Tailwind CSS 3.x
- React Query 5.x
- And all other dependencies

**Troubleshooting**:

```bash
# If install fails, try:
rm -rf node_modules package-lock.json
npm install

# Or use clean install:
npm ci
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local
# Update API URLs if different from defaults
```

**Minimum required**:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### 4. Start Development Server

```bash
npm run dev
```

**Output**:

```
> content-generator-dashboard@0.1.0 dev
> next dev

  ▲ Next.js 15.5.4
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.x:3000

✓ Ready in 2.3s
```

### 5. Verify Setup

Open http://localhost:3000 in your browser.

**You should see**:

- Home page loads
- Navigation bar appears
- No console errors

**Test backend connection**:

- Go to `/dashboard`
- Health check should show green status
- If red, verify backend is running

---

## Development Environment

### VS Code Setup (Recommended)

**Recommended Extensions**:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

**Settings** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["className\\s*=\\s*['\"`]([^'\"`]*)['\"`]", "([^'\"`]*)"]
  ]
}
```

### Browser DevTools

**Recommended**:

- Chrome DevTools
- React Developer Tools extension
- Redux DevTools (if using Redux)

**Useful shortcuts**:

- `Ctrl/Cmd + Shift + C` - Inspect element
- `Ctrl/Cmd + Shift + J` - Open console
- `Ctrl/Cmd + Shift + M` - Toggle device toolbar

---

## Project Structure

```
content-generator-dashboard/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── dashboard/         # Dashboard pages
│   ├── generate/          # Content generation
│   ├── jobs/              # Job management
│   ├── templates/         # Templates
│   └── settings/          # Settings
│
├── components/            # React components
│   ├── ui/               # Generic UI components
│   └── features/         # Feature components
│
├── lib/                  # Utilities
│   ├── api/             # API client
│   └── utils/           # Helper functions
│
├── hooks/               # Custom React hooks
├── types/               # TypeScript types
├── public/              # Static assets
│
├── context/             # PairCoder context
├── docs/                # Documentation
│
└── Configuration files
```

**See** [context/project_tree.md](../context/project_tree.md) for detailed structure.

---

## Development Workflow

### Daily Workflow

1. **Pull latest changes**:

   ```bash
   git pull origin master
   ```

2. **Install dependencies** (if package.json changed):

   ```bash
   npm install
   ```

3. **Start backend API**:

   ```bash
   cd ../halcytone-content-generator
   python run_dev.py
   ```

4. **Start dashboard**:

   ```bash
   npm run dev
   ```

5. **Make changes** following [CONVENTIONS.md](../CONVENTIONS.md)

6. **Test changes**:

   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build  # Verify build works
   ```

7. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push
   ```

### Feature Development

1. **Create branch**:

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Develop feature**:
   - Follow coding conventions
   - Add TypeScript types
   - Use Tailwind for styling
   - Add tests

3. **Test thoroughly**:

   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

4. **Commit with conventional commit**:

   ```bash
   git commit -m "feat(scope): description"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/my-feature
   # Create PR on GitHub
   ```

---

## Available Commands

### Development

```bash
# Start development server
npm run dev

# Development server with turbopack (faster)
npm run dev -- --turbo
```

### Building

```bash
# Create production build
npm run build

# Start production server (after build)
npm start

# Analyze bundle size
npm run build
# Check .next/static/ for bundle sizes
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Check TypeScript types
npm run type-check

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- Button.test.tsx

# Update snapshots
npm run test -- -u
```

### Utilities

```bash
# Clean build artifacts
rm -rf .next

# Clean dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for outdated packages
npm outdated

# Update dependencies
npm update
```

---

## Environment Variables

### Development (.env.local)

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Optional
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
```

### Production

```bash
# Required
NEXT_PUBLIC_API_URL=https://api.content-generator.com
NEXT_PUBLIC_WS_URL=wss://api.content-generator.com

# Optional
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Environment Variable Rules

**Next.js rules**:

- `NEXT_PUBLIC_*` - Exposed to browser (client-side)
- Others - Server-side only (not exposed to browser)

**Example**:

```typescript
// ✅ Can use in browser
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ Cannot use in browser (undefined)
const secret = process.env.SECRET_KEY;

// ✅ Can use in server components
const secret = process.env.SECRET_KEY;
```

**Loading environment variables**:

1. `.env.local` - Loaded in all environments (not committed)
2. `.env.development` - Loaded in development only
3. `.env.production` - Loaded in production only
4. `.env` - Loaded in all environments (committed, no secrets)

---

## Common Tasks

### Adding a New Page

1. **Create page file**:

   ```bash
   # Create app/my-page/page.tsx
   mkdir app/my-page
   touch app/my-page/page.tsx
   ```

2. **Implement page**:

   ```typescript
   export default function MyPage() {
     return (
       <div className="container mx-auto p-4">
         <h1 className="text-2xl font-bold">My Page</h1>
       </div>
     );
   }
   ```

3. **Add to navigation** (if needed):

   ```typescript
   // components/ui/Navigation.tsx
   const navItems = [
     // ...
     { href: '/my-page', label: 'My Page' },
   ];
   ```

4. **Test**:
   - Visit http://localhost:3000/my-page
   - Verify page loads correctly

### Adding a New Component

1. **Choose directory**:
   - UI component → `components/ui/`
   - Feature component → `components/features/`

2. **Create component file**:

   ```bash
   touch components/ui/MyComponent.tsx
   ```

3. **Implement component**:

   ```typescript
   'use client';  // If using hooks/events

   interface MyComponentProps {
     title: string;
     onAction?: () => void;
   }

   export default function MyComponent({ title, onAction }: MyComponentProps) {
     return (
       <div className="my-component">
         <h2>{title}</h2>
         {onAction && <button onClick={onAction}>Action</button>}
       </div>
     );
   }
   ```

4. **Add tests**:

   ```bash
   touch components/ui/MyComponent.test.tsx
   ```

5. **Use component**:

   ```typescript
   import MyComponent from '@/components/ui/MyComponent';

   <MyComponent title="Hello" onAction={() => console.log('Action')} />
   ```

### Adding API Integration

1. **Add types** in `types/content-generator.ts`:

   ```typescript
   export interface MyData {
     id: string;
     name: string;
   }
   ```

2. **Add API method** in `lib/api/api-client.ts`:

   ```typescript
   async getMyData(id: string): Promise<MyData> {
     const response = await this.axios.get(`/api/my-data/${id}`);
     return response.data;
   }
   ```

3. **Use with React Query**:

   ```typescript
   import { useQuery } from '@tanstack/react-query';
   import { apiClient } from '@/lib/api/client';

   function useMyData(id: string) {
     return useQuery({
       queryKey: ['myData', id],
       queryFn: () => apiClient.getMyData(id),
     });
   }
   ```

4. **Use in component**:
   ```typescript
   const { data, isLoading, error } = useMyData('123');
   ```

### Adding a Custom Hook

1. **Create hook file**:

   ```bash
   touch hooks/useMyHook.ts
   ```

2. **Implement hook**:

   ```typescript
   import { useState, useEffect } from 'react';

   export function useMyHook(param: string) {
     const [state, setState] = useState<string>('');

     useEffect(() => {
       // Logic
       setState(param);
     }, [param]);

     return state;
   }
   ```

3. **Use hook**:

   ```typescript
   import { useMyHook } from '@/hooks/useMyHook';

   function MyComponent() {
     const value = useMyHook('test');
     return <div>{value}</div>;
   }
   ```

---

## Debugging

### React DevTools

1. **Install extension**:
   - Chrome: React Developer Tools
   - Firefox: React Developer Tools

2. **Inspect components**:
   - Open DevTools → React tab
   - Inspect component tree
   - View props and state
   - Trigger re-renders

### Console Logging

```typescript
// ✅ Good - Temporary debugging
console.log('User data:', user);
console.error('Error occurred:', error);
console.warn('Deprecated feature used');

// ⚠️ Remove before committing
```

### Network Debugging

**Browser DevTools**:

1. Open DevTools → Network tab
2. Filter by XHR/Fetch
3. Inspect API requests
4. Check request/response

**Common issues**:

- CORS errors → Check backend CORS settings
- 404 errors → Verify API endpoint
- 500 errors → Check backend logs

### TypeScript Errors

```bash
# Check all TypeScript errors
npm run type-check

# Watch mode
npx tsc --noEmit --watch
```

**Common fixes**:

- Add type definitions
- Use type assertions: `as Type`
- Check tsconfig.json paths

### Build Errors

```bash
# Clean and rebuild
rm -rf .next
npm run build

# Check specific error
npm run build 2>&1 | grep "error"
```

### Hot Reload Issues

**If changes don't reflect**:

1. Stop dev server (Ctrl+C)
2. Delete `.next` folder
3. Restart: `npm run dev`

**If still not working**:

```bash
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

---

## Best Practices

### TypeScript

- Always define types for props, state, and functions
- Use `interface` for object shapes
- Avoid `any` type
- Enable strict mode

### React

- Use functional components
- Use hooks for state and effects
- Keep components small and focused
- Extract reusable logic to custom hooks

### Styling

- Use Tailwind utility classes
- Mobile-first responsive design
- Follow accessibility guidelines
- Use semantic HTML

### Performance

- Memoize expensive calculations with `useMemo`
- Memoize callbacks with `useCallback`
- Use `React.memo` for expensive components
- Lazy load heavy components

### Testing

- Write tests for new features
- Test edge cases
- Test error states
- Maintain >80% coverage

### Git

- Commit frequently with meaningful messages
- Use conventional commit format
- Keep commits focused
- Write descriptive PR descriptions

### Code Review

- Review your own code before submitting
- Run all checks (lint, type-check, test, build)
- Respond to feedback promptly
- Thank reviewers

---

## Troubleshooting

### Common Issues

**Port 3000 already in use**:

```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or use different port:
PORT=3001 npm run dev
```

**Module not found**:

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors after pulling**:

```bash
# Rebuild TypeScript cache
npm run type-check
```

**Build fails**:

```bash
# Clean and rebuild
rm -rf .next
npm run build
```

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more issues.

---

## Next Steps

- Review [CONVENTIONS.md](../CONVENTIONS.md) for coding standards
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Check [TESTING.md](TESTING.md) for testing guidelines
- See [API-INTEGRATION.md](API-INTEGRATION.md) for API usage
- Review [CONTRIBUTING.md](../CONTRIBUTING.md) before submitting PRs

---

**Last Updated**: 2025-10-02
**Questions?** Create an issue on GitHub
