import type { IconName } from "./icons";

export interface Waypoint {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
  copy: string;
  icon: IconName;
}

// Traditional/legendary identifications, not verified history — the Odyssey's
// geography has been argued over since antiquity. That uncertainty is part of
// what this page is about, not a gap to paper over.
export const waypoints: Waypoint[] = [
  {
    id: "troy",
    name: "Troy",
    center: [26.239, 39.957],
    zoom: 11,
    copy: "Ten years of war are over. Odysseus loads his ships and turns for Ithaca — a few weeks' sail away, by any reasonable estimate. It will take him ten years.",
    icon: "helmet",
  },
  {
    id: "cicones",
    name: "The Cicones",
    center: [25.543, 40.876],
    zoom: 9,
    copy: "The first stop, and the first mistake: his men raid the Cicones' coast, linger to feast on the spoils, and are still there when the counterattack comes.",
    icon: "flame",
  },
  {
    id: "lotus-eaters",
    name: "The Lotus-Eaters",
    center: [10.845, 33.808],
    zoom: 8,
    copy: "A storm blows the fleet off any known map. The people here offer a flower that erases the wish to go anywhere else. Odysseus drags his men back to the ships by force.",
    icon: "flower",
  },
  {
    id: "cyclops",
    name: "The Cyclops's Isle",
    center: [15.087, 37.734],
    zoom: 9,
    copy: "Polyphemus traps them in his cave and eats two men a night. Odysseus blinds him and escapes — then can't resist shouting his real name back at the shore, giving a vengeful god a target.",
    icon: "eye",
  },
  {
    id: "aeolia",
    name: "Aeolia, Keeper of the Winds",
    center: [14.960, 38.476],
    zoom: 9,
    copy: "Aeolus gives Odysseus a bag holding every wind but the one he needs. Ithaca comes into view. His crew, sure it's hoarded treasure, opens the bag while he sleeps.",
    icon: "wind",
  },
  {
    id: "circe",
    name: "Circe's Aeaea",
    center: [13.070, 41.219],
    zoom: 10,
    copy: "Circe turns his men into pigs, then — once Odysseus resists her magic — into a year of feasting he doesn't leave of his own accord. His crew has to talk him back to the ships.",
    icon: "pig",
  },
  {
    id: "sirens",
    name: "The Sirens' Isles",
    center: [14.443, 40.586],
    zoom: 10,
    copy: "A song that has drowned every sailor who ever heard it. Odysseus wants to hear it anyway, so his men bind him to the mast and stop their own ears with wax.",
    icon: "note",
  },
  {
    id: "scylla-charybdis",
    name: "Scylla & Charybdis",
    center: [15.566, 38.234],
    zoom: 10,
    copy: "A strait too narrow to avoid both: a six-headed monster on one shore, a whirlpool that swallows the sea itself on the other. He chooses the monster, and loses six men to save the rest.",
    icon: "whirlpool",
  },
  {
    id: "ogygia",
    name: "Calypso's Ogygia",
    center: [14.257, 36.044],
    zoom: 10,
    copy: "The last of his crew are gone. Calypso keeps Odysseus on her island for seven years, offering immortality if he'll stay. He spends every one of them wanting to leave.",
    icon: "island",
  },
  {
    id: "ithaca",
    name: "Ithaca",
    center: [20.712, 38.423],
    zoom: 11,
    copy: "Twenty years after he left for Troy, Odysseus reaches home alone, in a stranger's cloak, to find his own house full of men who assume he's already dead.",
    icon: "home",
  },
];

export function activeWaypoint(progress: number): number {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return Math.min(Math.floor(clamped * waypoints.length), waypoints.length - 1);
}

// Continuous counterpart to activeWaypoint: instead of snapping to a stop
// index, this gives a fractional position along the chain of stops (0 at
// Troy, waypoints.length - 1 at Ithaca) so the voyage line can creep forward
// smoothly within a stop's own scroll range rather than jumping stop to stop.
export function continuousPosition(progress: number): number {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return Math.min(clamped * waypoints.length, waypoints.length - 1);
}

// Asymmetric per-segment ease: leaving a waypoint ramps up slowly (a long,
// gradual return to cruising speed), while approaching one brakes over a
// shorter final stretch (a brisker deceleration into port). Both halves are
// zero-derivative at their own end (f=0 and f=1) and meet at (0.5, 0.5).
const LEAVE_POWER = 4;
const APPROACH_POWER = 2;

