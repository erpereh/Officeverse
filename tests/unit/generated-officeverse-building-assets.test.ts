import { readFileSync } from "node:fs";
import path from "node:path";

import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";

import manifest from "@/public/assets/officeverse/building/office-building.manifest.json";

describe("generated Officeverse building assets", () => {
  const sheetPath = path.join(
    process.cwd(),
    "public",
    "assets",
    "officeverse",
    "building",
    "office-building.png",
  );
  const sheet = PNG.sync.read(readFileSync(sheetPath));

  it("uses a transparent spritesheet with transparent corners", () => {
    expect(sheet.width).toBe(manifest.sourceSize.width);
    expect(sheet.height).toBe(manifest.sourceSize.height);

    for (const [x, y] of [
      [0, 0],
      [sheet.width - 1, 0],
      [0, sheet.height - 1],
      [sheet.width - 1, sheet.height - 1],
    ]) {
      expect(sheet.data[(y * sheet.width + x) * 4 + 3]).toBe(0);
    }
  });

  it("declares unique keys and visible in-bounds frames", () => {
    const keys = manifest.assets.map((asset) => asset.key);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual(
      expect.arrayContaining([
        "building_floor_blue_tile",
        "building_wall_panel_clean",
        "building_door_double_glass",
        "building_window_blinds_wide",
        "building_clock_digital",
      ]),
    );

    for (const asset of manifest.assets) {
      expect(asset.frame.x + asset.frame.w, asset.key).toBeLessThanOrEqual(sheet.width);
      expect(asset.frame.y + asset.frame.h, asset.key).toBeLessThanOrEqual(sheet.height);

      let visiblePixels = 0;

      for (let y = asset.frame.y; y < asset.frame.y + asset.frame.h; y += 1) {
        for (let x = asset.frame.x; x < asset.frame.x + asset.frame.w; x += 1) {
          if (sheet.data[(y * sheet.width + x) * 4 + 3] > 0) {
            visiblePixels += 1;
          }
        }
      }

      expect(visiblePixels, asset.key).toBeGreaterThan(0);
    }
  });
});
