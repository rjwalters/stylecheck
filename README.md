# StyleCheck - Code Aesthetics Engine

## Vision

**StyleCheck is a Code Aesthetics Engine** - a tool that lets developers define their personal style preferences and see which files in any repository don't comply. Think ESLint/Prettier powered by AI, but it understands context, works across any language, and handles subjective style preferences.

## Overview

StyleCheck scans an entire repository against user-configured style preferences and identifies which files need the most attention. Rather than analyzing files on-demand, it performs batch analysis of the entire codebase and presents a prioritized dashboard of files ranked by how much they deviate from your aesthetic preferences.

## Primary Use Case

**Problem**: Every developer has style preferences (comment verbosity, naming conventions, code organization), but enforcing them across a codebase is tedious.
**Solution**: Configure your style preferences once, point StyleCheck at any repo, and get a prioritized list of files that need attention to match your aesthetic.

**Workflow**:
1. Configure your style preferences (or load existing style guide)
2. Point StyleCheck at a repository
3. Scan all files (with smart filtering)
4. Analyze each file with Claude Code using your style preferences
5. Cache results for fast re-scanning
6. Present dashboard showing:
   - Files ranked by "aesthetic deviation" score
   - Which preferences are most violated
   - Drill-down into specific files
   - Track improvements over time

## Goals

1. **Configurable Aesthetics**: Let users define their own style preferences
2. **Universal Application**: Works with any repo, any language
3. **Intelligent Triage**: Show which files deviate most from preferences
4. **Smart Caching**: Store analysis results by file hash to avoid redundant processing
5. **Actionable Insights**: Clear prioritization and suggested fixes
6. **Progress Tracking**: Measure code quality improvements over time
7. **Shareable Profiles**: Export/import style preference profiles

## Style Preference System

### Preference Categories

Users can configure preferences in multiple categories:

#### 1. Naming Conventions
- Variable naming: `snake_case`, `camelCase`, `PascalCase`
- Function naming: prefer verbs vs nouns
- Class naming: prefer descriptive vs concise
- Constant naming: `UPPER_CASE` vs `lower_case`
- Private member prefix: `_private` vs `m_private` vs `private`

#### 2. Code Organization
- Import style: grouped by type vs alphabetical
- Function length: prefer short (<50 lines) vs medium (<100) vs flexible
- Class structure: fields first vs methods first
- File organization: one class per file vs multiple classes

#### 3. Comments & Documentation
- Comment verbosity: minimal vs moderate vs extensive
- Docstring style: concise vs detailed, with/without Args/Returns sections
- Inline comments: avoid vs encourage
- TODO format: `TODO:` vs `# TODO` vs `@todo`

#### 4. Type Annotations
- Type coverage: minimal vs moderate vs comprehensive
- Return type annotations: always vs selective vs none
- Variable annotations: always vs when needed vs avoid
- Modern syntax: `list[str]` vs `List[str]`, `|` vs `Union`

#### 5. Code Structure
- Line length: 80 vs 100 vs 120 characters
- Blank lines: conservative vs liberal
- Bracket style: K&R vs Allman vs one-line
- Import organization: multiple imports per line vs one per line

#### 6. Error Handling
- Exception handling: explicit vs implicit
- Error messages: verbose vs concise
- Validation: defensive vs optimistic
- Logging: extensive vs minimal

#### 7. Modern Practices
- Type hints: enforce vs suggest vs ignore
- F-strings: prefer vs allow all
- Walrus operator: encourage vs avoid
- Match statements: prefer vs traditional if/else

### Style Profile Format