function easeSegmentFraction(f: number): number {
  if (f < 0.5) {
    const t = f / 0.5;
    return 0.5 * Math.pow(t, LEAVE_POWER);
  }
  const t = (f - 0.5) / 0.5;
  return 0.5 + 0.5 * (1 - Math.pow(1 - t, APPROACH_POWER));
}

// Eased counterpart to continuousPosition: the ship lingers near each
// waypoint (slow to leave, brisk to arrive) and moves quickly through open
// water, instead of at constant scroll-linear speed.
export function easedPosition(progress: number): number {
  const raw = continuousPosition(progress);
  const segmentCount = waypoints.length - 1;
  if (segmentCount <= 0) return raw;
  const i = Math.min(Math.floor(raw), segmentCount - 1);
  const f = Math.min(Math.max(raw - i, 0), 1);
  return i + easeSegmentFraction(f);
}

export type LngLat = [number, number];

export interface RouteSegment {
  points: LngLat[];
}

const SAMPLES_PER_SEGMENT = 48;

// Deterministic PRNG (mulberry32) rather than Math.random: each segment's
// wobble should be stable across reloads, not reshuffled every render.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A straight line between stops reads as a flight path, not a ship's wake.
// Bow the segment out with a couple of sine harmonics, damped to zero at
// both ends (the envelope) so it still passes exactly through each
// waypoint dot rather than cutting the corner.
function buildSegment(a: LngLat, b: LngLat, seed: number): LngLat[] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length = Math.hypot(dx, dy);
  const nx = length === 0 ? 0 : -dy / length;
  const ny = length === 0 ? 0 : dx / length;

  const rand = mulberry32(seed);
  const primaryAmplitude = length * (0.08 + rand() * 0.1) * (rand() < 0.5 ? -1 : 1);
  const secondaryAmplitude = primaryAmplitude * 0.35;
  const secondaryFrequency = 2 + Math.floor(rand() * 2);
  const phase = rand() * Math.PI * 2;

  const points: LngLat[] = [];
  for (let i = 0; i <= SAMPLES_PER_SEGMENT; i++) {
    const t = i / SAMPLES_PER_SEGMENT;
    const envelope = Math.sin(Math.PI * t);
    const offset =
      envelope *
      (primaryAmplitude * Math.sin(Math.PI * t + phase) +
        secondaryAmplitude * Math.sin(secondaryFrequency * Math.PI * t));
    points.push([a[0] + dx * t + nx * offset, a[1] + dy * t + ny * offset]);
  }
  return points;
}

export function buildRoute(): RouteSegment[] {
  const segments: RouteSegment[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    segments.push({
      points: buildSegment(waypoints[i].center, waypoints[i + 1].center, i + 1),
    });
  }
  return segments;
}

// Concatenates every segment's samples into one line, dropping each
// segment's first point after the first (it's shared with the previous
// segment's last point).
export function buildFullRoute(segments: RouteSegment[]): LngLat[] {
  const points: LngLat[] = [];
  segments.forEach((segment, i) => {
    points.push(...segment.points.slice(i === 0 ? 0 : 1));
  });
  return points;
}

function lerpPoint(a: LngLat, b: LngLat, t: number): LngLat {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// Splits the route at a fractional position (see continuousPosition) into
// the stretch already sailed and the stretch still ahead, so the caller can
// render one as a solid trail and the other as the dotted route-to-come.
export function splitRoute(
  segments: RouteSegment[],
  position: number,
): { traveled: LngLat[]; remaining: LngLat[] } {
  const clamped = Math.min(Math.max(position, 0), segments.length);
  const segIndex = Math.min(Math.floor(clamped), segments.length - 1);
  const localT = clamped - segIndex;

  const traveled: LngLat[] = [];
  const remaining: LngLat[] = [];

  segments.forEach((segment, i) => {
    const pts = segment.points;
    if (i < segIndex) {
      traveled.push(...pts.slice(i === 0 ? 0 : 1));
    } else if (i > segIndex) {
      remaining.push(...pts.slice(1));
    } else {
      const idx = localT * SAMPLES_PER_SEGMENT;
      const i0 = Math.floor(idx);
      const i1 = Math.min(i0 + 1, SAMPLES_PER_SEGMENT);
      const frac = idx - i0;
      const leadPoint = lerpPoint(pts[i0], pts[i1], frac);

      traveled.push(...pts.slice(i === 0 ? 0 : 1, i0 + 1), leadPoint);
      remaining.push(leadPoint, ...pts.slice(i0 + 1));
    }
  });

  return { traveled, remaining };
}
