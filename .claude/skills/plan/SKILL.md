---
name: plan
description: >-
  Interview-driven planning for a feature or change. Use when the user invokes
  /plan — the agent will not reach for this skill on its own.
disable-model-invocation: true
---

# /plan — Feature Planning

You invoke this by typing `/plan` — the agent won't reach for it on its own.

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. For each question, provide your recommended answer. Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering. Do not enact the plan until I confirm we have reached a shared understanding. The result of this work should be a folder named `.ai` created in the project root (create it if it does not exist); inside this, create a subfolder named after the functionality discussed in the plan, using kebab-case. Within that subfolder, create a file named `plan.md` to store the plan details. The file structure is as follows:

```
Date:
Description:
```

The planning stage is exclusively about understanding what needs to be built, without relying on code.
