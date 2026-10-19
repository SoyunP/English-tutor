"use client";

import { useMemo, useState, useTransition } from "react";
import {
  authorizeRetakeAction,
  exportCsvAction,
  saveReviewAction,
  unlockAssignmentAction,
} from "@/lib/actions/teacher";
import type {
  Attempt,
  DemoStore,
  Profile,
  UnderstandingLabel,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LABELS: UnderstandingLabel[] = [
  "정확히 이해함",
  "부분적으로 이해함",
  "개념을 잘못 이해함",
  "추가 설명 필요",
];

export function TeacherDashboard({
  store,
  student,
  attempts,
  missedConcepts,
}: {
  store: DemoStore;
  student: Profile | undefined;
  attempts: Attempt[];
  missedConcepts: Record<string, number>;
}) {
  const [filter, setFilter] = useState<
    "all" | "incorrect" | "weak_reasoning" | "correct_maybe_misunderstood"
  >("all");
  const [selectedAttemptId, setSelectedAttemptId] = useState(attempts[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  const selected = attempts.find((a) => a.id === selectedAttemptId);

  const rows = useMemo(() => {
    if (!selected) return [];
    return selected.questionSnapshots
      .map((snap) => {
        const ans = selected.answers[snap.questionId];
        const review = store.teacherReviews.find(
          (r) => r.attemptId === selected.id && r.questionId === snap.questionId
        );
        const rem = store.remediationAttempts.filter(
          (r) => r.attemptId === selected.id && r.conceptId === snap.conceptId
        );
        return { snap, ans, review, rem };
      })
      .filter(({ snap, ans }) => {
        if (filter === "all") return true;
        if (filter === "incorrect") return ans?.isCorrect === false;
        if (filter === "weak_reasoning")
          return !ans?.studentReasoning || ans.studentReasoning.trim().length < 8;
        if (filter === "correct_maybe_misunderstood")
          return ans?.isCorrect === true && (!ans.studentReasoning || ans.studentReasoning.length < 12);
        void snap;
        return true;
      });
  }, [selected, filter, store.teacherReviews, store.remediationAttempts]);

  function downloadCsv() {
    startTransition(async () => {
      const { csv } = await exportCsvAction();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "english-lab-progress.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardDescription>학생</CardDescription>
          <CardTitle className="text-xl">{student?.displayName ?? "—"}</CardTitle>
        </Card>
        <Card>
          <CardDescription>제출/완료 시도</CardDescription>
          <CardTitle className="text-xl">{attempts.length}</CardTitle>
        </Card>
        <Card>
          <CardDescription>평균 최초 점수</CardDescription>
          <CardTitle className="text-xl">
            {attempts.length
              ? Math.round(
                  attempts.reduce((s, a) => s + (a.initialScore ?? 0), 0) / attempts.length
                )
              : "—"}
          </CardTitle>
        </Card>
        <Card>
          <CardDescription>평균 숙달 점수</CardDescription>
          <CardTitle className="text-xl">
            {attempts.filter((a) => a.finalMasteryScore != null).length
              ? Math.round(
                  attempts
                    .filter((a) => a.finalMasteryScore != null)
                    .reduce((s, a) => s + (a.finalMasteryScore ?? 0), 0) /
                    attempts.filter((a) => a.finalMasteryScore != null).length
                )
              : "—"}
          </CardTitle>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <CardTitle>자주 틀린 개념</CardTitle>
          <ul className="space-y-1 text-sm">
            {Object.entries(missedConcepts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([k, v]) => (
                <li key={k} className="flex justify-between">
                  <span>{k}</span>
                  <span className="text-muted-foreground">{v}회</span>
                </li>
              ))}
            {!Object.keys(missedConcepts).length && (
              <li className="text-muted-foreground">아직 데이터가 없습니다.</li>
            )}
          </ul>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>일정·잠금 해제</CardTitle>
            <Button size="sm" variant="outline" onClick={downloadCsv} disabled={pending}>
              CSV 내보내기
            </Button>
          </div>
          <ul className="space-y-2">
            {store.assignments.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  Day {a.dayNumber} · {a.date} {a.unlocked ? <Badge>해제됨</Badge> : null}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await unlockAssignmentAction(a.dayNumber, !a.unlocked);
                    })
                  }
                >
                  {a.unlocked ? "잠그기" : "미리 열기"}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="space-y-3">
        <CardTitle>일별 상세</CardTitle>
        <div className="flex flex-wrap gap-2">
          {attempts.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelectedAttemptId(a.id)}
              className={`rounded-xl border px-3 py-2 text-sm ${
                selectedAttemptId === a.id ? "border-primary bg-accent" : "bg-white"
              }`}
            >
              Day {a.dayNumber} · {a.status} · {a.initialScore ?? "—"}점
            </button>
          ))}
        </div>

        {selected && (
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded-xl border px-3 py-2 text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
              >
                <option value="all">전체</option>
                <option value="incorrect">오답만</option>
                <option value="correct_maybe_misunderstood">정답이지만 이해 의심</option>
                <option value="weak_reasoning">이유가 짧거나 없음</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await authorizeRetakeAction(selected.id);
                  })
                }
              >
                재시도 허용
              </Button>
            </div>

            {rows.map(({ snap, ans, review, rem }) => (
              <div key={snap.questionId} className="rounded-xl border p-4 text-sm space-y-2">
                <p className="font-medium">{snap.promptKo}</p>
                <p>정답: {snap.correctAnswer}</p>
                <p>학생 답: {ans?.studentAnswer ?? "—"} ({ans?.isCorrect ? "정답" : "오답"})</p>
                <p className="whitespace-pre-wrap">학생 이유: {ans?.studentReasoning ?? "—"}</p>
                {rem.length > 0 && (
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="text-xs font-medium">교정 기록</p>
                    {rem.map((r) => (
                      <p key={r.id}>
                        {r.attemptNumber}회 · {r.isCorrect ? "성공" : "실패"} · 답: {r.studentAnswer} ·
                        이유: {r.studentReasoning}
                      </p>
                    ))}
                  </div>
                )}
                <TeacherReviewForm
                  attemptId={selected.id}
                  questionId={snap.questionId}
                  initialLabel={review?.understandingLabel}
                  initialFeedback={review?.teacherFeedback ?? ""}
                />
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}

function TeacherReviewForm({
  attemptId,
  questionId,
  initialLabel,
  initialFeedback,
}: {
  attemptId: string;
  questionId: string;
  initialLabel?: UnderstandingLabel;
  initialFeedback: string;
}) {
  const [label, setLabel] = useState<UnderstandingLabel>(initialLabel ?? "추가 설명 필요");
  const [feedback, setFeedback] = useState(initialFeedback);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2 border-t pt-2">
      <p className="text-xs text-muted-foreground">이해도 피드백 (점수 가감 없음)</p>
      <select
        className="rounded-lg border px-2 py-1"
        value={label}
        onChange={(e) => setLabel(e.target.value as UnderstandingLabel)}
      >
        {LABELS.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
      <textarea
        className="min-h-[60px] rounded-lg border p-2"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="교사 코멘트"
      />
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await saveReviewAction({
              attemptId,
              questionId,
              understandingLabel: label,
              teacherFeedback: feedback,
            });
          })
        }
      >
        피드백 저장
      </Button>
    </div>
  );
}
