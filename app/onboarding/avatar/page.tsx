import Image from "next/image";
import { redirect } from "next/navigation";

import { selectAvatarAction } from "@/app/actions";
import { avatarDefinitions } from "@/lib/assets";
import { getProfile } from "@/lib/supabase/offices";
import { createClient } from "@/lib/supabase/server";

export default async function AvatarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const profile = await getProfile(supabase, user.id);

  if (profile?.avatar_id) {
    redirect("/office");
  }

  return (
    <main className="min-h-dvh px-6 py-10">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">Onboarding</p>
          <h1 className="mt-2 text-balance text-4xl font-semibold">
            Elige tu personaje
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground">
            Este avatar aparecerá dentro de tu oficina 2D.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {avatarDefinitions.map((avatar) => (
            <form
              key={avatar.id}
              action={selectAvatarAction}
              className="rounded-md border bg-card p-5 shadow-sm"
            >
              <input type="hidden" name="avatar_id" value={avatar.id} />
              <div className="flex aspect-square items-center justify-center rounded-md bg-secondary">
                <Image
                  alt={avatar.name}
                  className="pixelated"
                  height={96}
                  src={avatar.src}
                  width={384}
                  priority
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="font-medium">{avatar.name}</span>
                <button
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                  type="submit"
                >
                  Elegir
                </button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