```yaml
# My Personal Style Profile
profile:
  name: "My Python Style"
  version: "1.0"
  author: "Your Name"
  languages: ["python"]

preferences:
  naming:
    variables: "snake_case"
    functions: "verb_first"  # prefer get_user() over user()
    classes: "descriptive"   # prefer UserAuthenticator over Auth
    private_prefix: "_"

  organization:
    imports_grouped: true
    max_function_length: 50
    class_structure: "methods_first"

  documentation:
    comment_style: "minimal"  # avoid obvious comments
    docstring_format: "concise"  # no Args:/Returns: sections
    inline_comments: "rare"

  typing:
    coverage: "selective"  # parameters always, returns selective
    modern_syntax: true    # list[str] not List[str]
    return_annotations: "complex_only"

  structure:
    line_length: 100
    blank_lines: "conservative"
    imports_per_line: "one"

  practices:
    prefer_f_strings: true
    allow_walrus: true
    prefer_match: false  # stick with if/else for now

# Custom rules (natural language)
custom_rules:
  - "Avoid emojis in code unless explicitly requested"
  - "Properties should be used instead of simple getter methods"
  - "Private members should start with underscore"
  - "Test files can access private members"
  - "Prefer dataclasses over TypedDict for complex structures"

# Reference style guide (optional)
reference_guide:
  path: "/path/to/STYLE_GUIDE.md"
  weight: 0.8  # How much to prioritize guide vs preferences
```

### Built-in Profiles

Ship with common profiles users can start from:

- **Minimal**: Very lean, few opinions, focuses on critical issues only
- **PEP 8 Compliant**: Standard Python style guide
- **Google Style**: Google's Python style guide
- **Type-Safe**: Heavy emphasis on type annotations
- **Pragmatic**: Balanced, focuses on readability
- **Strict**: Very opinionated, catches everything

Users can load a built-in profile and customize from there.

### Profile Management UI

```
┌─────────────────────────────────────────────────────┐
│ Style Preferences                                   │
├─────────────────────────────────────────────────────┤
│ Profile: My Python Style          [Edit] [Export]  │
│ 🧠 Learning Mode: ENABLED (342 decisions tracked)  │
│                                                     │
│ Naming Conventions                           🟢     │
│   Variables: snake_case                             │
│   Functions: verb_first                             │
│   Classes: descriptive                              │
│                                                     │
│ Documentation                                🟡     │
│   Comments: minimal                                 │
│   Docstrings: concise                              │
│                                                     │
│ Type Annotations                             🟢     │
│   Coverage: selective                               │
│   Modern syntax: enabled                            │
│                                                     │
│ [+ Add Custom Rule]                                 │
│                                                     │
│ Reference Guide:                                    │
│ 📄 STYLE_GUIDE.md                    [Browse]       │
│                                                     │
│ [Load Profile ▼] [Save As...] [Reset to Default]   │
└─────────────────────────────────────────────────────┘
```

### Adaptive Aesthetic Learning

**Concept**: The system learns your coding aesthetics over time by tracking which suggestions you accept vs dismiss.

#### How It Works

1. **Initial Profile**: User starts with a base profile (custom or built-in)

2. **Track Decisions**: Every time user accepts or dismisses a suggestion, record:
   ```typescript
   {
     suggestionId: "abc123",
     fileHash: "def456",
     category: "documentation",
     ruleViolated: "docstring_format",
     originalCode: "def foo():\n    return 1",
     suggestedCode: "def foo():\n    \"\"\"Returns 1.\"\"\"\n    return 1",
     userAction: "accepted" | "dismissed" | "modified",
     timestamp: "2025-01-20T10:30:00Z"
   }
   ```

3. **Pattern Detection**: Analyze decisions to find patterns:
   - User accepts 90% of "add type hints" suggestions → Increase type coverage preference
   - User dismisses 80% of "add docstring" suggestions → Decrease documentation verbosity
   - User accepts short docstrings but dismisses verbose ones → Prefer concise style

