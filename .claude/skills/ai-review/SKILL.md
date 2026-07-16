---
name: ai-review
description: >-
  Critical review of an implementation for consequences and vulnerabilities. Use
  when the user invokes /ai-review or /ai-review <feature-plan> — the agent will
  not reach for this skill on its own.
disable-model-invocation: true
---

# /ai-review — Implementation Review

You invoke this by typing `/ai-review <feature-plan>` or `/ai-review` — the agent won't reach for it on its own.

Critically review the implementation with focus on **consequences** and **vulnerabilities** (security, data integrity, auth, failure modes, regressions). **Do not modify any code** during the review. Report findings; propose fixes only as suggestions.

## Scope selection

### With `<feature-plan>`

Resolve to `.ai/<feature-plan>/`. Read `plan.md`, `research.md`, and `status.md`. Review the code and changes that implement that feature (files and decisions described in those docs, related diffs, and call sites).

If the feature plan folder or key files are missing, stop and report what is missing.

### Without `<feature-plan>` (whole branch)

Review the **current branch** relative to its base (typically `main`/`master`, or the tracked upstream merge-base): full branch diff, commits, and touched areas.

**Production branch guard:** If the current branch is `main` or `master` (or another clearly production default), **stop immediately** and ask:

> You are on a production branch (`main`/`master`). Did you mean to review this entire branch? Confirm to continue, or provide a feature plan / switch branch.

Do not proceed with a whole-branch review on `main`/`master` until the user explicitly confirms.

## Workflow

### 1. Establish context

- Determine scope (feature plan vs whole branch) using the rules above
- For a feature plan: align review against intended behavior in plan/research/status
- For a branch: identify what changed and why (commit messages, PR description if available)
- Prefer looking up facts in the codebase over asking — but see step 2

### 2. Stop and ask when unclear

If a code decision, invariant, or trade-off is **not understandable** (unclear intent, missing context, surprising pattern without explanation), **stop and ask** before continuing that thread. Ask **one** focused question at a time. Do not invent intent.

Resume review only after the user answers, or note the item as blocked if they defer.

### 3. Analyze for consequences and vulnerabilities

Look for (non-exhaustive):

- Security: injection, XSS, CSRF, authz gaps, secret exposure, unsafe deserialization
- Data: corruption, race conditions, incorrect persistence, missing validation
- Reliability: unhandled errors, partial failures, resource leaks
- Compatibility: breaking API/behavior changes, migration risk
- Observability: silent failures, misleading logs

Cite specific files and lines. Prefer evidence over speculation; label uncertainty clearly.

### 4. Report by severity

Structure the entire review as three lists. Put each finding in exactly one bucket.

```markdown
## Critical
Issues that can cause security breaches, data loss, auth bypass, or severe production failure.

### C1: [Short title]
**Location:** [file:lines]
**Consequence:** [What can go wrong]
**Evidence:** [Why this is real]
**Fix proposals:**
1. [Preferred or primary approach]
2. [Alternative, if a second reasonable option exists]
```

```markdown
## Important
Significant bugs, moderate security/quality risks, or likely regressions that should be fixed before merge/ship.

### I1: [Short title]
...same fields as above...
```

```markdown
## Nice to have
Improvements, hardening, clarity, or low-likelihood issues — optional.

### N1: [Short title]
...same fields as above...
```

### Fix proposals rule

For every finding where you recommend a change (especially vulnerabilities and Critical/Important items):

- Provide **at least one** concrete fix proposal
- Prefer **two** proposals when more than one reasonable approach exists
- Each proposal must say **what** to change and **how** it addresses the consequence
- If only one approach is sensible, give that one and briefly say why alternatives were ruled out

### Empty buckets

If a severity has no findings, write `None found.` for that section. Do not invent issues to fill the list.

### 5. Close the review

End with a short verdict:

- Overall risk (low / medium / high)
- Whether merge/ship is advisable given Critical/Important items
- Optional: offer to implement a chosen fix **only if the user asks** (otherwise point them to `/ai-fix` or a normal edit session)

## Rules

- **Never** edit, create, or delete application code as part of `/ai-review`
- **Never** silently assume intent — stop and ask when a decision is unclear
- **Never** run a whole-branch review on `main`/`master` without explicit confirmation
- Be critical but fair — severity must match real impact and exploitability
- Prefer precise, actionable findings over vague style comments unless they create real risk
