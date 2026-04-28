import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const cookieStore = await cookies();

  cookieStore.delete("officeverse_debug");
  cookieStore.delete("officeverse_debug_avatar");

  redirect("/");
}
