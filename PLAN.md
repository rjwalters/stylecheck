# StyleCheck - Code Aesthetics Engine Development Plan

## Vision

Build a tool that helps developers discover and enforce their personal coding aesthetics through AI-powered analysis and adaptive learning.

## Development Philosophy

**Profile-First**: Style preferences drive everything.
**Iterative & Incremental**: Build working features in phases, each phase delivers usable value.
**Learning-Oriented**: System should get smarter about user preferences over time.
**Local-First**: Everything runs locally, leverages Claude Code CLI (no direct API costs).
**Repo-Agnostic**: Works with any repository, any language.

---

## Phase 1: Profile Configuration & Basic Infrastructure (Week 1)

### Goal
Set up project foundation and create a style profile configuration system.

### Features
- [ ] **Project Setup**
  - [ ] Basic Vite + React + TypeScript setup
  - [ ] Tailwind CSS + shadcn/ui configuration
  - [ ] Backend API setup (Node.js + Express)
  - [ ] SQLite database initialization

- [ ] **Style Profile System**
  - [ ] Define profile schema (YAML/JSON format)
  - [ ] Create built-in profiles (Minimal, PEP 8, Google, Pragmatic, Strict)
  - [ ] Profile storage in database
  - [ ] Profile CRUD API endpoints
    - [ ] GET `/api/profiles` - List all profiles
    - [ ] GET `/api/profiles/:id` - Get profile details
    - [ ] POST `/api/profiles` - Create new profile
    - [ ] PUT `/api/profiles/:id` - Update profile
    - [ ] DELETE `/api/profiles/:id` - Delete profile

- [ ] **Profile Management UI**
  - [ ] Profile selector dropdown
  - [ ] Profile editor form with categories:
    - [ ] Naming conventions
    - [ ] Code organization
    - [ ] Comments & documentation
    - [ ] Type annotations
    - [ ] Code structure
    - [ ] Error handling
    - [ ] Modern practices
  - [ ] Custom rules text area (natural language)
  - [ ] Reference guide file picker
  - [ ] Save/Load/Export functionality

- [ ] **Repository Configuration**
  - [ ] Repo path selector
  - [ ] File pattern filters (include/exclude)
  - [ ] Config storage

### Database Schema

```sql
CREATE TABLE profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    author TEXT,
    languages TEXT, -- JSON array
    preferences TEXT, -- JSON object with all preferences
    custom_rules TEXT, -- JSON array
    reference_guide_path TEXT,
    is_builtin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE repo_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repo_path TEXT NOT NULL UNIQUE,
    active_profile_id INTEGER,
    file_patterns TEXT, -- JSON array of include patterns
    exclude_patterns TEXT, -- JSON array of exclude patterns
    last_scan_at TIMESTAMP,
    FOREIGN KEY (active_profile_id) REFERENCES profiles(id)
);
```

### Deliverable
A working profile management system where users can:
1. Load a built-in profile
2. Customize preferences
3. Save custom profile
4. Configure a repository path

---

## Phase 2: Claude Review Integration - Simple Display (Week 2)

### Goal
Show Claude Code review results in a separate pane next to the file.

