"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveAnswerAction,
  startHomeworkAction,
  submitHomeworkAction,
} from "@/lib/actions/homework";
import type { Attempt, Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { QuestionView } from "./question-view";

export function HomeworkShell({
  dayNumber,
  assignmentTitle,
  questionCount,
  attempt,
  questions,
}: {
  dayNumber: number;
  assignmentTitle: string;
  questionCount: number;
  attempt: Attempt | null;
  questions: Question[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { studentAnswer: string; studentReasoning: string }>
  >(() => {
    const init: Record<string, { studentAnswer: string; studentReasoning: string }> = {};
    for (const q of questions) {
      const a = attempt?.answers[q.id];
      init[q.id] = {
        studentAnswer: a?.studentAnswer ?? "",
        studentReasoning: a?.studentReasoning ?? "",
      };
    }
    return init;
  });
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [incomplete, setIncomplete] = useState<
    { order: number; missing: ("answer" | "reasoning")[] }[] | null
  >(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const current = questions[index];
  const readOnly = attempt?.status !== "in_progress" && attempt != null;

  const progress = useMemo(() => {
    const answered = questions.filter((q) => answers[q.id]?.studentAnswer.trim()).length;
    return Math.round((answered / questions.length) * 100);
  }, [answers, questions]);

  // Debounced autosave
  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress" || !current) return;
    const payload = answers[current.id];
    if (!payload) return;
    setSaveState("saving");
    const t = setTimeout(() => {
      void saveAnswerAction({
        attemptId: attempt.id,
        questionId: current.id,
        studentAnswer: payload.studentAnswer,
        studentReasoning: payload.studentReasoning,
      }).then(() => setSaveState("saved"));
    }, 500);
    return () => clearTimeout(t);
  }, [answers, attempt, current]);

  const updateField = useCallback(
    (field: "studentAnswer" | "studentReasoning", value: string) => {
      if (!current || readOnly) return;
      setAnswers((prev) => ({
        ...prev,
        [current.id]: { ...prev[current.id], [field]: value },
      }));
    },
    [current, readOnly]
  );

  function handleStart() {
    startTransition(async () => {
      await startHomeworkAction(dayNumber);
      router.refresh();
    });
  }

  async function handleSubmit() {
    if (!attempt) return;
    // Flush current answer first
    await saveAnswerAction({
      attemptId: attempt.id,
      questionId: current.id,
      studentAnswer: answers[current.id].studentAnswer,
      studentReasoning: answers[current.id].studentReasoning,
    });

    const result = await submitHomeworkAction(attempt.id);
    if (!result.ok) {
      setIncomplete(result.incomplete.map((i) => ({ order: i.order, missing: i.missing })));
      setConfirmOpen(false);
      return;
    }
    router.push(`/student/practice/${dayNumber}/results`);
    router.refresh();
  }

  if (!attempt) {
    return (
      <Card className="mx-auto max-w-xl space-y-4">
        <CardTitle>오늘의 숙제</CardTitle>
        <CardDescription>{assignmentTitle}</CardDescription>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>문항 수: {questionCount}문항</li>
          <li>예상 소요 시간: 약 30분</li>
          <li>제한 시간: 없음 (원하는 만큼 풀고 나중에 이어서 할 수 있어요)</li>
          <li>모든 문항에 답과 「왜 그렇게 생각하나요?」를 작성해야 제출할 수 있습니다.</li>
        </ul>
        <Button size="lg" onClick={handleStart} disabled={pending}>
          Start Homework — 숙제 시작하기
        </Button>
      </Card>
    );
  }

  if (attempt.status !== "in_progress") {
    return (
      <Card className="mx-auto max-w-xl space-y-3">
        <CardTitle>이미 제출한 숙제입니다</CardTitle>
        <CardDescription>답과 이유는 수정할 수 없습니다.</CardDescription>
        <Button onClick={() => router.push(`/student/practice/${dayNumber}/results`)}>
          결과 보기
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-muted-foreground">
              문제 {index + 1} / {questions.length}
              {current.points ? ` · [${current.points}점]` : ""}
            </p>
            <div className="mt-1 h-2 w-48 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {saveState === "saving" ? "저장 중…" : saveState === "saved" ? "자동 저장됨" : ""}
          </p>
        </div>

        <QuestionView
          question={current}
          studentAnswer={answers[current.id]?.studentAnswer ?? ""}
          studentReasoning={answers[current.id]?.studentReasoning ?? ""}
          onAnswerChange={(v) => updateField("studentAnswer", v)}
          onReasoningChange={(v) => updateField("studentReasoning", v)}
          readOnly={false}
          flagged={flagged.has(current.id)}
          onToggleFlag={() =>
            setFlagged((prev) => {
              const next = new Set(prev);
              if (next.has(current.id)) next.delete(current.id);
              else next.add(current.id);
              return next;
            })
          }
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            이전
          </Button>
          <Button
            variant="outline"
            disabled={index >= questions.length - 1}
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
          >
            다음
          </Button>
          <Button className="ml-auto" onClick={() => setConfirmOpen(true)}>
            Submit Homework — 제출하기
          </Button>
        </div>

        {incomplete && (
          <Card className="border-red-200 bg-red-50">
            <CardTitle className="text-base text-red-800">미완성 문항이 있습니다</CardTitle>
            <ul className="mt-2 space-y-1 text-sm text-red-800">
              {incomplete.map((i) => (
                <li key={i.order}>
                  <button
                    type="button"
                    className="underline"
                    onClick={() => {
                      setIndex(i.order - 1);
                      setIncomplete(null);
                    }}
                  >
                    {i.order}번
                  </button>
                  :{" "}
                  {i.missing
                    .map((m) => (m === "answer" ? "답 없음" : "이유 없음"))
                    .join(", ")}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {confirmOpen && (
          <Card className="space-y-3 border-primary/30">
            <CardTitle className="text-base">제출하시겠습니까?</CardTitle>
            <CardDescription>
              미응답{" "}
              {questions.filter((q) => !answers[q.id]?.studentAnswer.trim()).length}문항 · 이유
              미작성{" "}
              {questions.filter((q) => !answers[q.id]?.studentReasoning.trim()).length}문항
              <br />
              제출 후에는 답과 이유를 수정할 수 없습니다.
            </CardDescription>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                돌아가기
              </Button>
              <Button onClick={() => void handleSubmit()}>확인 제출</Button>
            </div>
          </Card>
        )}
      </div>

      <aside className="rounded-2xl border bg-white p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">문제 목록</p>
        <div className="grid grid-cols-5 gap-1.5 lg:grid-cols-4">
          {questions.map((q, i) => {
            const a = answers[q.id];
            const done = Boolean(a?.studentAnswer.trim() && a?.studentReasoning.trim());
            const partial = Boolean(a?.studentAnswer.trim() || a?.studentReasoning.trim()) && !done;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-9 rounded-lg text-xs font-medium focus-ring ${
                  i === index
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-[#e8f5ee] text-[#067647]"
                      : partial
                        ? "bg-amber-50 text-amber-800"
                        : "bg-muted text-muted-foreground"
                }`}
                aria-label={`${i + 1}번 문제`}
              >
                {i + 1}
                {flagged.has(q.id) ? "*" : ""}
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
