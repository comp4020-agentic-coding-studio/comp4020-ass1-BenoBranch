import {
  Map as MapLibreMap,
  Marker,
  LngLatBounds,
  type GeoJSONSource,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  activeWaypoint,
  continuousPosition,
  waypoints,
  buildRoute,
  buildFullRoute,
  splitRoute,
  easedPosition,
  stopHeightVh,
  stopRange,
  stopTransitionProgress,
  type LngLat,
} from "./voyage";
import { ICONS, SHIP_ICON } from "./icons";

const storyEl = document.querySelector<HTMLDivElement>("#story");
const mapEl = document.querySelector<HTMLDivElement>("#map");
const currentStopEl = document.querySelector<HTMLElement>("#current-stop");
const progressBarEl = document.querySelector<HTMLDivElement>("#progress-bar");
const restartButtonEl =
  document.querySelector<HTMLButtonElement>("#restart-button");

if (storyEl && mapEl && currentStopEl && progressBarEl && restartButtonEl) {
  const story = storyEl;
  const currentStop = currentStopEl;
  const restartButton = restartButtonEl;
  const progressFill =
    progressBarEl.querySelector<HTMLElement>(".progress-fill");
  const progressMarker = progressBarEl.querySelector<HTMLElement>(
    ".progress-marker",
  );
  const progressTrack =
    progressBarEl.querySelector<HTMLElement>(".progress-track");

  const keystoneEls = waypoints.map((waypoint, index) => {
    const keystone = document.createElement("div");
    keystone.className = "progress-keystone";
    keystone.title = waypoint.name;
    const { start, end } = stopRange(index);
    keystone.style.left = `${((start + end) / 2) * 100}%`;
    progressTrack?.appendChild(keystone);
    return keystone;
  });

  if (progressMarker) progressMarker.innerHTML = SHIP_ICON;

  function updateProgressBar(progress: number) {
    const percent = `${progress * 100}%`;
    if (progressFill) progressFill.style.width = percent;
    if (progressMarker) progressMarker.style.left = percent;
  }

  // Scroll rarely lands on exactly 1 (rubber-banding, sub-pixel rounding),
  // so the button appears a hair before the true bottom rather than never.
  const JOURNEY_END_THRESHOLD = 0.995;

  function updateRestartButton(progress: number) {
    restartButton.hidden = progress < JOURNEY_END_THRESHOLD;
  }

  story.innerHTML = waypoints
    .map(
      (waypoint, index) => `
        <section class="stop" data-index="${index}" style="min-height: ${stopHeightVh(index)}vh">
          <div class="stop-content">
            <div class="stop-panel">
              <h2>${waypoint.name}</h2>
              <p>${waypoint.copy}</p>
              <p class="modern-name">Modern-day: ${waypoint.modernName}</p>
              <p class="today-fact">${waypoint.todayFact}</p>
            </div>
          </div>
        </section>
      `,
    )
    .join("");

  const stopEls = story.querySelectorAll<HTMLElement>(".stop");
  // The slide/fade transform below is applied to .stop-panel, not
  // .stop-content: .stop-content stays untransformed and full-height so it
  // remains a continuous hit surface over the map the whole time a stop is
  // on screen (see updateStopContentTransitions for why moving *this* box
  // instead opened a gap for the map's native scroll-zoom to show through).
  const stopPanelEls = story.querySelectorAll<HTMLElement>(".stop-panel");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Fit around every stop rather than a fixed center/zoom, so the overview
  // is correct at any viewport aspect ratio (a 390px-wide phone needs a
  // different zoom than a 1920px-wide desktop to show the same area).
  const overviewBounds = new LngLatBounds();
  for (const waypoint of waypoints) overviewBounds.extend(waypoint.center);
  const overviewPadding = 48;

  const map = new MapLibreMap({
    container: mapEl,
    style: "https://tiles.openfreemap.org/styles/positron",
    bounds: overviewBounds,
    fitBoundsOptions: { padding: overviewPadding },
  });

  const markers = waypoints.map((waypoint) => {
    const el = document.createElement("div");
    el.className = "waypoint-marker";
    el.title = waypoint.name;
    el.innerHTML = ICONS[waypoint.icon];
    return new Marker({ element: el }).setLngLat(waypoint.center).addTo(map);
  });

  // The reader's own position: a ship icon that rides the traveled trail
  // (see updateRoute below), rather than jumping stop to stop like the map
  // camera does.
  const shipEl = document.createElement("div");
  shipEl.className = "ship-marker";
  shipEl.setAttribute("aria-hidden", "true");
  shipEl.innerHTML = SHIP_ICON;
  const shipMarker = new Marker({
    element: shipEl,
    rotationAlignment: "map",
    pitchAlignment: "map",
  })
    .setLngLat(waypoints[0].center)
    .addTo(map);

  function updateShipMarker(traveled: LngLat[]) {
    const lead = traveled[traveled.length - 1] ?? waypoints[0].center;
    shipMarker.setLngLat(lead);

    const prev = traveled[traveled.length - 2];
    if (!prev || reduceMotion) return;
    const dx = lead[0] - prev[0];
    const dy = lead[1] - prev[1];
    if (dx === 0 && dy === 0) return;
    shipMarker.setRotation((Math.atan2(dx, dy) * 180) / Math.PI);
  }

  // The voyage line: a dotted line for the whole planned route, with a
  // solid trail drawn on top of whatever stretch has already been "sailed"
  // (see continuousPosition/splitRoute in voyage.ts). Both wobble a little
  // rather than running straight stop-to-stop, so it reads as a ship's wake
  // instead of a flight path.
  const routeSegments = buildRoute();
  const fullRoute = buildFullRoute(routeSegments);
  let routeReady = false;

  function emptyLine(): LngLat[] {
    const start = fullRoute[0];
    return start ? [start, start] : [];
  }

  // Camera follow/lock: by default the camera tracks the ship's live position
  // on the trail (it's usually mid-transit between stops while a stop's text
  // is on screen); only when the ship is actually near a waypoint does the
  // camera hold the curated center/zoom authored for that stop.
  const LOCK_THRESHOLD = 0.18;
  // Following eases toward its target rather than jumping straight to it:
  // called every scroll frame, a fresh short ease re-targets from wherever
  // the camera currently is, so it reads as a continuous chase rather than
  // a series of instant cuts — including the moment a lock releases and the
  // camera has to cross the gap back to the ship in one go.
  const FOLLOW_EASE_MS = 220;
  let lockedIndex: number | null = null;

  function updateCamera(position: number, leadPoint: LngLat | undefined) {
    const nearest = Math.round(position);
    const distance = Math.abs(position - nearest);

    if (distance < LOCK_THRESHOLD) {
      if (lockedIndex !== nearest) {
        lockedIndex = nearest;
        const waypoint = waypoints[nearest];
        map.flyTo({
          center: waypoint.center,
          zoom: waypoint.zoom,
          duration: reduceMotion ? 0 : 1200,
          essential: true,
        });
      }
      return;
    }

    lockedIndex = null;
    if (!leadPoint) return;
    const segIndex = Math.min(Math.max(Math.floor(position), 0), waypoints.length - 2);
    const localT = Math.min(Math.max(position - segIndex, 0), 1);
    const zoom =
      waypoints[segIndex].zoom +
      (waypoints[segIndex + 1].zoom - waypoints[segIndex].zoom) * localT;
    map.easeTo({
      center: leadPoint,
      zoom,
      duration: reduceMotion ? 0 : FOLLOW_EASE_MS,
      essential: true,
    });
  }

  function updateRoute(position: number): LngLat[] {
    const { traveled } = splitRoute(routeSegments, position);
    updateShipMarker(traveled);

    if (routeReady) {
      const source = map.getSource("voyage-traveled") as
        | GeoJSONSource
        | undefined;
      source?.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: traveled.length >= 2 ? traveled : emptyLine(),
        },
      });
    }
    return traveled;
  }

  // -1 means "showing the whole-voyage overview, no stop active yet" —
  // the state the map is already in via `bounds` above, before any scroll.
  let currentIndex = -1;

  function clearActiveMarkers() {
    for (const stopEl of stopEls) {
      stopEl.classList.remove("is-active");
      stopEl.removeAttribute("aria-current");
    }
    for (const marker of markers) {
      marker.getElement().classList.remove("is-active");
    }
    for (const keystone of keystoneEls) {
      keystone.classList.remove("is-active");
    }
  }

  function showOverview() {
    const wasShowingAStop = currentIndex !== -1;
    currentIndex = -1;
    lockedIndex = null;
    if (wasShowingAStop) {
      map.fitBounds(overviewBounds, {
        padding: overviewPadding,
        duration: reduceMotion ? 0 : 1500,
      });
    }
    clearActiveMarkers();
    currentStop.textContent = "An overview of the whole voyage, Troy to Ithaca.";
  }

  function setActiveStop(index: number) {
    if (index === currentIndex) return;
    currentIndex = index;
    const waypoint = waypoints[index];

    clearActiveMarkers();
    stopEls[index].classList.add("is-active");
    stopEls[index].setAttribute("aria-current", "true");
    markers[index].getElement().classList.add("is-active");
    keystoneEls[index].classList.add("is-active");

    currentStop.textContent = waypoint.name;
  }

  // Each stop's text panel is pinned (via CSS `position: sticky` on the
  // outer .stop-content) for the first STOP_LOCK_FRACTION of that stop's own
  // scroll range, then visually slides away over the rest — driven by raw
  // (non-eased) scroll progress, since it should track the reader's actual
  // scroll input rather than the ship's "lingers near port" easing used for
  // the map camera.
  //
  // The transform/opacity below is applied to the *inner* .stop-panel, never
  // to .stop-content itself. .stop-content is the full-height sticky box
  // that keeps the map covered (and its wheel input reaching the page
  // instead of the map) for the entire time a stop is on screen; only the
  // decorative panel inside it slides away. Moving .stop-content itself used
  // to open a gap — once translated partway up, its hit box no longer
  // covered the bottom of the viewport, exposing the fixed #map underneath
  // to the cursor mid-transition (the reported "scroll grabs the map
  // instead" bug). translateY is in vh, not %, because .stop-panel is only
  // as tall as its content, not 100vh — a percentage of its own height
  // wouldn't clear the screen.
  //
  // This is applied to *every* stop every tick (not just the active one):
  // `position: sticky` naturally un-pins .stop-content over the last 100vh
  // of its own container regardless of STOP_LOCK_FRACTION, so once a stop
  // stopped being "active" and its transform was reset to "", it would snap
  // from wherever our 25%/75% curve had left it to wherever that native
  // fixed-100vh unstick math put it — a visible jump right at the boundary.
  // Applying the same formula continuously to already-passed stops instead
  // leaves them explicitly pinned at their fully-transitioned end state
  // (translateY(-100vh), opacity 0), so there's nothing for native sticky to
  // visibly override.
  function updateStopContentTransitions(clamped: number) {
    const raw = continuousPosition(clamped);
    stopPanelEls.forEach((el, index) => {
      const local = raw - index;
      const t = stopTransitionProgress(local);
      el.style.transform = `translateY(${-t * 100}vh)`;
      el.style.opacity = `${1 - t}`;
    });
  }

  function updateFromScroll() {
    const rect = story.getBoundingClientRect();
    const scrolled = -rect.top;

    if (scrolled <= 0) {
      showOverview();
      updateProgressBar(0);
      updateRoute(0);
      updateStopContentTransitions(0);
      updateRestartButton(0);
      return;
    }

    const scrollable = rect.height - window.innerHeight;
    const progress = scrollable > 0 ? scrolled / scrollable : 0;
    const clamped = Math.min(Math.max(progress, 0), 1);
    const activeIndex = activeWaypoint(clamped);
    setActiveStop(activeIndex);
    updateStopContentTransitions(clamped);
    updateProgressBar(clamped);
    updateRestartButton(clamped);
    const eased = easedPosition(clamped);
    const traveled = updateRoute(eased);
    updateCamera(eased, traveled[traveled.length - 1]);
  }

  let ticking = false;
  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateFromScroll();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);

  // Keyboard nav jumps a whole stop at a time rather than nudging scroll
  // position, so it reads as "go to the next stop" instead of "scroll a
  // bit" — landing mid-way through a stop's own scroll range (not right at
  // its boundary) keeps it clear of the neighbouring stop's activation edge.
  const NEXT_KEYS = new Set(["ArrowDown", "ArrowRight", " ", "Spacebar"]);
  const PREV_KEYS = new Set(["ArrowUp", "ArrowLeft"]);
  const INTERACTIVE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"]);

  function isInteractiveTarget(target: EventTarget | null): boolean {
    return (
      target instanceof HTMLElement &&
      (target.isContentEditable || INTERACTIVE_TAGS.has(target.tagName))
    );
  }

  function scrollYForProgress(progress: number): number {
    const rect = story.getBoundingClientRect();
    const storyTop = window.scrollY + rect.top;
    const scrollable = Math.max(story.offsetHeight - window.innerHeight, 0);
    return storyTop + scrollable * progress;
  }

  function scrollToStop(index: number) {
    const clamped = Math.min(Math.max(index, -1), waypoints.length - 1);
    if (clamped < 0) {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    const { start, end } = stopRange(clamped);
    const top = scrollYForProgress((start + end) / 2);
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  }

  restartButton.addEventListener("click", () => {
    scrollToStop(-1);
  });

  window.addEventListener("keydown", (event) => {
    if (isInteractiveTarget(event.target)) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (NEXT_KEYS.has(event.key)) {
      event.preventDefault();
      scrollToStop(currentIndex + 1);
    } else if (PREV_KEYS.has(event.key)) {
      event.preventDefault();
      scrollToStop(currentIndex - 1);
    }
  });

  map.on("load", () => {
    map.addSource("voyage-route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: fullRoute },
      },
    });
    map.addSource("voyage-traveled", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: emptyLine() },
      },
    });

    // Dotted route first, solid traveled trail second, so the solid trail
    // visually overwrites the dots along the stretch already sailed.
    map.addLayer({
      id: "voyage-route-dotted",
      type: "line",
      source: "voyage-route",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#f4f1ea",
        "line-width": 2.5,
        "line-opacity": 0.55,
        "line-dasharray": [0, 2],
      },
    });
    map.addLayer({
      id: "voyage-route-traveled",
      type: "line",
      source: "voyage-traveled",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#d9a441",
        "line-width": 3,
      },
    });

    routeReady = true;
    updateFromScroll();
  });
}
