import { describe, expect, it } from "vitest";

import { createDefaultOfficeObjects, gridToPixel } from "@/lib/office";

describe("office bootstrap", () => {
  it("creates deterministic default objects for a new office", () => {
    const objects = createDefaultOfficeObjects("office-1", "user-1");

    expect(objects.map((object) => object.asset_key)).toEqual([
      "desk_basic",
      "chair_basic",
      "plant_basic",
      "wardrobe_editor",
    ]);
    expect(objects.every((object) => object.office_id === "office-1")).toBe(true);
    expect(objects.every((object) => object.user_id === "user-1")).toBe(true);
  });

  it("converts grid coordinates to scaled pixel positions", () => {
    expect(gridToPixel({ x: 3, y: 4 }, 16, 3)).toEqual({ x: 144, y: 192 });
  });
});
