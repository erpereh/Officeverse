import { createDefaultOfficeObjects, defaultOfficeHeight, defaultOfficeWidth } from "@/lib/office";
import type { OfficeState } from "@/lib/types";

export const debugUserId = "00000000-0000-4000-8000-000000000001";
export const debugOfficeId = "00000000-0000-4000-8000-000000000101";

export function isDebugEnabled() {
  return process.env.NEXT_PUBLIC_OFFICEVERSE_DEBUG === "true";
}

export function createDebugOfficeState(avatarId = "adam"): OfficeState {
  const timestamp = new Date("2026-04-28T00:00:00.000Z").toISOString();

  return {
    profile: {
      id: debugUserId,
      username: "debug",
      avatar_id: avatarId,
      created_at: timestamp,
      updated_at: timestamp,
    },
    office: {
      id: debugOfficeId,
      user_id: debugUserId,
      name: "Debug Arcade Office",
      width: defaultOfficeWidth,
      height: defaultOfficeHeight,
      base_floor: "office_floor_01",
      created_at: timestamp,
      updated_at: timestamp,
    },
    objects: createDefaultOfficeObjects(debugOfficeId, debugUserId),
  };
}
