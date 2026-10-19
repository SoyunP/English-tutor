import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "english_lab_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const raw = request.cookies.get(COOKIE_NAME)?.value;

  let role: string | null = null;
  if (raw) {
    try {
      role = (JSON.parse(decodeURIComponent(raw)) as { role?: string }).role ?? null;
    } catch {
      role = null;
    }
  }

  const isAuthPage = pathname.startsWith("/login");
  const isStudent = pathname.startsWith("/student");
  const isTeacher = pathname.startsWith("/teacher");

  if ((isStudent || isTeacher) && !role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isStudent && role === "teacher") {
    return NextResponse.redirect(new URL("/teacher", request.url));
  }
  if (isTeacher && role === "student") {
    return NextResponse.redirect(new URL("/student", request.url));
  }
  if (isAuthPage && role) {
    return NextResponse.redirect(
      new URL(role === "teacher" ? "/teacher" : "/student", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/teacher/:path*", "/login"],
};
