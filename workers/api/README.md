# VibeCov API - Cloudflare Workers

Backend API for VibeCov built on Cloudflare Workers, D1, and KV.

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Create D1 Database

```bash
pnpm run db:create
```

This will output a database ID. Copy it and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "vibecov-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 3. Create KV Namespace

```bash
wrangler kv:namespace create SESSIONS
```

Copy the ID and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "YOUR_KV_NAMESPACE_ID_HERE"
```

### 4. Run Database Migrations

```bash
# For local development
pnpm run db:migrate

# For production
pnpm run db:migrate:production
```

### 5. Set Secrets

```bash
# GitHub OAuth credentials
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET

# JWT secret for sessions
wrangler secret put JWT_SECRET
```

To get GitHub OAuth credentials:
1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:8787/auth/callback` (dev) or `https://api.vibecov.com/auth/callback` (prod)

### 6. Start Development Server

```bash
pnpm run dev
```

The API will be available at `http://localhost:8787`

## API Endpoints

### Authentication

- `GET /auth/login` - Initiate GitHub OAuth login
- `GET /auth/callback` - GitHub OAuth callback handler
- `GET /auth/me` - Get current user (requires session cookie)
- `POST /auth/logout` - Logout and clear session

### Development (Local Only)

- `POST /dev/create-session` - Create session with GitHub token (bypasses OAuth)
- `POST /dev/seed` - Seed database with test data
- `GET /dev/status` - Check database status

### Health Check

- `GET /` - API health check

## Environment Variables

### Development (`wrangler.toml`)

```toml
GITHUB_CALLBACK_URL = "http://localhost:8787/auth/callback"
FRONTEND_URL = "http://localhost:5173"
```

### Production

```toml
GITHUB_CALLBACK_URL = "https://api.vibecov.com/auth/callback"
FRONTEND_URL = "https://vibecov.com"
```

### Secrets (use `wrangler secret put`)

- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `JWT_SECRET` - Secret for signing JWTs

## Deployment

### Deploy to Production

```bash
pnpm run deploy:production
```

### Custom Domain Setup

1. Add your custom domain in Cloudflare dashboard
2. Update `wrangler.toml` with your routes
3. Update `GITHUB_CALLBACK_URL` to use your domain

## Database Schema

See `migrations/0001_initial_schema.sql` for the complete schema.

### Tables

- `users` - User accounts from GitHub OAuth
- `sessions` - Active user sessions (backup for KV)
- `repositories` - Connected GitHub repositories
- `profiles` - User style profiles

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono (lightweight web framework)
- **Database**: Cloudflare D1 (SQLite)
- **Cache**: Cloudflare KV (sessions)
- **Auth**: GitHub OAuth 2.0

## CLI Tool (Headless Development)

The VibeCov CLI allows programmatic API access for testing and debugging without requiring browser-based OAuth.

### Installation

From the `workers/api` directory:

```bash
pnpm install
```

### Usage

```bash
# Login with GitHub Personal Access Token
pnpm cli login ghp_xxxxxxxxxxxx

# Check current user
pnpm cli me

# Make authenticated API request
pnpm cli request GET /auth/me
pnpm cli request POST /api/repos '{"name":"test"}'

# Seed database with test data
pnpm cli seed

# Logout
pnpm cli logout

# Show help
pnpm cli help
```

### Creating a GitHub PAT

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `read:user`, `user:email`
4. Copy the generated token

### Session Storage

The CLI stores your session in `.vibecov-session` file in the current directory. This file contains your session ID and GitHub token, so keep it secure and add it to `.gitignore`.

### Environment

Set `API_URL` environment variable to point to your API:

```bash
API_URL=http://localhost:8787 pnpm cli me
```

Default: `http://localhost:8787`

## Development Helpers

### Quick Start

The quickstart script sets up everything with one command:

```bash
./scripts/quickstart.sh <github-token>
```

This will:
1. Install dependencies
2. Start the API server
3. Authenticate with your GitHub token
4. Seed the database with test data
5. Verify everything is working

### API Client Library

Use the client library for programmatic access:

```typescript
import { createClient } from './src/client';

const client = createClient({
  apiUrl: 'http://localhost:8787',
});

// Authenticate
const session = await client.createSession(githubToken);

// Get current user
const { user } = await client.getCurrentUser();

// Seed database
await client.seedDatabase();

// Make custom requests
await client.call('GET', '/dev/status');
```

Run the example:

```bash
GITHUB_TOKEN=ghp_xxx pnpm example:client
```

### Test Fixtures

Test fixtures provide ready-to-use mock data:

```typescript
import { fixtures } from './src/test/fixtures';
import { createMockUser, mockGithubUsers } from './src/test/helpers';

// Use pre-built fixtures
const user = fixtures.users.full;
const repo = fixtures.repositories.public;

// Create custom mocks
const mockUser = createMockUser('alice');
const mockRepo = createMockRepository(mockUser.id, 'publicRepo');
```

Run the example:

```bash
pnpm example:fixtures
```

### Available Scripts

```bash
# API Server
pnpm dev                  # Start development server
pnpm deploy              # Deploy to Cloudflare Workers
pnpm deploy:production   # Deploy to production

# Database
pnpm db:create           # Create D1 database
pnpm db:migrate          # Run migrations (local)
pnpm db:migrate:production  # Run migrations (production)

# CLI Tool
pnpm cli login <token>   # Login with GitHub token
pnpm cli me              # Get current user
pnpm cli seed            # Seed database
pnpm cli logout          # Logout
pnpm cli help            # Show help

# Examples
pnpm example:client      # Run client library example
pnpm example:fixtures    # Run test fixtures example

# Quick Start
pnpm quickstart <token>  # Complete setup in one command
```
