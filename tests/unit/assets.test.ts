import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

import { assetDefinitions, avatarDefinitions, getAssetDefinition } from "@/lib/assets";
import { createDefaultOfficeObjects } from "@/lib/office";

describe("asset manifest", () => {
  it("uses unique asset keys", () => {
    const keys = assetDefinitions.map((asset) => asset.key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it("maps avatar ids to public sprite paths", () => {
    expect(avatarDefinitions).toHaveLength(4);
    expect(avatarDefinitions.map((avatar) => avatar.id)).toEqual([
      "adam",
      "alex",
      "amelia",
      "bob",
    ]);

    for (const avatar of avatarDefinitions) {
      expect(avatar.src).toMatch(/^\/assets\/modern-tiles-free\/characters\/.+\.png$/);
      expect(avatar.runSrc).toMatch(/^\/assets\/modern-tiles-free\/characters\/.+\.png$/);
      expect(avatar.frame).toEqual({ width: 16, height: 32 });
    }
  });

  it("uses visible tileset frames for default office objects", () => {
    const usedAssetKeys = new Set(
      createDefaultOfficeObjects("office-1", "user-1").map((object) => object.asset_key),
    );
    const interiors = PNG.sync.read(
      readFileSync(
        path.join(
          process.cwd(),
          "public",
          "assets",
          "modern-tiles-free",
          "interiors",
          "Interiors_free_16x16.png",
        ),
      ),
    );

    for (const assetKey of usedAssetKeys) {
      const asset = assetDefinitions.find((candidate) => candidate.key === assetKey);

      expect(asset, assetKey).toBeDefined();

      if (!asset?.frame || !asset.src.includes("Interiors_free_16x16.png")) {
        continue;
      }

      let visiblePixels = 0;

      for (let y = asset.frame.y; y < asset.frame.y + asset.frame.h; y += 1) {
        for (let x = asset.frame.x; x < asset.frame.x + asset.frame.w; x += 1) {
          const index = (y * interiors.width + x) * 4 + 3;

          if (interiors.data[index] > 0) {
            visiblePixels += 1;
          }
        }
      }

      expect(visiblePixels, asset.key).toBeGreaterThan(0);
    }
  });

  it("uses the new Officeverse sprite sheet for office furniture", () => {
    const terminal = getAssetDefinition("office_automation_command_center");

    expect(terminal?.src).toBe("/assets/officeverse/interiors/office-sprites.png");
    expect(getAssetDefinition("terminal_workstation")).toBeUndefined();
  });
});
