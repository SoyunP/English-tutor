"use server";

import { redirect } from "next/navigation";
import { STUDENT, TEACHER, readStore } from "@/lib/demo/store";
import { isDemoMode } from "@/lib/mode";
import { clearSessionCookie, setSessionCookie } from "./session";
import type { SessionUser } from "@/lib/types";

export async function loginAsStudent() {
  await loginDemo("student");
}

export async function loginAsTeacher() {
  await loginDemo("teacher");
}

async function loginDemo(role: "student" | "teacher") {
  if (!isDemoMode()) {
    throw new Error("데모 로그인은 데모 모드에서만 사용할 수 있습니다.");
  }
  await readStore();
  const profile = role === "student" ? STUDENT : TEACHER;
  const user: SessionUser = {
    id: profile.id,
    email: profile.email,
    displayName: profile.displayName,
    role: profile.role,
  };
  await setSessionCookie(user);
  redirect(role === "student" ? "/student" : "/teacher");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
