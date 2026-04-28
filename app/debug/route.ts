import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const cookieStore = await cookies();

  cookieStore.set("officeverse_debug", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  redirect("/onboarding/avatar");
}
