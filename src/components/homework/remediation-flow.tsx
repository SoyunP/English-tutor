"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitRemediationAction } from "@/lib/actions/homework";
import type { Attempt, RemediationAttempt, RemediationQuestion } from "@/lib/types";
import { QuestionView } from "./question-view";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function RemediationFlow({
  dayNumber,
  attempt,
  bank,
  priorAttempts,
}: {
  dayNumber: number;
  attempt: Attempt;
  bank: RemediationQuestion[];
  priorAttempts: RemediationAttempt[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const conceptId = attempt.conceptsNeedingRemediation[0];

  const conceptBank = useMemo(
    () => bank.filter((b) => b.conceptId === conceptId).sort((a, b) => a.order - b.order),
    [bank, conceptId]
  );

  const priorForConcept = priorAttempts.filter((p) => p.conceptId === conceptId);
  const nextQuestion = conceptBank[Math.min(priorForConcept.length, conceptBank.length - 1)];

  if (!conceptId || !nextQuestion) {
    return (
      <Card className="space-y-3">
        <CardTitle>교정 완료</CardTitle>
        <CardDescription>모든 교정 활동을 마쳤습니다.</CardDescription>
        <Button onClick={() => router.push(`/student/practice/${dayNumber}/results`)}>
          결과로 돌아가기
        </Button>
      </Card>
    );
  }

  const snap = attempt.questionSnapshots.find((s) => s.conceptId === conceptId);
  const originalAns = snap ? attempt.answers[snap.questionId] : undefined;
  const attemptNumber = priorForConcept.length + 1;
  const useSimpler = attemptNumber >= 2;

  function handleSubmit() {
    if (!answer.trim() || !reasoning.trim()) {
      setFeedback("답과 「왜 그렇게 생각하나요?」를 모두 작성해 주세요.");
      return;
    }
    startTransition(async () => {
      await submitRemediationAction({
        attemptId: attempt.id,
        conceptId,
        remediationQuestionId: nextQuestion.id,
        studentAnswer: answer,
        studentReasoning: reasoning,
      });
      setAnswer("");
      setReasoning("");
      setFeedback(null);
      router.refresh();
      if (attempt.conceptsNeedingRemediation.length <= 1) {
        router.push(`/student/practice/${dayNumber}/results`);
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <CardTitle className="text-base">틀린 문제 돌아보기 — {snap?.conceptLabel}</CardTitle>
        {snap && (
          <>
            <p className="text-sm">{snap.promptKo}</p>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">내가 선택한 답</p>
                <p>{originalAns?.studentAnswer}</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">내가 생각한 이유</p>
                <p className="whitespace-pre-wrap">{originalAns?.studentReasoning}</p>
              </div>
            </div>
            <div className="rounded-xl border border-red-100 bg-red-50/70 p-3 text-sm">
              <p>
                <strong>왜 틀렸을까요?</strong> {snap.explanationKo}
              </p>
              <p className="mt-2">
                <strong>핵심 개념 다시 배우기:</strong>{" "}
                {useSimpler ? nextQuestion.simplerExplanationKo : nextQuestion.workedExampleKo}
              </p>
            </div>
          </>
        )}
      </Card>

      <div>
        <h2 className="mb-2 font-display text-xl">비슷한 문제 다시 풀기 ({attemptNumber}/2)</h2>
        <QuestionView
          question={{
            id: nextQuestion.id,
            promptKo: nextQuestion.promptKo,
            type: nextQuestion.type,
            options: nextQuestion.options,
            passageHtml: nextQuestion.passageHtml,
            points: nextQuestion.points,
            order: attemptNumber,
          }}
          studentAnswer={answer}
          studentReasoning={reasoning}
          onAnswerChange={setAnswer}
          onReasoningChange={setReasoning}
        />
        {feedback && <p className="mt-2 text-sm text-red-700">{feedback}</p>}
        <Button className="mt-3" onClick={handleSubmit} disabled={pending}>
          교정 답안 제출
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        남은 개념 {attempt.conceptsNeedingRemediation.length}개. 두 번 연속 실패하면 「선생님 도움
        필요」로 표시되고 다음 개념으로 넘어갑니다.
      </p>
    </div>
  );
}
