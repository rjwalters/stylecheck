# VibeCov Testing Strategy

## Overview

VibeCov implements a **three-tier testing pyramid** to ensure code quality, prevent regressions, and enable confident refactoring.

```
        /\
       /  \      E2E Tests (10%)
      /    \     - Playwright
     /------\    - Critical user journeys
    /        \
   /  Integration \ (20%)
  /    Tests      \  - API tests with SQLite
 /------------------\ - Claude CLI mocking
/                    \
/    Unit Tests       \ (70%)
/  Vitest + RTL       \ - Business logic
/______________________\ - Components
```

## Testing Philosophy

### Core Principles

1. **Fast Feedback**: Unit tests run in <1 second for rapid development
2. **Deterministic**: Tests produce same results every run (no flaky tests)
3. **Isolated**: Each test is independent (no shared state)
4. **Maintainable**: Tests are easy to understand and update
5. **Comprehensive**: 80% coverage for critical paths

### When to Write Each Type

| Test Type | When to Use | Example |
|-----------|-------------|---------|
| **Unit** | Testing pure functions, business logic, utility functions | `hashProfile()`, `parseAnalysisResponse()` |
| **Component** | Testing React components in isolation | `ProfileSelector`, `AnalysisResultCard` |
| **Integration** | Testing API endpoints, database operations, service interactions | `POST /api/analysis`, cache lookup flow |
| **E2E** | Testing complete user workflows | Load profile → Analyze file → View results |

## Test Frameworks

### Frontend Testing

**Framework**: Vitest + React Testing Library

```bash
cd frontend
pnpm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm install -D happy-dom  # Fast DOM implementation for tests
```

