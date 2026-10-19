import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { ResultsView } from "@/components/homework/results-view";
import { getSessionUser } from "@/lib/auth/session";
import { getAttemptForStudent } from "@/lib/repository";

export default async function ResultsPage({
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

  if (!data.attempt || data.attempt.status === "in_progress") {
    redirect(`/student/practice/${dayNumber}`);
  }

  return (
    <div>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Link href="/student" className="text-sm text-primary hover:underline">
          ← 대시보드
        </Link>
        <h1 className="font-display text-3xl">Day {dayNumber} 결과</h1>
        <ResultsView
          dayNumber={dayNumber}
          attempt={data.attempt}
          questions={data.fullQuestions ?? []}
          remediationAttempts={data.remediationAttempts}
          teacherReviews={data.teacherReviews}
        />
      </main>
    </div>
  );
}
