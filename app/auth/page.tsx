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
    <main className="flex min-h-dvh items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-md border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-primary">Officeverse</p>
          <h1 className="mt-2 text-balance text-3xl font-semibold">
            Entra en tu oficina
          </h1>
          <p className="mt-2 text-pretty text-sm leading-6 text-muted-foreground">
            Usa email y contraseña para crear una cuenta o iniciar sesión.
          </p>
        </div>
        <AuthForm />
      </section>
    </main>
  );
}
