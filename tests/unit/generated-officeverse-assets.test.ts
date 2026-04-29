import { readFileSync } from "node:fs";
import path from "node:path";

import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";

import manifest from "@/public/assets/officeverse/interiors/office-sprites.manifest.json";

describe("generated Officeverse interior assets", () => {
  const sheetPath = path.join(
    process.cwd(),
    "public",
    "assets",
    "officeverse",
    "interiors",
    "office-sprites.png",
  );
  const sheet = PNG.sync.read(readFileSync(sheetPath));

  it("uses a transparent spritesheet with transparent corners", () => {
    expect(sheet.width).toBe(manifest.sourceSize.width);
    expect(sheet.height).toBe(manifest.sourceSize.height);

    const corners = [
      [0, 0],
      [sheet.width - 1, 0],
      [0, sheet.height - 1],
      [sheet.width - 1, sheet.height - 1],
    ];

    for (const [x, y] of corners) {
      expect(sheet.data[(y * sheet.width + x) * 4 + 3]).toBe(0);
    }
  });

  it("declares unique keys and in-bounds visible frames", () => {
    const keys = manifest.assets.map((asset) => asset.key);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual(
      expect.arrayContaining([
        "office_desk_basic",
        "office_automation_command_center",
        "office_chair_teal",
        "office_file_cabinet_gray",
        "office_bookshelf_wide",
        "office_editor_wardrobe",
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

  it("uses curated names and grid footprints for editor placement", () => {
    const byKey = new Map(manifest.assets.map((asset) => [asset.key, asset]));

    expect(byKey.get("office_server_rack")).toMatchObject({
      name: "Rack servidor",
      gridSize: { w: 2, h: 3 },
    });
    expect(byKey.get("office_flat_monitor")).toMatchObject({
      name: "Monitor plano",
      gridSize: { w: 1, h: 1 },
    });
    expect(byKey.get("office_chair_teal")).toMatchObject({
      name: "Silla oficina teal",
      gridSize: { w: 1, h: 1 },
    });
    expect(byKey.get("office_desk_basic")).toMatchObject({
      name: "Mesa de trabajo",
      gridSize: { w: 3, h: 2 },
    });
  });
});
