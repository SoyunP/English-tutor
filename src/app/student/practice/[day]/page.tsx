import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { HomeworkShell } from "@/components/homework/homework-shell";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/session";
import { getAttemptForStudent } from "@/lib/repository";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect("/teacher");

  const { day } = await params;
  const dayNumber = Number(day);
  const data = await getAttemptForStudent(user, dayNumber);

  if (!data.available) {
    return (
      <div>
        <SiteHeader user={user} />
        <main className="mx-auto max-w-xl px-4 py-12">
          <Card className="space-y-3">
            <CardTitle>아직 열리지 않은 숙제입니다</CardTitle>
            <CardDescription>
              {data.assignment.date}에 열립니다. 교사가 잠금 해제하면 미리 풀 수 있습니다.
            </CardDescription>
            <Link href="/student" className="text-sm text-primary underline">
              대시보드로
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  if (data.attempt && data.attempt.status !== "in_progress") {
    redirect(`/student/practice/${dayNumber}/results`);
  }

  return (
    <div>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8">
        <Link href="/student" className="text-sm text-primary hover:underline">
          ← 대시보드
        </Link>
        <h1 className="font-display text-3xl">Day {dayNumber} 숙제</h1>
        <p className="text-sm text-muted-foreground">{data.assignment.title}</p>
        <HomeworkShell
          dayNumber={dayNumber}
          assignmentTitle={data.assignment.title}
          questionCount={data.assignment.questionCount}
          attempt={data.attempt}
          questions={data.questions as never}
        />
      </main>
    </div>
  );
}
