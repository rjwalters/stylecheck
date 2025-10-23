# VibeCheck 🎯

**VibeCheck** helps developers define, track, and maintain their coding aesthetic across any repository.

## Vision

In the era of "vibe coding" - where AI helps us write code faster than ever - maintaining consistent style and aesthetic becomes critical. **VibeCheck** is a SaaS platform (similar to codecov) that analyzes your repositories and provides aesthetic quality metrics, helping you spot files that don't match your coding vibe.

**Free for public repos, paid for private repos.**

## How It Works

### User Setup (Web Dashboard)
1. **Sign in** to VibeCheck.dev with GitHub
2. **Configure your aesthetic**:
   - Choose preferred LLM (Claude, GPT-4, etc.)
   - Provide API keys (stored securely)
   - Define your coding style preferences
   - Set your quality thresholds
3. **Connect repositories** (public or private with GitHub token)
4. **Install GitHub integration** (optional - for badges and PR comments)

### Analysis & Metrics (Powered by Cloudflare AI Gateway)
- VibeCheck analyzes your repository file-by-file
- Each file gets a **vibe score** (0-100) based on your aesthetic preferences
- Like codecov: track lines that are "stylish" vs "needs work"
- Set threshold percentages for passing (e.g., 80% vibe score to pass)

### GitHub Integration
- **Badges**: Add VibeCheck badge to your README showing repo vibe score
- **PR Comments**: Automatic aesthetic review on pull requests
- **Status Checks**: Block PRs that drop below vibe threshold

### Dashboard Features
- **Repository health**: Overall vibe score and trends over time
- **File rankings**: See which files need aesthetic attention
- **Per-file analysis**: Line-by-line style review with suggestions
- **Comparison**: Track improvements across commits
- **Team consistency**: See how well your team maintains the vibe

## Core Features

### 🎨 Aesthetic Configuration
- **Customizable preferences**: Define your coding style across multiple dimensions
- **LLM choice**: Use Claude, GPT-4, or other models for analysis
- **Preset profiles**: Start from popular style guides (PEP 8, Google, Airbnb, etc.)
- **Natural language rules**: Define custom preferences in plain English

### 📊 Repository Analysis
- **Per-file vibe scores**: 0-100 rating based on your aesthetic
- **Line-level tracking**: Like code coverage, but for style compliance
- **Trend analysis**: Track improvements or regressions over time
- **Multi-language support**: Works with any programming language

### 🔗 GitHub Integration
- **Status badges**: Show your repo's vibe score in README
- **PR automation**: Automatic aesthetic reviews on pull requests
- **Quality gates**: Block merges that don't meet vibe threshold
- **GitHub App**: Easy installation and token management

### 💾 Smart Caching
- **File hash-based**: Only re-analyze changed files
- **Fast re-scans**: Instant results for unchanged code
- **Cloudflare AI Gateway**: Efficient LLM request handling
- **Cost optimization**: Minimize API usage through intelligent caching

## Technology Stack

### Frontend (Cloudflare Pages)
- **React + TypeScript**: Modern web application
- **Tailwind CSS + shadcn/ui**: Beautiful, accessible components
- **Cloudflare Pages**: Serverless hosting with global CDN
- **GitHub OAuth**: Secure authentication

### Backend (Cloudflare Workers)
- **Cloudflare Workers**: Serverless edge compute
- **Cloudflare D1**: SQLite-compatible serverless database
- **Cloudflare AI Gateway**: LLM request routing and caching
- **KV Storage**: Fast key-value storage for sessions

### Integrations
- **GitHub API**: Repository access and webhooks
- **Claude API**: Code aesthetic analysis (via AI Gateway)
- **OpenAI API**: Alternative LLM option (via AI Gateway)

## Style Preference System

Users can configure preferences across multiple dimensions:

**Key Preference Categories:**
1. **Naming Conventions**: Variable/function/class naming styles
2. **Code Organization**: Import style, function length, class structure
3. **Comments & Documentation**: Verbosity, docstring format, inline comments
4. **Type Annotations**: Coverage level, modern syntax preferences
5. **Code Structure**: Line length, blank lines, bracket style
6. **Error Handling**: Exception style, logging verbosity
7. **Modern Practices**: Language-specific features and idioms

### Example Style Profile

```yaml
profile:
  name: "My Python Aesthetic"
  llm: "claude-sonnet-4"

preferences:
  naming:
    variables: "snake_case"
    functions: "verb_first"
  documentation:
    comment_style: "minimal"
    docstring_format: "concise"
  typing:
    coverage: "comprehensive"
    modern_syntax: true
  structure:
    line_length: 100

custom_rules:
  - "Avoid emojis unless explicitly needed"
  - "Prefer dataclasses over TypedDict"
  - "Properties instead of simple getters"
```

**Built-in profiles**: Minimal, PEP 8, Google Style, Type-Safe, Pragmatic, Strict

## Pricing Model

- **Public Repos**: Free forever
- **Private Repos**: Paid tiers based on usage
  - Starter: $9/mo (5 private repos)
  - Team: $29/mo (20 private repos)
  - Enterprise: Custom pricing

## Business Model (Like codecov)

1. **Freemium SaaS**: Free for open source, paid for private repos
2. **GitHub Integration**: Seamless setup via GitHub App
3. **Badge System**: Show your vibe score publicly
4. **API Access**: Programmatic access for CI/CD integration
5. **Team Features**: Shared aesthetic profiles, collaboration tools

## Current Status

This repository contains:
- Frontend prototype (React + Vite + Tailwind)
- Backend prototype (Express + SQLite)
- Initial architecture and design docs

**Next steps**: See [`ROADMAP.md`](./ROADMAP.md) for development timeline and [`ARCHITECTURE.md`](./ARCHITECTURE.md) for technical details.

## Development Setup

### Prerequisites
- Node.js 20+ and pnpm
- Modern browser with ES2022 support

### Installation

```bash
# Install dependencies
pnpm install
```

### Running the Development Environment

```bash
# Start both frontend and backend servers
pnpm run dev
```

This starts:
- **Frontend** on http://localhost:5173 (Vite + React + Tailwind CSS)
- **Backend** on http://localhost:3001 (Express + SQLite)

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for complete technical documentation.

## Contributing

See [`ROADMAP.md`](./ROADMAP.md) for planned features and how to contribute.

## License

MIT
