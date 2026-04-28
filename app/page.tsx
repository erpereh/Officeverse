import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/office");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-10">
      <section className="w-full max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-md bg-primary text-lg font-bold text-primary-foreground">
            O
          </div>
          <span className="text-lg font-semibold">Officeverse</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-tight md:text-7xl">
              Tu oficina 2D para agentes que trabajan por ti.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
              Entra, elige tu personaje y abre una oficina viva donde tus
              automatizaciones irán procesando tareas reales.
            </p>
            <div className="mt-8">
              <Link
                href="/auth"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Entrar o registrarme
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="rounded-md border bg-card p-4 shadow-sm">
            <div className="grid aspect-[4/3] grid-cols-6 grid-rows-5 gap-1 rounded-md bg-secondary p-3">
              {Array.from({ length: 30 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-sm border border-white/60 bg-white/70"
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Primer MVP: login, avatar y una oficina 2D persistida.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
