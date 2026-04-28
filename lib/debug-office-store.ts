import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  defaultOfficeHeight,
  defaultOfficeWidth,
} from "@/lib/office";
import type { Office, OfficeObject } from "@/lib/types";

type DebugOfficeStore = {
  activeOfficeId: string;
  offices: Office[];
  objectsByOfficeId: Record<string, OfficeObject[]>;
};

const timestamp = "2026-04-28T00:00:00.000Z";
const storePath = path.join(process.cwd(), "data", "debug-offices.json");
export const sharedDebugUserId = "00000000-0000-4000-8000-000000000001";
export const sharedDebugOfficeId = "00000000-0000-4000-8000-000000000101";

export function createEmptyDebugOffice(
  id = sharedDebugOfficeId,
  name = "Debug Arcade Office",
): Office {
  return {
    id,
    user_id: sharedDebugUserId,
    name,
    width: defaultOfficeWidth,
    height: defaultOfficeHeight,
    base_floor: "office_floor_01",
    created_at: timestamp,
    updated_at: timestamp,
  };
}

export async function readDebugOfficeStore(): Promise<DebugOfficeStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as DebugOfficeStore;

    if (parsed.offices.length > 0) {
      return parsed;
    }
  } catch {
    // First run or invalid local debug state: recreate below.
  }

  const fallback = createDefaultDebugOfficeStore();
  await writeDebugOfficeStore(fallback);
  return fallback;
}

export async function writeDebugOfficeStore(store: DebugOfficeStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export function createDefaultDebugOfficeStore(): DebugOfficeStore {
  const office = createEmptyDebugOffice();

  return {
    activeOfficeId: office.id,
    offices: [office],
    objectsByOfficeId: {
      [office.id]: [],
    },
  };
}

export async function resetDebugOfficeStore() {
  const store = createDefaultDebugOfficeStore();
  await writeDebugOfficeStore(store);
  return store;
}
