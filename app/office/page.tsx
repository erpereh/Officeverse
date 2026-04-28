import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { OfficeShell } from "@/components/office/office-shell";
import { debugUserId, isDebugEnabled } from "@/lib/debug-office";
import { readDebugOfficeStore } from "@/lib/debug-office-store";
import {
  ensureOfficeForUser,
  getOfficeObjects,
  getProfile,
  listOfficesForUser,
} from "@/lib/supabase/offices";
import { createClient } from "@/lib/supabase/server";

type OfficePageProps = {
  searchParams?: Promise<{
    office?: string;
  }>;
};

export default async function OfficePage({ searchParams }: OfficePageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const isDebug = isDebugEnabled() && cookieStore.get("officeverse_debug")?.value === "1";
  const debugAvatar = cookieStore.get("officeverse_debug_avatar")?.value;
  const requestedOfficeId = params?.office;

  if (isDebug) {
    if (!debugAvatar) {
      redirect("/onboarding/avatar");
    }

    const store = await readDebugOfficeStore();
    const office =
      store.offices.find((candidate) => candidate.id === requestedOfficeId) ??
      store.offices.find((candidate) => candidate.id === store.activeOfficeId) ??
      store.offices[0];
    const timestamp = new Date("2026-04-28T00:00:00.000Z").toISOString();

    return (
      <OfficeShell
        isDebug
        offices={store.offices}
        state={{
          profile: {
            id: debugUserId,
            username: "debug",
            avatar_id: debugAvatar,
            created_at: timestamp,
            updated_at: timestamp,
          },
          office,
          objects: store.objectsByOfficeId[office.id] ?? [],
        }}
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

  const office = await ensureOfficeForUser(supabase, user.id, requestedOfficeId);
  const offices = await listOfficesForUser(supabase, user.id);
  const objects = await getOfficeObjects(supabase, office.id);

  return (
    <OfficeShell
      offices={offices}
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
