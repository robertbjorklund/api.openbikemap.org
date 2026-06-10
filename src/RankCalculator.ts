import * as GeoJSON from "geojson";
import { FeatureType } from "./format";

export function calculateFeatureLengthKm(feature: GeoJSON.Feature): number {
  const properties = feature.properties;
  if (!properties) {
    return 0;
  }

  if (
    properties.type === FeatureType.Trail &&
    typeof properties.lengthMeters === "number"
  ) {
    return properties.lengthMeters / 1000;
  }

  if (properties.type === FeatureType.Route && properties.distance) {
    const distance = String(properties.distance);
    const kmMatch = distance.match(/([\d.]+)\s*km/i);
    if (kmMatch) {
      return parseFloat(kmMatch[1]);
    }
    const numeric = parseFloat(distance.replace(/[^\d.]/g, ""));
    return isNaN(numeric) ? 0 : numeric;
  }

  return 0;
}

export function normalizeToRank(lengthInKm: number): number {
  if (lengthInKm <= 0) {
    return 0;
  }

  const rank = Math.log10(lengthInKm + 1) * 2.5;
  return Math.min(5, Math.max(0, rank));
}

export function calculateRank(feature: GeoJSON.Feature): number {
  return normalizeToRank(calculateFeatureLengthKm(feature));
}
