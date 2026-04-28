"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { OfficeScene } from "@/components/office/office-scene";
import { createClient } from "@/lib/supabase/client";
import type { OfficeState } from "@/lib/types";

type OfficeShellProps = {
  state: OfficeState;
  userEmail: string;
};

export function OfficeShell({ state, userEmail }: OfficeShellProps) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:px-6">
        <div>
          <p className="text-sm font-medium text-primary">Officeverse</p>
          <h1 className="text-xl font-semibold">{state.office.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {userEmail}
          </span>
          <button
            aria-label="Cerrar sesión"
            className="inline-flex size-10 items-center justify-center rounded-md border bg-card hover:bg-secondary"
            type="button"
            onClick={signOut}
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="grid flex-1 md:grid-cols-[1fr_280px]">
        <section className="min-w-0 overflow-auto p-4">
          <OfficeScene state={state} />
        </section>
        <aside className="border-t bg-card p-4 md:border-l md:border-t-0">
          <h2 className="text-sm font-semibold">Estado</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Avatar</dt>
              <dd className="font-medium">{state.profile.avatar_id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Tamaño</dt>
              <dd className="font-medium">
                {state.office.width} x {state.office.height}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Objetos</dt>
              <dd className="font-medium tabular-nums">{state.objects.length}</dd>
            </div>
          </dl>
          <p className="mt-6 rounded-md bg-secondary p-3 text-sm leading-6 text-muted-foreground">
            El armario marca el futuro punto de entrada al editor de oficina.
          </p>
        </aside>
      </div>
    </main>
  );
}
