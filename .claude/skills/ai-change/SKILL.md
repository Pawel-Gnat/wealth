---
name: ai-change
description: >-
  Append requirement or scope changes to an existing feature plan. Use when the
  user invokes /ai-change <feature-plan> — the agent will not reach for this
  skill on its own.
disable-model-invocation: true
---

# /ai-change — Feature Plan Change

You invoke this by typing `/ai-change <feature-plan>` followed by the change expectations — the agent won't reach for it on its own.

Update an existing feature plan when requirements or implementation needs change. Work only inside `.ai/<feature-plan>/`. Read `plan.md`, `research.md`, and `status.md`, then record the change so a later model (e.g. via `/ai-research` or `/ai-build`) can see that the original plan is amended.

## Core rule: append, do not rewrite

**Do not substantially rewrite or replace** existing content in `plan.md`, `research.md`, or `status.md`. Preserve the original text as the historical baseline. Record each change as an explicit amendment that states:

- what is no longer accurate or complete
- what is now expected instead
- which steps or decisions are affected

Another language model must be able to read the files and understand that implementation plans have changed relative to the original.

## Workflow

### 1. Locate and read the feature plan

Resolve `<feature-plan>` to `.ai/<feature-plan>/` (kebab-case). Read all of:

- `plan.md`
- `research.md`
- `status.md`

If the folder or any of these files is missing, stop and report what is missing. Do not invent a full plan from scratch — that belongs to `/ai-plan` and `/ai-research`.

### 2. Clarify the change

Parse the user's change expectations after `/ai-change <feature-plan>`. If the request is ambiguous, ask **one** focused question at a time. Prefer looking up facts in the existing plan files and codebase over guessing.

Summarize back:

- **What stays the same**
- **What changes**
- **Impact** on plan, research, and remaining/completed status steps

Do not edit files until the user confirms this summary.

### 3. Append amendments to the three files

After confirmation, append a dated change block to each affected file. Prefer appending at the end. Touch only what the change requires — if a file is unaffected, leave it unchanged and say so.

Use this block shape (adapt per file):

```
## Change — YYYY-MM-DD

Expectation:
[What the user now wants]

Supersedes / amends:
[Which prior sections, decisions, or steps are outdated — reference them; do not delete them]

New direction:
[What should be true going forward]

Notes for implementers:
[What a later /ai-research or /ai-build run must revisit]
```

File-specific guidance:

- **plan.md** — amend product/requirement intent; do not expand into full re-planning
- **research.md** — mark which implementation decisions or approaches are invalidated or need revisit; do not re-run full research here
- **status.md** — add or annotate steps that must be redone, skipped, or newly planned; keep existing checkboxes and history; if overall status was `finished` or `in progress`, set it to `planned` (or `in progress` if work continues) and note why in the change block

### 4. Confirm and stop

Summarize what was appended to which files. Do **not** implement application code. Point the user to `/ai-research <feature-plan>` if research must be revisited, and `/ai-build <feature-plan>` when ready to implement the amended steps.

## Rules

- Never delete or heavily rewrite prior plan/research/status content
- Never implement product code as part of `/ai-change`
- Never invent requirements beyond what the user stated — record their expectations clearly
- Keep amendments short, explicit, and readable by another model as a delta over the original
