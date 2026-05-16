import { describe, it, expect } from "vitest";
import { haversineDistance, isWithinRadius } from "../gps";

describe("haversineDistance", () => {
  it("returns 0 for same point", () => {
    expect(haversineDistance(48.8566, 2.3522, 48.8566, 2.3522)).toBe(0);
  });

  it("calculates Paris to London ~344km", () => {
    const dist = haversineDistance(48.8566, 2.3522, 51.5074, -0.1278);
    expect(dist).toBeGreaterThan(300_000);
    expect(dist).toBeLessThan(400_000);
  });

  it("returns ~111km for 1 degree latitude", () => {
    const dist = haversineDistance(0, 0, 1, 0);
    expect(dist).toBeGreaterThan(110_000);
    expect(dist).toBeLessThan(112_000);
  });
});

describe("isWithinRadius", () => {
  it("returns true for points within radius", () => {
    const result = isWithinRadius(48.8566, 2.3522, 48.857, 2.3522, 100);
    expect(result).toBe(true);
  });

  it("returns false for points far apart", () => {
    const result = isWithinRadius(48.8566, 2.3522, 48.86, 2.36, 200);
    expect(result).toBe(false);
  });
});
