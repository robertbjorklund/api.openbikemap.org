import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { Repository } from "../../Repository";
import getRepository from "../../RepositoryFactory";

describe("GET /features/:entityType/:id.geojson", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    const repository = await getRepository();
    app = createApp(repository);
  });

  it("returns a feature by OpenStreetMap ID", async () => {
    const response = await request(app)
      .get("/features/openstreetmap/way%2F100001.geojson")
      .expect(200);

    expect(response.body.properties.type).toBe("trail");
    expect(response.body.properties.sources).toContainEqual({
      type: "openstreetmap",
      id: "way/100001",
    });
  });

  it("returns 404 for unknown source ID", async () => {
    await request(app)
      .get("/features/openstreetmap/way%2F999999999.geojson")
      .expect(404);
  });

  it("returns 400 for unknown entity type", async () => {
    await request(app)
      .get("/features/skimap_org/123.geojson")
      .expect(400);
  });
});

describe("GET /features/:id.geojson", () => {
  let app: ReturnType<typeof createApp>;
  let repository: Repository;

  beforeAll(async () => {
    repository = await getRepository();
    app = createApp(repository);
  });

  it("returns a trail by canonical ID", async () => {
    const response = await request(app)
      .get("/features/trail_hornsgatan_cycleway_001.geojson")
      .expect(200);

    expect(response.body.properties.type).toBe("trail");
    expect(response.body.properties.id).toBe("trail_hornsgatan_cycleway_001");
  });

  it("returns a route by canonical ID", async () => {
    const response = await request(app)
      .get("/features/route_stockholm_lcn_001.geojson")
      .expect(200);

    expect(response.body.properties.type).toBe("route");
  });

  it("returns 404 for non-existent feature ID", async () => {
    await request(app)
      .get("/features/nonexistent-id-12345.geojson")
      .expect(404);
  });
});

describe("GET /features/groups/:groupId.geojson", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    const repository = await getRepository();
    app = createApp(repository);
  });

  it("returns all features in a group", async () => {
    const response = await request(app)
      .get("/features/groups/group_stockholm_lcn.geojson")
      .expect(200);

    expect(response.body.type).toBe("FeatureCollection");
    expect(response.body.features).toHaveLength(2);
    expect(
      response.body.features.every(
        (feature: { properties: { groupId: string } }) =>
          feature.properties.groupId === "group_stockholm_lcn",
      ),
    ).toBe(true);
  });

  it("returns 404 for unknown groupId", async () => {
    await request(app)
      .get("/features/groups/nonexistent-group.geojson")
      .expect(404);
  });
});
