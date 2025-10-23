# VibeCov Architecture

This document describes the technical architecture for VibeCov, a SaaS platform built entirely on Cloudflare's serverless infrastructure.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                    (vibecov.com)                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Pages                           │
│              (React + TypeScript Frontend)                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Dashboard  │  │   Settings   │  │   File View  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ API Calls
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Workers                         │
│                    (Edge API Layer)                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth API   │  │  Repo API    │  │ Analysis API │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                   │                 │              │
│         ↓                   ↓                 ↓              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │      KV      │  │   D1 (SQLite)│  │  AI Gateway  │     │
│  │  (Sessions)  │  │  (Cache/Data)│  │ (LLM Routing)│     │
│  └──────────────┘  └──────────────┘  └──────┬───────┘     │
└─────────────────────────────────────────────┼──────────────┘
                                               │
                                               ↓
                 ┌──────────────────────────────────────┐
                 │     External Services                │
                 │                                      │
                 │  ┌────────────┐  ┌────────────┐    │
                 │  │ GitHub API │  │ Claude API │    │
                 │  └────────────┘  └────────────┘    │
                 └──────────────────────────────────────┘
```

## Core Components

### 1. Frontend (Cloudflare Pages)

**Technology**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui

**Key Features**:
- Server-side rendering (SSR) for SEO
- Global CDN distribution
- Automatic HTTPS and DDoS protection
- GitHub integration for CI/CD

**Pages**:
- `/` - Landing page
- `/dashboard` - Main user dashboard
- `/repos/:owner/:repo` - Repository detail view
- `/repos/:owner/:repo/files/:path` - File analysis view
- `/settings` - User preferences and API key management
- `/auth/callback` - GitHub OAuth callback

**State Management**:
- React Context for global state
- TanStack Query for server state caching
- Local storage for user preferences

### 2. Backend (Cloudflare Workers)

**Technology**: TypeScript + Hono (lightweight web framework)

**Key API Routes**:

```typescript
// Authentication
POST   /api/auth/github           // Initiate GitHub OAuth
GET    /api/auth/callback         // OAuth callback handler
POST   /api/auth/logout           // Clear session

// User Management
GET    /api/user                  // Get current user
PUT    /api/user/preferences      // Update user preferences
GET    /api/user/usage            // Get usage stats

// Repository Management
GET    /api/repos                 // List user's repositories
POST   /api/repos                 // Add repository
DELETE /api/repos/:id             // Remove repository
GET    /api/repos/:id             // Get repository details
GET    /api/repos/:id/files       // List repository files
POST   /api/repos/:id/analyze     // Trigger full repo analysis

// File Analysis
GET    /api/files/:hash           // Get cached analysis
POST   /api/analyze               // Analyze single file
GET    /api/analyze/:job_id       // Get analysis job status

// GitHub Integration
POST   /api/webhooks/github       // Handle GitHub webhooks
GET    /api/badge/:owner/:repo    // Generate SVG badge

// Billing (Stripe)
POST   /api/billing/checkout      // Create checkout session
POST   /api/billing/portal        // Customer portal
POST   /api/webhooks/stripe       // Stripe webhooks
```

### 3. Database (Cloudflare D1)

**Technology**: SQLite-compatible distributed SQL database

**Schema**:

```sql
-- Users and authentication
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    github_id INTEGER UNIQUE NOT NULL,
    github_username TEXT NOT NULL,
    email TEXT,
    created_at INTEGER NOT NULL,
    subscription_tier TEXT DEFAULT 'free',
    stripe_customer_id TEXT
);

-- User API keys (encrypted)
CREATE TABLE api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    provider TEXT NOT NULL, -- 'anthropic', 'openai', etc.
    encrypted_key TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    last_used_at INTEGER
);

-- User style preferences
CREATE TABLE style_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    llm_provider TEXT NOT NULL,
    llm_model TEXT NOT NULL,
    preferences_json TEXT NOT NULL, -- YAML/JSON config
    is_default INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Connected repositories
CREATE TABLE repositories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    github_id INTEGER NOT NULL,
    owner TEXT NOT NULL,
    name TEXT NOT NULL,
    default_branch TEXT NOT NULL,
    is_private INTEGER NOT NULL,
    profile_id TEXT REFERENCES style_profiles(id),
    last_analyzed_at INTEGER,
    vibe_score REAL, -- 0-100
    created_at INTEGER NOT NULL,
    UNIQUE(user_id, github_id)
);

-- File analysis cache
CREATE TABLE file_analyses (
    id TEXT PRIMARY KEY,
    repository_id TEXT NOT NULL REFERENCES repositories(id),
    file_path TEXT NOT NULL,
    file_hash TEXT NOT NULL, -- SHA-256 of content
    content_size INTEGER NOT NULL,
    vibe_score REAL NOT NULL, -- 0-100
    analysis_json TEXT NOT NULL, -- Detailed results
    llm_provider TEXT NOT NULL,
    llm_model TEXT NOT NULL,
    analyzed_at INTEGER NOT NULL,
    UNIQUE(repository_id, file_hash)
);

