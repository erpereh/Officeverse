import type { SupabaseClient } from "@supabase/supabase-js";

import { createDefaultOfficeObjects } from "@/lib/office";
import type { Office, OfficeObject, Profile } from "@/lib/types";

export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Profile | null;
}

export async function upsertProfileAvatar(
  supabase: SupabaseClient,
  userId: string,
  email: string | undefined,
  avatarId: string,
) {
  const username = email?.split("@")[0] ?? "usuario";
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      username,
      avatar_id: avatarId,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function ensureOfficeForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<Office> {
  const existing = await getOffice(supabase, userId);

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("offices")
    .insert({
      user_id: userId,
      name: "Mi oficina",
      width: 30,
      height: 20,
      base_floor: "office_floor_01",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const office = data as Office;
  await ensureDefaultObjects(supabase, office, userId);

  return office;
}

export async function getOffice(
  supabase: SupabaseClient,
  userId: string,
): Promise<Office | null> {
  const { data, error } = await supabase
    .from("offices")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Office | null;
}

export async function getOfficeObjects(
  supabase: SupabaseClient,
  officeId: string,
): Promise<OfficeObject[]> {
  const { data, error } = await supabase
    .from("office_objects")
    .select("*")
    .eq("office_id", officeId)
    .order("layer", { ascending: true })
    .order("y", { ascending: true })
    .order("x", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as OfficeObject[];
}

async function ensureDefaultObjects(
  supabase: SupabaseClient,
  office: Office,
  userId: string,
) {
  const objects = await getOfficeObjects(supabase, office.id);

  if (objects.length > 0) {
    return;
  }

  const { error } = await supabase
    .from("office_objects")
    .insert(createDefaultOfficeObjects(office.id, userId));

  if (error) {
    throw new Error(error.message);
  }
}
