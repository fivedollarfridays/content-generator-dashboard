# Vercel Deployment Guide - Toombos Frontend

Complete guide for deploying the Toombos Frontend to Vercel with proper environment configuration.

## Prerequisites

- [ ] Vercel account created ([vercel.com](https://vercel.com))
- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] toombos-backend deployed to production
- [ ] toombos-backend URL available (e.g., `https://api.toombos.com`)

## Quick Start

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Link your project
vercel link

# 4. Deploy to production
vercel --prod
```

## Environment Variables Configuration

### Required Variables

The following environment variables **must** be configured in Vercel:

| Variable Name | Description | Example Value | Required |
|--------------|-------------|---------------|----------|
| `NEXT_PUBLIC_API_URL` | Toombos backend API URL | `https://api.toombos.com` | ✅ Yes |
| `NEXT_PUBLIC_WS_URL` | Toombos backend WebSocket URL | `wss://api.toombos.com` | ✅ Yes |

### Optional Variables

| Variable Name | Description | Example Value | Required |
|--------------|-------------|---------------|----------|
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics tracking | `true` | ⚠️ Recommended |
| `NEXT_PUBLIC_ENABLE_WEBSOCKET` | Enable WebSocket features | `true` | ⚠️ Recommended |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | `G-XXXXXXXXXX` | ❌ No |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | `https://...@sentry.io/...` | ❌ No |
| `NEXT_PUBLIC_API_TIMEOUT` | API request timeout (ms) | `30000` | ❌ No |
| `NEXT_PUBLIC_API_MAX_RETRIES` | Max API retry attempts | `3` | ❌ No |

## Setup Methods

### Method 1: Vercel Dashboard (Recommended for First-Time Setup)

#### Step 1: Access Project Settings

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: **toombos-frontend**
3. Click **Settings** → **Environment Variables**

#### Step 2: Add Required Variables

For each environment variable:

1. **Key**: Enter the variable name (e.g., `NEXT_PUBLIC_API_URL`)
2. **Value**: Enter the value (e.g., `https://api.toombos.com`)
3. **Environment**: Select environments to apply to:
   - ✅ Production
   - ✅ Preview (optional, for testing)
   - ❌ Development (use `.env.local` instead)
4. Click **Save**

#### Step 3: Add All Required Variables

```bash
# Required Variables
NEXT_PUBLIC_API_URL=https://api.toombos.com
NEXT_PUBLIC_WS_URL=wss://api.toombos.com

# Recommended Variables
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_WEBSOCKET=true

# Optional Variables (if needed)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

#### Step 4: Redeploy

After adding variables:
1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Select **Redeploy**
4. Check **Use existing Build Cache** (optional)
5. Click **Redeploy**

### Method 2: Vercel CLI (Recommended for Automation)

#### Add Variables via CLI

```bash
# Login to Vercel
vercel login

# Link to your project (if not already linked)
vercel link

# Add required variables (Production)
vercel env add NEXT_PUBLIC_API_URL production
# When prompted, enter: https://api.toombos.com

vercel env add NEXT_PUBLIC_WS_URL production
# When prompted, enter: wss://api.toombos.com

# Add recommended variables
vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS production
# When prompted, enter: true

vercel env add NEXT_PUBLIC_ENABLE_WEBSOCKET production
# When prompted, enter: true

# Optional: Add to Preview environment as well
vercel env add NEXT_PUBLIC_API_URL preview
vercel env add NEXT_PUBLIC_WS_URL preview
```

#### List Current Variables

```bash
# View all environment variables
vercel env ls

# Pull environment variables to local
vercel env pull .env.production.local
```

#### Remove Variables (if needed)

```bash
# Remove a variable
vercel env rm NEXT_PUBLIC_API_URL production
```

### Method 3: Bulk Import via JSON

#### Create `vercel-env.json`

```json
{
  "NEXT_PUBLIC_API_URL": {
    "type": "plain",
    "value": "https://api.toombos.com",
    "target": ["production", "preview"]
  },
  "NEXT_PUBLIC_WS_URL": {
    "type": "plain",
    "value": "wss://api.toombos.com",
    "target": ["production", "preview"]
  },
  "NEXT_PUBLIC_ENABLE_ANALYTICS": {
    "type": "plain",
    "value": "true",
    "target": ["production", "preview"]
  },
  "NEXT_PUBLIC_ENABLE_WEBSOCKET": {
    "type": "plain",
    "value": "true",
    "target": ["production", "preview"]
  }
}
```

#### Import Variables

**Note**: Vercel doesn't support direct JSON import via CLI. Use Dashboard import or CLI commands above.

## Deployment Process

### Initial Deployment

```bash
# 1. Ensure environment variables are configured (see above)

# 2. Deploy to production
vercel --prod

# 3. Wait for deployment to complete
# Output will show: ✅ Production: https://toombos-frontend.vercel.app

# 4. Verify deployment
curl https://toombos-frontend.vercel.app/api/health
```

### Subsequent Deployments

```bash
# Option 1: Automatic deployment (recommended)
# Push to main branch - Vercel auto-deploys

git push origin main

# Option 2: Manual deployment
vercel --prod

# Option 3: Deploy specific branch
vercel --prod --branch feature-branch-name
```

## Post-Deployment Verification

### 1. Check Build Logs

1. Go to Vercel Dashboard → **Deployments**
2. Click on the latest deployment
3. Review **Build Logs** for errors
4. Check **Runtime Logs** for application errors

### 2. Verify Environment Variables

```bash
# Test API connectivity (browser console)
fetch(process.env.NEXT_PUBLIC_API_URL + '/health')
  .then(r => r.json())
  .then(console.log)

# Test WebSocket connectivity (browser console)
const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL + '/ws/jobs');
ws.onopen = () => console.log('WebSocket connected');
ws.onerror = (e) => console.error('WebSocket error:', e);
```

### 3. Functional Testing

Visit your deployment URL and verify:

- [ ] **Dashboard page** loads without errors
- [ ] **Health status** shows backend connection
- [ ] **Jobs page** fetches real jobs
- [ ] **Analytics page** displays metrics
- [ ] **WebSocket** shows "Connected" status
- [ ] **Real-time updates** work (create a test job)

### 4. Performance Check

```bash
# Run Lighthouse audit
npx lighthouse https://toombos-frontend.vercel.app --view

