# API Integration Guide - Content Generator Dashboard

**Last Updated**: 2025-10-02
**Backend Repository**: https://github.com/fivedollarfridays/halcytone-content-generator

---

## Overview

This dashboard integrates with the Content Generator FastAPI backend via:
- **REST API** - HTTP requests for data operations
- **WebSocket** - Real-time updates for jobs and health

**Base URLs**:
- Development: `http://localhost:8000`
- Production: `https://api.content-generator.com`

---

## API Client

### Setup

The API client is pre-configured in `lib/api/client.ts`:

```typescript
import { ContentGeneratorAPI } from './api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

// Configured instance
export const apiClient = new ContentGeneratorAPI(API_URL);

// WebSocket URL helper
export function getWebSocketUrl(endpoint: string): string {
  return `${WS_URL}${endpoint}`;
}
```

### Usage

```typescript
import { apiClient } from '@/lib/api/client';

// Use in components
const data = await apiClient.healthCheck();
```

---

## REST API Endpoints

### Health Check

**GET `/health`**

```typescript
const health = await apiClient.healthCheck();

// Response
{
  status: "healthy",
  version: "1.0.0",
  uptime: 123456,
  components: {
    database: "healthy",
    cache: "healthy",
    ai_service: "healthy"
  }
}
```

### Content Generation

**POST `/api/v2/generate-content`**

```typescript
const result = await apiClient.generateContent({
  living_doc_id: 'doc-123',
  channel: 'email',
  tone: 'professional',
  template_id: 'newsletter-modern',
});

// Response
{
  job_id: "job-abc123",
  status: "queued",
  created_at: "2025-10-02T10:00:00Z"
}
```

### Job Management

**GET `/api/v2/jobs`**

```typescript
const jobs = await apiClient.listJobs();

// Response
[
  {
    id: "job-abc123",
    title: "Newsletter Generation",
    status: "completed",
    created_at: "2025-10-02T10:00:00Z",
    completed_at: "2025-10-02T10:05:00Z"
  }
]
```

**GET `/api/v2/jobs/{id}`**

```typescript
const job = await apiClient.getJobStatus('job-abc123');

// Response
{
  id: "job-abc123",
  title: "Newsletter Generation",
  status: "completed",
  progress: 100,
  result: {
    content: "Generated content...",
    metadata: {...}
  }
}
```

### Templates

**GET `/api/v2/templates`**

```typescript
const templates = await apiClient.listTemplates();

// Response
[
  {
    id: "template-123",
    name: "Modern Newsletter",
    category: "email",
    description: "Clean, modern newsletter design"
  }
]
```

### Cache Management

**POST `/api/v2/cache/invalidate`**

```typescript
await apiClient.invalidateCache({
  pattern: 'jobs:*'
});

// Response
{
  success: true,
  keys_invalidated: 15
}
```

---

## Using React Query

### Queries (Read Operations)

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.healthCheck(),
    staleTime: 5000,         // Data fresh for 5s
    refetchInterval: 10000,  // Refetch every 10s
  });
}

// Usage
const { data, isLoading, error } = useHealthCheck();
```

### Mutations (Write Operations)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useGenerateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.generateContent(data),
    onSuccess: () => {
      // Invalidate jobs list to refetch
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error) => {
      console.error('Generation failed:', error);
    },
  });
}

// Usage
const mutation = useGenerateContent();

mutation.mutate({
  living_doc_id: 'doc-123',
  channel: 'email',
  tone: 'professional',
});
```

### Custom Hook Example

```typescript
// hooks/useJobs.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export function useJobs(filters?: { status?: string }) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const jobs = await apiClient.listJobs();

      if (filters?.status) {
        return jobs.filter(job => job.status === filters.status);
      }

      return jobs;
    },
    staleTime: 30000,  // 30 seconds
  });
}

// Usage in component
const { data: jobs, isLoading } = useJobs({ status: 'completed' });
```

---

## WebSocket Integration

### Connection Setup

```typescript
import { getWebSocketUrl } from '@/lib/api/client';
import { useEffect, useState } from 'react';

function useJobUpdates(clientId: string) {
  const [jobs, setJobs] = useState([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(
      getWebSocketUrl(`/ws/content/${clientId}`)
    );

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'job_update') {
        setJobs(prev => {
          const existing = prev.findIndex(j => j.id === data.data.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = data.data;
            return updated;
          }
          return [...prev, data.data];
        });
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [clientId]);

  return { jobs, ws };
}
```

### Message Format

```typescript
// Incoming message structure
{
  type: 'job_update' | 'health_update',
  data: {
    // Event-specific data
  },
  timestamp: '2025-10-02T10:00:00Z'
}
```

### Reconnection Logic

```typescript
function useWebSocketWithReconnect(url: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    socket.onclose = () => {
      setIsConnected(false);

      // Attempt reconnection
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
        reconnectAttempts.current += 1;

        setTimeout(() => {
          console.log(`Reconnecting... (attempt ${reconnectAttempts.current})`);
          connect();
        }, delay);
      }
    };

    setWs(socket);
  }, [url]);

  useEffect(() => {
    connect();
    return () => ws?.close();
  }, [connect]);

  return { ws, isConnected };
}
```

