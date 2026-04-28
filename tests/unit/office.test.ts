import { describe, expect, it } from "vitest";

import { getAssetDefinition } from "@/lib/assets";
import { createObjectFromAsset, deleteObjectAt, moveObjectAt, placeObject } from "@/lib/office-editor";
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

    expect(objects).toHaveLength(39);
    expect(objects.map((object) => object.asset_key)).toEqual(
      expect.arrayContaining([
        "task_board",
        "wall_board",
        "wall_map",
        "bookshelf_basic",
        "file_cabinet",
        "wardrobe_editor",
        "desk_corner",
        "office_chair_blue",
        "desk_basic",
        "chair_basic",
        "terminal_workstation",
        "arcade_rug",
        "meeting_table",
        "large_rug",
        "sofa_lounge",
        "coffee_table",
        "stacked_boxes",
        "bookshelf_wide",
        "plant_basic",
      ]),
    );
    expect(objects.every((object) => object.office_id === "office-1")).toBe(true);
    expect(objects.every((object) => object.user_id === "user-1")).toBe(true);
    expect(objects.every((object) => getAssetDefinition(object.asset_key))).toBe(true);
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

    expect(isGridBlocked(officeSpawnPoint, objects)).toBe(false);
    expect(isGridBlocked({ x: 5, y: 8 }, objects)).toBe(true);
    expect(isGridBlocked({ x: officeSpawnPoint.x - 1, y: officeSpawnPoint.y }, objects)).toBe(false);
    expect(isGridBlocked({ x: officeSpawnPoint.x + 1, y: officeSpawnPoint.y }, objects)).toBe(false);
  });

  it("places, moves, and deletes editor objects", () => {
    const object = createObjectFromAsset("office-1", "user-1", "desk_basic", { x: 4, y: 5 });
    const placed = placeObject([], object);

    expect(placed).toHaveLength(1);
    expect(placed[0].asset_key).toBe("desk_basic");

    const moved = moveObjectAt(placed, { x: 4, y: 5 }, { x: 8, y: 9 });

    expect(moved[0]).toMatchObject({ x: 8, y: 9 });
    expect(deleteObjectAt(moved, { x: 8, y: 9 })).toEqual([]);
  });
});
