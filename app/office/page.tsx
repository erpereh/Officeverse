import { redirect } from "next/navigation";

import { OfficeShell } from "@/components/office/office-shell";
import {
  ensureOfficeForUser,
  getOfficeObjects,
  getProfile,
} from "@/lib/supabase/offices";
import { createClient } from "@/lib/supabase/server";

export default async function OfficePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const profile = await getProfile(supabase, user.id);

  if (!profile?.avatar_id) {
    redirect("/onboarding/avatar");
  }

  const office = await ensureOfficeForUser(supabase, user.id);
  const objects = await getOfficeObjects(supabase, office.id);

  return (
    <OfficeShell
      state={{
        profile,
        office,
        objects,
      }}
      userEmail={user.email ?? "usuario"}
    />
  );
}