CREATE INDEX idx_file_analyses_repo ON file_analyses(repository_id);
CREATE INDEX idx_file_analyses_hash ON file_analyses(file_hash);

-- Analysis queue (for async processing)
CREATE TABLE analysis_jobs (
    id TEXT PRIMARY KEY,
    repository_id TEXT NOT NULL REFERENCES repositories(id),
    file_path TEXT,
    status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
    created_at INTEGER NOT NULL,
    started_at INTEGER,
    completed_at INTEGER,
    error_message TEXT
);

-- GitHub webhooks log
CREATE TABLE webhook_events (
    id TEXT PRIMARY KEY,
    repository_id TEXT REFERENCES repositories(id),
    event_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    processed INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
);

-- Usage tracking (for billing)
CREATE TABLE usage_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    event_type TEXT NOT NULL, -- 'file_analysis', 'api_call', etc.
    tokens_used INTEGER,
    cost_cents INTEGER,
    created_at INTEGER NOT NULL
);

CREATE INDEX idx_usage_user_date ON usage_events(user_id, created_at);
```

### 4. Session Storage (Cloudflare KV)

**Purpose**: Fast, distributed key-value storage for user sessions

**Data Structure**:

```typescript
// Session key format: session:{sessionId}
interface Session {
  userId: string;
  githubToken: string;
  expiresAt: number;
  createdAt: number;
}

// Rate limiting key format: ratelimit:{userId}:{endpoint}
interface RateLimit {
  count: number;
  resetAt: number;
}
```

### 5. AI Gateway (Cloudflare AI Gateway)

**Purpose**: Route LLM requests, cache responses, manage costs

**Configuration**:

```typescript
// Gateway endpoint
const AI_GATEWAY_ENDPOINT = 'https://gateway.ai.cloudflare.com/v1/{account_id}/vibecov';

// Request structure
interface LLMRequest {
  provider: 'anthropic' | 'openai';
  endpoint: string;
  method: 'POST';
  headers: {
    'Authorization': string;
    'Content-Type': 'application/json';
  };
  body: {
    model: string;
    messages: Message[];
    max_tokens?: number;
    temperature?: number;
  };
}

// AI Gateway benefits:
// - Automatic request caching (by content hash)
// - Usage analytics and cost tracking
// - Rate limiting and quotas
// - Fallback to backup providers
```

## Data Flow

### File Analysis Flow

```
1. User selects file for analysis
   ↓
2. Frontend sends request to /api/analyze
   ↓
3. Worker computes SHA-256 hash of file content
   ↓
4. Worker checks D1 cache by hash
   ↓
5a. Cache HIT:                        5b. Cache MISS:
    - Return cached result                - Queue analysis job
    - Update last_accessed                - Return job_id
    ↓                                      ↓
6. Display results to user            6. Poll /api/analyze/:job_id
                                          ↓
                                      7. Worker processes job:
                                         - Load user's style profile
                                         - Build prompt for LLM
                                         - Send to AI Gateway
                                         ↓
                                      8. AI Gateway:
                                         - Check its own cache
                                         - Route to appropriate LLM
                                         - Return analysis
                                         ↓
                                      9. Worker:
                                         - Parse LLM response
                                         - Calculate vibe score
                                         - Store in D1 cache
                                         - Update job status
                                         ↓
                                      10. Frontend polls and gets result
                                         ↓
                                      11. Display to user
```

### GitHub PR Integration Flow

```
1. User creates PR in GitHub
   ↓
2. GitHub sends webhook to /api/webhooks/github
   ↓
3. Worker validates webhook signature
   ↓
4. Worker extracts changed files from PR
   ↓
5. For each changed file:
   - Compute file hash
   - Check cache
   - If miss, queue analysis
   ↓
6. Process all analyses
   ↓
7. Calculate overall PR vibe score
   ↓
8. Post comment to PR via GitHub API:
   - Overall score
   - Files with low vibe scores
   - Specific suggestions
   ↓
9. Update GitHub status check:
   - Pass if score > threshold
   - Fail otherwise
```

## Vibe Score Calculation

```typescript
interface VibeScore {
  overall: number; // 0-100
  categories: {
    naming: number;
    organization: number;
    documentation: number;
    typing: number;
    structure: number;
    errorHandling: number;
    modernPractices: number;
  };
  issues: Issue[];
}

interface Issue {
  line: number;
  column?: number;
  category: string;
  severity: 'critical' | 'major' | 'minor' | 'style';
  message: string;
  suggestion?: string;
  affectedLines: number; // How many lines this issue affects
}

