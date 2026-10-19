import Link from "next/link";
import { logoutAction } from "@/lib/auth/actions";
import type { SessionUser } from "@/lib/types";
import { Button } from "./ui/button";

export function SiteHeader({ user }: { user: SessionUser }) {
  return (
    <header className="border-b border-border/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href={user.role === "teacher" ? "/teacher" : "/student"} className="group">
          <div className="font-display text-2xl tracking-tight text-primary transition group-hover:opacity-80">
            English Lab
          </div>
          <p className="text-xs text-muted-foreground">Your English journey, one day at a time.</p>
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="font-medium">{user.displayName}</div>
            <div className="text-xs text-muted-foreground">
              {user.role === "teacher" ? "교사" : "학생"}
            </div>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              로그아웃
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
