// Small line-icon set, one per waypoint, plus the ship that marks the
// reader's current position. All are 24x24, single-colour (currentColor),
// so they inherit whatever palette the page defines instead of hardcoding
// hex values here.
const SVG_OPEN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const SVG_CLOSE = "</svg>";

export type IconName =
  | "helmet"
  | "flame"
  | "flower"
  | "eye"
  | "wind"
  | "pig"
  | "note"
  | "whirlpool"
  | "island"
  | "home";

export const ICONS: Record<IconName, string> = {
  // Troy: a Corinthian helmet, dome + cheek guards + nose guard.
  helmet:
    SVG_OPEN +
    '<path d="M5 15.5V11a7 7 0 0 1 14 0v4.5"/>' +
    '<path d="M5 15.5h3l.7-2h6.6l.7 2h3"/>' +
    '<path d="M9 8c1-1 2-1.5 3-1.5"/>' +
    SVG_CLOSE,

  // The Cicones: a raider's flame.
  flame:
    SVG_OPEN +
    '<path d="M12 3c1 3-2.2 4.5-2.2 8a3.2 3.2 0 0 0 6.4 0c0-1.7-.8-2.8-1.6-3.5.2 1.4-.6 2.3-1.4 2.5.7-2.4-1.2-4-1.2-7z"/>' +
    SVG_CLOSE,

  // The Lotus-Eaters: a four-petal lotus blossom.
  flower:
    SVG_OPEN +
    '<path d="M12 4.5c1.6 0 2.9 1.7 2.9 3.2S13.6 11 12 11s-2.9-1.6-2.9-3.3S10.4 4.5 12 4.5z"/>' +
    '<path d="M12 19.5c1.6 0 2.9-1.6 2.9-3.2S13.6 13 12 13s-2.9 1.6-2.9 3.3 1.3 3.2 2.9 3.2z"/>' +
    '<path d="M4.5 12c0-1.6 1.7-2.9 3.3-2.9S11 10.4 11 12s-1.6 2.9-3.2 2.9S4.5 13.6 4.5 12z"/>' +
    '<path d="M19.5 12c0 1.6-1.7 2.9-3.3 2.9S13 13.6 13 12s1.6-2.9 3.2-2.9 3.3 1.3 3.3 2.9z"/>' +
    '<circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>' +
    SVG_CLOSE,

  // The Cyclops: a single eye.
  eye:
    SVG_OPEN +
    '<path d="M2 12c2.5-4.4 6.5-7 10-7s7.5 2.6 10 7c-2.5 4.4-6.5 7-10 7s-7.5-2.6-10-7z"/>' +
    '<circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/>' +
    SVG_CLOSE,

  // Aeolia: the wind, given as king Aeolus's gift.
  wind:
    SVG_OPEN +
    '<path d="M3 9h11a2.5 2.5 0 1 0-2.2-3.7"/>' +
    '<path d="M3 13h15a2.5 2.5 0 1 1-2.2 3.7"/>' +
    '<path d="M3 17h8"/>' +
    SVG_CLOSE,

  // Circe: the pig her potion makes of Odysseus's men.
  pig:
    SVG_OPEN +
    '<path d="M8 9a4 4 0 1 1 8 0v2a4 4 0 0 1-8 0z"/>' +
    '<path d="M7 8 5.5 6.5M17 8l1.5-1.5"/>' +
    '<circle cx="10" cy="12" r="0.6" fill="currentColor" stroke="none"/>' +
    '<circle cx="14" cy="12" r="0.6" fill="currentColor" stroke="none"/>' +
    SVG_CLOSE,

  // The Sirens: their song.
  note:
    SVG_OPEN +
    '<path d="M9 17a2.5 2.5 0 1 1-1.8-2.4M9 17V5l9-2v11"/>' +
    '<path d="M18 14a2.5 2.5 0 1 1-1.8-2.4"/>' +
    SVG_CLOSE,

  // Scylla & Charybdis: the whirlpool.
  whirlpool:
    SVG_OPEN +
    '<path d="M20 12a8 8 0 1 0-8 8 6 6 0 1 1 6-6 4 4 0 1 0-4-4"/>' +
    SVG_CLOSE,

  // Ogygia: Calypso's island.
  island:
    SVG_OPEN +
    '<path d="M4 17c2-1 4-1.5 8-1.5s6 .5 8 1.5"/>' +
    '<path d="M12 15V8"/>' +
    '<path d="M12 8c-1.5-1-3-1-4 0M12 8c1.5-1 3-1 4 0M12 8c-2-2-2-3.5-1-4.5"/>' +
    SVG_CLOSE,

  // Ithaca: home.
  home:
    SVG_OPEN +
    '<path d="M4 12l8-7 8 7"/>' +
    '<path d="M6 11v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7"/>' +
    '<path d="M10 19v-4h4v4"/>' +
    SVG_CLOSE,
};

// The reader's own position: a Greek galley, side-on, with the curled
// stern (aphlaston) that marked a warship of the period.
export const SHIP_ICON =
  SVG_OPEN +
  '<path d="M3 16c2 2 5 3 9 3s7-1 9-3"/>' +
  '<path d="M5 16l1-4h12l1 4"/>' +
  '<path d="M12 12V4"/>' +
  '<path d="M12 5h5l-1 6h-4z"/>' +
  '<path d="M19 12c1.2-1.4 1.6-3 .8-5.5"/>' +
  SVG_CLOSE;
