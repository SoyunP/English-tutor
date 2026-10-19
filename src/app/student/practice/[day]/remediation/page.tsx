import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { RemediationFlow } from "@/components/homework/remediation-flow";
import { getSessionUser } from "@/lib/auth/session";
import { getAttemptForStudent } from "@/lib/repository";

export default async function RemediationPage({
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

  if (!data.attempt) redirect(`/student/practice/${dayNumber}`);
  if (data.attempt.status === "completed") {
    redirect(`/student/practice/${dayNumber}/results`);
  }
  if (data.attempt.status !== "remediating") {
    redirect(`/student/practice/${dayNumber}/results`);
  }

  return (
    <div>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Link
          href={`/student/practice/${dayNumber}/results`}
          className="text-sm text-primary hover:underline"
        >
          ← 결과
        </Link>
        <h1 className="font-display text-3xl">교정 학습</h1>
        <RemediationFlow
          dayNumber={dayNumber}
          attempt={data.attempt}
          bank={data.remediationQuestions}
          priorAttempts={data.remediationAttempts}
        />
      </main>
    </div>
  );
}
