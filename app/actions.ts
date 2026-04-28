"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { assetDefinitions, avatarDefinitions } from "@/lib/assets";
import {
  createDefaultDebugOfficeStore,
  createEmptyDebugOffice,
  readDebugOfficeStore,
  writeDebugOfficeStore,
} from "@/lib/debug-office-store";
import { normalizeLayoutPayload } from "@/lib/office-editor";
import { createDefaultOfficeObjects } from "@/lib/office";
import {
  createOfficeForUser,
  ensureOfficeForUser,
  getOfficeById,
  getOfficeObjects,
  listOfficesForUser,
  upsertProfileAvatar,
} from "@/lib/supabase/offices";
import { createClient } from "@/lib/supabase/server";
import type { OfficeLayoutPayload, OfficeObject } from "@/lib/types";

export async function selectAvatarAction(formData: FormData) {
  const avatarId = String(formData.get("avatar_id") ?? "");
  const avatar = avatarDefinitions.find((candidate) => candidate.id === avatarId);

  if (!avatar) {
    throw new Error("Avatar no valido.");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth");
  }

  await upsertProfileAvatar(supabase, user.id, user.email, avatar.id);
  await ensureOfficeForUser(supabase, user.id);

  redirect("/office");
}

export async function selectDebugAvatarAction(formData: FormData) {
  const avatarId = String(formData.get("avatar_id") ?? "");
  const avatar = avatarDefinitions.find((candidate) => candidate.id === avatarId);

  if (!avatar) {
    throw new Error("Avatar no valido.");
  }

  const cookieStore = await cookies();

  cookieStore.set("officeverse_debug", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  cookieStore.set("officeverse_debug_avatar", avatar.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  redirect("/office");
}

export async function createOfficeAction(isDebug: boolean) {
  if (isDebug) {
    const store = await readDebugOfficeStore();
    const office = createEmptyDebugOffice(
      crypto.randomUUID(),
      `Oficina ${store.offices.length + 1}`,
    );

    store.offices.unshift(office);
    store.objectsByOfficeId[office.id] = [];
    store.activeOfficeId = office.id;
    await writeDebugOfficeStore(store);
    return office.id;
  }

  const { supabase, userId } = await requireUser();
  const offices = await listOfficesForUser(supabase, userId);
  const office = await createOfficeForUser(supabase, userId, `Oficina ${offices.length + 1}`);
  return office.id;
}

export async function renameOfficeAction(isDebug: boolean, officeId: string, name: string) {
  const cleanName = name.trim().slice(0, 48) || "Mi oficina";

  if (isDebug) {
    const store = await readDebugOfficeStore();
    store.offices = store.offices.map((office) =>
      office.id === officeId
        ? { ...office, name: cleanName, updated_at: new Date().toISOString() }
        : office,
    );
    await writeDebugOfficeStore(store);
    return;
  }

  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("offices")
    .update({ name: cleanName })
    .eq("id", officeId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteOfficeAction(isDebug: boolean, officeId: string) {
  if (isDebug) {
    const store = await readDebugOfficeStore();
    store.offices = store.offices.filter((office) => office.id !== officeId);
    delete store.objectsByOfficeId[officeId];

    if (store.offices.length === 0) {
      Object.assign(store, createDefaultDebugOfficeStore());
    }

    store.activeOfficeId = store.offices[0].id;
    await writeDebugOfficeStore(store);
    return store.activeOfficeId;
  }

  const { supabase, userId } = await requireUser();
  const offices = await listOfficesForUser(supabase, userId);

  if (offices.length <= 1) {
    const replacement = await createOfficeForUser(supabase, userId, "Mi oficina");
    await supabase.from("offices").delete().eq("id", officeId).eq("user_id", userId);
    return replacement.id;
  }

  const { error } = await supabase.from("offices").delete().eq("id", officeId).eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return offices.find((office) => office.id !== officeId)?.id ?? "";
}

export async function duplicateOfficeAction(isDebug: boolean, officeId: string) {
  if (isDebug) {
    const store = await readDebugOfficeStore();
    const source = store.offices.find((office) => office.id === officeId) ?? store.offices[0];
    const office = createEmptyDebugOffice(crypto.randomUUID(), `${source.name} copia`);
    const objects = (store.objectsByOfficeId[source.id] ?? []).map((object) => ({
      ...object,
      id: undefined,
      office_id: office.id,
    }));

    store.offices.unshift(office);
    store.objectsByOfficeId[office.id] = objects;
    store.activeOfficeId = office.id;
    await writeDebugOfficeStore(store);
    return office.id;
  }

  const { supabase, userId } = await requireUser();
  const source = await getOfficeById(supabase, userId, officeId);

  if (!source) {
    throw new Error("Oficina no encontrada.");
  }

  const office = await createOfficeForUser(supabase, userId, `${source.name} copia`);
  const objects = await getOfficeObjects(supabase, officeId);

  if (objects.length > 0) {
    await insertOfficeObjects(
      supabase,
      userId,
      office.id,
      objects.map((object) => ({ ...object, office_id: office.id })),
    );
  }

  return office.id;
}

export async function saveOfficeLayoutAction(isDebug: boolean, payload: OfficeLayoutPayload) {
  if (isDebug) {
    const store = await readDebugOfficeStore();
    const office = store.offices.find((candidate) => candidate.id === payload.officeId);

    if (!office) {
      throw new Error("Oficina debug no encontrada.");
    }

    const normalized = normalizeLayoutPayload(payload, office);
    store.objectsByOfficeId[office.id] = normalized.map((object) => ({
      ...object,
      office_id: office.id,
      user_id: office.user_id,
    }));
    store.activeOfficeId = office.id;
    await writeDebugOfficeStore(store);
    return;
  }

  const { supabase, userId } = await requireUser();
  const office = await getOfficeById(supabase, userId, payload.officeId);

  if (!office) {
    throw new Error("Oficina no encontrada.");
  }

  const normalized = normalizeLayoutPayload(payload, office);

  const { error: deleteError } = await supabase
    .from("office_objects")
    .delete()
    .eq("office_id", office.id)
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (normalized.length > 0) {
    await insertOfficeObjects(supabase, userId, office.id, normalized);
  }
}

export async function loadTemplateOfficeAction(isDebug: boolean, officeId: string) {
  const objects = createDefaultOfficeObjects(officeId, isDebug ? "00000000-0000-4000-8000-000000000001" : "");
  await saveOfficeLayoutAction(isDebug, {
    officeId,
    objects,
  });
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("No autenticado.");
  }

  return { supabase, userId: user.id };
}

async function insertOfficeObjects(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  officeId: string,
  objects: Array<Partial<OfficeObject>>,
) {
  const validKeys = new Set(assetDefinitions.map((asset) => asset.key));
  const rows = objects
    .filter((object) => object.asset_key && validKeys.has(object.asset_key))
    .map((object) => ({
      office_id: officeId,
      user_id: userId,
      object_type: object.object_type ?? "furniture",
      asset_key: object.asset_key,
      x: object.x ?? 1,
      y: object.y ?? 1,
      rotation: object.rotation ?? 0,
      layer: object.layer ?? 2,
      metadata: object.metadata ?? {},
    }));

  const { error } = await supabase.from("office_objects").insert(rows);

  if (error) {
    throw new Error(error.message);
  }
}
