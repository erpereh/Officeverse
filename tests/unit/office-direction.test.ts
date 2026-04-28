import { describe, expect, it } from "vitest";

import {
  avatarFrameRanges,
  frontAvatarFrame,
  resolveFacingDirection,
} from "@/lib/office-direction";

describe("office direction helpers", () => {
  it("resolves cardinal movement directions", () => {
    expect(resolveFacingDirection({ dx: 0, dy: -1 }, "down")).toBe("up");
    expect(resolveFacingDirection({ dx: 0, dy: 1 }, "up")).toBe("down");
    expect(resolveFacingDirection({ dx: -1, dy: 0 }, "down")).toBe("left");
    expect(resolveFacingDirection({ dx: 1, dy: 0 }, "down")).toBe("right");
  });

  it("keeps the last direction when idle", () => {
    expect(resolveFacingDirection({ dx: 0, dy: 0 }, "left")).toBe("left");
    expect(resolveFacingDirection({ dx: 0, dy: 0 }, "up")).toBe("up");
  });

  it("uses six-frame directional ranges from the 24-frame character sheet", () => {
    expect(avatarFrameRanges).toEqual({
      right: { start: 0, end: 5 },
      up: { start: 6, end: 11 },
      left: { start: 12, end: 17 },
      down: { start: 18, end: 23 },
    });
  });

  it("uses the first front-facing frame for avatar previews", () => {
    expect(frontAvatarFrame).toBe(18);
  });
});
