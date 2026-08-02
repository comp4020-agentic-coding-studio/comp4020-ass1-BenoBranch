export interface Waypoint {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
  copy: string;
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
  },
  {
    id: "cicones",
    name: "The Cicones",
    center: [25.543, 40.876],
    zoom: 9,
    copy: "The first stop, and the first mistake: his men raid the Cicones' coast, linger to feast on the spoils, and are still there when the counterattack comes.",
  },
  {
    id: "lotus-eaters",
    name: "The Lotus-Eaters",
    center: [10.845, 33.808],
    zoom: 8,
    copy: "A storm blows the fleet off any known map. The people here offer a flower that erases the wish to go anywhere else. Odysseus drags his men back to the ships by force.",
  },
  {
    id: "cyclops",
    name: "The Cyclops's Isle",
    center: [15.087, 37.734],
    zoom: 9,
    copy: "Polyphemus traps them in his cave and eats two men a night. Odysseus blinds him and escapes — then can't resist shouting his real name back at the shore, giving a vengeful god a target.",
  },
  {
    id: "aeolia",
    name: "Aeolia, Keeper of the Winds",
    center: [14.960, 38.476],
    zoom: 9,
    copy: "Aeolus gives Odysseus a bag holding every wind but the one he needs. Ithaca comes into view. His crew, sure it's hoarded treasure, opens the bag while he sleeps.",
  },
  {
    id: "circe",
    name: "Circe's Aeaea",
    center: [13.070, 41.219],
    zoom: 10,
    copy: "Circe turns his men into pigs, then — once Odysseus resists her magic — into a year of feasting he doesn't leave of his own accord. His crew has to talk him back to the ships.",
  },
  {
    id: "sirens",
    name: "The Sirens' Isles",
    center: [14.443, 40.586],
    zoom: 10,
    copy: "A song that has drowned every sailor who ever heard it. Odysseus wants to hear it anyway, so his men bind him to the mast and stop their own ears with wax.",
  },
  {
    id: "scylla-charybdis",
    name: "Scylla & Charybdis",
    center: [15.566, 38.234],
    zoom: 10,
    copy: "A strait too narrow to avoid both: a six-headed monster on one shore, a whirlpool that swallows the sea itself on the other. He chooses the monster, and loses six men to save the rest.",
  },
  {
    id: "ogygia",
    name: "Calypso's Ogygia",
    center: [14.257, 36.044],
    zoom: 10,
    copy: "The last of his crew are gone. Calypso keeps Odysseus on her island for seven years, offering immortality if he'll stay. He spends every one of them wanting to leave.",
  },
  {
    id: "ithaca",
    name: "Ithaca",
    center: [20.712, 38.423],
    zoom: 11,
    copy: "Twenty years after he left for Troy, Odysseus reaches home alone, in a stranger's cloak, to find his own house full of men who assume he's already dead.",
  },
];

export function activeWaypoint(progress: number): number {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return Math.min(Math.floor(clamped * waypoints.length), waypoints.length - 1);
}