function calculateVibeScore(analysis: LLMAnalysis, preferences: StyleProfile): VibeScore {
  // 1. Extract issues from LLM response
  const issues = parseIssues(analysis);

  // 2. Weight issues by severity
  const weights = { critical: 10, major: 5, minor: 2, style: 1 };
  const totalPenalty = issues.reduce((sum, issue) =>
    sum + (weights[issue.severity] * issue.affectedLines), 0
  );

  // 3. Calculate percentage based on file size
  const maxPossiblePenalty = fileLineCount * weights.critical;
  const penaltyPercent = (totalPenalty / maxPossiblePenalty) * 100;

  // 4. Overall score is inverse of penalty
  const overall = Math.max(0, 100 - penaltyPercent);

  // 5. Calculate category-specific scores
  const categories = calculateCategoryScores(issues, preferences);

  return { overall, categories, issues };
}
```

## Caching Strategy

### Multi-Layer Cache

1. **AI Gateway Cache** (Cloudflare):
   - Caches identical LLM requests
   - TTL: 30 days
   - Invalidation: Manual or automatic

2. **D1 File Analysis Cache**:
   - Key: file_hash + profile_id
   - Stores: Full analysis results
   - Invalidation: On file content change

3. **Browser Cache** (TanStack Query):
   - Caches API responses
   - TTL: 5 minutes
   - Invalidation: Manual refetch or stale-while-revalidate

### Cache Key Structure

```typescript
// D1 cache key
const cacheKey = `${fileHash}:${profileId}:${llmModel}`;

// AI Gateway automatically caches by request content hash
const requestHash = sha256(JSON.stringify({
  model,
  messages,
  temperature
}));
```

## Security

### Authentication Flow

```typescript
// 1. User clicks "Sign in with GitHub"
// 2. Redirect to GitHub OAuth
const githubAuthUrl = `https://github.com/login/oauth/authorize?
  client_id=${GITHUB_CLIENT_ID}&
  scope=repo,user:email&
  redirect_uri=${CALLBACK_URL}`;

// 3. GitHub redirects back with code
// 4. Exchange code for access token
const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
  method: 'POST',
  body: JSON.stringify({
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    code,
  }),
});

// 5. Store token in encrypted session (KV)
const sessionId = crypto.randomUUID();
await KV.put(`session:${sessionId}`, JSON.stringify({
  userId: user.id,
  githubToken: encrypt(token),
  expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
}), { expirationTtl: 7 * 24 * 60 * 60 });

// 6. Set secure cookie
setCookie('session_id', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60,
});
```

### API Key Encryption

```typescript
// Encrypt user API keys before storing in D1
async function encryptApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(ENCRYPTION_KEY),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );

  return `${arrayBufferToBase64(iv)}:${arrayBufferToBase64(encrypted)}`;
}
```

## Performance Optimization

### Parallel Processing

```typescript
// Analyze multiple files in parallel
async function analyzeRepository(repoId: string, files: string[]) {
  // Batch files into groups
  const batches = chunk(files, 10);

  for (const batch of batches) {
    // Process batch in parallel
    await Promise.all(
      batch.map(file => analyzeFile(repoId, file))
    );
  }
}
```

### Smart Filtering

```typescript
// Skip files that don't need analysis
const SKIP_PATTERNS = [
  /node_modules\//,
  /\.venv\//,
  /\.min\.js$/,
  /\.map$/,
  /\.lock$/,
  /package-lock\.json$/,
];

function shouldAnalyze(filePath: string): boolean {
  return !SKIP_PATTERNS.some(pattern => pattern.test(filePath));
}
```

## Monitoring & Observability

### Metrics to Track

1. **Performance**:
   - API response time (p50, p95, p99)
   - LLM request latency
   - Cache hit rate
   - Database query time

2. **Business**:
   - Daily active users
   - Repositories analyzed
   - Files analyzed per day
   - API calls per user
   - Revenue (MRR, ARR)

3. **Costs**:
   - LLM API costs (by provider/model)
   - Cloudflare costs (Workers, D1, KV)
   - Total cost per user

### Logging

```typescript
// Structured logging for debugging
interface LogEvent {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  context: {
    userId?: string;
    repoId?: string;
    fileHash?: string;
    [key: string]: any;
  };
}

function log(event: LogEvent) {
  console.log(JSON.stringify(event));
  // Also send to external logging service (e.g., Axiom, Logflare)
}
```

## Deployment

### Environments

1. **Development**: Local development with Wrangler
2. **Staging**: Separate Cloudflare environment for testing
3. **Production**: Main production environment

### CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test
      - run: pnpm build

      # Deploy Workers
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          command: deploy

      # Deploy Pages
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          projectName: vibecov
          directory: frontend/dist
```

## Cost Estimation

### Cloudflare Costs (Pro Plan)

- **Pages**: $20/mo (included builds, bandwidth)
- **Workers**: $5/mo + $0.50 per million requests
- **D1**: Free tier (5GB storage, 5M reads/day)
- **KV**: $0.50 per million reads
- **AI Gateway**: Free (proxy only)

### LLM Costs (Anthropic Claude)

- **Claude Sonnet**: ~$3 per million tokens (~$0.015 per file analysis)
- **Estimated monthly cost**: $100-500 depending on usage

### Total Estimated Costs

- **Fixed**: $25/mo (Cloudflare Pro)
- **Variable**: $100-1000/mo (LLM + usage)
- **Target margin**: 70% (charge $9-29/mo for paid tiers)

## Next Steps

See [ROADMAP.md](./ROADMAP.md) for development timeline and priorities.