4. **Profile Adjustment**: Automatically suggest profile updates:
   ```
   ┌─────────────────────────────────────────────────────┐
   │ 🧠 Aesthetic Insights Detected                      │
   ├─────────────────────────────────────────────────────┤
   │ Based on 50 recent decisions, we noticed:          │
   │                                                     │
   │ • You consistently accept type hint additions      │
   │   Suggestion: Increase "typing.coverage" to        │
   │   "comprehensive"                     [Apply]      │
   │                                                     │
   │ • You often dismiss verbose docstrings             │
   │   Suggestion: Change "documentation.style" to      │
   │   "minimal"                          [Apply]      │
   │                                                     │
   │ • You prefer f-strings over .format()              │
   │   Suggestion: Enable "practices.prefer_f_strings"  │
   │                                      [Apply]      │
   │                                                     │
   │ [Apply All] [Dismiss All] [Review Decisions]       │
   └─────────────────────────────────────────────────────┘
   ```

5. **Confidence Levels**: Track confidence in each preference:
   ```yaml
   preferences:
     typing:
       coverage: "comprehensive"
       confidence: 0.95  # High confidence (many consistent decisions)

     documentation:
       style: "minimal"
       confidence: 0.65  # Medium confidence (mixed signals)
   ```

#### Learning Algorithm

```typescript
function analyzeUserPreferences(decisions: Decision[], currentProfile: Profile): Insights {
  const insights: Insights = [];

  // Group decisions by category
  const byCategory = groupBy(decisions, 'category');

  for (const [category, categoryDecisions] of Object.entries(byCategory)) {
    // Group by rule within category
    const byRule = groupBy(categoryDecisions, 'ruleViolated');

    for (const [rule, ruleDecisions] of Object.entries(byRule)) {
      // Calculate acceptance rate
      const accepted = ruleDecisions.filter(d => d.userAction === 'accepted').length;
      const total = ruleDecisions.length;
      const acceptanceRate = accepted / total;

      // Minimum sample size before making suggestions
      if (total < 10) continue;

      // High acceptance rate → User wants this rule enforced more
      if (acceptanceRate > 0.8 && currentProfile[category][rule] !== 'strict') {
        insights.push({
          type: 'increase_strictness',
          category,
          rule,
          currentValue: currentProfile[category][rule],
          suggestedValue: getStricterOption(currentProfile[category][rule]),
          confidence: acceptanceRate,
          sampleSize: total
        });
      }

      // Low acceptance rate → User doesn't want this rule
      if (acceptanceRate < 0.2 && currentProfile[category][rule] !== 'lenient') {
        insights.push({
          type: 'decrease_strictness',
          category,
          rule,
          currentValue: currentProfile[category][rule],
          suggestedValue: getLenientOption(currentProfile[category][rule]),
          confidence: 1 - acceptanceRate,
          sampleSize: total
        });
      }
    }
  }

  return insights;
}
```

#### Decision History UI

```
┌─────────────────────────────────────────────────────┐
│ Decision History                                    │
├─────────────────────────────────────────────────────┤
│ Showing 342 decisions                              │
│                                                     │
│ Filter: [All] [Accepted] [Dismissed] [Modified]   │
│ Category: [All ▼]                                  │
│                                                     │
│ ✅ src/trainer.py:45 - Add type hint              │
│    Accepted • 2 hours ago                          │
│    Category: Type Annotations                       │
│                                                     │
│ ❌ tests/test_foo.py:12 - Add docstring           │
│    Dismissed • 3 hours ago                         │
│    Category: Documentation                          │
│    Reason: "Test functions don't need docstrings"  │
│                                                     │
│ ✏️ src/utils.py:78 - Simplify logic               │
│    Modified • 1 day ago                            │
│    Category: Code Structure                         │
│    Note: "Used different approach"                 │
│                                                     │
│ [Export History] [Clear History] [Analyze Trends] │
└─────────────────────────────────────────────────────┘
```

#### Privacy & Control

- **Opt-in Feature**: Learning mode is optional, users can disable it
- **Local Only**: All decision data stored locally, never sent anywhere
- **Transparent**: Users can review all tracked decisions
- **Reversible**: Can reset learning data and start fresh
- **Manual Override**: Suggested profile changes require explicit approval

#### Use Cases

