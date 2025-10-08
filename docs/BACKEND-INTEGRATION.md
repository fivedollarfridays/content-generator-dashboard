# Toombos Backend Integration Guide

This document describes how the Toombos Frontend integrates with the toombos-backend API and WebSocket services.

## Overview

The Toombos Frontend is a Next.js application that communicates with toombos-backend (FastAPI) for:
- Content generation job management
- Real-time job status updates via WebSocket
- Analytics and metrics
- Health monitoring and cache management

## Architecture

```
┌─────────────────────┐         HTTP/REST          ┌──────────────────┐
│  Toombos Frontend   │  ◄─────────────────────►   │ Toombos Backend  │
│  (Next.js 15.5.4)   │                            │   (FastAPI)      │
│                     │         WebSocket          │                  │
│  - React 18         │  ◄─────────────────────►   │  - Python        │
│  - TypeScript       │                            │  - PostgreSQL    │
│  - Tailwind CSS     │                            │  - Redis         │
└─────────────────────┘                            └──────────────────┘
```

## Environment Configuration

### Development (.env.local)

```bash
# Toombos Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Production (.env.production)

```bash
# Toombos Backend API (Production)
NEXT_PUBLIC_API_URL=https://api.toombos.com
NEXT_PUBLIC_WS_URL=wss://api.toombos.com

# Optional: API timeout and retry configuration
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_MAX_RETRIES=3
```

## API Client

The frontend uses a centralized API client (`lib/api/api-client.ts`) for all backend communication.

### Usage Example

```typescript
import { ContentGeneratorAPI } from '@/lib/api/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const apiKey = localStorage.getItem('api_key') || '';
const api = new ContentGeneratorAPI(API_URL, apiKey);

// List jobs
const response = await api.listJobs({ limit: 100 });
if (response.success && response.data) {
  const jobs = response.data.jobs;
}

// Get analytics
const analyticsResponse = await api.getAnalytics({
  start_date: startDate.toISOString(),
  end_date: endDate.toISOString(),
  granularity: 'day',
});
```

### Available API Methods

- `healthCheck()` - Check backend health status
- `metrics()` - Get system metrics
- `listJobs(params)` - List content generation jobs
- `getJob(jobId)` - Get specific job details
- `generateContent(request)` - Create new content generation job
- `retryJob(jobId)` - Retry a failed job
- `cancelJob(jobId)` - Cancel an in-progress job
- `getAnalytics(params)` - Get analytics data
- `getCacheStats()` - Get cache statistics
- `invalidateCache(request)` - Invalidate cache entries
- `clearAllCaches()` - Clear all caches

## WebSocket Integration

Real-time job updates are handled via WebSocket connections.

### Custom Hook: useJobUpdates

The `useJobUpdates` hook provides a simple interface for real-time job updates:

```typescript
import { useJobUpdates } from '@/app/hooks/use-job-updates';

