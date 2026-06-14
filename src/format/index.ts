/**
 * Shared feature types for OpenBikeMap API and data processor.
 * Will move to openbikedata-format npm package later.
 */
export enum FeatureType {
  Trail = "trail",
  Route = "route",
}

export enum TrailCategory {
  MtbTrail = "mtb_trail",
}

export enum Status {
  Operating = "operating",
  Disused = "disused",
  Abandoned = "abandoned",
  Proposed = "proposed",
  Planned = "planned",
  Construction = "construction",
}

export enum SourceType {
  OPENSTREETMAP = "openstreetmap",
}

export interface Source {
  type: SourceType;
  id: string;
}

export interface TrailProperties {
  type: FeatureType.Trail;
  id: string;
  /** Stable id for all segments of the same logical trail (name/ref group). */
  groupId: string | null;
  category: TrailCategory;
  name: string | null;
  ref: string | null;
  surface: string | null;
  smoothness: string | null;
  tracktype: string | null;
  mtbScale: number | null;
  sacScale: string | null;
  bicycle: string | null;
  lit: boolean | null;
  oneway: boolean | null;
  network: string | null;
  lengthMeters: number | null;
  status: Status;
  sources: Source[];
}

export interface RouteProperties {
  type: FeatureType.Route;
  id: string;
  /** Stable id for all segments of the same logical route (name/ref group). */
  groupId: string | null;
  name: string | null;
  ref: string | null;
  network: string | null;
  distance: string | null;
  roundtrip: boolean | null;
  status: Status;
  sources: Source[];
}

export type TrailFeature = GeoJSON.Feature<
  GeoJSON.LineString | GeoJSON.MultiLineString,
  TrailProperties
>;

export type RouteFeature = GeoJSON.Feature<
  GeoJSON.LineString | GeoJSON.MultiLineString,
  RouteProperties
>;
