# Troubleshooting Guide - Content Generator Dashboard

**Last Updated**: 2025-10-02

---

## Common Issues

### Installation Issues

#### Port 3000 Already in Use

**Error**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:

**Windows**:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux**:
```bash
lsof -ti:3000 | xargs kill -9
```

**Or use different port**:
```bash
PORT=3001 npm run dev
```

---

#### Module Not Found

**Error**:
```
Cannot find module '@/components/ui/Button'
```

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check tsconfig.json paths
cat tsconfig.json | grep paths
```

---

#### npm install Fails

**Error**:
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve
```

**Solution**:
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Or force
npm install --force

# Or use clean install
npm ci
```

---

### Development Server Issues

#### Hot Reload Not Working

**Issue**: Changes don't reflect in browser

**Solution 1**: Clear Next.js cache
```bash
rm -rf .next
npm run dev
```

**Solution 2**: Full clean
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

**Solution 3**: Disable caching in browser DevTools
- Open DevTools
- Network tab
- Check "Disable cache"

---

#### Build Errors

**Error**:
```
Error: Build failed
```

**Solution**:
```bash
# Clean build
rm -rf .next
npm run build

# Check specific error
npm run build 2>&1 | grep "error"

# Type check
npm run type-check

# Lint
npm run lint
```

---

### TypeScript Issues

#### Type Errors

**Error**:
```
Property 'x' does not exist on type 'Y'
```

**Solution 1**: Add type definition
```typescript
interface MyType {
  x: string;
}

const obj: MyType = { x: 'value' };
```

**Solution 2**: Type assertion
```typescript
const obj = data as MyType;
```

**Solution 3**: Check imports
```typescript
import type { MyType } from '@/types';
```

---

#### Import Path Not Resolved

**Error**:
```
Cannot find module '@/lib/utils'
```

**Solution**: Check `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Restart TypeScript server:
- VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

---

### API Integration Issues

#### CORS Errors

**Error**:
```
CORS policy: No 'Access-Control-Allow-Origin' header
```

**Solution**: Update backend CORS settings

```python
# Backend main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

#### Connection Refused

**Error**:
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```

**Check**:
1. Backend is running:
   ```bash
   curl http://localhost:8000/health
   ```

2. Correct API URL in `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. No firewall blocking

---

#### API Returns 404

**Error**: API endpoints return 404

**Check**:
1. Correct endpoint URL
2. Backend version matches dashboard expectations
3. API documentation: http://localhost:8000/docs

---

### WebSocket Issues

#### WebSocket Connection Failed

**Error**:
```
WebSocket connection to 'ws://localhost:8000' failed
```

**Check**:
1. WebSocket URL is correct (ws:// not http://):
   ```bash
   # .env.local
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   ```

2. Backend supports WebSocket

3. No proxy blocking WebSocket

**Test WebSocket**:
```typescript
const ws = new WebSocket('ws://localhost:8000/ws/test');
ws.onopen = () => console.log('Connected');
ws.onerror = (e) => console.error('Error:', e);
```

---

### UI/Styling Issues

#### Tailwind Classes Not Applied

**Issue**: Tailwind classes don't work

**Solution 1**: Restart dev server
```bash
# Ctrl+C to stop
npm run dev
```

**Solution 2**: Check `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // ...
};
```

**Solution 3**: Check `globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

#### Dark Mode Not Working

**Issue**: Dark mode classes don't apply

**Solution**: Enable dark mode in `tailwind.config.js`:
```javascript
module.exports = {
  darkMode: 'class',  // or 'media'
  // ...
};
```

Apply dark class:
```typescript
<html className="dark">
```

---

### Testing Issues

#### Tests Fail to Run

**Error**:
```
Cannot find module 'jest'
```

**Solution**:
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

---

#### Tests Timeout

**Error**:
```
Timeout - Async callback was not invoked
```

**Solution**: Increase timeout
```typescript
jest.setTimeout(10000);  // 10 seconds

// Or in test
it('test', async () => {
  // ...
}, 10000);
```

---

#### Mock Not Working

**Issue**: Mocks don't apply

**Solution**: Mock before import
```typescript
jest.mock('@/lib/api/client');  // Before import

import { apiClient } from '@/lib/api/client';
```

---

### Performance Issues

#### Slow Page Load

**Issue**: Pages load slowly

**Solution 1**: Check bundle size
```bash
npm run build
# Check .next/server/ and .next/static/
```

**Solution 2**: Optimize images
```typescript
import Image from 'next/image';

<Image src="/large.jpg" width={800} height={600} />
```

