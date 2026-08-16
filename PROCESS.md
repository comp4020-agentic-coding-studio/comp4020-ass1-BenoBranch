# Process Overview

## What I built

Inspired after recently watching Christopher Nolan's "The Odyssey" I built a scroll driven storytelling map that allows the user to trace Odysseus' journey home depicted in Homer's "The Odyssey". As the user scrolls through the map, they can trace the rough path that he took through the Mediterranean Sea, and read about the key points of interest that he stopped at along his journey including their modern real world names, and a little bit about what the location does today. The website also supports keyboard input and works on mobile too.

## The moments that mattered

### Moment 1:

1. **what happened**

Across multi-day sessions, I struggled to track planned feature ideas and recall exact stopping points when starting new chats.

2. **what you did instead of the obvious thing**

Instead of external notes, I created a agent-readable TODO.md file to drive planning mode with task states ([ ], [~], [x]). To eliminate manual pasting, I built a .claude/hooks/ SessionStart hook that automatically injects TODO.md into the agent's context every time a session starts.

3. **how you knew it was right**

I could jump straight back into the development flow without re-explaining context. Mid-session ideas went straight into TODO.md as new items rather than disappearing in closed chat logs, ensuring no tasks were left half-finished.

4. **the citation**

Commit [`5e3a859`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-BenoBranch/commit/5e3a85963b3b0ba633120c7fe66e653ee0513264)

### Moment 2:

1. **what happened**

When scrolling between stops, text tiles un-stuck and slid away, causing the cursor to drop onto the map canvas and trigger map zoom instead of progressing the journey.

2. **what you did instead of the obvious thing**

Instead of disabling scroll-zoom or hacking CSS opacity, I refactored the DOM scaffolding. I split .stop-content into an outer, transparent position: sticky container that maintains a permanent 100vh hit surface over the map, and an inner .stop-panel handling visual fades without moving the hit surface. I also fixed the denominator in voyage.ts (totalHeightVh - VIEWPORT_VH) and set MIN_VH to 150 to keep sticky pinning reliable.

3. **how you knew it was right**

I ran an automated playwright script sampling cursor hit-testing across stop transitions; it confirmed 0 canvas hits across 72 points on desktop (1920×1080) and 57 on mobile (390×844). A Playwright script verified .stop[i].getBoundingClientRect().top === 0 across all 10 stops, while all 27 unit tests stayed green in pnpm check.

4. **the citation**

Commit [`8efd698`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-BenoBranch/commit/8efd698d3c859c9c3e3e63e59ea74342f086e030)

### Moment 3:

1. **what happened**

While setting up the interactive map, the standard choice was Mapbox GL JS. Mapbox GL JS required a public API key that triggered pre-commit secret scanners. Additionally, jsdom unit testing couldn't render WebGL/canvas elements.

2. **what you did instead of the obvious thing**

I swapped Mapbox for MapLibre GL JS with keyless OpenFreeMap tiles. To solve testing without WebGL mocks, I decoupled domain logic from rendering by extracting scroll-to-waypoint math into a pure function in voyage.ts.

3. **how you knew it was right**

Interaction contract tests in spec/assignment-1.test.ts passed in vitest without WebGL, and the build pipeline ran smoothly without scanner flags or key setups.

4. **the citation**

Commit [`5b1d715`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-BenoBranch/commit/5b1d715f76396b834f96820c562abfd42e8105ac)

### Moment 4:

1. **what happened**

Running pnpm build + pnpm preview resulted in a blank map canvas with zero console errors, because Vite’s fallback served index.html with an HTTP 200 status for missing dynamically loaded assets.  

2. **what you did instead of the obvious thing**

Instead of assuming the build script was broken or writing dev-only workarounds, I investigated Rollup's chunking behavior. I found MapLibre’s Web Worker (maplibre-gl-worker.mjs) was excluded from dist/ due to dynamic import.meta.url loading. I configured vite.config.ts to explicitly bundle the worker using ?worker&url and passed it via maplibregl.setWorkerUrl().  

3. **how you knew it was right**

The build generated a self-contained 469 kB worker chunk in dist/assets/. A Playwright test against the preview server confirmed map.loaded() returned true and road geometries rendered cleanly across desktop and mobile viewports.  

4. **the citation**

Commit [`25d7207`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-BenoBranch/commit/25d720702ca30a113b549c75eee41d123debaf7d)
