import { Map as MapLibreMap, Marker, LngLatBounds } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { activeWaypoint, waypoints } from "./voyage";

const storyEl = document.querySelector<HTMLDivElement>("#story");
const mapEl = document.querySelector<HTMLDivElement>("#map");
const currentStopEl = document.querySelector<HTMLElement>("#current-stop");

if (storyEl && mapEl && currentStopEl) {
  const story = storyEl;
  const currentStop = currentStopEl;

  story.innerHTML = waypoints
    .map(
      (waypoint, index) => `
        <section class="stop" data-index="${index}">
          <h2>${waypoint.name}</h2>
          <p>${waypoint.copy}</p>
        </section>
      `,
    )
    .join("");

  const stopEls = story.querySelectorAll<HTMLElement>(".stop");
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
    const dot = document.createElement("div");
    dot.className = "waypoint-dot";
    dot.title = waypoint.name;
    return new Marker({ element: dot }).setLngLat(waypoint.center).addTo(map);
  });

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
  }

  function showOverview() {
    const wasShowingAStop = currentIndex !== -1;
    currentIndex = -1;
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

    map.flyTo({
      center: waypoint.center,
      zoom: waypoint.zoom,
      duration: reduceMotion ? 0 : 1500,
      essential: true,
    });

    clearActiveMarkers();
    stopEls[index].classList.add("is-active");
    stopEls[index].setAttribute("aria-current", "true");
    markers[index].getElement().classList.add("is-active");

    currentStop.textContent = waypoint.name;
  }

  function updateFromScroll() {
    const rect = story.getBoundingClientRect();
    const scrolled = -rect.top;

    if (scrolled <= 0) {
      showOverview();
      return;
    }

    const scrollable = rect.height - window.innerHeight;
    const progress = scrollable > 0 ? scrolled / scrollable : 0;
    setActiveStop(activeWaypoint(progress));
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
  map.on("load", updateFromScroll);
}
