import { describe, expect, it } from "vitest";

import { getAssetDefinition } from "@/lib/assets";
import {
  createObjectFromAsset,
  deleteObjectAt,
  moveObjectAt,
  placeObject,
  rotateObjectAt,
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

    expect(objects).toHaveLength(32);
    expect(objects.map((object) => object.asset_key)).toEqual(
      expect.arrayContaining([
        "office_kanban_board",
        "office_whiteboard",
        "office_chart_board",
        "office_editor_wardrobe",
        "office_desk_monitor",
        "office_desk_dual_terminal",
        "office_desk_basic",
        "office_chair_black",
        "office_chair_teal",
        "office_chair_blue",
        "office_automation_command_center",
        "office_server_rack",
        "office_rug_teal",
        "office_rug_red",
        "office_rug_beige",
        "office_sofa_teal",
        "office_armchair_beige",
        "office_drawer_small",
        "office_plant_tall",
        "office_plant_round",
        "office_plant_small_pot",
        "office_plant_square",
        "building_power_cable",
      ]),
    );
    expect(objects.every((object) => object.office_id === "office-1")).toBe(true);
    expect(objects.every((object) => object.user_id === "user-1")).toBe(true);
    expect(objects.every((object) => getAssetDefinition(object.asset_key))).toBe(true);
    expect(objects.some((object) => object.asset_key.startsWith("building_door"))).toBe(false);
    expect(objects.some((object) => object.asset_key.startsWith("building_window"))).toBe(false);
  });

  it("keeps template objects inside bounds and grouped by office zones", () => {
    const objects = createDefaultOfficeObjects("office-1", "user-1");
    const keys = objects.map((object) => object.asset_key);

    expect(keys).toEqual(
      expect.arrayContaining([
        "office_desk_monitor",
        "office_desk_dual_terminal",
        "office_desk_basic",
        "office_automation_command_center",
        "office_server_rack",
        "office_sofa_teal",
        "office_editor_wardrobe",
        "building_power_cable",
      ]),
    );

    for (const object of objects) {
      const asset = getAssetDefinition(object.asset_key);
      const width = asset?.gridSize?.w ?? 1;
      const height = asset?.gridSize?.h ?? 1;

      expect(object.x, object.asset_key).toBeGreaterThanOrEqual(1);
      expect(object.y, object.asset_key).toBeGreaterThanOrEqual(1);
      expect(object.x + width, object.asset_key).toBeLessThanOrEqual(defaultOfficeWidth);
      expect(object.y + height, object.asset_key).toBeLessThanOrEqual(defaultOfficeHeight);
    }

    expect(objects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ asset_key: "office_desk_monitor", x: 13, y: 7 }),
        expect.objectContaining({ asset_key: "office_desk_dual_terminal", x: 19, y: 7 }),
        expect.objectContaining({ asset_key: "office_desk_basic", x: 25, y: 7 }),
        expect.objectContaining({ asset_key: "office_server_rack", x: 29, y: 4 }),
        expect.objectContaining({ asset_key: "office_server_rack", x: 32, y: 4 }),
        expect.objectContaining({ asset_key: "office_sofa_teal", x: 27, y: 17 }),
        expect.objectContaining({ asset_key: "office_editor_wardrobe", x: 35, y: 12 }),
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

    expect(officeSpawnPoint).toEqual({ x: 8, y: 19 });
    expect(isGridBlocked(officeSpawnPoint, objects)).toBe(false);
    expect(isGridBlocked({ x: 13, y: 8 }, objects)).toBe(true);
    expect(isGridBlocked({ x: officeSpawnPoint.x - 1, y: officeSpawnPoint.y }, objects)).toBe(false);
    expect(isGridBlocked({ x: officeSpawnPoint.x + 1, y: officeSpawnPoint.y }, objects)).toBe(false);
    expect(isGridBlocked({ x: officeSpawnPoint.x, y: officeSpawnPoint.y - 1 }, objects)).toBe(false);
    expect(isGridBlocked({ x: officeSpawnPoint.x, y: officeSpawnPoint.y + 1 }, objects)).toBe(false);
  });

  it("places, moves, and deletes editor objects", () => {
    const object = createObjectFromAsset("office-1", "user-1", "office_desk_basic", { x: 4, y: 5 });
    const placed = placeObject([], object);

    expect(placed).toHaveLength(1);
    expect(placed[0].asset_key).toBe("office_desk_basic");

    const moved = moveObjectAt(placed, { x: 4, y: 5 }, { x: 8, y: 9 });

    expect(moved[0]).toMatchObject({ x: 8, y: 9 });
    expect(deleteObjectAt(moved, { x: 8, y: 9 })).toEqual([]);
  });

  it("rotates editor objects clockwise in quarter turns", () => {
    const object = createObjectFromAsset("office-1", "user-1", "office_desk_basic", { x: 4, y: 5 });
    const placed = placeObject([], object);

    const rotated90 = rotateObjectAt(placed, { x: 4, y: 5 });
    const rotated180 = rotateObjectAt(rotated90, { x: 4, y: 5 });
    const rotated270 = rotateObjectAt(rotated180, { x: 4, y: 5 });
    const rotated0 = rotateObjectAt(rotated270, { x: 4, y: 5 });

    expect(rotated90[0].rotation).toBe(90);
    expect(rotated180[0].rotation).toBe(180);
    expect(rotated270[0].rotation).toBe(270);
    expect(rotated0[0].rotation).toBe(0);
    expect(rotateObjectAt(placed, { x: 20, y: 20 })).toBe(placed);
  });
});
