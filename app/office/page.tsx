import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { OfficeShell } from "@/components/office/office-shell";
import { createDebugOfficeState, isDebugEnabled } from "@/lib/debug-office";
import {
  ensureOfficeForUser,
  getOfficeObjects,
  getProfile,
} from "@/lib/supabase/offices";
import { createClient } from "@/lib/supabase/server";

export default async function OfficePage() {
  const cookieStore = await cookies();
  const isDebug = isDebugEnabled() && cookieStore.get("officeverse_debug")?.value === "1";
  const debugAvatar = cookieStore.get("officeverse_debug_avatar")?.value;

  if (isDebug) {
    if (!debugAvatar) {
      redirect("/onboarding/avatar");
    }

    return (
      <OfficeShell
        isDebug
        state={createDebugOfficeState(debugAvatar)}
        userEmail="debug@officeverse.local"
      />
    );
  }

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
      isDebug={false}
      userEmail={user.email ?? "usuario"}
    />
  );
}
