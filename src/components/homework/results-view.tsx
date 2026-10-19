"use client";

import Link from "next/link";
import type { Attempt, Question, RemediationAttempt, TeacherReview } from "@/lib/types";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ResultsView({
  dayNumber,
  attempt,
  questions,
  remediationAttempts,
  teacherReviews,
}: {
  dayNumber: number;
  attempt: Attempt;
  questions: Question[];
  remediationAttempts: RemediationAttempt[];
  teacherReviews: TeacherReview[];
}) {
  const incorrect = attempt.questionSnapshots.filter((snap) => {
    const a = attempt.answers[snap.questionId];
    return a && a.isCorrect === false && !a.pendingReview;
  });

  return (
    <div className="space-y-6">
      <Card className="space-y-3">
        <CardTitle>채점 결과</CardTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="최초 점수 (Initial Score)" value={`${attempt.initialScore ?? 0}점`} />
          <Stat label="정답 / 오답" value={`${attempt.initialCorrect ?? 0} / ${attempt.initialIncorrect ?? 0}`} />
          <Stat
            label="교정 숙달률"
            value={
              attempt.remediationMasteryRate != null
                ? `${attempt.remediationMasteryRate}%`
                : attempt.status === "remediating"
                  ? "진행 중"
                  : "—"
            }
          />
          <Stat
            label="최종 숙달 점수"
            value={
              attempt.finalMasteryScore != null
                ? `${attempt.finalMasteryScore}점`
                : "교정 후 확정"
            }
            hint="학습/숙달 점수이며 원래 시험 점수를 대체하지 않습니다."
          />
        </div>
        <CardDescription>
          최초 점수는 변경되지 않습니다. 최종 숙달 점수 = 교정 불필요 시 최초 점수, 그 외 80%×최초 + 20%×교정
          숙달률.
        </CardDescription>
      </Card>

      {attempt.status === "remediating" && (
        <Card className="space-y-3 border-amber-200 bg-amber-50">
          <CardTitle className="text-base">교정 학습이 필요합니다</CardTitle>
          <CardDescription>
            틀린 개념마다 비슷한 문제를 다시 풀어 주세요. 완료 후 최종 숙달 점수가 기록됩니다.
          </CardDescription>
          <Link href={`/student/practice/${dayNumber}/remediation`}>
            <Button>비슷한 문제 다시 풀기</Button>
          </Link>
        </Card>
      )}

      {attempt.status === "completed" && (
        <Card className="space-y-2">
          <CardTitle className="text-base">완료</CardTitle>
          <p className="text-sm">숙달한 개념: {attempt.conceptsMastered.join(", ") || "해당 없음"}</p>
          <p className="text-sm">
            선생님 도움이 필요한 개념: {attempt.conceptsNeedingHelp.join(", ") || "없음"}
          </p>
        </Card>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-2xl">문항별 피드백</h2>
        {attempt.questionSnapshots.map((snap) => {
          const ans = attempt.answers[snap.questionId];
          const q = questions.find((x) => x.id === snap.questionId);
          const review = teacherReviews.find((r) => r.questionId === snap.questionId);
          const wrong = ans && ans.isCorrect === false && !ans.pendingReview;

          return (
            <Card key={snap.questionId} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{q?.order ?? snap.questionId}번</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    ans?.pendingReview
                      ? "bg-amber-100 text-amber-800"
                      : ans?.isCorrect
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {ans?.pendingReview ? "교사 검토 대기" : ans?.isCorrect ? "정답" : "오답"}
                </span>
                <span className="text-xs text-muted-foreground">{snap.conceptLabel}</span>
              </div>
              <p className="text-sm font-medium">{snap.promptKo}</p>

              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">내가 선택한 답</p>
                  <p className="mt-1">{ans?.studentAnswer || "(미응답)"}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">내가 생각한 이유</p>
                  <p className="mt-1 whitespace-pre-wrap">{ans?.studentReasoning || "(없음)"}</p>
                </div>
              </div>

              {wrong && (
                <div className="space-y-2 rounded-xl border border-red-100 bg-red-50/60 p-3 text-sm">
                  <p>
                    <strong>정답:</strong> {snap.correctAnswer}
                  </p>
                  <p>
                    <strong>왜 틀렸을까요?</strong> 학생이 고른 「{ans?.studentAnswer}」은 정답이
                    아닙니다. {snap.explanationKo}
                  </p>
                  <p>
                    <strong>핵심 개념 다시 배우기:</strong> {snap.conceptLabel}
                  </p>
                </div>
              )}

              {ans?.isCorrect && (
                <p className="text-sm text-muted-foreground">{snap.explanationKo}</p>
              )}

              {review && (
                <div className="rounded-xl border border-primary/20 bg-accent/40 p-3 text-sm">
                  <p>교사 이해도 평가: {review.understandingLabel}</p>
                  {review.teacherFeedback && <p className="mt-1">{review.teacherFeedback}</p>}
                </div>
              )}
            </Card>
          );
        })}
      </section>

      {incorrect.length > 0 && attempt.status === "remediating" && (
        <Link href={`/student/practice/${dayNumber}/remediation`}>
          <Button size="lg">교정 학습으로 이동</Button>
        </Link>
      )}

      {remediationAttempts.length > 0 && (
        <Card className="space-y-2">
          <CardTitle className="text-base">교정 시도 기록</CardTitle>
          <ul className="space-y-1 text-sm">
            {remediationAttempts.map((r) => (
              <li key={r.id}>
                {r.conceptId} · {r.attemptNumber}회차 · {r.isCorrect ? "성공" : "실패"}
                {r.status === "needs_teacher_help" ? " · 선생님 도움 필요" : ""}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
