import {
  createEmptyDebugOffice,
  sharedDebugOfficeId,
  sharedDebugUserId,
} from "@/lib/debug-office-store";
import type { OfficeState } from "@/lib/types";

export const debugUserId = sharedDebugUserId;
export const debugOfficeId = sharedDebugOfficeId;

export function isDebugEnabled() {
  return process.env.NEXT_PUBLIC_OFFICEVERSE_DEBUG === "true";
}

export function createDebugOfficeState(avatarId = "adam"): OfficeState {
  const timestamp = new Date("2026-04-28T00:00:00.000Z").toISOString();
  const office = createEmptyDebugOffice();

  return {
    profile: {
      id: debugUserId,
      username: "debug",
      avatar_id: avatarId,
      created_at: timestamp,
      updated_at: timestamp,
    },
    office,
    objects: [],
  };
}
