import { describe, expect, it } from "vitest";

import { getAssetDefinition } from "@/lib/assets";
import { defaultOfficeHeight, defaultOfficeWidth } from "@/lib/office";
import { createRoomBasePlacements } from "@/lib/office-room";

describe("office room base", () => {
  it("covers the playable interior with beige floor", () => {
    const placements = createRoomBasePlacements(defaultOfficeWidth, defaultOfficeHeight);

    expect(placements).toContainEqual(
      expect.objectContaining({ assetKey: "building_floor_beige_tile", x: 1, y: 1 }),
    );
    expect(placements).toContainEqual(
      expect.objectContaining({ assetKey: "building_floor_beige_tile", x: 1, y: defaultOfficeHeight - 2 }),
    );
    expect(placements.filter((placement) => placement.assetKey === "building_floor_blue_tile")).toHaveLength(0);
  });

  it("builds a closed office shell with bottom-left entrance and windows", () => {
    const placements = createRoomBasePlacements(defaultOfficeWidth, defaultOfficeHeight);

    expect(placements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ assetKey: "building_door_double_glass", x: 5, y: defaultOfficeHeight - 5 }),
        expect.objectContaining({ assetKey: "building_window_double" }),
        expect.objectContaining({ assetKey: "building_window_quad" }),
        expect.objectContaining({ assetKey: "building_window_blinds_wide" }),
        expect.objectContaining({ assetKey: "building_wall_panel_clean", x: 2, y: 1 }),
        expect.objectContaining({ assetKey: "building_baseboard_blue_medium", x: 2, y: 3 }),
        expect.objectContaining({ assetKey: "building_trim_white_long", x: 2, y: defaultOfficeHeight - 2 }),
      ]),
    );

    for (const placement of placements) {
      const asset = getAssetDefinition(placement.assetKey);

      expect(asset, placement.assetKey).toBeDefined();
      expect(placement.x).toBeGreaterThanOrEqual(0);
      expect(placement.y).toBeGreaterThanOrEqual(0);
      expect(placement.x + (asset?.gridSize?.w ?? 1), placement.assetKey).toBeLessThanOrEqual(defaultOfficeWidth);
      expect(placement.y + (asset?.gridSize?.h ?? 1), placement.assetKey).toBeLessThanOrEqual(defaultOfficeHeight);
    }
  });
});
