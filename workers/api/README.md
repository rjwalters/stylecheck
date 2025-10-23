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
