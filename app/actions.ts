"use server";

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