# Check Core Web Vitals in Vercel Dashboard
# Go to: Analytics → Web Vitals
```

## Environment-Specific Configuration

### Production Environment

```bash
# Production URLs
NEXT_PUBLIC_API_URL=https://api.toombos.com
NEXT_PUBLIC_WS_URL=wss://api.toombos.com

# Enable all features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_WEBSOCKET=true

# Add monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Preview Environment (Staging)

```bash
# Staging URLs (if you have a staging backend)
NEXT_PUBLIC_API_URL=https://staging-api.toombos.com
NEXT_PUBLIC_WS_URL=wss://staging-api.toombos.com

# Enable features for testing
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

### Development Environment (Local)

Use `.env.local` file (not in Vercel):

```bash
# Local development
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Optional debug mode
NEXT_PUBLIC_ENABLE_DEBUG=true
```

## Custom Domains

### Add Custom Domain

1. Go to **Project Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain: `toombos.com`
4. Follow DNS configuration instructions
5. Vercel auto-issues SSL certificate

### Configure DNS

#### Option A: Using Vercel Nameservers (Recommended)

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

#### Option B: Using A/CNAME Records

```
# A Record
Type: A
Name: @
Value: 76.76.21.21

# CNAME Record (www subdomain)
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Rollback & Version Management

### Rollback to Previous Deployment

1. Go to **Deployments** tab
2. Find the previous working deployment
3. Click **⋯** → **Promote to Production**
4. Confirm promotion

### Version Aliases

```bash
# Create a custom alias
vercel alias set deployment-url custom-alias.vercel.app

# Example
vercel alias set toombos-frontend-abc123.vercel.app beta.toombos.com
```

## Monitoring & Alerts

### Enable Vercel Analytics

1. Go to **Analytics** tab
2. Enable **Web Vitals**
3. Enable **Audience** (optional, paid feature)

### Add Sentry Integration

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard -i nextjs

