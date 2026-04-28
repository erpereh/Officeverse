import { describe, expect, it } from "vitest";

import { assetDefinitions, avatarDefinitions } from "@/lib/assets";

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
});
