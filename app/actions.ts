"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { avatarDefinitions } from "@/lib/assets";
import { ensureOfficeForUser, upsertProfileAvatar } from "@/lib/supabase/offices";
import { createClient } from "@/lib/supabase/server";

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