# Add Sentry DSN to Vercel environment variables
vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Enter your Sentry DSN when prompted
```

### Configure Alerts

1. Go to **Project Settings** → **Notifications**
2. Enable alerts for:
   - ✅ Deployment failures
   - ✅ Build errors
   - ✅ Runtime errors (with Sentry)

## Troubleshooting

### Build Failures

**Problem**: Build fails with "Module not found"
```bash
# Solution: Clear build cache
vercel --prod --force
```

**Problem**: Environment variables not working
```bash
# Solution 1: Check variable names (must start with NEXT_PUBLIC_)
# Solution 2: Redeploy after adding variables
# Solution 3: Verify in Vercel Dashboard → Settings → Environment Variables
```

### Runtime Errors

**Problem**: API requests fail with CORS errors
```bash
# Solution: Update toombos-backend CORS configuration
# Allow origin: https://toombos-frontend.vercel.app
```

**Problem**: WebSocket connection fails
```bash
# Solution 1: Check WebSocket URL uses wss:// (not ws://)
# Solution 2: Verify backend WebSocket endpoint is accessible
# Solution 3: Check browser console for connection errors
```

### Performance Issues

**Problem**: Slow page loads
```bash
# Solution 1: Enable Vercel Edge Network
# Solution 2: Check Next.js Image Optimization is working
# Solution 3: Review bundle size: npm run build
# Solution 4: Enable caching headers
```

## Security Best Practices

### Environment Variables

- ✅ Use `NEXT_PUBLIC_` prefix only for client-side variables
- ❌ Never expose API keys or secrets with `NEXT_PUBLIC_` prefix
- ✅ Store sensitive data in Vercel environment variables (server-side only)
- ✅ Use different API keys for production vs. preview environments

### SSL/TLS

- ✅ Always use HTTPS (`https://`) for API URLs in production
- ✅ Always use WSS (`wss://`) for WebSocket URLs in production
- ✅ Vercel auto-provisions SSL certificates
- ✅ Enable HSTS (Strict-Transport-Security headers)

### CORS Configuration

Backend must allow frontend origin:

```python
# toombos-backend CORS settings
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://toombos-frontend.vercel.app",
        "https://toombos.com",
        "https://www.toombos.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Cost Optimization

### Vercel Pricing

- **Hobby Plan**: Free for personal projects
  - 100GB bandwidth/month
  - Unlimited deployments
  - SSL included

- **Pro Plan**: $20/month
  - 1TB bandwidth/month
  - Advanced analytics
  - Team collaboration

### Optimization Tips

1. **Image Optimization**: Use Next.js `<Image>` component
2. **Bundle Size**: Analyze with `npm run build`
3. **Code Splitting**: Use dynamic imports
4. **Caching**: Configure `Cache-Control` headers
5. **Edge Functions**: Use for frequently accessed data

## Support & Resources

### Vercel Documentation

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Deployment](https://vercel.com/docs/frameworks/nextjs)

### Toombos Documentation

- [Backend Integration Guide](./BACKEND-INTEGRATION.md)
- [Deployment Checklist](./DEPLOYMENT-CHECKLIST.md)
- [Development Context](../context/development.md)

### Getting Help

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Vercel Discord**: [vercel.com/discord](https://vercel.com/discord)
- **GitHub Issues**: [Repository Issues](https://github.com/fivedollarfridays/toombos-frontend/issues)

## Quick Reference

### Common Commands

```bash
# Deploy to production
vercel --prod

# View logs
vercel logs toombos-frontend

# List deployments
vercel ls

# Inspect deployment
vercel inspect <deployment-url>

# Environment variables
vercel env ls
vercel env add <name> <environment>
vercel env rm <name> <environment>

# Domains
vercel domains ls
vercel domains add <domain>

# Secrets (for sensitive data)
vercel secrets add <secret-name> <secret-value>
vercel secrets ls
vercel secrets rm <secret-name>
```

### Environment Variable Template

```bash
# Copy this to Vercel Dashboard → Settings → Environment Variables

# Required
NEXT_PUBLIC_API_URL=https://api.toombos.com
NEXT_PUBLIC_WS_URL=wss://api.toombos.com

# Recommended
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_WEBSOCKET=true

# Optional
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_MAX_RETRIES=3
```

---

**Last Updated**: 2025-10-08
**Version**: 1.0.0
**Maintainer**: Toombos Team
