---
name: ai-pull-request-desc
description: >-
  Generate a pull request title and description from branch changes. Use when
  the user invokes /ai-pull-request-desc — the agent will not reach for this
  skill on its own.
disable-model-invocation: true
---

# /ai-pull-request-desc — Pull Request Title & Description

You invoke this by typing `/ai-pull-request-desc` or `/ai-pull-request-desc <base-branch>` — the agent won't reach for it on its own.

Generate a **title** and **description** for a pull request from the current branch's changes. **Do not create the PR, push, or edit application code** unless the user explicitly asks afterward.

## Base branch

- **Default:** compare the current branch against the main production branch (`main` or `master` — detect which exists / is the default)
- **Override:** if the user passes `<base-branch>`, compare against that branch instead

Diff scope: all commits and file changes on the current branch that are not on the base (`git log` / `git diff <base>...HEAD`).

If the current branch **is** the production branch and no other base was given, stop and ask which base to compare against.

## Workflow

### 1. Gather changes

Run git against the resolved base branch:

- Commit list and messages
- Full diff of changed files
- Classify paths as **added**, **edited**, or **deleted** (renames: treat as deleted old + added new, or note rename if clear)

### 2. Produce title

One line, English, imperative mood where natural. Must start with exactly one of these prefixes (lowercase, with colon and space):

| Prefix | When |
|--------|------|
| `feat:` | New feature or user-facing capability |
| `fix:` | Bug fix |
| `hotfix:` | Urgent production fix |
| `refactor:` | Internal restructure without intended behavior change |
| `docs:` | Documentation only |
| `style:` | Formatting, lint, visual polish without logic change |
| `ops:` | Infra, CI, deploy, tooling operations |
| `build:` | Build system, bundler, compile, package tooling |
| `chore:` | Maintenance, deps, misc non-feature work |

Examples:

- `feat: add dashboard page components`
- `fix: remove duplicated rerender`

Pick the **single best** prefix from the dominant change. Do not stack prefixes.

### 3. Produce description

Markdown only, in this exact section order:

```markdown
## What's new

[1–3 short paragraphs or bullets explaining what this PR introduces and why it matters. Focus on intent and outcome, not a file dump.]

## What has been changed

### Added
- `path/to/file`

### Edited
- `path/to/file`

### Deleted
- `path/to/file`
```

Rules for **What has been changed**:

1. List **Added** first, then **Edited**, then **Deleted**
2. Use repository-relative paths
3. If a group is empty, write `None.` under that subheading (keep all three subheadings)
4. Prefer a complete file list for the PR; if the list is huge, group by top-level area and note the count, but still prefer paths when feasible

### 4. Deliver

Output only:

1. **Title** (plain line)
2. **Description** (the markdown block above)

Ready to paste into GitHub/GitLab. Do not open a PR unless the user asks.

## Rules

- Base the text on the actual diff — do not invent features that are not in the changes
- Prefer accurate, skim-friendly wording over marketing language
- If the diff is empty, say so and do not invent a PR description
- Never push, force-push, or create a remote PR as part of this skill alone
