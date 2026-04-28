import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AvatarCarousel } from "@/components/avatar-carousel";
import { isDebugEnabled } from "@/lib/debug-office";
import { getProfile } from "@/lib/supabase/offices";
import { createClient } from "@/lib/supabase/server";

export default async function AvatarPage() {
  const cookieStore = await cookies();
  const isDebug = isDebugEnabled() && cookieStore.get("officeverse_debug")?.value === "1";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isDebug) {
    redirect("/auth");
  }

  if (user && !isDebug) {
    const profile = await getProfile(supabase, user.id);

    if (profile?.avatar_id) {
      redirect("/office");
    }
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,#ffd56d,transparent_28%),linear-gradient(135deg,#fff8df,#dfeec8)] px-6 py-10">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-black uppercase text-teal-700">
            {isDebug ? "Debug onboarding" : "Onboarding"}
          </p>
          <h1 className="mt-2 text-balance text-5xl font-black text-stone-950">
            Elige tu personaje
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-stone-700">
            Usa las flechas para cambiar de agente. Tu personaje aparecera en
            la oficina viva.
          </p>
        </div>
        <AvatarCarousel isDebug={isDebug} />
      </section>
    </main>
  );
}
