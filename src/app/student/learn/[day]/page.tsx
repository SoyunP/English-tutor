import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { VocabularyPanel } from "@/components/vocabulary-panel";
import { Card, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/session";
import { readStore } from "@/lib/demo/store";
import { getLessonBundle } from "@/lib/repository";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect("/teacher");

  const { day } = await params;
  const dayNumber = Number(day);
  const { lesson, vocabulary } = await getLessonBundle(dayNumber);
  const store = await readStore();
  const difficultIds = store.difficultWords[user.id] ?? [];

  return (
    <div>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div>
          <Link href="/student" className="text-sm text-primary hover:underline">
            ← 대시보드
          </Link>
          <h1 className="mt-2 font-display text-3xl">Day {lesson.dayNumber}: {lesson.lessonTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{lesson.title}</p>
          <p className="mt-2 rounded-xl bg-muted/70 p-3 text-xs text-muted-foreground">{lesson.textbookNote}</p>
        </div>

        <Card className="space-y-2">
          <CardTitle>오늘의 학습 목표</CardTitle>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {lesson.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-3">
          <CardTitle>Reading — {lesson.passageTitle}</CardTitle>
          <div className="space-y-3">
            {lesson.passageSentences.map((s, i) => (
              <details key={i} className="rounded-xl border border-border/80 bg-muted/30 p-3">
                <summary className="cursor-pointer text-sm font-medium leading-relaxed">
                  {s.en}
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{s.ko}</p>
                {s.highlight?.length ? (
                  <p className="mt-1 text-xs text-primary">핵심: {s.highlight.join(", ")}</p>
                ) : null}
              </details>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{lesson.readingExplanationKo}</p>
        </Card>

        <Card className="space-y-3">
          <CardTitle>Vocabulary</CardTitle>
          <VocabularyPanel items={vocabulary} difficultIds={difficultIds} />
        </Card>

        <Card className="space-y-3">
          <CardTitle>
            Grammar — {lesson.grammar.title}
            {lesson.grammar.provisional ? (
              <span className="ml-2 text-xs font-normal text-amber-700">(잠정 자료)</span>
            ) : null}
          </CardTitle>
          <p className="text-sm leading-relaxed">{lesson.grammar.explanationKo}</p>
          <div className="space-y-2">
            {lesson.grammar.examples.map((ex, i) => (
              <div key={i} className="rounded-xl bg-muted/50 p-3 text-sm">
                <p className="text-[var(--success)]">O {ex.correct}</p>
                {ex.incorrect && <p className="text-[var(--danger)]">X {ex.incorrect}</p>}
                {ex.note && <p className="text-muted-foreground">{ex.note}</p>}
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-sm font-semibold">자주 하는 실수</h4>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {lesson.grammar.commonMistakes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">연습</h4>
            <ul className="mt-2 space-y-2">
              {lesson.grammar.guidedPractice.map((g) => (
                <li key={g.prompt} className="rounded-xl border p-3 text-sm">
                  <p>{g.prompt}</p>
                  <details className="mt-1">
                    <summary className="cursor-pointer text-primary">정답 보기</summary>
                    <p className="mt-1">{g.answer} — {g.explanation}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="space-y-3">
          <CardTitle>요약</CardTitle>
          <ul className="list-disc pl-5 text-sm">
            {lesson.keyTakeaways.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
          <h4 className="text-sm font-semibold">자주 출제되는 유형</h4>
          <ul className="list-disc pl-5 text-sm">
            {lesson.examPatterns.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </Card>

        <Link
          href={`/student/practice/${dayNumber}`}
          className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          이 날의 숙제로 이동
        </Link>
      </main>
    </div>
  );
}