1. **New Developer Onboarding**:
   - Start with team's base profile
   - System learns personal preferences over time
   - Gradually customizes to individual style while respecting team standards

2. **Profile Refinement**:
   - Start with "I think I like minimal comments"
   - System tracks actual behavior
   - Discovers "Actually, you like comments for complex logic but not simple code"

3. **Consistency Enforcement**:
   - Developer accepts certain style choices
   - System remembers and flags similar issues in future
   - Builds muscle memory for consistency

4. **Preference Discovery**:
   - "I never thought about my bracket style preference"
   - System notices pattern in your acceptances
   - "You consistently prefer K&R style brackets"

#### Future Enhancements

- **Collaborative Learning**: Team can share decision patterns to build consensus profile
- **Context Awareness**: Learn that preferences differ by file type (tests vs core)
- **Trend Analysis**: Visualize how preferences evolve over time
- **A/B Comparison**: "Your style vs PEP 8 vs Google Style - here's how you differ"

## Deployment Strategy

### Option 1: Standalone Package in `/packages/stylecheck`
**Pros**:
- Integrated with metta monorepo tooling
- Can reference metta's STYLE_GUIDE.md directly
- Uses existing CI/CD infrastructure
- Easy to dogfood on metta itself

**Cons**:
- Coupled to metta repo structure
- Harder to use with other repos
- Less portable

### Option 2: Separate Repository (Recommended)
**Pros**:
- Works with any repository (most flexible)
- Can be distributed/shared easily
- Clean separation of concerns
- Independent versioning and releases
- Can be open-sourced
- Better for portfolio/showcase

**Cons**:
- Need separate CI/CD setup
- Can't reference metta files directly

### Hybrid Approach (Best of Both)
- Develop as **standalone tool in separate repo**
- **Configure** it to work with metta repo
- Takes repo path + style guide path as config
- Can be used for metta or any other project

**Configuration Example**:
```json
{
  "repoPath": "/Users/me/metta",
  "styleGuidePath": "/Users/me/metta/STYLE_GUIDE.md",
  "filePatterns": ["**/*.py"],
  "excludePatterns": ["**/node_modules/**", "**/.venv/**"],
  "reviewType": "style"
}
```

**Recommendation**: Build as separate repo, make metta the first "customer"

## Technology Stack

### Frontend
- **Vite**: Fast build tool and dev server
- **React**: UI framework
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality, accessible component library
- **TanStack Query**: Data fetching and caching layer

### Backend/Data
- **SQLite**: Local database for caching analysis results
- **Node.js Backend**: API server for file operations and Claude Code integration
- **File System API**: Read repository files and compute hashes

### Integration
- **Claude Code**: Analysis engine (via API or CLI)
- **Git**: Repository awareness and file tracking

## Architecture

### High-Level Flow

```
User Opens File
    ↓
Compute File Hash (SHA-256)
    ↓
Check Cache (SQLite)
    ↓
    ├─ Cache Hit → Display Cached Results
    │
    └─ Cache Miss → Show Spinner
                    ↓
                    Process with Claude Code
                    ↓
                    Store Results in Cache
                    ↓
                    Display Results
```

## Prioritization Algorithm

### Attention Score Calculation

Each file gets an "attention score" based on:

```typescript
attentionScore =
  (blockingIssues * 100) +
  (majorIssues * 10) +
  (minorIssues * 2) +
  (nitpicks * 0.5)
```

**Why this weighting?**
- Blocking issues (100pts): Must be fixed, critical problems
- Major issues (10pts): Significant style violations
- Minor issues (2pts): Should be fixed but not urgent
- Nitpicks (0.5pts): Nice to have

**Additional Factors**:
- File size: Larger files might get slight boost (more impact when fixed)
- Change frequency: Recently modified files score higher (active development)
- File type priority: Core source files > tests > docs

### Ranking Display

Files sorted by attention score (highest first):

