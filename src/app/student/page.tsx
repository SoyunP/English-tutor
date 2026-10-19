import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, PenLine, Flame, Trophy, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/session";
import { formatKoreanDate, getSeoulDisplayDate } from "@/lib/dates";
import { getDashboardData } from "@/lib/repository";
import { STATUS_LABELS } from "@/lib/status-labels";

export default async function StudentDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect("/teacher");

  const data = await getDashboardData(user);
  const todayDay = data.days.find((d) => d.assignment.date === data.today) ?? data.days.find((d) => d.available);

  return (
    <div>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <section className="animate-fade-up">
          <p className="text-sm text-muted-foreground">{getSeoulDisplayDate()}</p>
          <h1 className="mt-1 font-display text-4xl text-foreground">안녕하세요, {user.displayName} 님</h1>
          <p className="mt-2 text-muted-foreground">
            {todayDay
              ? `오늘은 Day ${todayDay.assignment.dayNumber} of 7 — ${todayDay.lesson.lessonTitle}`
              : "7일 학습 여정을 확인해 보세요."}
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Flame, label: "연속 학습", value: `${data.stats.streak}일` },
            { icon: BookOpen, label: "접근 가능 수업", value: `${data.stats.lessonsAccessible}` },
            { icon: CheckCircle2, label: "숙제 완료", value: `${data.stats.homeworkCompleted}/7` },
            {
              icon: Trophy,
              label: "최근 숙달 점수",
              value: data.stats.latestFinalScore != null ? `${data.stats.latestFinalScore}점` : "—",
            },
          ].map((stat) => (
            <Card key={stat.label} className="flex items-center gap-3">
              <stat.icon className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-xl font-semibold">{stat.value}</div>
              </div>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" />
              <CardTitle>Learn — 수업 복습</CardTitle>
            </div>
            <CardDescription>
              수업 자료와 어휘는 언제든 다시 볼 수 있어요. 숙제 점수에는 영향을 주지 않습니다.
            </CardDescription>
            <div className="flex flex-wrap gap-2">
              {data.days.map((d) => (
                <Link
                  key={d.assignment.id}
                  href={`/student/learn/${d.assignment.dayNumber}`}
                  className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm hover:bg-accent"
                >
                  Day {d.assignment.dayNumber}
                </Link>
              ))}
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <PenLine className="h-5 w-5" />
              <CardTitle>Practice — 오늘의 숙제</CardTitle>
            </div>
            <CardDescription>
              날짜가 되면 숙제를 시작할 수 있어요. 제한 시간은 없으며, 답과 이유를 저장한 뒤 제출하세요.
            </CardDescription>
            {todayDay?.available ? (
              <Link
                href={`/student/practice/${todayDay.assignment.dayNumber}`}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground"
              >
                Day {todayDay.assignment.dayNumber} 숙제 열기
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">오늘은 열린 숙제가 없습니다.</p>
            )}
          </Card>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl">7일 학습 일정</h2>
          <div className="space-y-3">
            {data.days.map((d) => (
              <Card key={d.assignment.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">Day {d.assignment.dayNumber}</span>
                    <Badge status={d.status}>{STATUS_LABELS[d.status]}</Badge>
                    <span className="text-xs text-muted-foreground">{formatKoreanDate(d.assignment.date)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{d.assignment.title}</p>
                  {d.attempt?.finalMasteryScore != null && (
                    <p className="mt-1 text-sm">
                      최초 {d.attempt.initialScore}점 · 숙달 {d.attempt.finalMasteryScore}점
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/student/learn/${d.assignment.dayNumber}`}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-muted"
                  >
                    수업
                  </Link>
                  {d.available ? (
                    <Link
                      href={`/student/practice/${d.assignment.dayNumber}`}
                      className="rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                    >
                      숙제
                    </Link>
                  ) : (
                    <span className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">잠김</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
