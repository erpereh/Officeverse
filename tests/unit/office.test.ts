import { describe, expect, it } from "vitest";

import {
  createDefaultOfficeObjects,
  fitMapToViewport,
  gridToPixel,
  isGridBlocked,
  officeSpawnPoint,
} from "@/lib/office";

describe("office bootstrap", () => {
  it("creates deterministic default objects for a new office", () => {
    const objects = createDefaultOfficeObjects("office-1", "user-1");

    expect(objects.map((object) => object.asset_key)).toEqual([
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
      "chair_basic",
      "chair_basic",
      "large_rug",
      "sofa_lounge",
      "coffee_table",
      "stacked_boxes",
      "bookshelf_wide",
      "plant_basic",
      "plant_basic",
    ]);
    expect(objects.every((object) => object.office_id === "office-1")).toBe(true);
    expect(objects.every((object) => object.user_id === "user-1")).toBe(true);
  });

  it("converts grid coordinates to scaled pixel positions", () => {
    expect(gridToPixel({ x: 3, y: 4 }, 16, 3)).toEqual({ x: 144, y: 192 });
  });

  it("fits the full map inside the available viewport", () => {
    const fit = fitMapToViewport(
      { width: 1280, height: 720 },
      { width: 1440, height: 864 },
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
  });
});
