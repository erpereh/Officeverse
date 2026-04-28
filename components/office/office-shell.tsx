"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { OfficeScene } from "@/components/office/office-scene";
import { createClient } from "@/lib/supabase/client";
import type { OfficeState } from "@/lib/types";

type OfficeShellProps = {
  state: OfficeState;
  userEmail: string;
  isDebug: boolean;
};

export function OfficeShell({ state, userEmail, isDebug }: OfficeShellProps) {
  const router = useRouter();

  async function signOut() {
    if (isDebug) {
      router.replace("/debug/exit");
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#fff8df]">
      <header className="flex h-[70px] shrink-0 items-center justify-between border-b-2 border-stone-900 bg-[#24313f] px-4 py-3 text-[#fff8df] md:px-6">
        <div>
          <p className="text-xs font-black uppercase text-[#f8c85f]">Officeverse</p>
          <h1 className="text-xl font-black">{state.office.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          {isDebug ? (
            <span className="rounded-md border border-[#f8c85f] bg-[#f8c85f] px-2 py-1 text-xs font-black text-stone-950">
              DEBUG
            </span>
          ) : null}
          <span className="hidden text-sm text-[#fff8df]/80 sm:inline">
            {userEmail}
          </span>
          <button
            aria-label={isDebug ? "Salir del modo debug" : "Cerrar sesion"}
            className="inline-flex size-10 items-center justify-center rounded-md border-2 border-[#fff8df] bg-transparent hover:bg-[#fff8df]/10"
            type="button"
            onClick={signOut}
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 overflow-auto md:h-[calc(100dvh-70px)] md:grid-cols-[minmax(0,1fr)_320px] md:overflow-hidden">
        <section className="min-h-[520px] min-w-0 overflow-hidden bg-[radial-gradient(circle_at_top_left,#ffd56d,transparent_26%),linear-gradient(135deg,#fff8df,#dfeec8)] md:min-h-0">
          <OfficeScene state={state} />
        </section>
        <aside className="shrink-0 border-t-2 border-stone-900 bg-[#fffdf2] p-4 md:h-full md:overflow-auto md:border-l-2 md:border-t-0">
          <h2 className="text-sm font-black uppercase text-teal-700">HUD de oficina</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4 rounded-md border border-stone-200 bg-white px-3 py-2">
              <dt className="text-stone-600">Avatar</dt>
              <dd className="font-black">{state.profile.avatar_id}</dd>
            </div>
            <div className="flex justify-between gap-4 rounded-md border border-stone-200 bg-white px-3 py-2">
              <dt className="text-stone-600">Mapa</dt>
              <dd className="font-black">
                {state.office.width} x {state.office.height}
              </dd>
            </div>
            <div className="flex justify-between gap-4 rounded-md border border-stone-200 bg-white px-3 py-2">
              <dt className="text-stone-600">Camara</dt>
              <dd className="font-black">Mapa completo</dd>
            </div>
            <div className="flex justify-between gap-4 rounded-md border border-stone-200 bg-white px-3 py-2">
              <dt className="text-stone-600">Decoracion</dt>
              <dd className="font-black tabular-nums">{state.objects.length}</dd>
            </div>
          </dl>
          <p className="mt-6 rounded-md border-2 border-stone-900 bg-[#f8c85f] p-3 text-sm font-semibold leading-6 text-stone-900 shadow-[4px_4px_0_#2f2418]">
            WASD o flechas para moverte. El armario sera la entrada al editor.
          </p>
          {isDebug ? (
            <Link
              className="mt-4 flex h-11 items-center justify-center rounded-md border-2 border-stone-900 bg-teal-500 text-sm font-black uppercase text-stone-950 shadow-[4px_4px_0_#2f2418]"
              href="/onboarding/avatar"
            >
              Cambiar personaje
            </Link>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
