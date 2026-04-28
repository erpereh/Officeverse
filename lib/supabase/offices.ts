import type { SupabaseClient } from "@supabase/supabase-js";

import { defaultOfficeHeight, defaultOfficeWidth } from "@/lib/office";
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
  requestedOfficeId?: string,
): Promise<Office> {
  const existing = requestedOfficeId
    ? await getOfficeById(supabase, userId, requestedOfficeId)
    : await getLatestOffice(supabase, userId);

  if (existing) {
    return existing;
  }

  return createOfficeForUser(supabase, userId, "Mi oficina");
}

export async function createOfficeForUser(
  supabase: SupabaseClient,
  userId: string,
  name: string,
): Promise<Office> {
  const { data, error } = await supabase
    .from("offices")
    .insert({
      user_id: userId,
      name,
      width: defaultOfficeWidth,
      height: defaultOfficeHeight,
      base_floor: "office_floor_01",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Office;
}

export async function getLatestOffice(
  supabase: SupabaseClient,
  userId: string,
): Promise<Office | null> {
  const { data, error } = await supabase
    .from("offices")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Office | null;
}

export async function getOfficeById(
  supabase: SupabaseClient,
  userId: string,
  officeId: string,
): Promise<Office | null> {
  const { data, error } = await supabase
    .from("offices")
    .select("*")
    .eq("id", officeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Office | null;
}

export async function listOfficesForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<Office[]> {
  const { data, error } = await supabase
    .from("offices")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Office[];
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