```
┌─────────────────────────────────────────────────────┐
│ Files Needing Attention (327 total)                │
├─────────────────────────────────────────────────────┤
│ 🔴 src/trainer.py                     Score: 145   │
│    5 blocking, 2 major, 3 minor                    │
│                                                     │
│ 🟠 src/agent.py                       Score: 87    │
│    0 blocking, 7 major, 5 minor                    │
│                                                     │
│ 🟡 tests/test_trainer.py              Score: 24    │
│    0 blocking, 1 major, 7 minor                    │
└─────────────────────────────────────────────────────┘
```

### Repo Health Metrics

- **Total Files Analyzed**: 327
- **Files with Issues**: 89 (27%)
- **Total Issues**: 452 (123 major, 329 minor/nitpick)
- **Average Issues per File**: 1.4
- **Highest Attention Score**: 145 (src/trainer.py)
- **Cache Hit Rate**: 82%

### Components

#### 1. Dashboard (Primary View)
- **Summary Cards**
  - Total files analyzed
  - Files with issues
  - Issues by severity
  - Overall health score (0-100)

- **Prioritized File List**
  - Sorted by attention score
  - Severity indicators (🔴🟠🟡🟢)
  - Quick stats per file
  - Click to drill down

- **Filters/Search**
  - Filter by severity threshold
  - Filter by file type (.py, .ts, etc.)
  - Search by file name or path
  - Filter by issue type

- **Batch Actions**
  - "Fix All Nitpicks" button
  - "Re-scan Changed Files"
  - "Export Report"

#### 2. File Browser (Secondary View)
- Tree view of repository structure
- Color-coded by attention score
- Search functionality
- Git status indicators

#### 3. File Detail View
- Syntax-highlighted code display
- Line numbers
- Inline annotations for issues
- Split view: code on left, analysis on right

#### 3. Analysis Display
- **Summary Panel**: Overview of findings
  - Issue count by severity (blocking, major, minor, nitpick)
  - Overall quality score
  - Key recommendations

- **Issue List**: Expandable list of findings
  - File location (line range)
  - Severity badge
  - Issue description
  - Suggested fix (with diff preview)
  - Quick actions (accept, dismiss, copy)

- **Code Diff Viewer**: Side-by-side comparison
  - Original code vs suggested code
  - Inline highlighting of changes

#### 4. Analysis Engine
- Queue management for processing files
- Progress tracking
- Retry logic for failures
- Configurable review types (style, types, comments, etc.)

#### 5. Cache Management
- Database schema for storing results
- Cache invalidation strategies
- Storage statistics and cleanup tools

## Database Schema

```sql
-- Analysis results cache
CREATE TABLE analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_hash TEXT NOT NULL UNIQUE,
    file_path TEXT NOT NULL,
    review_type TEXT NOT NULL, -- 'style', 'types', 'comments', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Analysis results (JSON)
    review_summary TEXT,
    review_status TEXT, -- 'COMMENT', 'CHANGES_REQUESTED'
    suggestions TEXT, -- JSON array of suggestions
    tldr TEXT, -- JSON array of summary points

    -- Metadata
    claude_model TEXT,
    analysis_duration_ms INTEGER,
    file_size_bytes INTEGER
);

CREATE INDEX idx_file_hash ON analyses(file_hash);
CREATE INDEX idx_file_path ON analyses(file_path);
CREATE INDEX idx_review_type ON analyses(review_type);
CREATE INDEX idx_created_at ON analyses(created_at);

-- File tracking (for cache invalidation)
CREATE TABLE file_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL UNIQUE,
    last_hash TEXT NOT NULL,
    last_modified TIMESTAMP,
    size_bytes INTEGER,
    git_status TEXT -- 'modified', 'untracked', 'clean', etc.
);

CREATE INDEX idx_file_metadata_path ON file_metadata(file_path);

-- Analysis queue
CREATE TABLE analysis_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    review_type TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0
);

CREATE INDEX idx_queue_status ON analysis_queue(status);
CREATE INDEX idx_queue_priority ON analysis_queue(priority DESC);

-- User preferences
CREATE TABLE preferences (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
```

