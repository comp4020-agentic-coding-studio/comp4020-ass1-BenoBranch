import { describe, expect, it } from "vitest";
import { activeWaypoint, waypoints } from "../voyage";

// Assignment 1's spec: "the visitor does something that changes what they
// see — state the core interaction plainly enough to write a test for it."
// Here that's scrolling: the map camera should track the voyage as the
// visitor scrolls, moving through Odysseus's stops from Troy to Ithaca.
//
// `activeWaypoint` is the contract, not the map itself: a pure function from
// scroll progress to "which stop is current" that main.ts wires up to a real
// scroll/IntersectionObserver listener and the map camera. Testing the pure
// function means this stays green through a rewrite of the map layer, and
// doesn't need jsdom to fake WebGL.

describe("assignment-1: scrolling moves the voyage forward", () => {
  it("has more than one waypoint to move between", () => {
    expect(waypoints.length).toBeGreaterThan(1);
  });

  it("starts at Troy when the visitor hasn't scrolled", () => {
    expect(activeWaypoint(0)).toBe(0);
  });

  it("ends at Ithaca once the visitor has scrolled through the whole story", () => {
    expect(activeWaypoint(1)).toBe(waypoints.length - 1);
  });

  it("only moves forward as scroll progress increases — never skips backward", () => {
    const samples = Array.from({ length: 21 }, (_, i) => i / 20);
    const indices = samples.map(activeWaypoint);
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThanOrEqual(indices[i - 1]);
    }
  });
});