---

## Error Handling

### HTTP Errors

```typescript
try {
  const data = await apiClient.generateContent(payload);
} catch (error) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    switch (status) {
      case 400:
        // Bad request - show validation errors
        console.error('Validation error:', message);
        break;
      case 401:
        // Unauthorized - redirect to login
        router.push('/login');
        break;
      case 404:
        // Not found
        console.error('Resource not found');
        break;
      case 500:
        // Server error
        console.error('Server error:', message);
        break;
      default:
        console.error('API error:', error);
    }
  } else {
    // Network error
    console.error('Network error:', error);
  }
}
```

### React Query Error Handling

```typescript
const { data, error } = useQuery({
  queryKey: ['jobs'],
  queryFn: () => apiClient.listJobs(),
  retry: (failureCount, error) => {
    // Don't retry on 4xx errors
    if (axios.isAxiosError(error) && error.response?.status < 500) {
      return false;
    }
    return failureCount < 3;
  },
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (error) {
  return <ErrorMessage error={error} />;
}
```

---

## Authentication

### API Key Authentication

```typescript
// lib/api/api-client.ts
export class ContentGeneratorAPI {
  private axios: AxiosInstance;

  constructor(baseURL: string, apiKey?: string) {
    this.axios = axios.create({
      baseURL,
      headers: apiKey ? {
        'X-API-Key': apiKey,
      } : {},
    });
  }

  setApiKey(apiKey: string) {
    this.axios.defaults.headers['X-API-Key'] = apiKey;
  }
}

// Usage with API key
apiClient.setApiKey('your-api-key');
```

### Storing API Key

```typescript
// hooks/useApiKey.ts
import { useState, useEffect } from 'react';

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('api_key');
    if (stored) {
      setApiKey(stored);
      apiClient.setApiKey(stored);
    }
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem('api_key', key);
    setApiKey(key);
    apiClient.setApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem('api_key');
    setApiKey(null);
  };

  return { apiKey, saveApiKey, clearApiKey };
}
```

---

## Type Safety

### API Response Types

All types are defined in `types/content-generator.ts`:

```typescript
export interface HealthStatus {
  status: string;
  version: string;
  uptime: number;
  components: {
    database: string;
    cache: string;
    ai_service: string;
  };
}

export interface Job {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  progress?: number;
  result?: any;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
}
```

### Using Types

```typescript
import type { Job, HealthStatus } from '@/types';

const job: Job = await apiClient.getJobStatus('job-123');
const health: HealthStatus = await apiClient.healthCheck();
```

---

## Best Practices

### Caching Strategy

```typescript
// Long cache for static data
useQuery({
  queryKey: ['templates'],
  queryFn: () => apiClient.listTemplates(),
  staleTime: 5 * 60 * 1000,  // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});

// Short cache for dynamic data
useQuery({
  queryKey: ['jobs'],
  queryFn: () => apiClient.listJobs(),
  staleTime: 10000,  // 10 seconds
  refetchInterval: 30000,  // Refetch every 30s
});
```

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: (newJob) => apiClient.createJob(newJob),
  onMutate: async (newJob) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['jobs'] });

    // Snapshot previous value
    const previousJobs = queryClient.getQueryData(['jobs']);

    // Optimistically update
    queryClient.setQueryData(['jobs'], (old: Job[]) => [...old, newJob]);

    return { previousJobs };
  },
  onError: (err, newJob, context) => {
    // Rollback on error
    queryClient.setQueryData(['jobs'], context?.previousJobs);
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  },
});
```

### Request Cancellation

```typescript
function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async ({ signal }) => {
      // Pass AbortSignal to axios
      const response = await apiClient.axios.get('/api/v2/jobs', { signal });
      return response.data;
    },
  });
}
```

---

## Testing API Integration

### Mocking API Client

```typescript
// __mocks__/lib/api/client.ts
export const apiClient = {
  healthCheck: jest.fn(),
  listJobs: jest.fn(),
  getJobStatus: jest.fn(),
  generateContent: jest.fn(),
};
```

### Test Example

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import JobsList from './JobsList';
import { apiClient } from '@/lib/api/client';

jest.mock('@/lib/api/client');

describe('JobsList with API', () => {
  it('fetches and displays jobs', async () => {
    const mockJobs = [{ id: '1', title: 'Job 1' }];
    (apiClient.listJobs as jest.Mock).mockResolvedValue(mockJobs);

    const queryClient = new QueryClient();

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

---

## Troubleshooting

### CORS Errors

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**: Ensure backend CORS is configured for dashboard domain

```python
# Backend main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://dashboard.yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Connection Refused

**Error**: `Connection refused` or `ECONNREFUSED`

**Check**:
1. Backend is running: `curl http://localhost:8000/health`
2. Correct API URL in `.env.local`
3. No firewall blocking

### WebSocket Connection Failed

**Error**: WebSocket connection to 'ws://...' failed

**Check**:
1. WebSocket URL is correct (ws:// or wss://)
2. Backend supports WebSocket
3. No proxy blocking WebSocket

---

**Last Updated**: 2025-10-02
**Backend API Docs**: http://localhost:8000/docs (when backend running)
