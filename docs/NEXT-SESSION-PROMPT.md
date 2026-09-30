# Prompt for the next Sonnet session (N6 to N10)

Before pasting: connect the keyword-library MCP in the Claude Code environment and add `pozo.com.py` under
Network access. Without them the session skips the same tasks again.

```
Repo https://github.com/antonmarklundcom/pozo (pozo.com.py). Continue the SONNET part of
docs/RUNBOOK-OPUS-THEN-SONNET.md on main: tasks N6 to N10 and N-end (N1-N5 are already merged), in order,
one PR per task. Read "Notes from the Opus run" in section 3 and the "Sonnet run log" in
docs/IMPROVE-REPORT-2026-09-29.md first, then run: npm i -g axe-core

The owner authorises you to merge your own PRs into main of antonmarklundcom/pozo when green, exactly as
section 0 of the runbook defines it. No human review needed. Never force-push, never weaken a check, never
touch antonmarklundcom/pozo.com.py, no GitHub Actions, no secrets in git. Use your session branch for every
task (fast-forward it to main after each merge). If a task can't reach green in 3 attempts, close its PR, log
why, continue.
Gates: skip every keyword (🔑) task if the keyword-library MCP is not connected (never guess keyword data);
skip N6 if pozo.com.py is unreachable (smoke-live exit 2); list skipped items in docs/OWNER-TODO.md.
IMAGE GATE: CLOSED  (change CLOSED to OPEN to allow images: GPT Image 2.5, variant sunburst, quality medium,
test one image first, stop before 50 credits in total)
Finish with a short summary: PRs merged, skipped tasks and why, SEO before/after, what I must do.
```