### Features
- [ ] Backend: Claude Code integration
  - [ ] POST `/api/analysis/run` - Execute Claude review on file
  - [ ] **DECISION (Issue #7)**: Use Claude Code CLI subprocess (leverages monthly billing plan)
  - [ ] Spawn Claude Code CLI, capture stdout/stderr, parse JSON output
- [ ] UI: Review Results Pane (right side or bottom)
  - [ ] Summary card (issue count by severity)
  - [ ] List of suggestions
    - [ ] Severity badge
    - [ ] File location (line range)
    - [ ] Issue description
    - [ ] Original code block
    - [ ] Suggested code block
  - [ ] Click suggestion → Scroll file viewer to that line
- [ ] Loading states
  - [ ] Show spinner while analyzing
  - [ ] Progress indicator
- [ ] Basic error handling
  - [ ] Show error messages
  - [ ] Retry button

### Layout

```
┌─────────────────────────────────────────────────┐
│ Header                                          │
├──────────┬──────────────────┬───────────────────┤
│          │                  │                   │
│  File    │  File Viewer     │  Review Results   │
│  Tree    │  (syntax         │                   │
│          │   highlighted)   │  Summary:         │
│          │                  │  ⚠️ 2 issues      │
│          │  1  def foo():   │                   │
│          │  2    pass       │  Issue 1:         │
│          │  3    return x   │  Line 3           │
│          │                  │  [major] ...      │
│          │                  │                   │
│          │                  │  Original:        │
│          │                  │  return x         │
│          │                  │                   │
│          │                  │  Suggested:       │
│          │                  │  return str(x)    │
└──────────┴──────────────────┴───────────────────┘
```

### Deliverable
Click a file → Review button → See analysis results in side panel.

---

## Phase 3: Monaco Editor with Inline Diff Annotations (Week 3)

### Goal
Replace basic syntax highlighter with Monaco Editor and show inline diff markers.

### Why Monaco?
- **Industry Standard**: Powers VS Code
- **Built-in Features**: Syntax highlighting, line numbers, minimap, search
- **Diff Editor**: Built-in side-by-side and inline diff views
- **Annotations**: Can add custom decorations/markers inline
- **Language Support**: Excellent TypeScript, Python, JavaScript support

### Features
- [ ] Replace `prism-react-renderer` with Monaco Editor
  - [ ] Use `@monaco-editor/react`
  - [ ] Configure for read-only viewing
  - [ ] Match theme to rest of app
- [ ] Inline annotations for issues
  - [ ] Add line decorations (warning/error squiggles)
  - [ ] Hover tooltips showing issue description
  - [ ] Gutter icons for severity levels
  - [ ] Click marker → Show detailed suggestion in panel
- [ ] Diff view integration
  - [ ] Button to toggle between "View" and "Diff" modes
  - [ ] In Diff mode: Show original vs suggested side-by-side
  - [ ] Use Monaco's built-in `DiffEditor` component

### Monaco Editor Features to Use

1. **Decorations API**: Add inline markers
```typescript
editor.deltaDecorations([], [
  {
    range: new monaco.Range(3, 1, 3, 10),
    options: {
      isWholeLine: true,
      className: 'code-issue-line',
      glyphMarginClassName: 'code-issue-glyph',
      hoverMessage: { value: 'Major: Remove redundant return' }
    }
  }
]);
```

2. **Diff Editor**: Side-by-side comparison
```typescript
<DiffEditor
  original={originalCode}
  modified={suggestedCode}
  language="python"
  theme="vs-dark"
/>
```

3. **Markers API**: Error/warning indicators
```typescript
monaco.editor.setModelMarkers(model, 'claude-review', [
  {
    startLineNumber: 3,
    startColumn: 1,
    endLineNumber: 3,
    endColumn: 10,
    message: 'Major: Remove redundant return',
    severity: monaco.MarkerSeverity.Warning
  }
]);
```

### Layout Evolution

```
┌─────────────────────────────────────────────────┐
│ Header                        [View|Diff] Toggle│
├──────────┬──────────────────────────────────────┤
│          │                                      │
│  File    │  Monaco Editor                       │
│  Tree    │  ┌────────────────────────────────┐ │
│          │  │ 1  def foo():                 │ │
│          │  │ 2    pass                     │ │
│          │  │ 3 ⚠️ return x  ← inline marker│ │
│          │  │      ^^^^^^^^^^^^              │ │
│          │  └────────────────────────────────┘ │
│          │                                      │
│          │  Issue Panel (collapsible)           │
│          │  ⚠️ Line 3: Remove redundant return   │
│          │  [Show Diff] [Accept] [Dismiss]      │
└──────────┴──────────────────────────────────────┘
```

### Deliverable
Monaco-powered editor with inline issue markers and hover tooltips. Toggle to diff view for detailed comparisons.

---

## Phase 4: Caching Layer (Week 4)

### Goal
Add SQLite caching so repeated views of the same file are instant.

### Features
- [ ] SQLite database setup
  - [ ] Create `analyses` table
  - [ ] Create `file_metadata` table
- [ ] File hash computation (SHA-256)
  - [ ] Backend: GET `/api/files/hash/:path`
- [ ] Cache lookup logic
  - [ ] Check cache before running analysis
  - [ ] Return cached results if hash matches
- [ ] Cache storage
  - [ ] Store analysis results after successful run
  - [ ] Associate with file hash + review type
- [ ] UI indicators
  - [ ] Badge showing "Cached" vs "Fresh" results
  - [ ] Cache timestamp
  - [ ] Button to force refresh

### Database Schema (Simplified for MVP)

```sql
CREATE TABLE analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_hash TEXT NOT NULL,
    file_path TEXT NOT NULL,
    review_type TEXT DEFAULT 'style',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- JSON fields
    review_summary TEXT,
    suggestions TEXT, -- JSON array

    -- Metadata
    claude_model TEXT,
    analysis_duration_ms INTEGER
);

CREATE UNIQUE INDEX idx_hash_type ON analyses(file_hash, review_type);
```

### User Experience
1. Open file (never seen before) → Analyze → Show results → Cache
2. Open same file again → Instant results from cache
3. File changes → Hash changes → Cache miss → Re-analyze

### Deliverable
Fast, cached analysis results. Second view of any file is instant.

---

## Phase 5: Analysis Queue & Batch Processing (Week 5)

### Goal
Allow users to queue multiple files for analysis and process them in the background.

### Features
- [ ] Analysis queue table
  - [ ] Track pending, processing, completed, failed
- [ ] Batch selection UI
  - [ ] Checkbox next to each file
  - [ ] "Analyze Selected" button
  - [ ] Bulk operations toolbar
- [ ] Queue processor
  - [ ] Process N files concurrently (configurable, default: 3)
  - [ ] Retry logic for failures
  - [ ] Progress tracking
- [ ] Queue status UI
  - [ ] Show processing status for each file
  - [ ] Overall progress bar
  - [ ] Cancel/pause queue
- [ ] Background processing
  - [ ] Continue processing while browsing other files
  - [ ] Notification when batch completes

### Deliverable
Select 10 files → Click "Analyze All" → Watch progress → All cached for instant viewing.

---

## Phase 6: Advanced Features & Polish (Week 6+)

### Features to Add
- [ ] **Multi-Review Types**
  - [ ] Style, Types, Comments, General
  - [ ] Dropdown to select review type
  - [ ] Store separate cache entries per type

- [ ] **Statistics Dashboard**
  - [ ] Total files analyzed
  - [ ] Cache hit rate
  - [ ] Issues by severity
  - [ ] Most problematic files

- [ ] **Filter & Search**
  - [ ] Filter files by extension
  - [ ] Search file names
  - [ ] Filter by analysis status (cached, not analyzed, errors)

- [ ] **Cache Management**
  - [ ] View cache statistics
  - [ ] Clear old entries
  - [ ] Export/import cache

- [ ] **Suggestion Actions**
  - [ ] Apply suggestion to file (write changes)
  - [ ] Copy suggested code to clipboard
  - [ ] Dismiss/ignore suggestion
  - [ ] Undo applied changes

- [ ] **Git Integration**
  - [ ] Show git status in file tree
  - [ ] Filter by changed files only
  - [ ] Analyze only uncommitted changes

---

## Technology Stack - Final Recommendations

### Frontend
```json
{
  "core": {
    "framework": "React 18",
    "language": "TypeScript",
    "build": "Vite",
    "styling": "Tailwind CSS",
    "components": "shadcn/ui"
  },
  "libraries": {
    "editor": "@monaco-editor/react",
    "fileTree": "react-arborist (or custom)",
    "icons": "lucide-react",
    "dataFetching": "@tanstack/react-query",
    "routing": "react-router-dom",
    "state": "zustand (lightweight) or React Context"
  }
}
```

### Backend
```json
{
  "runtime": "Node.js 20+",
  "framework": "Express",
  "database": "better-sqlite3",
  "claudeIntegration": "Claude Code CLI (subprocess)",
  "fileWatching": "chokidar",
  "hashing": "crypto (built-in)"
}
```

### Development Tools
```json
{
  "typescript": "5.x",
  "linting": "ESLint",
  "formatting": "Prettier",
  "testing": "Vitest + React Testing Library"
}
```

---

## File Structure

```
tools/stylecheck/
├── DESIGN.md              # This design document
├── PLAN.md                # This development plan
├── README.md              # Setup and usage instructions
│
├── frontend/              # React app
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── FileTree.tsx
│   │   │   ├── FileViewer.tsx
│   │   │   ├── ReviewPanel.tsx
│   │   │   ├── DiffViewer.tsx
│   │   │   ├── AnalysisQueue.tsx
│   │   │   └── ui/         # shadcn components
│   │   ├── hooks/
│   │   │   ├── useFileTree.ts
│   │   │   ├── useAnalysis.ts
│   │   │   └── useCache.ts
│   │   ├── services/
│   │   │   └── api.ts      # API client
│   │   ├── types/
│   │   │   └── index.ts    # TypeScript types
│   │   └── lib/
│   │       └── utils.ts
│   └── public/
│
├── backend/               # Node.js server
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── server.ts      # Express app
│   │   ├── routes/
│   │   │   ├── files.ts
│   │   │   ├── analysis.ts
│   │   │   └── cache.ts
│   │   ├── services/
│   │   │   ├── claude.ts      # Claude Code CLI subprocess wrapper
│   │   │   ├── fileSystem.ts
│   │   │   ├── cache.ts
│   │   │   └── queue.ts
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── database.ts
│   │   └── types/
│   │       └── index.ts
│   └── data/
│       └── cache.db       # SQLite database
│
└── shared/                # Shared types between FE/BE
    └── types.ts
```

---

## Development Workflow

### Phase 1 Checklist
1. Initialize Vite project with React + TypeScript
2. Install and configure Tailwind + shadcn/ui
3. Create basic Express backend with file routes
4. Build file tree component
5. Implement file content API
6. Create syntax-highlighted file viewer
7. Test with repository files

### Phase 2 Checklist
1. Set up Claude Code CLI subprocess integration
2. Create analysis API endpoint
3. Build review results panel component
4. Add loading states
5. Implement click-to-scroll navigation
6. Test with real Claude analysis

### Phase 3 Checklist
1. Install Monaco Editor
2. Replace syntax highlighter with Monaco
3. Implement decorations for issue markers
4. Add hover tooltips
5. Create diff view toggle
6. Integrate Monaco DiffEditor
7. Test with various file types

### Starting Point - Phase 1 Commands

```bash
# Frontend setup
cd tools/stylecheck/frontend
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge
npm install react-syntax-highlighter @types/react-syntax-highlighter
npm install lucide-react

# Backend setup
cd tools/stylecheck/backend
npm init -y
npm install express cors better-sqlite3
npm install -D @types/express @types/cors @types/better-sqlite3
npm install -D typescript ts-node-dev
npx tsc --init
```

---

## Success Criteria

### Phase 1 Success
- Can browse all repository files
- Can view file contents with syntax highlighting
- UI is responsive and intuitive

### Phase 2 Success
- Can trigger Claude analysis on any file
- Results display clearly with severity indicators
- Can navigate from issue to code location

### Phase 3 Success
- Monaco editor provides professional code viewing experience
- Inline markers make issues immediately visible
- Diff view clearly shows suggested changes

### Phase 4 Success
- Cache hit ratio > 80% after initial usage
- Instant results for previously analyzed files
- Clear cache status indicators

### Phase 5 Success
- Can queue 10+ files for analysis
- Background processing doesn't block UI
- Clear progress indication

### Phase 6 Success
- All review types functional
- Statistics provide useful insights
- Cache management tools work reliably

---

## Next Steps

1. **Review and refine this plan** - Discuss any concerns or changes
2. **Set up development environment** - Install tools, create project structure
3. **Start Phase 1** - Build the file browser
4. **Iterate and adapt** - Adjust plan based on what we learn

## Questions for Discussion

1. **Repository Scope**: Should we target a specific directory (e.g., `packages/mettagrid`) or entire repo?
2. **Claude Integration**: Use official SDK or alternative approach?
3. **Monaco Configuration**: Light theme, dark theme, or both?
4. **Review Types**: Start with just "style" or implement all types from the beginning?
5. **Deployment**: Dev server only or package for distribution?
6. **Performance**: What's acceptable for initial file tree load time? (< 1 second for 1000 files?)
