# VibeCov Roadmap

This document outlines the development phases for transforming VibeCov into a production SaaS platform.

## Current Status (Prototype)

We have:
- ✅ Basic frontend (React + Vite + Tailwind)
- ✅ Basic backend (Express + SQLite)
- ✅ Vision and design documentation
- ✅ Initial architecture

## Phase 1: Cloudflare Migration (Weeks 1-2)

**Goal**: Migrate from local Express/SQLite to Cloudflare's serverless platform

### Frontend
- [ ] Deploy React app to Cloudflare Pages
- [ ] Set up custom domain (vibecov.com)
- [ ] Configure GitHub OAuth for authentication
- [ ] Implement basic dashboard UI with shadcn/ui components

### Backend
- [ ] Create Cloudflare Workers for API endpoints
- [ ] Set up Cloudflare D1 database (SQLite-compatible)
- [ ] Implement KV storage for sessions
- [ ] Set up Cloudflare AI Gateway

### Infrastructure
- [ ] CI/CD pipeline for automated deployments
- [ ] Environment variable management
- [ ] Monitoring and error tracking setup

## Phase 2: Core Features (Weeks 3-5)

**Goal**: Build the minimum viable product

### GitHub Integration
- [ ] GitHub OAuth flow
- [ ] Repository selection and permissions
- [ ] GitHub App creation and installation
- [ ] Webhook setup for push events

### Aesthetic Configuration
- [ ] Style preference editor UI
- [ ] Built-in profile templates (PEP 8, Google, etc.)
- [ ] Custom rule creation (natural language)
- [ ] Profile save/load functionality

### Repository Analysis
- [ ] File discovery and filtering
- [ ] File hash computation
- [ ] LLM integration (Claude via AI Gateway)
- [ ] Analysis result storage (D1 database)
- [ ] Vibe score calculation algorithm

### Caching System
- [ ] File hash-based cache lookups
- [ ] Cache invalidation on file changes
- [ ] Cache hit/miss metrics

## Phase 3: Dashboard & Visualization (Weeks 6-7)

**Goal**: Create compelling user experience

### Repository Dashboard
- [ ] Overall vibe score display
- [ ] Trend charts (score over time)
- [ ] File ranking list (sorted by vibe score)
- [ ] Filter and search functionality

### File Analysis View
- [ ] Syntax-highlighted code display
- [ ] Line-by-line vibe annotations
- [ ] Suggestion cards with fixes
- [ ] Accept/dismiss suggestion actions

### Metrics & Analytics
- [ ] Repository health metrics
- [ ] Per-file vibe scores
- [ ] Historical trend tracking
- [ ] Team consistency metrics

## Phase 4: GitHub Integration Features (Weeks 8-9)

**Goal**: Seamless GitHub workflow integration

### Status Badges
- [ ] SVG badge generation
- [ ] Real-time vibe score updates
- [ ] Multiple badge styles/themes
- [ ] Markdown embed code generator

### PR Automation
- [ ] PR webhook handler
- [ ] Automated vibe check on PRs
- [ ] Comment posting with analysis
- [ ] Diff-based incremental analysis

### Status Checks
- [ ] GitHub status check API integration
- [ ] Configurable pass/fail thresholds
- [ ] Block merge option
- [ ] Detailed status check reports

## Phase 5: Monetization & Scaling (Weeks 10-12)

**Goal**: Launch paid tiers and handle growth

### Payment Integration
- [ ] Stripe integration
- [ ] Subscription plan creation (Starter, Team, Enterprise)
- [ ] Usage tracking and billing
- [ ] Free tier limitations (public repos only)

### Performance Optimization
- [ ] LLM request batching
- [ ] Parallel file analysis
- [ ] Edge caching strategies
- [ ] Rate limiting and quotas

### Admin & Analytics
- [ ] User dashboard (usage stats)
- [ ] Admin panel (user management)
- [ ] Revenue analytics
- [ ] System health monitoring

## Phase 6: Advanced Features (Months 4-6)

**Goal**: Differentiate from competitors

### Adaptive Learning (Future)
- [ ] Track user accept/dismiss decisions
- [ ] Pattern detection algorithm
- [ ] Automatic profile adjustments
- [ ] Confidence scoring

### Team Features
- [ ] Shared team profiles
- [ ] Team-wide analytics
- [ ] Collaborative aesthetic refinement
- [ ] Team member permissions

### API & Integrations
- [ ] Public API for programmatic access
- [ ] CLI tool for local development
- [ ] VS Code extension
- [ ] CI/CD integrations (GitHub Actions, GitLab CI)

### Multi-Language Support
- [ ] Python (initial)
- [ ] TypeScript/JavaScript
- [ ] Go
- [ ] Rust
- [ ] Java
- [ ] More languages based on demand

## Success Metrics

### Phase 1-2 (MVP Launch)
- [ ] 10 beta users signed up
- [ ] 5 repositories analyzed
- [ ] < 500ms average API response time
- [ ] 99% uptime

### Phase 3-4 (Public Launch)
- [ ] 100 active users
- [ ] 50 repositories with badges
- [ ] 10 paying customers
- [ ] NPS score > 40

### Phase 5-6 (Growth)
- [ ] 1,000 active users
- [ ] $1k MRR
- [ ] 80%+ cache hit rate
- [ ] < 2s average analysis time per file

## Open Questions & Decisions

### Technical
- [ ] Which LLM to use as default? (Claude vs GPT-4)
- [ ] How to handle extremely large repos? (sampling strategy)
- [ ] How granular should vibe scores be? (file-level, function-level, line-level)
- [ ] Should we offer self-hosted option?

### Business
- [ ] Pricing tiers - what limits make sense?
- [ ] Should we offer team trials?
- [ ] How to position vs existing tools (ESLint, Prettier)?
- [ ] Partnership opportunities with GitHub?

### Product
- [ ] Should we support GitLab/Bitbucket initially?
- [ ] Mobile app needed?
- [ ] Email notifications for vibe drops?
- [ ] Gamification elements (badges, leaderboards)?

## Contributing

We welcome contributions! Key areas:

1. **Frontend Development**: React, TypeScript, Tailwind CSS
2. **Backend Development**: Cloudflare Workers, D1, AI Gateway
3. **LLM Prompt Engineering**: Improving aesthetic analysis quality
4. **Documentation**: Guides, tutorials, examples
5. **Testing**: E2E tests, integration tests, load testing

See issues labeled `good-first-issue` to get started.

## Timeline Summary

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| 1: Cloudflare Migration | 2 weeks | Deployed to production |
| 2: Core Features | 3 weeks | MVP with basic analysis |
| 3: Dashboard & Viz | 2 weeks | Compelling user experience |
| 4: GitHub Integration | 2 weeks | Badges, PRs, status checks |
| 5: Monetization | 3 weeks | Payment processing, scaling |
| 6: Advanced Features | 3 months | Differentiated product |

**Total to public launch**: ~12 weeks (3 months)
**Total to feature-complete v1**: ~6 months
