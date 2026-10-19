import { cookies } from "next/headers";
import { readStore } from "@/lib/demo/store";
import { isDemoMode } from "@/lib/mode";
import type { SessionUser, UserRole } from "@/lib/types";

const COOKIE_NAME = "english_lab_session";

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as SessionUser;
    if (!parsed?.id || !parsed?.role) return null;

    if (isDemoMode()) {
      const store = await readStore();
      const profile = store.profiles.find((p) => p.id === parsed.id);
      if (!profile) return null;
      return {
        id: profile.id,
        email: profile.email,
        displayName: profile.displayName,
        role: profile.role,
      };
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function requireUser(role?: UserRole): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (role && user.role !== role) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeURIComponent(JSON.stringify(user)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
