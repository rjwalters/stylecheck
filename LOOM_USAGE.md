# Using Loom in StyleCheck

This project uses **[Loom](https://github.com/rjwalters/loom)**, a multi-terminal orchestration system that coordinates AI-powered development workers using GitHub labels and git worktrees.

> **Note**: This document covers how to **use** Loom in StyleCheck. For Loom's internal development documentation, see the [Loom repository](https://github.com/rjwalters/loom).

## Core Concepts

- **Roles**: Each terminal can have a specialized role (Architect, Builder, Curator, Judge, etc.)
- **Labels**: GitHub labels coordinate work between roles (`loom:issue`, `loom:in-progress`, etc.)
- **Worktrees**: Git worktrees provide isolated work environments for each issue
- **Autonomous Mode**: Terminals can work independently on assigned tasks

## Label-Based Workflow

Loom uses GitHub labels as a state machine to coordinate work:

### Issue Lifecycle
```
[created] → loom:curated → loom:issue → loom:in-progress → [closed]
                                              ↓
                                        loom:blocked (if dependencies)
```

### PR Lifecycle
```
[created] → loom:review-requested → loom:approved → [merged]
                     ↓
              loom:changes-requested (if needs fixes)
```

### Special Labels
- `loom:urgent` - High-priority issues needing immediate attention
- `loom:architect` - Architectural proposals awaiting review
- `loom:hermit` - Bloat removal suggestions
- `loom:external` - Issues from non-collaborators (require approval)

## Git Worktree Workflow

Loom uses git worktrees to provide isolated work environments for each issue. **Always use the helper script** to create worktrees:

### Creating a Worktree

```bash
# Create worktree for issue #42
./.loom/scripts/worktree.sh 42
# → Creates: .loom/worktrees/issue-42
# → Branch: feature/issue-42

# Change to worktree
cd .loom/worktrees/issue-42

# Do your work
# ... implement, test, commit ...

# Push and create PR
git push -u origin feature/issue-42
gh pr create --label "loom:review-requested" --title "..." --body "Closes #42"

# Return to main workspace
cd ../..
```

### Why Use the Helper Script?

The `./.loom/scripts/worktree.sh` script provides:
- ✅ Prevents nested worktrees
- ✅ Consistent naming (`.loom/worktrees/issue-{number}`)
- ✅ Automatic branch creation (`feature/issue-{number}`)
- ✅ Sandbox-compatible paths
- ✅ Safety checks and error prevention

**Don't run `git worktree add` directly** - always use the helper script.

## Role System

Loom defines several specialized roles (see `.loom/roles/` directory):

| Role | Purpose | Autonomous | Workflow |
|------|---------|-----------|----------|
| **Architect** | Creates architectural proposals | Yes (15 min) | Creates issues with `loom:architect` label |
| **Curator** | Enhances issues with implementation details | Yes (5 min) | Adds `loom:curated` label when ready |
| **Builder** | Implements features and fixes | No | Claims `loom:issue`, creates PR with `loom:review-requested` |
| **Judge** | Reviews pull requests | Yes (5 min) | Reviews PRs with `loom:review-requested` |
| **Hermit** | Identifies code bloat and complexity | Yes (daily) | Creates issues with `loom:hermit` label |
| **Guide** | Triages and prioritizes issues | Yes (hourly) | Adds `loom:urgent` to top priorities |
| **Healer** | Fixes bugs and addresses PR feedback | No | Works on `loom:changes-requested` PRs |

### Autonomous Mode

Roles marked "Autonomous" run at regular intervals with configured prompts. For example:
- **Architect** scans the codebase every 15 minutes for improvement opportunities
- **Curator** checks for uncurated issues every 5 minutes
- **Judge** looks for PRs needing review every 5 minutes

## Creating Issues and PRs

### Issue Creation

```bash
gh issue create --title "..." --body "..."
# → Creates unlabeled issue
# → Curator will enhance it
# → Human adds loom:issue label to approve
```

### PR Creation

**CRITICAL**: Use GitHub magic keywords to auto-close issues:

```bash
gh pr create --label "loom:review-requested" --body "$(cat <<'EOF'
## Summary
Brief description of changes.

## Changes
- Change 1
- Change 2

## Test Plan
How you verified the changes work.

Closes #123
EOF
)"
```

**Always use `Closes #123`** (not "Issue #123" or "Fixes issue #123") - this ensures the issue auto-closes when the PR merges.

## Common Workflows

### Working on an Approved Issue

```bash
# 1. Find work
gh issue list --label="loom:issue" --state=open

# 2. View issue details (including comments!)
gh issue view 42 --comments

# 3. Claim the issue
gh issue edit 42 --remove-label "loom:issue" --add-label "loom:in-progress"

# 4. Create worktree
./.loom/scripts/worktree.sh 42
cd .loom/worktrees/issue-42

# 5. Implement, test, commit
# ... your work ...

# 6. Push and create PR
git push -u origin feature/issue-42
gh pr create --label "loom:review-requested"

# 7. Issue auto-closes when PR merges
```

### Checking Issue Dependencies

Before claiming an issue, check for a "Dependencies" section:

```markdown
## Dependencies

- [ ] #123: Required feature
- [ ] #456: Required infrastructure
```

- **All boxes checked (✅)**: Safe to claim
- **Any boxes unchecked (☐)**: Mark as `loom:blocked` instead

### Handling Blocked Issues

```bash
# If you discover a dependency while working
gh issue edit 42 --add-label "loom:blocked"
gh issue comment 42 --body "Blocked by #123 - need X feature first"

# Switch to a different issue
```

## Terminal Configuration

Each terminal in Loom can be configured with:
- **Role**: Which role definition to use (`worker.md`, `architect.md`, etc.)
- **Worker Type**: Claude or other AI provider
- **Autonomous Mode**: Whether to run automatically
- **Interval**: How often to run (milliseconds)
- **Interval Prompt**: What prompt to send at each interval

Configuration is stored in `.loom/config.json` per workspace.

## Best Practices

### Do's ✅
- **Always read issue comments** before starting work (use `gh issue view 42 --comments`)
- **Use the worktree helper script** (`./.loom/scripts/worktree.sh`)
- **Update labels** as you progress through work
- **Use `Closes #X`** in PR descriptions for auto-close
- **Run `pnpm check:ci`** before creating PRs
- **Respect the priority system** (urgent issues first)

### Don'ts ❌
- **Don't work on `external` issues** (require maintainer approval first)
- **Don't use `git worktree add` directly** (use the helper script)
- **Don't expand scope** during implementation (create separate issues)
- **Don't skip dependency checks** (mark as `loom:blocked` if needed)
- **Don't forget to claim issues** before starting work

## Troubleshooting

### Worktree Already Exists
```bash
# Check existing worktrees
git worktree list

# Remove if orphaned
git worktree remove .loom/worktrees/issue-42 --force
git worktree prune

# Then create fresh
./.loom/scripts/worktree.sh 42
```

### Issue Not Showing in Queue
- Check if it has the `loom:issue` label
- Check if it's marked `external` (needs approval)
- Check if it's already `loom:in-progress` (someone else claimed it)

### PR Not Auto-Closing Issue
- Verify PR description has `Closes #123` (exact format)
- Check the PR was merged (not just closed)
- Check the issue number is correct

## Reference

- **Loom Repository**: https://github.com/rjwalters/loom
- **Loom Documentation**: See Loom repo for full development docs
- **Role Definitions**: `.loom/roles/*.md` in this repository
- **Workflow Details**: See Loom's `WORKFLOWS.md` for complete label workflow
- **Installation Issues**: https://github.com/rjwalters/loom/issues/468

---

*This lightweight guide covers Loom usage in StyleCheck. For Loom's internal architecture, development setup, and contribution guidelines, see the [Loom repository](https://github.com/rjwalters/loom).*