## Analysis Process

### Review Types
Following the existing GitHub workflow patterns:

1. **Style Review** (`style`)
   - Check against STYLE_GUIDE.md
   - Focus on readability and maintainability
   - Severity: minor, major, blocking, nitpick

2. **Type Review** (`types`)
   - Check type annotations
   - Verify type consistency
   - Modern Python typing practices

3. **Comment Review** (`comments`)
   - Documentation quality
   - Docstring completeness
   - Comment clarity

4. **General Review** (`general`)
   - Overall code quality
   - Best practices
   - Potential bugs

### Claude Code Integration

Similar to `.github/workflows/claude-review-style.yml`:

```json
{
  "review_name": "Code Style",
  "review_type": "style",
  "file_pattern": "\\.py$",
  "model": "claude-sonnet-4-20250514",
  "tools": ["Edit", "Replace", "Read"],
  "prompt": "Review the Python file for code style violations..."
}
```

### Processing Pipeline

1. **File Selection**: User clicks on file in tree view
2. **Hash Computation**: Calculate SHA-256 of file content
3. **Cache Lookup**: Query `analyses` table by `file_hash` and `review_type`
4. **Cache Hit Path**:
   - Retrieve results from database
   - Parse JSON suggestions
   - Render analysis display
   - Update UI (instant)

5. **Cache Miss Path**:
   - Show loading spinner
   - Add to analysis queue
   - Execute Claude Code with appropriate prompt
   - Parse JSON response
   - Store in database
   - Render analysis display
   - Update UI

### Error Handling

- **File Read Errors**: Show error message, allow retry
- **Analysis Failures**: Capture error, store in queue table, allow manual retry
- **Timeout Handling**: Configurable timeout (default: 2 minutes)
- **Rate Limiting**: Respect Claude API rate limits
- **Partial Results**: If analysis partially succeeds, store what's available

## User Interface Design

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header: StyleCheck Browser | Current Repo | Settings    │
├───────────────┬─────────────────────────────────────────┤
│               │                                         │
│  File Tree    │  File Viewer                           │
│               │  ┌──────────────────────────────────┐  │
│  📁 src/      │  │ filename.py                      │  │
│  📁 tests/    │  │ Line numbers | Code              │  │
│  📁 docs/     │  │                                   │  │
│  📄 README.md │  │ 1  def example():                │  │
│               │  │ 2      # comment                 │  │
│               │  │ 3      return True      ⚠️       │  │
│               │  └──────────────────────────────────┘  │
│               │                                         │
│               │  Analysis Results                       │
│               │  ┌──────────────────────────────────┐  │
│               │  │ ✓ No blocking issues             │  │
│               │  │ ⚠️ 2 major issues                 │  │
│               │  │ ℹ️ 3 minor suggestions            │  │
│               │  │                                   │  │
│               │  │ Issue 1: Line 3                  │  │
│               │  │ [major] Remove redundant return  │  │
│               │  │ [Show diff] [Accept] [Dismiss]   │  │
│               │  └──────────────────────────────────┘  │
│               │                                         │
├───────────────┴─────────────────────────────────────────┤
│ Status Bar: 15 files cached | Last analysis: 2s ago   │
└─────────────────────────────────────────────────────────┘
```

### Key Interactions

1. **File Selection**: Click file → Show loading or cached results
2. **Issue Navigation**: Click issue → Scroll to code location, highlight
3. **Diff Preview**: Click "Show diff" → Modal with side-by-side comparison
4. **Accept Suggestion**: Apply suggested code change to file
5. **Batch Processing**: Select multiple files → Queue for analysis
6. **Filter/Search**: Filter by severity, search by keyword
7. **Refresh Analysis**: Force re-analysis (invalidate cache)

## API Endpoints

### Backend API (Node.js/Express)

```typescript
// File operations
GET  /api/files/tree              // Get file tree
GET  /api/files/content/:path     // Get file content
GET  /api/files/hash/:path        // Get file hash

