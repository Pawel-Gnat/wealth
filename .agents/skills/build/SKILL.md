---
name: build
description: >-
  Step-by-step implementation from research and status files. Use when the user
  invokes /build <feature-plan> — the agent will not reach for this skill on its own.
disable-model-invocation: true
---

# /build — Feature Build

You invoke this by typing `/build <feature-plan>` — the agent won't reach for it on its own.

Carry out the tasks described in the "research.md" file. Check "status.md" to see which step has not yet been performed and proceed to execute it. If the step's status is "planned," change it to "in progress." After writing the code, write the appropriate tests and run them, along with code formatting and linting. Ensure the terminal reports no errors. Upon completing the step, pause, announce the end of the stage, and mark the step as completed. Ask whether to proceed to the next step; if it was the final step, change the status to "finished." Finally, run the full test suite.
