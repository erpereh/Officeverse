import { describe, expect, it } from "vitest";

import { getAssetDefinition } from "@/lib/assets";
import { defaultOfficeHeight, defaultOfficeWidth } from "@/lib/office";
import { createRoomBasePlacements } from "@/lib/office-room";

describe("office room base", () => {
  it("covers the playable floor from y=1", () => {
    const placements = createRoomBasePlacements(defaultOfficeWidth, defaultOfficeHeight);

    expect(placements).toContainEqual(
      expect.objectContaining({ assetKey: "building_floor_blue_tile", x: 1, y: 1 }),
    );
    expect(placements).toContainEqual(
      expect.objectContaining({ assetKey: "building_floor_blue_tile", x: 1, y: defaultOfficeHeight - 2 }),
    );
  });

  it("keeps static room assets inside the office bounds", () => {
    const placements = createRoomBasePlacements(defaultOfficeWidth, defaultOfficeHeight);

    expect(placements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ assetKey: "building_door_double_glass" }),
        expect.objectContaining({ assetKey: "building_window_double" }),
        expect.objectContaining({ assetKey: "building_window_quad" }),
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