**Solution 3**: Code splitting
```typescript
import dynamic from 'next/dynamic';

const Heavy = dynamic(() => import('./Heavy'), {
  loading: () => <Spinner />,
});
```

---

#### High Memory Usage

**Issue**: Development server uses too much memory

**Solution 1**: Increase Node.js memory
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run dev
```

**Solution 2**: Disable source maps (development):
```javascript
// next.config.js
module.exports = {
  productionBrowserSourceMaps: false,
};
```

---

### Environment Issues

#### Environment Variables Not Working

**Issue**: `process.env.NEXT_PUBLIC_API_URL` is undefined

**Check**:
1. Variable starts with `NEXT_PUBLIC_`
2. `.env.local` exists in root
3. Restart dev server after changes
4. Not using variable in server-side code without `NEXT_PUBLIC_`

**Example**:
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000  # ✅ Works in browser
API_SECRET=secret123  # ❌ Doesn't work in browser (server only)
```

---

#### Wrong Environment Loaded

**Issue**: Production variables in development

**Check**: Load order (highest priority first):
1. `.env.local`
2. `.env.development` (in dev)
3. `.env.production` (in production)
4. `.env`

**Delete unwanted env files**:
```bash
ls .env*
rm .env.production  # If not needed in development
```

---

### Git Issues

#### Merge Conflicts

**Error**: Merge conflict in package-lock.json

**Solution**:
```bash
# Use theirs
git checkout --theirs package-lock.json
npm install

# Or delete and regenerate
rm package-lock.json
npm install
```

---

#### Large node_modules in Git

**Issue**: Accidentally committed node_modules

**Solution**:
```bash
# Remove from git
git rm -r --cached node_modules
git commit -m "Remove node_modules"

# Ensure .gitignore has:
echo "node_modules/" >> .gitignore
```

---

### Deployment Issues

#### Vercel Build Fails

**Error**: Build fails on Vercel but works locally

**Check**:
1. Environment variables set in Vercel
2. Build command correct: `npm run build`
3. Node version matches:
   ```json
   // package.json
   "engines": {
     "node": "18.x"
   }
   ```

**View logs**:
- Vercel Dashboard → Deployments → Click deployment → Logs

---

#### Production Site Not Loading

**Issue**: Deployed site shows blank page

**Check browser console**:
1. API URL is production URL (not localhost)
2. CORS configured for production domain
3. No JavaScript errors

**Check environment variables**:
```bash
# Vercel
NEXT_PUBLIC_API_URL=https://api.content-generator.com
# Not localhost!
```

---

## Debugging Tips

### Enable Debug Logging

```bash
# Development
NEXT_PUBLIC_ENABLE_DEBUG=true npm run dev
```

```typescript
// In code
if (process.env.NEXT_PUBLIC_ENABLE_DEBUG) {
  console.log('Debug info:', data);
}
```

---

### Browser DevTools

**Network Tab**:
- View API requests
- Check request/response
- Check status codes

**Console Tab**:
- View errors
- Check warnings
- Debug with `console.log`

**React DevTools**:
- Inspect component tree
- View props and state
- Trigger re-renders

---

### VS Code Debugging

**launch.json**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

---

## Getting Help

### Resources

- **Documentation**: [docs/](.)
- **GitHub Issues**: https://github.com/fivedollarfridays/content-generator-dashboard/issues
- **Next.js Docs**: https://nextjs.org/docs
- **React Query Docs**: https://tanstack.com/query/latest

### Creating an Issue

Include:
1. **Error message** (full text)
2. **Steps to reproduce**
3. **Environment** (OS, Node version, npm version)
4. **Expected vs actual behavior**
5. **Screenshots** (if UI issue)

**Example**:
```markdown
## Bug Report

**Error**: `Cannot find module '@/lib/api/client'`

**Steps to Reproduce**:
1. Run `npm run dev`
2. Navigate to /dashboard
3. See error in console

**Environment**:
- OS: Windows 11
- Node: v18.17.0
- npm: 9.6.7

**Expected**: Page loads successfully
**Actual**: Module not found error
```

---

## Quick Fixes Checklist

Before asking for help, try:

- [ ] Restart dev server
- [ ] Clear `.next` folder
- [ ] Reinstall `node_modules`
- [ ] Check `.env.local` exists and is correct
- [ ] Check backend is running
- [ ] Check browser console for errors
- [ ] Check Network tab in DevTools
- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`
- [ ] Try in incognito/private browsing
- [ ] Clear browser cache

---

**Last Updated**: 2025-10-02
**Need More Help?** Create an issue on GitHub
