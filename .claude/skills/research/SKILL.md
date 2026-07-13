---
name: research
description: >-
  Codebase-aware research for a feature plan. Use when the user invokes
  /research <feature-plan> — the agent will not reach for this skill on its own.
disable-model-invocation: true
---

# /research — Feature Research

You invoke this by typing `/research <feature-plan>` — the agent won't reach for it on its own.

Research about every implementation aspect of this implementation plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer. Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering. If a fact can be found by exploring the codebase, look it up rather than asking me. The decisions, though, are mine — put each one to me and wait for my answer. Do not enact the research until I confirm we have reached a shared understanding. The result of this work should be a file named "research.md" created in the feature plan folder and containing every implementation aspect of the researched feature. The file structure is as follows:

```
Date:
Description:
```

Additionally, a "status.md" file should be created inside the feature plan folder, containing the entire research broken down into implementation steps. The initial status of this file is "planned". Each step should have a checkbox to mark whether that step has been completed. The file structure is as follows:

```
Date:
Status: planned
Steps:
```
