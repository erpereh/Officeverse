import { describe, expect, it } from "vitest";

import { getAssetDefinition } from "@/lib/assets";
import {
  createObjectFromAsset,
  deleteObjectAt,
  getRotatedGridSize,
  moveObjectAt,
  placeObject,
  rotateQuarterTurn,
} from "@/lib/office-editor";
import {
  createEmptyOfficeObjects,
  createDefaultOfficeObjects,
  defaultOfficeHeight,
  defaultOfficeWidth,
  fitMapToViewport,
  gridToPixel,
  isGridBlocked,
  officeSpawnPoint,
} from "@/lib/office";

describe("office bootstrap", () => {
  it("creates empty objects for a new office", () => {
    expect(createEmptyOfficeObjects()).toEqual([]);
  });

  it("creates deterministic template objects on demand", () => {
    const objects = createDefaultOfficeObjects("office-1", "user-1");

    expect(objects).toHaveLength(112);
    expect(objects.map((object) => object.asset_key)).toEqual(
      expect.arrayContaining([
        "building_wall_column",
        "building_wall_panel_wide",
        "building_trim_white_long",
        "building_rug_beige_large",
        "building_floor_carpet_teal",
        "office_kanban_board",
        "office_whiteboard",
        "office_chart_board",
        "office_editor_wardrobe",
        "office_corner_desk",
        "office_automation_command_center",
        "office_server_rack",
        "office_sofa_teal",
        "office_plant_tall",
      ]),
    );
    expect(objects.every((object) => object.office_id === "office-1")).toBe(true);
    expect(objects.every((object) => object.user_id === "user-1")).toBe(true);
    expect(objects.every((object) => getAssetDefinition(object.asset_key))).toBe(true);
    expect(objects.some((object) => object.asset_key.startsWith("building_door"))).toBe(false);
    expect(objects.some((object) => object.asset_key.startsWith("building_window"))).toBe(false);
    expect(objects.some((object) => object.asset_key === "building_exit_arrow_sign")).toBe(false);
  });

  it("keeps template objects inside bounds using persisted metadata", () => {
    const objects = createDefaultOfficeObjects("office-1", "user-1");
    const keys = objects.map((object) => object.asset_key);

    expect(keys).toEqual(
      expect.arrayContaining([
        "building_rug_beige_large",
        "building_floor_carpet_teal",
        "office_corner_desk",
        "office_automation_command_center",
        "office_server_rack",
        "office_sofa_teal",
        "office_editor_wardrobe",
      ]),
    );

    for (const object of objects) {
      const width = Number(object.metadata?.grid_w ?? 1);
      const height = Number(object.metadata?.grid_h ?? 1);

      expect(object.x, object.asset_key).toBeGreaterThanOrEqual(1);
      expect(object.y, object.asset_key).toBeGreaterThanOrEqual(1);
      expect(object.x + width, object.asset_key).toBeLessThanOrEqual(defaultOfficeWidth);
      expect(object.y + height, object.asset_key).toBeLessThanOrEqual(defaultOfficeHeight);
    }

    expect(objects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ asset_key: "building_rug_beige_large", x: 18, y: 17, metadata: { grid_w: 4, grid_h: 4 } }),
        expect.objectContaining({ asset_key: "building_floor_carpet_teal", x: 18, y: 9, metadata: { grid_w: 4, grid_h: 4 } }),
        expect.objectContaining({ asset_key: "office_automation_command_center", x: 18, y: 9 }),
        expect.objectContaining({ asset_key: "office_sofa_teal", x: 32, y: 18 }),
        expect.objectContaining({ asset_key: "office_editor_wardrobe", x: 9, y: 8 }),
      ]),
    );
  });

  it("converts grid coordinates to scaled pixel positions", () => {
    expect(gridToPixel({ x: 3, y: 4 }, 16, 3)).toEqual({ x: 144, y: 192 });
  });

  it("fits the full map inside the available viewport", () => {
    const fit = fitMapToViewport(
      { width: 1280, height: 720 },
      { width: defaultOfficeWidth * 16 * 3, height: defaultOfficeHeight * 16 * 3 },
    );

    expect(fit.displayWidth).toBeLessThanOrEqual(1280);
    expect(fit.displayHeight).toBeLessThanOrEqual(720);
    expect(fit.offsetX).toBeGreaterThanOrEqual(0);
    expect(fit.offsetY).toBeGreaterThanOrEqual(0);
  });

  it("keeps the spawn point clear in the furnished office", () => {
    const objects = createDefaultOfficeObjects("office-1", "user-1");

    expect(officeSpawnPoint).toEqual({ x: 20, y: 19 });
    expect(objects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ asset_key: "building_rug_beige_large", x: 18, y: 17 }),
      ]),
    );
    expect(isGridBlocked(officeSpawnPoint, objects)).toBe(false);
    expect(isGridBlocked({ x: officeSpawnPoint.x - 1, y: officeSpawnPoint.y }, objects)).toBe(false);
    expect(isGridBlocked({ x: officeSpawnPoint.x + 1, y: officeSpawnPoint.y }, objects)).toBe(false);
    expect(isGridBlocked({ x: officeSpawnPoint.x, y: officeSpawnPoint.y - 1 }, objects)).toBe(false);
    expect(isGridBlocked({ x: officeSpawnPoint.x, y: officeSpawnPoint.y + 1 }, objects)).toBe(false);
  });

  it("places, moves, and deletes editor objects", () => {
    const object = createObjectFromAsset("office-1", "user-1", "office_desk_basic", { x: 4, y: 5 }, 90);
    const placed = placeObject([], object);

    expect(placed).toHaveLength(1);
    expect(placed[0].asset_key).toBe("office_desk_basic");
    expect(placed[0].rotation).toBe(90);
    expect(placed[0].metadata).toMatchObject({ grid_w: 2, grid_h: 3 });

    const moved = moveObjectAt(placed, { x: 4, y: 5 }, { x: 8, y: 9 });

    expect(moved[0]).toMatchObject({ x: 8, y: 9 });
    expect(deleteObjectAt(moved, { x: 8, y: 9 })).toEqual([]);
  });

  it("cycles placement rotation clockwise in quarter turns", () => {
    expect(rotateQuarterTurn(0)).toBe(90);
    expect(rotateQuarterTurn(90)).toBe(180);
    expect(rotateQuarterTurn(180)).toBe(270);
    expect(rotateQuarterTurn(270)).toBe(0);
    expect(rotateQuarterTurn(undefined)).toBe(90);
  });

  it("resolves rotated grid footprints for placement previews", () => {
    const arrow = getAssetDefinition("building_exit_arrow_sign");
    const desk = getAssetDefinition("office_desk_basic");

    expect(getRotatedGridSize(arrow, 0)).toEqual({ w: 3, h: 1 });
    expect(getRotatedGridSize(arrow, 90)).toEqual({ w: 1, h: 3 });
    expect(getRotatedGridSize(arrow, 270)).toEqual({ w: 1, h: 3 });
    expect(getRotatedGridSize(desk, 180)).toEqual({ w: 3, h: 2 });
  });

  it("deletes wall objects placed on map borders and leaves empty cells unchanged", () => {
    const arrow = createObjectFromAsset("office-1", "user-1", "building_exit_arrow_sign", { x: 0, y: 14 }, 90);
    const chair = createObjectFromAsset("office-1", "user-1", "office_chair_black", { x: 2, y: 14 });
    const placed = placeObject([arrow], chair);

    expect(arrow).toMatchObject({ rotation: 90, metadata: { grid_w: 1, grid_h: 3 } });
    expect(deleteObjectAt(placed, { x: 0, y: 16 })).toEqual([chair]);
    expect(deleteObjectAt(placed, { x: 30, y: 20 })).toBe(placed);
  });

  it("selects the top object using persisted rotated metadata", () => {
    const arrow = createObjectFromAsset("office-1", "user-1", "building_exit_arrow_sign", { x: 4, y: 4 }, 90);
    const chair = createObjectFromAsset("office-1", "user-1", "office_chair_black", { x: 4, y: 5 });
    const placed = placeObject([arrow], chair);

    expect(deleteObjectAt(placed, { x: 4, y: 4 })).toEqual([chair]);
    expect(deleteObjectAt(placed, { x: 4, y: 5 })).toEqual([arrow]);
  });
});
