import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { createClient } from "@/lib/supabase/server";

export default async function AuthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/office");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_top_left,#ffe7a8,transparent_28%),linear-gradient(135deg,#fff8df,#e7f0d8)] px-6 py-10">
      <section className="w-full max-w-md rounded-lg border-2 border-stone-900 bg-[#fffdf2] p-6 shadow-[8px_8px_0_#2f2418]">
        <div className="mb-6">
          <p className="text-sm font-black uppercase text-teal-700">Officeverse</p>
          <h1 className="mt-2 text-balance text-3xl font-black text-stone-950">
            Entra en tu oficina arcade
          </h1>
          <p className="mt-2 text-pretty text-sm leading-6 text-stone-700">
            Usa Supabase cuando quieras probar auth real, o entra en modo debug
            para iterar rapido sin validaciones.
          </p>
        </div>

        {process.env.NEXT_PUBLIC_OFFICEVERSE_DEBUG === "true" ? (
          <Link
            className="mb-5 flex h-11 items-center justify-center rounded-md border-2 border-amber-400 bg-amber-100 px-4 text-sm font-black uppercase text-stone-900 shadow-[4px_4px_0_#2f2418] transition hover:-translate-y-0.5"
            href="/debug"
          >
            Entrar en modo debug
          </Link>
        ) : null}

        <AuthForm />
      </section>
    </main>
  );
}
