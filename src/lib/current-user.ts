import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getCurrentUser() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireCurrentUser() {
  const session = await getCurrentUser();
  if (!session?.user) throw new Error("UNAUTHENTICATED");
  return session.user;
}
