---
name: commit
description: >-
  Propose a commit subject from staged changes, or from unstaged and untracked
  changes when nothing is staged. Use when the user invokes /commit — the agent
  will not reach for this skill on its own.
disable-model-invocation: true
---

# /commit — Commit subject

You invoke this by typing `/commit` — the agent won't reach for it on its own.

Return **one** proposed commit subject. Do not stage files, commit, push, or amend.

## What to name

1. Run `git status`, `git diff --cached`, and `git log -20 --format='%s'` in parallel.
2. If the index has staged changes, name **only** those. Ignore unstaged and untracked files.
3. If nothing is staged, run `git diff` and include untracked files that are real work. Name that set.
4. If there is nothing to name, say so and stop. Do not invent a subject.

Skip files that look like secrets (`.env`, credentials, keys). If such a file is in the set you are naming, warn in one sentence before the subject and do not describe its contents.

## Subject

Match the recent `git log` subjects in this repo:

- Conventional prefix: `feat`, `fix`, `refactor`, `chore`, `build`, `test`, or `docs`.
- One line. Imperative. English. Lowercase after the prefix.
- Say why the change exists, not a file list.
- No ticket suffix, no body, no alternatives.

Reply with the subject in a fenced block and nothing else, unless you are warning about a secret file or an empty diff.
