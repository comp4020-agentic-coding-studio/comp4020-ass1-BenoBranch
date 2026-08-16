import { describe, expect, it } from "vitest";
import {
  stopHeightVh,
  stopRange,
  stopTransitionProgress,
  waypoints,
  STOP_LOCK_FRACTION,
} from "./voyage";

// Distance-weighted scroll: real leg distances between waypoints vary
// roughly 20x across the voyage, so a stop covering a long leg (e.g. Calypso's
// Ogygia -> Ithaca) needs proportionally more scroll height than a short one
// (e.g. the Cyclops's Isle -> Aeolia) for the ship and the text to stay in
// sync. These tests pin down that contract.

describe("stopHeightVh", () => {
  it("gives long legs a meaningfully taller stop than short legs", () => {
    const ogygiaIndex = waypoints.findIndex((w) => w.id === "ogygia");
    const cyclopsIndex = waypoints.findIndex((w) => w.id === "cyclops");
    expect(stopHeightVh(ogygiaIndex)).toBeGreaterThan(
      stopHeightVh(cyclopsIndex) * 2,
    );
  });

  it("never gives a stop less than a full viewport", () => {
    for (let i = 0; i < waypoints.length; i++) {
      expect(stopHeightVh(i)).toBeGreaterThanOrEqual(100);
    }
  });
});

describe("stopRange", () => {
  it("starts at 0 and ends at exactly 1", () => {
    expect(stopRange(0).start).toBe(0);
    expect(stopRange(waypoints.length - 1).end).toBe(1);
  });

  it("has no gaps between consecutive stops", () => {
    for (let i = 0; i < waypoints.length - 1; i++) {
      expect(stopRange(i).end).toBe(stopRange(i + 1).start);
    }
  });

  it("is monotonically increasing", () => {
    for (let i = 0; i < waypoints.length; i++) {
      const { start, end } = stopRange(i);
      expect(end).toBeGreaterThan(start);
    }
  });
});

describe("stopTransitionProgress", () => {
  it("stays locked (0) for the first STOP_LOCK_FRACTION of a stop's range", () => {
    expect(stopTransitionProgress(0)).toBe(0);
    expect(stopTransitionProgress(STOP_LOCK_FRACTION)).toBe(0);
  });

  it("reaches 1 at the end of a stop's range", () => {
    expect(stopTransitionProgress(1)).toBe(1);
  });

  it("is monotonically non-decreasing across the transition", () => {
    const samples = Array.from({ length: 21 }, (_, i) => i / 20);
    const values = samples.map(stopTransitionProgress);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });
});
