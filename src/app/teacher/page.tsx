import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { TeacherDashboard } from "@/components/teacher/teacher-dashboard";
import { getSessionUser } from "@/lib/auth/session";
import { getTeacherOverview } from "@/lib/repository";

export default async function TeacherPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") redirect("/student");

  const data = await getTeacherOverview();

  return (
    <div>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div>
          <h1 className="font-display text-4xl">교사 대시보드</h1>
          <p className="mt-1 text-muted-foreground">
            학생 수행, 오답·이유, 교정 결과, 일정을 관리합니다.
          </p>
        </div>
        <TeacherDashboard
          store={data.store}
          student={data.student}
          attempts={data.attempts}
          missedConcepts={data.missedConcepts}
        />
      </main>
    </div>
  );
}
