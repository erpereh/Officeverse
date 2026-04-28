import { describe, expect, it } from "vitest";

import { getAdjacentAvatarId } from "@/lib/avatar-carousel";
import { createDebugOfficeState } from "@/lib/debug-office";
import { clampGridPosition, isGridBlocked } from "@/lib/office";

describe("debug office", () => {
  it("creates deterministic state for a selected avatar", () => {
    const state = createDebugOfficeState("bob");

    expect(state.profile.avatar_id).toBe("bob");
    expect(state.office.name).toBe("Debug Arcade Office");
    expect(state.office.width).toBe(40);
    expect(state.office.height).toBe(24);
    expect(state.objects.map((object) => object.asset_key)).toContain("meeting_table");
    expect(state.objects.map((object) => object.asset_key)).toContain("sofa_lounge");
  });

  it("cycles avatars in both directions", () => {
    expect(getAdjacentAvatarId("adam", "next")).toBe("alex");
    expect(getAdjacentAvatarId("adam", "previous")).toBe("bob");
  });

  it("clamps movement and detects blocked cells", () => {
    expect(clampGridPosition({ x: -4, y: 28 }, 40, 24)).toEqual({ x: 1, y: 23 });

    expect(
      isGridBlocked({ x: 5, y: 8 }, createDebugOfficeState("adam").objects),
    ).toBe(true);
  });
});