const MyComponent = () => {
  const { isConnected, lastUpdate, subscribeToJob } = useJobUpdates({
    enabled: true,
    onJobUpdate: (job) => {
      console.log('Job updated:', job);
      // Update local state
    },
    onJobCompleted: (job) => {
      toast.success(`Job ${job.job_id} completed!`);
    },
    onJobFailed: (job) => {
      toast.error(`Job ${job.job_id} failed`);
    },
  });

  // Subscribe to specific job
  useEffect(() => {
    subscribeToJob('job-123');
  }, []);

  return (
    <div>
      Connection: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
};
```

### WebSocket Message Format

#### Incoming Messages

```json
{
  "type": "job_update" | "job_created" | "job_completed" | "job_failed",
  "job": {
    "job_id": "string",
    "document_id": "string",
    "status": "pending" | "in_progress" | "completed" | "failed",
    "channels": ["email", "website"],
    "created_at": "2025-10-08T12:00:00Z",
    "completed_at": "2025-10-08T12:05:00Z",
    "results": {...}
  },
  "timestamp": "2025-10-08T12:00:00Z"
}
```

#### Outgoing Messages (Subscriptions)

```json
{
  "type": "subscribe" | "unsubscribe",
  "job_id": "job-123"
}
```

## Pages Using Backend API

### 1. Dashboard Page (`app/dashboard/page.tsx`)

**API Calls:**
- `api.listJobs()` - Fetches recent jobs for metrics
- Health component calls `api.healthCheck()` and `api.metrics()`

**Update Frequency:**
- Jobs: Every 30 seconds
- Health: Every 30 seconds

### 2. Analytics Page (`app/analytics/page.tsx`)

**API Calls:**
- `api.getAnalytics()` - Fetches analytics data with time range filtering

**Features:**
- Time range selection (24h, 7d, 30d)
- Manual refresh button
- Auto-refresh on time range change

### 3. History Page (`app/history/page.tsx`)

**API Calls:**
- `api.listJobs()` - Fetches up to 500 jobs for timeline
- `api.retryJob()` - Retry failed jobs
- `api.cancelJob()` - Cancel in-progress jobs

**Features:**
- Search by job ID or document ID
- Filter by status
- Job detail modal
- Retry and cancel operations

### 4. Jobs Page (`app/jobs/page.tsx`)

**API Calls:**
- Real-time updates via WebSocket
- `api.retryJob()` - Batch retry
- `api.cancelJob()` - Batch cancel

**Features:**
- Live job status updates via WebSocket
- Advanced filtering
- Batch operations
- Export to CSV/JSON

## Authentication

The frontend uses API keys for authentication:

```typescript
// API key is stored in localStorage
const apiKey = localStorage.getItem('api_key') || '';

// Pass to API client
const api = new ContentGeneratorAPI(API_URL, apiKey);
```

API keys are included in requests as Bearer tokens:

```
Authorization: Bearer <api_key>
```

## Error Handling

All API calls return a standardized response format:

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    status?: number;
    details?: any;
  };
}
```

### Error Handling Pattern

```typescript
const response = await api.someMethod();

if (response.success && response.data) {
  // Handle success
  const data = response.data;
} else {
  // Handle error
  console.error(response.error?.message);
  toast.error(response.error?.message || 'Operation failed');
}
```

## CORS Configuration

The backend must allow requests from the frontend origin:

### Development
```python
# toombos-backend CORS settings
allow_origins = ["http://localhost:3000"]
```

### Production
```python
# toombos-backend CORS settings
allow_origins = ["https://toombos.com", "https://www.toombos.com"]
```

## WebSocket Connection Management

The frontend implements automatic reconnection with exponential backoff:

- **Initial Reconnect Delay**: 3000ms
- **Max Reconnect Attempts**: 5
- **Auto-reconnect**: Enabled

Connection states:
- `CONNECTING` - Establishing connection
- `CONNECTED` - Successfully connected
- `DISCONNECTED` - Not connected
- `ERROR` - Connection error

## Testing Backend Integration

### 1. Check Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 3600,
  "version": "1.0.0",
  "checks": {...}
}
```

### 2. Test API Endpoints

```bash
# List jobs
curl http://localhost:8000/api/jobs

# Get analytics
curl http://localhost:8000/api/analytics
```

### 3. Test WebSocket

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/jobs');
ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};
```

## Deployment Checklist

### Backend Deployment

- [ ] Deploy toombos-backend to production
- [ ] Configure CORS to allow frontend origin
- [ ] Set up SSL/TLS for HTTPS and WSS
- [ ] Configure database and Redis
- [ ] Set up environment variables
- [ ] Test health endpoint

### Frontend Deployment

- [ ] Update `.env.production` with backend URLs
- [ ] Set environment variables in Vercel
- [ ] Deploy to Vercel
- [ ] Test API connectivity
- [ ] Test WebSocket connection
- [ ] Verify real-time updates

## Monitoring

### Frontend Monitoring

- WebSocket connection state
- API request success/failure rates
- Response times
- Error tracking (Sentry recommended)

### Backend Monitoring

- Health check endpoint status
- Request/response metrics
- WebSocket connection count
- Job processing performance

## Troubleshooting

### Connection Issues

**Problem**: WebSocket not connecting

**Solutions**:
1. Check backend is running: `curl http://localhost:8000/health`
2. Verify WebSocket endpoint: `ws://localhost:8000/ws/jobs`
3. Check browser console for errors
4. Verify CORS settings on backend
5. Check firewall/network settings

**Problem**: API requests failing with CORS errors

**Solutions**:
1. Verify backend CORS configuration
2. Check `NEXT_PUBLIC_API_URL` is correct
3. Ensure backend is running on correct port
4. Check for HTTPS/HTTP mismatch in production

### Performance Issues

**Problem**: Slow API responses

**Solutions**:
1. Check backend performance metrics
2. Verify database query performance
3. Enable Redis caching on backend
4. Implement request debouncing on frontend
5. Use pagination for large datasets

## Additional Resources

- [Backend API Documentation](https://github.com/your-org/toombos-backend/docs/API.md)
- [WebSocket Protocol Specification](https://github.com/your-org/toombos-backend/docs/WEBSOCKET.md)
- [Deployment Guide](./DEPLOYMENT-CHECKLIST.md)
- [Environment Configuration](../.env.example)

## Support

For issues or questions:
- Backend Issues: [toombos-backend repository](https://github.com/your-org/toombos-backend/issues)
- Frontend Issues: [toombos-frontend repository](https://github.com/your-org/toombos-frontend/issues)
