# Toombos Frontend - Vercel Deployment Steps

## Prerequisites Checklist

- ✅ Vercel CLI installed (v48.2.6)
- ❌ **ACTION REQUIRED**: Login to Vercel
- ❌ **ACTION REQUIRED**: Link project to Vercel
- ⚠️ **IMPORTANT**: Ensure toombos-backend is deployed to production first

## Backend Requirements

Before deploying the frontend, ensure your toombos-backend is:

1. **Deployed to production** with a public URL (e.g., `https://api.toombos.com`)
2. **CORS configured** to allow requests from your frontend domain
3. **WebSocket endpoint** accessible at `/ws/jobs`
4. **SSL/TLS enabled** (HTTPS/WSS for production)

## Step-by-Step Deployment

### Step 1: Login to Vercel

```bash
vercel login
```

This will open your browser for authentication. Follow the prompts to complete login.

### Step 2: Link Project to Vercel

```bash
vercel link
```

You'll be asked:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your team/personal account
- **Link to existing project?** → No (first time) or Yes (if exists)
- **Project name?** → toombos-frontend (or your preferred name)

### Step 3: Configure Environment Variables

Choose one of these methods:

#### Method A: Automated Script (Recommended)

```bash
# Make script executable
chmod +x scripts/deploy-vercel.sh

# Run deployment script
./scripts/deploy-vercel.sh
```

The script will:
- ✅ Verify Vercel CLI installation
- ✅ Check authentication
- ✅ Prompt for backend URLs
- ✅ Configure environment variables
- ✅ Deploy to production

#### Method B: Manual CLI Configuration

```bash
# Add API URL
vercel env add NEXT_PUBLIC_API_URL production
# When prompted, enter: https://api.toombos.com

# Add WebSocket URL
vercel env add NEXT_PUBLIC_WS_URL production
# When prompted, enter: wss://api.toombos.com

# Add feature flags
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS production
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_WEBSOCKET production
```

#### Method C: Vercel Dashboard

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select **toombos-frontend** project
3. Click **Settings** → **Environment Variables**
4. Add the following variables for **Production**:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://api.toombos.com` | Production |
| `NEXT_PUBLIC_WS_URL` | `wss://api.toombos.com` | Production |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `true` | Production |
| `NEXT_PUBLIC_ENABLE_WEBSOCKET` | `true` | Production |

### Step 4: Deploy to Production

```bash
vercel --prod
```

Wait for deployment to complete. You'll see output like:

```
✔ Production: https://toombos-frontend.vercel.app [copied to clipboard]
```

### Step 5: Verify Deployment

#### A. Check Build Logs

1. Go to Vercel Dashboard → **Deployments**
2. Click on the latest deployment
3. Review **Build Logs** for errors
4. Check **Runtime Logs** for application errors

#### B. Test API Connectivity

Open the deployment URL and test each page:

1. **Dashboard** (`/dashboard`)
   - ✅ Page loads without errors
   - ✅ Health status shows backend connection
   - ✅ Metrics display correctly

2. **Analytics** (`/analytics`)
   - ✅ Analytics data loads
   - ✅ Charts render correctly
   - ✅ Time range filters work

3. **History** (`/history`)
   - ✅ Job history loads
   - ✅ Timeline displays jobs
   - ✅ Search and filters work

4. **Jobs** (`/jobs`)
   - ✅ WebSocket shows "Connected" status
   - ✅ Real-time updates work
   - ✅ Batch operations functional

#### C. Test WebSocket Connection

Open browser console on the Jobs page:

```javascript
// Should see WebSocket connection established
// Check Network tab → WS → Filter by "ws/jobs"
// Status should be "101 Switching Protocols"
```

#### D. Test End-to-End Flow

1. Create a test content generation job
2. Verify real-time status updates
3. Check job appears in History
4. Verify Analytics metrics update

## Troubleshooting

### Issue: Build Fails

**Solution**:
```bash
# Clear build cache and retry
vercel --prod --force
```

### Issue: Environment Variables Not Working

**Solution**:
1. Verify variable names start with `NEXT_PUBLIC_`
2. Check Vercel Dashboard → Settings → Environment Variables
3. Redeploy after adding variables:
   - Go to Deployments → ⋯ → Redeploy

### Issue: API Requests Fail with CORS Errors

**Solution**:
1. Update toombos-backend CORS configuration
2. Add your Vercel deployment URL to allowed origins:

```python
# Backend CORS settings
allow_origins = [
    "https://toombos-frontend.vercel.app",
    "https://your-custom-domain.com"
]
```

### Issue: WebSocket Connection Fails

**Solution**:
1. Check WebSocket URL uses `wss://` (not `ws://`)
2. Verify backend WebSocket endpoint is accessible
3. Check browser console for connection errors
4. Test backend WebSocket directly:
   ```bash
   wscat -c wss://api.toombos.com/ws/jobs
   ```

## Custom Domain (Optional)

### Add Custom Domain

1. Go to **Project Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain: `toombos.com`
4. Configure DNS records as instructed
5. Vercel auto-issues SSL certificate

### DNS Configuration

**Option A: Vercel Nameservers** (Recommended)
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option B: A/CNAME Records**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Post-Deployment Checklist

- [ ] Deployment completed successfully
- [ ] All pages load without errors
- [ ] API connectivity verified
- [ ] WebSocket connection established
- [ ] Real-time updates working
- [ ] Test job creation and completion
- [ ] Analytics displaying data
- [ ] No console errors
- [ ] Performance acceptable (Lighthouse audit)
- [ ] Custom domain configured (optional)

## Next Steps

1. **Monitor Performance**:
   - Vercel Dashboard → Analytics → Web Vitals
   - Set up error tracking (Sentry recommended)

2. **Configure Alerts**:
   - Project Settings → Notifications
   - Enable deployment failure alerts
   - Enable build error alerts

3. **Backend Coordination**:
   - Ensure backend CORS allows frontend domain
   - Verify API rate limits are appropriate
   - Test under production load

## Support Resources

- **Vercel Documentation**: [https://vercel.com/docs](https://vercel.com/docs)
- **Deployment Guide**: `docs/VERCEL-DEPLOYMENT.md`
- **Backend Integration**: `docs/BACKEND-INTEGRATION.md`
- **Automated Script**: `scripts/deploy-vercel.sh`

---

**Ready to deploy?** Start with Step 1: `vercel login`