**Configuration** (`frontend/vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
});
```

**Setup file** (`frontend/src/test/setup.ts`):
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

### Backend Testing

**Framework**: Vitest + Supertest

```bash
cd backend
pnpm install -D vitest @vitest/ui supertest @types/supertest
pnpm install -D vitest-mock-extended  # For mocking
```

**Configuration** (`backend/vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/test/**',
        'src/**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

### E2E Testing

**Framework**: Playwright

```bash
# Root directory
pnpm install -D @playwright/test
npx playwright install
```

**Configuration** (`playwright.config.ts`):
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Testing Patterns

### Unit Test Example (Frontend)

```typescript
// frontend/src/lib/profileHash.test.ts
import { describe, it, expect } from 'vitest';
import { hashProfile } from './profileHash';

describe('hashProfile', () => {
  it('generates consistent hash for same profile', () => {
    const profile = { name: 'Test', preferences: { lineLength: 100 } };
    const hash1 = hashProfile(profile);
    const hash2 = hashProfile(profile);

    expect(hash1).toBe(hash2);
  });

  it('generates different hashes for different profiles', () => {
    const profile1 = { name: 'Test1', preferences: { lineLength: 100 } };
    const profile2 = { name: 'Test2', preferences: { lineLength: 120 } };

    expect(hashProfile(profile1)).not.toBe(hashProfile(profile2));
  });

  it('generates same hash regardless of property order', () => {
    const profile1 = { name: 'Test', preferences: { a: 1, b: 2 } };
    const profile2 = { preferences: { b: 2, a: 1 }, name: 'Test' };

    expect(hashProfile(profile1)).toBe(hashProfile(profile2));
  });
});
```

### Component Test Example (Frontend)

```typescript
// frontend/src/components/ProfileSelector.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@testing-library/react';
import { ProfileSelector } from './ProfileSelector';

describe('ProfileSelector', () => {
  it('renders profile options', () => {
    const profiles = [
      { id: 1, name: 'PEP 8' },
      { id: 2, name: 'Google Style' },
    ];

    render(<ProfileSelector profiles={profiles} onSelect={() => {}} />);

    expect(screen.getByText('PEP 8')).toBeInTheDocument();
    expect(screen.getByText('Google Style')).toBeInTheDocument();
  });

  it('calls onSelect when profile clicked', async () => {
    const onSelect = vi.fn();
    const profiles = [{ id: 1, name: 'PEP 8' }];

    render(<ProfileSelector profiles={profiles} onSelect={onSelect} />);

    await userEvent.click(screen.getByText('PEP 8'));

    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
```

### Integration Test Example (Backend)

```typescript
// backend/src/routes/analysis.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { db } from '../db/database';

describe('POST /api/analysis', () => {
  beforeEach(async () => {
    // Set up test database
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(async () => {
    // Clean up
    await db.migrate.rollback();
  });

  it('returns cached result if file hash matches', async () => {
    const fileHash = 'abc123';

    // Seed cache
    await db('analyses').insert({
      file_hash: fileHash,
      file_path: 'test.py',
      review_type: 'style',
      review_summary: 'Test summary',
    });

    const response = await request(app)
      .post('/api/analysis')
      .send({ filePath: 'test.py', fileHash });

    expect(response.status).toBe(200);
    expect(response.body.cached).toBe(true);
    expect(response.body.summary).toBe('Test summary');
  });

  it('runs new analysis if cache miss', async () => {
    const response = await request(app)
      .post('/api/analysis')
      .send({ filePath: 'new-file.py', fileHash: 'new123' });

    expect(response.status).toBe(200);
    expect(response.body.cached).toBe(false);
    expect(response.body.summary).toBeDefined();
  });
});
```

### E2E Test Example

```typescript
// e2e/analysis-workflow.spec.ts
import { test, expect } from '@playwright/test';

test('complete analysis workflow', async ({ page }) => {
  // 1. Navigate to app
  await page.goto('/');

  // 2. Select profile
  await page.click('text=Select Profile');
  await page.click('text=PEP 8 Compliant');

  // 3. Select repository
  await page.click('text=Browse Repository');
  await page.fill('input[type="text"]', '/path/to/test-repo');
  await page.click('text=Analyze');

  // 4. Wait for analysis to complete
  await page.waitForSelector('text=Analysis Complete');

  // 5. Verify results displayed
  await expect(page.locator('.analysis-results')).toBeVisible();
  await expect(page.locator('.file-card').first()).toContainText('test.py');
});
```

## Claude Code CLI Testing Strategy

### The Challenge

Testing features that depend on Claude Code CLI subprocess calls is complex because:
- Claude Code calls are expensive (API costs, time)
- Subprocess spawning is slow and adds test flakiness
- Real Claude responses vary (non-deterministic)

### Solution: Service Abstraction + Mocking

**Step 1: Create service interface**

```typescript
// backend/src/services/claude/ClaudeCodeService.ts
export interface ClaudeCodeService {
  analyzeFile(filePath: string, profile: StyleProfile): Promise<AnalysisResult>;
}
```

**Step 2: Real implementation**

```typescript
// backend/src/services/claude/ClaudeCodeSubprocessService.ts
import { spawn } from 'child_process';

export class ClaudeCodeSubprocessService implements ClaudeCodeService {
  async analyzeFile(filePath: string, profile: StyleProfile): Promise<AnalysisResult> {
    return new Promise((resolve, reject) => {
      const process = spawn('claude', [
        '--dangerously-skip-permissions',
        '--analyze-file',
        filePath,
      ]);

      let stdout = '';
      process.stdout.on('data', (data) => stdout += data);
      process.on('close', (code) => {
        if (code === 0) {
          resolve(JSON.parse(stdout));
        } else {
          reject(new Error(`Claude Code exited with code ${code}`));
        }
      });
    });
  }
}
```

**Step 3: Mock implementation**

```typescript
// backend/src/services/claude/MockClaudeCodeService.ts
import { AnalysisFixtures } from '@vibecov/test-utils';

export class MockClaudeCodeService implements ClaudeCodeService {
  async analyzeFile(filePath: string, profile: StyleProfile): Promise<AnalysisResult> {
    // Return fixture based on file extension
    const ext = filePath.split('.').pop();
    return AnalysisFixtures.getByExtension(ext);
  }
}
```

**Step 4: Dependency injection**

```typescript
// backend/src/app.ts
import { ClaudeCodeService } from './services/claude/ClaudeCodeService';
import { ClaudeCodeSubprocessService } from './services/claude/ClaudeCodeSubprocessService';
import { MockClaudeCodeService } from './services/claude/MockClaudeCodeService';

const claudeService: ClaudeCodeService = process.env.NODE_ENV === 'test'
  ? new MockClaudeCodeService()
  : new ClaudeCodeSubprocessService();
```

**Step 5: Test with mock**

```typescript
// backend/src/services/analysis.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { AnalysisService } from './analysis';
import { MockClaudeCodeService } from './claude/MockClaudeCodeService';

describe('AnalysisService', () => {
  let service: AnalysisService;

  beforeEach(() => {
    const claudeService = new MockClaudeCodeService();
    service = new AnalysisService(claudeService);
  });

  it('analyzes file using Claude service', async () => {
    const result = await service.analyze('test.py', mockProfile);

    expect(result.issues).toBeDefined();
    expect(result.score).toBeGreaterThan(0);
  });
});
```

### Test Fixtures

**Structure:**

```
packages/test-utils/
├── src/
│   ├── fixtures/
│   │   ├── profiles.fixture.ts
│   │   ├── analysis.fixture.ts
│   │   └── files.fixture.ts
│   ├── mocks/
│   │   └── claudeCodeService.mock.ts
│   └── index.ts
└── package.json
```

**Example fixture:**

```typescript
// packages/test-utils/src/fixtures/analysis.fixture.ts
export const AnalysisFixtures = {
  python_clean: {
    filePath: 'clean.py',
    issues: [],
    score: 100,
    summary: 'No style violations found',
  },

  python_naming_violations: {
    filePath: 'violations.py',
    issues: [
      {
        line: 5,
        column: 1,
        severity: 'major',
        category: 'naming',
        description: 'Variable uses camelCase instead of snake_case',
        original: 'myVariable = 10',
        suggested: 'my_variable = 10',
      },
    ],
    score: 65,
    summary: '1 major issue found',
  },

  getByExtension(ext: string) {
    if (ext === 'py') return this.python_naming_violations;
    return this.python_clean;
  },
};
```

## Test Organization

### File Naming Conventions

```
src/
├── components/
│   ├── ProfileSelector.tsx
│   └── ProfileSelector.test.tsx      # Component tests live next to components
├── lib/
│   ├── profileHash.ts
│   └── profileHash.test.ts           # Unit tests live next to source
├── services/
│   ├── analysis.ts
│   └── analysis.test.ts              # Service tests live next to services
└── test/
    ├── setup.ts                      # Test configuration
    └── utils.ts                      # Test utilities
```

### Test File Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ComponentName or FunctionName', () => {
  // Setup (if needed)
  beforeEach(() => {
    // Runs before each test
  });

  afterEach(() => {
    // Runs after each test (cleanup)
  });

  describe('specific feature or method', () => {
    it('does something specific', () => {
      // Arrange: Set up test data
      const input = 'test';

      // Act: Execute the code under test
      const result = myFunction(input);

      // Assert: Verify the result
      expect(result).toBe('expected');
    });

    it('handles edge case', () => {
      // Test edge cases
    });

    it('throws error when invalid input', () => {
      expect(() => myFunction(null)).toThrow('Invalid input');
    });
  });
});
```

## Coverage Requirements

### Thresholds

| Module Type | Lines | Functions | Branches | Statements |
|-------------|-------|-----------|----------|------------|
| **Core Business Logic** | 90% | 90% | 85% | 90% |
| **Services** | 85% | 85% | 80% | 85% |
| **API Routes** | 80% | 80% | 75% | 80% |
| **Components** | 75% | 75% | 70% | 75% |
| **Utilities** | 90% | 90% | 85% | 90% |

### Enforcement

**Local development:**
```bash
# Check coverage
pnpm test:coverage

# Coverage report opens in browser
```

**CI/CD** (`.github/workflows/test.yml`):
```yaml
- name: Run tests with coverage
  run: pnpm test:coverage

- name: Enforce coverage thresholds
  run: |
    # Vitest will fail if thresholds not met (configured in vitest.config.ts)
```

### What to Exclude from Coverage

- Test files (`*.test.ts`, `*.spec.ts`)
- Type definitions (`*.d.ts`)
- Configuration files
- Generated code
- Third-party mocks

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit and integration tests
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Testing Checklist for Pull Requests

Before submitting a PR, verify:

- [ ] All tests pass locally (`pnpm test`)
- [ ] New features have unit tests
- [ ] Integration tests cover API changes
- [ ] Coverage thresholds maintained (check `pnpm test:coverage`)
- [ ] E2E tests updated if UI changed
- [ ] No skipped tests without justification
- [ ] Mock services used for Claude Code integration tests
- [ ] Test fixtures updated if data models changed

## Best Practices

### Do's ✅

- **Write tests first** (or immediately after) for new features
- **Test behavior, not implementation** - focus on what the code does, not how
- **Use descriptive test names** - `it('returns cached result if file hash matches')`
- **Keep tests isolated** - no shared state between tests
- **Mock external dependencies** - don't hit real databases or APIs in unit tests
- **Test edge cases** - null values, empty arrays, boundary conditions
- **Clean up after tests** - use `afterEach` to reset state

### Don'ts ❌

- **Don't test implementation details** - test public API, not private methods
- **Don't write flaky tests** - tests should pass consistently
- **Don't skip failing tests** - fix or remove them
- **Don't test third-party libraries** - trust they work
- **Don't use real Claude Code in unit/integration tests** - use mocks
- **Don't share test data** - create fresh data for each test
- **Don't ignore coverage drops** - investigate and fix

## Running Tests

### Commands

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Run tests with UI (Vitest UI)
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage

# Run only unit tests (fast)
pnpm test:unit

# Run only integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test -- profileHash.test.ts

# Run tests matching pattern
pnpm test -- --grep="ProfileSelector"
```

### Filtering Tests

```typescript
// Run only this test
it.only('specific test', () => {
  // ...
});

// Skip this test
it.skip('test to skip', () => {
  // ...
});

// Run only tests in this describe block
describe.only('feature', () => {
  // ...
});
```

## Debugging Tests

### VS Code Debugging

**Configuration** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest Tests",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["test", "--run"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Console Output

```typescript
import { describe, it } from 'vitest';

it('debugging test', () => {
  const result = myFunction();

  console.log('Result:', result);  // Shows in test output

  expect(result).toBeDefined();
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Maintenance

This document should be updated when:
- New testing patterns emerge
- Test frameworks are upgraded
- Coverage thresholds change
- New testing tools are adopted
