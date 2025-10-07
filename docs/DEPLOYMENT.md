# Deployment Guide - Toombos Frontend

**Last Updated**: 2025-10-02

---

## Overview

This guide covers deploying the Toombos Frontend to production environments.

**Recommended Platform**: Vercel (optimized for Next.js)
**Alternatives**: Netlify, AWS Amplify, Docker, Traditional hosting

---

## Vercel Deployment (Recommended)

### Prerequisites

- GitHub account
- Vercel account (https://vercel.com)
- Domain name (optional)

### Step 1: Push to GitHub

```bash
# Ensure code is pushed
git push origin master
```

### Step 2: Import to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `content-generator-dashboard`
4. Click "Import"

### Step 3: Configure Project

**Framework Preset**: Next.js (auto-detected)
**Root Directory**: `./`
**Build Command**: `npm run build`
**Output Directory**: `.next`
**Install Command**: `npm install`

### Step 4: Environment Variables

Add in Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://api.content-generator.com
NEXT_PUBLIC_WS_URL=wss://api.content-generator.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Step 5: Deploy

Click "Deploy" - Vercel will:

1. Clone repository
2. Install dependencies
3. Build project
4. Deploy to CDN
5. Provide deployment URL

**Deployment URL**: `https://your-project.vercel.app`

### Step 6: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS:
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (1-48 hours)

### Automatic Deployments

**Production**:

- Push to `master` branch → Deploys to production

**Preview**:

- Create PR → Vercel creates preview deployment
- Each commit → New preview deployment

---

## Environment Variables

### Required

```bash
NEXT_PUBLIC_API_URL=https://api.content-generator.com
NEXT_PUBLIC_WS_URL=wss://api.content-generator.com
```

### Optional

```bash
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  dashboard:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NEXT_PUBLIC_API_URL=https://api.content-generator.com
      - NEXT_PUBLIC_WS_URL=wss://api.content-generator.com
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - dashboard
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t content-generator-dashboard .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.content-generator.com \
  -e NEXT_PUBLIC_WS_URL=wss://api.content-generator.com \
  content-generator-dashboard

# Or with docker-compose
docker-compose up -d
```

---

## Netlify Deployment

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
```

### Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

## AWS Amplify Deployment

1. Go to AWS Amplify Console
2. Connect GitHub repository
3. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
4. Add environment variables
5. Deploy

---

## SSL/HTTPS

### Vercel

**Automatic SSL**:

- Vercel provides automatic SSL
- Free SSL certificates via Let's Encrypt
- Auto-renewal

### Custom SSL (Docker/VPS)

**Using Let's Encrypt**:

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificates saved to:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

**Nginx Configuration**:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Monitoring & Analytics

### Google Analytics

1. Create GA4 property
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to environment variables
4. Configure in app:

```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
```

### Sentry (Error Tracking)

1. Create Sentry project
2. Get DSN
3. Install SDK:
   ```bash
   npm install @sentry/nextjs
   ```
4. Configure:

   ```typescript
   // sentry.client.config.ts
   import * as Sentry from '@sentry/nextjs';

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 1.0,
   });
   ```

---

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle
npm run build
# Check .next/server/ and .next/static/ sizes

# Enable SWC minification (Next.js 13+)
# Already enabled by default
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority  // For above-the-fold images
/>
```

### Code Splitting

```typescript
// Dynamic imports
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false,
});
```

---

## Health Checks

### Endpoint

Create health check endpoint:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

### Monitoring

Configure uptime monitoring:

- UptimeRobot
- Pingdom
- StatusCake

**Check**: `GET https://yourdomain.com/api/health`

---

## Rollback

### Vercel

1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Docker

```bash
# List images
docker images

# Run previous version
docker run -p 3000:3000 content-generator-dashboard:previous-tag
```

---

## Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Backend API accessible from dashboard
- [ ] SSL/HTTPS enabled
- [ ] Custom domain configured
- [ ] Analytics tracking setup
- [ ] Error tracking configured
- [ ] Performance tested (Lighthouse >90)
- [ ] Accessibility tested (WCAG 2.1 AA)
- [ ] All tests passing
- [ ] Build successful
- [ ] Health check working
- [ ] Monitoring configured
- [ ] Backup strategy in place

---

**Last Updated**: 2025-10-02
