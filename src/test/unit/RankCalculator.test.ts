import { describe, expect, it } from "vitest";
import * as GeoJSON from "geojson";
import {
  calculateFeatureLengthKm,
  calculateRank,
  normalizeToRank,
} from "../../RankCalculator";

describe("RankCalculator", () => {
  describe("calculateFeatureLengthKm", () => {
    it("returns trail length in kilometers from lengthMeters", () => {
      const feature: GeoJSON.Feature = {
        type: "Feature",
        properties: {
          type: "trail",
          lengthMeters: 2500,
        },
        geometry: { type: "LineString", coordinates: [[0, 0], [1, 1]] },
      };
      expect(calculateFeatureLengthKm(feature)).toBe(2.5);
    });

    it("parses route distance strings", () => {
      const feature: GeoJSON.Feature = {
        type: "Feature",
        properties: {
          type: "route",
          distance: "45 km",
        },
        geometry: { type: "LineString", coordinates: [[0, 0], [1, 1]] },
      };
      expect(calculateFeatureLengthKm(feature)).toBe(45);
    });

    it("returns 0 when no length data exists", () => {
      const feature: GeoJSON.Feature = {
        type: "Feature",
        properties: { type: "trail" },
        geometry: { type: "LineString", coordinates: [[0, 0], [1, 1]] },
      };
      expect(calculateFeatureLengthKm(feature)).toBe(0);
    });
  });

  describe("normalizeToRank", () => {
    it("returns 0 for zero length", () => {
      expect(normalizeToRank(0)).toBe(0);
    });

    it("caps at 5 for very large lengths", () => {
      expect(normalizeToRank(1000)).toBe(5);
    });
  });

  describe("calculateRank", () => {
    it("calculates rank from trail length", () => {
      const feature: GeoJSON.Feature = {
        type: "Feature",
        properties: {
          type: "trail",
          lengthMeters: 10000,
        },
        geometry: { type: "LineString", coordinates: [[0, 0], [1, 1]] },
      };
      expect(calculateRank(feature)).toBeGreaterThan(0);
      expect(calculateRank(feature)).toBeLessThanOrEqual(5);
    });
  });
});