// Analysis operations
GET  /api/analysis/:hash/:type    // Get cached analysis
POST /api/analysis/queue          // Queue file for analysis
GET  /api/analysis/status/:id     // Get queue status
POST /api/analysis/cancel/:id     // Cancel queued analysis

// Cache operations
GET  /api/cache/stats             // Get cache statistics
POST /api/cache/clear             // Clear cache (all or filtered)
GET  /api/cache/list              // List cached analyses

// Repository operations
GET  /api/repo/info               // Get repo metadata
GET  /api/repo/files/changed      // Get changed files (git status)

// Configuration
GET  /api/config                  // Get user preferences
PUT  /api/config                  // Update user preferences
```

## Configuration

### User Preferences

```json
{
  "defaultReviewType": "style",
  "autoAnalyzeOnOpen": true,
  "showLineNumbers": true,
  "theme": "dark",
  "cacheExpirationDays": 30,
  "maxConcurrentAnalyses": 3,
  "claudeModel": "claude-sonnet-4-20250514",
  "excludePatterns": [
    "**/*.min.js",
    "**/node_modules/**",
    "**/.venv/**"
  ]
}
```

### Review Type Configurations

Store in `tools/stylecheck/reviews/` directory:

- `style.json`
- `types.json`
- `comments.json`
- `general.json`

Each config includes:
- Review name
- File patterns (regex)
- Claude prompt template
- Allowed tools
- Severity thresholds

## Development Phases

### Phase 1: Core Infrastructure (MVP)
- [ ] SQLite database setup
- [ ] File system crawler
- [ ] Basic file tree UI
- [ ] File hash computation
- [ ] Cache hit/miss logic

### Phase 2: Analysis Integration
- [ ] Claude Code integration
- [ ] Analysis queue system
- [ ] JSON response parsing
- [ ] Result storage

### Phase 3: UI Enhancement
- [ ] File viewer with syntax highlighting
- [ ] Analysis result display
- [ ] Issue navigation
- [ ] Diff viewer

### Phase 4: Advanced Features
- [ ] Batch processing
- [ ] Filter and search
- [ ] Statistics dashboard
- [ ] Cache management UI
- [ ] Configuration panel

### Phase 5: Polish
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Documentation
- [ ] Testing

## Open Questions

1. **Claude Code Integration Method**:
   - Use Claude API directly?
   - Spawn Claude Code CLI as subprocess?
   - Hybrid approach?

2. **Concurrency**:
   - How many concurrent analyses should we allow?
   - Queue priority algorithm?

3. **Cache Invalidation**:
   - Time-based expiration?
   - LRU eviction?
   - Manual invalidation only?

4. **File Change Detection**:
   - Watch file system for changes?
   - Poll git status periodically?
   - Manual refresh only?

5. **Multi-Repository Support**:
   - Single repo per instance?
   - Multiple repos in one interface?
   - Workspace concept?

6. **Suggestion Application**:
   - Apply changes directly to files?
   - Generate patches for review?
   - Copy to clipboard only?

7. **Collaboration**:
   - Share analysis results with team?
   - Export reports?
   - Integration with PR review process?

## Success Metrics

- **Speed**: Cache hit ratio > 80% after initial usage
- **Accuracy**: Analysis results align with manual review
- **Usability**: Average time to find and fix issue < 30 seconds
- **Coverage**: Ability to analyze 90%+ of repository files
- **Performance**: UI remains responsive during background analysis

## Future Enhancements

- Real-time collaboration (share analyses with team)
- Historical analysis tracking (see how code quality evolves)
- Custom review rules (user-defined checks)
- Integration with IDE plugins (VS Code extension)
- CI/CD integration (automated batch analysis)
- Comparative analysis (before/after metrics)
- Machine learning for issue prioritization
- Export reports (PDF, markdown, HTML)
