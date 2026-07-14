---
name: fix
description: >-
  Diagnose bugs and propose fix options without changing code. Use when the user
  invokes /fix — the agent will not reach for this skill on its own.
disable-model-invocation: true
---

# /fix — Bug Diagnosis and Fix Proposal

You invoke this by typing `/fix` — the agent won't reach for it on its own.

Diagnose the problem described by the user, explore related code, and propose fix options. **Do not modify any code, files, or git state until the user explicitly approves implementation.**

## Workflow

### 1. Understand the problem

Parse the user's command for:

- **Symptom** — what fails, looks wrong, or behaves unexpectedly
- **Context** — error messages, stack traces, reproduction steps, affected feature or file
- **Scope** — whether the issue is local or systemic

If critical details are missing, ask **one** focused question at a time. Prefer looking up facts in the codebase over asking the user.

### 2. Investigate related code

Search and read code connected to the problem:

- Files, modules, and functions mentioned by the user or error output
- Callers, callees, imports, and configuration that influence the behavior
- Recent changes (git log/diff) when they may explain a regression
- Tests covering the affected area — note gaps if relevant

Stop when you can explain **root cause**, not just symptoms. Cite specific files and lines in your analysis.

### 3. Diagnose and report

Present findings using this structure:

```markdown
## Problem summary
[What the user experiences and why it happens]

## Root cause
[Technical explanation with code references]

## Evidence
- [File/line or behavior that supports the diagnosis]
```

### 4. Propose fix options

Provide **at least two** fix proposals when multiple reasonable approaches exist. If the problem is obvious and one approach is clearly best, a **single** recommended fix is enough — state briefly why alternatives were ruled out.

For each option:

```markdown
### Option N: [Short title]

**Approach:** [What to change and where]

**Why it fixes the problem:** [Link the change to the root cause]

**Trade-offs:** [Risk, scope, maintainability, side effects]

**Effort:** [Low / Medium / High]
```

Mark one option as **Recommended** when you have a clear preference.

### 5. Ask before implementing

End with an explicit gate — do not skip it:

> Which option should I implement? I will not change any code until you confirm.

Wait for the user's choice. Accept refinements (e.g. "Option 2, but without touching X").

### 6. Implement only after approval

When the user approves:

1. Implement **only** the chosen option — minimal, focused diff
2. Follow project conventions and existing patterns in the codebase
3. Add or update tests when they meaningfully cover the fix
4. Run relevant lint/tests and report results
5. Summarize what changed and how it resolves the original problem

If the user declines or wants more analysis, return to steps 2–4 without editing code.

## Rules

- **Never** edit, create, or delete files during diagnosis and proposal (steps 1–5)
- **Never** commit or stage changes without explicit user approval
- **Never** assume which fix option the user wants — always ask
- Prefer the smallest correct fix over a large refactor unless the user requests otherwise
- If diagnosis is inconclusive, say so and list what additional evidence would help
