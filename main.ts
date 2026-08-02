import { Map as MapLibreMap } from "maplibre-gl";
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

  const map = new MapLibreMap({
    container: mapEl,
    style: "https://tiles.openfreemap.org/styles/positron",
    center: waypoints[0].center,
    zoom: waypoints[0].zoom,
  });

  let currentIndex = -1;

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

    for (const stopEl of stopEls) {
      const isActive = Number(stopEl.dataset.index) === index;
      stopEl.classList.toggle("is-active", isActive);
      if (isActive) {
        stopEl.setAttribute("aria-current", "true");
      } else {
        stopEl.removeAttribute("aria-current");
      }
    }

    currentStop.textContent = waypoint.name;
  }

  function updateFromScroll() {
    const rect = story.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const scrolled = -rect.top;
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
