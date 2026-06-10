import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import getRepository from "../../RepositoryFactory";
import { createApp } from "../../app";

describe("GET /search", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    const repository = await getRepository();
    app = createApp(repository);
  });

  it("returns trails for name search", async () => {
    const response = await request(app)
      .get("/search?query=Hornsgatan")
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].properties.name).toBe("Hornsgatan Cycleway");
    expect(response.body[0].properties.type).toBe("trail");
  });

  it("prioritizes routes over trails when both match", async () => {
    const response = await request(app)
      .get("/search?query=Stockholm")
      .expect(200);

    const types = response.body.map((f: GeoJSON.Feature) => f.properties?.type);
    const firstRouteIndex = types.indexOf("route");
    const firstTrailIndex = types.indexOf("trail");

    if (firstRouteIndex >= 0 && firstTrailIndex >= 0) {
      expect(firstRouteIndex).toBeLessThan(firstTrailIndex);
    }
  });

  it("returns empty array for no matches", async () => {
    const response = await request(app)
      .get("/search?query=NonexistentTrail12345")
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it("returns 400 for missing query parameter", async () => {
    await request(app).get("/search").expect(400);
  });

  it("includes CORS headers", async () => {
    const response = await request(app).get("/search?query=MTB").expect(200);

    expect(response.headers["access-control-allow-origin"]).toBe("*");
  });
});
