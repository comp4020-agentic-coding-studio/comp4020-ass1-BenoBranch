# Project history

Dated log of what was attempted, decided, and discarded each session, and how
it was checked. Not itself marked evidence — raw material for `PROCESS.md`,
the reflection, and the end-of-assignment report. See `CLAUDE.md` for the
convention.

## 2026-08-16 — pivoted back to the Odyssey prototype from `main`

- After the initial Odyssey scrollytelling prototype (this branch's commits
  `85aeecf`..`c7592bb`: map open on a whole-Mediterranean overview, waypoint
  dots, worker-loading fix), a separate `idea2` branch explored a full pivot
  to a traffic-assignment/Braess's-paradox simulation, which got as far as a
  working, tested Pyrmont-peninsula prototype (population slider, connector
  toggle, MapLibre congestion colouring), then a second, unimplemented pivot
  draft (a Sydney-wide diurnal congestion map) was written to `BRIEF.md` but
  never built.
- With time running out before the assignment cutoff, decided to abandon both
  traffic-sim directions and return to the Odyssey prototype, since it's
  further along (more of the core interaction already built and green) and
  better matches the time remaining. The `idea2` branch's uncommitted
  Sydney-wide draft was committed there first (`e6023cd`) so the exploration
  stays in the record rather than being silently discarded, then this session
  switched back to `main` to continue from here.
- Verified `main` is in a clean, working state before resuming: `pnpm check`
  green (typecheck, build, oxlint, stylelint, 19/19 vitest tests).
- Not yet done this session: any new feature work on the Odyssey prototype
  itself — this entry only covers the branch decision and verification.
